import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface VideoMetadata {
    id: string;
    title: string;
    description: string;
    uploader: string;
    view_count: number;
    like_count: number;
    comment_count: number;
    share_count: number;
    duration: number;
    width: number;
    height: number;
    upload_date: string;
    platform: string;
    original_url: string;
    filepath: string;
    text_content?: string; // For text-based posts (Twitter/LinkedIn)
    image_url?: string;    // For text-based posts with images
}

export async function unshortenUrl(url: string): Promise<string> {
    try {
        // Allow TikTok, Instagram, and YouTube URLs
        if (url.includes('tiktok.com/@') || url.includes('instagram.com/') || url.includes('youtube.com/') || url.includes('youtu.be/')) return url;

        const response = await fetch(url, {
            method: 'HEAD',
            redirect: 'follow',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        return response.url;
    } catch (error) {
        console.warn('Failed to unshorten URL, using original:', error);
        return url;
    }
}

async function fetchTweetMetadata(url: string): Promise<VideoMetadata | null> {
    try {
        // Clean URL (remove query params)
        const cleanUrl = url.split('?')[0];
        // Convert x.com or twitter.com to fixupx.com for metadata extraction
        const fxUrl = cleanUrl.replace('x.com', 'fixupx.com').replace('twitter.com', 'fixupx.com');
        console.log(`Fetching tweet metadata from: ${fxUrl}`);

        const response = await fetch(fxUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
            }
        });

        if (!response.ok) {
            console.warn(`FxTwitter fetch failed: ${response.status}`);
            return null;
        }

        const html = await response.text();

        // Extract OG tags
        const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/);
        const descMatch = html.match(/<meta property="og:description" content="([^"]+)"/);
        const imageMatch = html.match(/<meta property="og:image" content="([^"]+)"/);

        // Extract Uploader from title (usually "Name (@handle)")
        const title = titleMatch ? titleMatch[1] : 'Unknown';
        const uploader = title.split('(')[0].trim();

        const description = descMatch ? descMatch[1] : '';
        const imageUrl = imageMatch ? imageMatch[1] : undefined;

        if (!description && !imageUrl) {
            return null;
        }

        return {
            id: url.split('/').pop()?.split('?')[0] || 'unknown',
            title: title,
            description: description,
            uploader: uploader,
            view_count: 0,
            like_count: 0,
            comment_count: 0,
            share_count: 0,
            duration: 0,
            width: 0,
            height: 0,
            upload_date: new Date().toISOString(),
            platform: 'Twitter',
            original_url: url,
            filepath: '', // No video file
            text_content: description,
            image_url: imageUrl
        };

    } catch (error) {
        console.error('Error fetching tweet metadata:', error);
        return null;
    }
}

export async function downloadVideo(url: string, outputDir: string): Promise<VideoMetadata> {
    const finalUrl = await unshortenUrl(url);
    console.log(`Processing URL: ${url} -> ${finalUrl}`);

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = Date.now();
    const filename = `video_${timestamp}`;
    const outputPath = path.join(outputDir, filename);

    // Command to download video and get metadata
    // -J: Dump JSON metadata
    // -o: Output template
    // --no-playlist: Only download single video
    // --extractor-args: Use Android client to avoid web client issues (SABR/JS runtime)
    // Fix ffmpeg path resolution
    let ffmpegExec = require('ffmpeg-static');
    if (!ffmpegExec || typeof ffmpegExec !== 'string' || ffmpegExec.includes('\\ROOT')) {
        // Fallback to manual path resolution
        ffmpegExec = path.join(process.cwd(), 'node_modules', 'ffmpeg-static', 'ffmpeg.exe');
    }

    // Check if it's a Twitter URL to potentially skip video download if it's just text/image
    const isTwitter = finalUrl.includes('twitter.com') || finalUrl.includes('x.com');

    // For Twitter, we might want to just get metadata first to see if it's a video
    // But yt-dlp handles "downloading" tweets by downloading the media. 
    // If it's a text-only tweet, yt-dlp might fail to "download" a video but still give JSON.
    // We'll use --skip-download for the initial JSON fetch to be safe and fast.

    // Only use android client for YouTube to avoid issues with other platforms
    const isYouTube = finalUrl.includes('youtube.com') || finalUrl.includes('youtu.be');
    const extractorArgs = isYouTube ? '--extractor-args "youtube:player_client=android"' : '';

    // Add --ignore-errors to prevent failure if it tries to download a linked article and fails
    const command = `yt-dlp --print-json --no-playlist --ignore-errors ${extractorArgs} --ffmpeg-location "${ffmpegExec}" -o "${outputPath}.%(ext)s" "${finalUrl}"`;

    try {
        const { stdout } = await execAsync(command);
        // Find the JSON line in stdout (it might be mixed with other output)
        const lines = stdout.trim().split('\n');
        const jsonLine = lines.find(l => l.startsWith('{') && l.endsWith('}'));
        const metadata = JSON.parse(jsonLine || stdout);

        // Find the actual downloaded file (extension might vary)
        const files = fs.readdirSync(outputDir);
        const downloadedFile = files.find(f => f.startsWith(filename));

        // For Twitter text-only tweets, there might not be a video file.
        // If we have metadata but no file, and it's Twitter, we proceed with text content.
        if (!downloadedFile && !isTwitter) {
            throw new Error('Downloaded file not found');
        }

        // Normalize metrics based on platform quirks
        const viewCount = metadata.view_count || metadata.play_count;
        const likeCount = metadata.like_count;
        const commentCount = metadata.comment_count;
        const shareCount = metadata.repost_count || metadata.share_count;

        // Detect platform for UI customization
        let platform = metadata.extractor_key;
        if (!platform) {
            if (finalUrl.includes('tiktok')) platform = 'TikTok';
            else if (finalUrl.includes('instagram')) platform = 'Instagram';
            else if (finalUrl.includes('youtube') || finalUrl.includes('youtu.be')) platform = 'YouTube';
            else platform = 'Video';
        }

        return {
            id: metadata.id,
            title: metadata.title,
            description: metadata.description,
            uploader: metadata.uploader,
            view_count: viewCount,
            like_count: likeCount,
            comment_count: commentCount,
            share_count: shareCount,
            duration: metadata.duration,
            width: metadata.width,
            height: metadata.height,
            upload_date: metadata.upload_date,
            platform: platform,
            original_url: finalUrl,
            filepath: downloadedFile ? path.join(outputDir, downloadedFile) : '',
            text_content: metadata.description, // Twitter text is usually in description
            image_url: metadata.thumbnail       // Twitter image is in thumbnail
        };
    } catch (error) {
        console.error('Error downloading video:', error);

        // Fallback for Twitter/X if yt-dlp fails (likely text-only tweet)
        if (isTwitter) {
            console.log('Attempting Twitter fallback via FxTwitter...');
            const fallbackMetadata = await fetchTweetMetadata(finalUrl);
            if (fallbackMetadata) {
                console.log('Twitter fallback successful');
                return fallbackMetadata;
            }
        }

        throw error;
    }
}
