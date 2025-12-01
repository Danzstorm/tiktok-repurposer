const { exec } = require('child_process');
const ffmpegPath = require('ffmpeg-static');

// Zach King's Shorts page - yt-dlp should be able to pick the first one
const url = 'https://www.youtube.com/@ZachKing/shorts';

// Added --playlist-end 1 to just get the first video from the feed
const command = `yt-dlp --print-json --playlist-end 1 --ffmpeg-location "${ffmpegPath}" "${url}"`;

console.log('Running command for YouTube Shorts...');
exec(command, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
    if (error) {
        console.error('Error:', error.message);
        return;
    }
    try {
        // stdout might contain multiple JSONs if it processes a playlist, but we limited to 1
        // It might also contain download progress text if not careful, but --print-json usually suppresses that or puts it in stderr
        // We look for the JSON line
        const lines = stdout.trim().split('\n');
        const jsonLine = lines.find(l => l.startsWith('{') && l.endsWith('}'));

        if (!jsonLine) {
            console.log('No JSON found. Raw output:', stdout.substring(0, 500));
            return;
        }

        const metadata = JSON.parse(jsonLine);
        console.log('Success! Extracted Metadata Keys:', Object.keys(metadata));
        console.log('Sample Metrics:', {
            platform: metadata.extractor_key,
            view_count: metadata.view_count,
            like_count: metadata.like_count,
            comment_count: metadata.comment_count,
            duration: metadata.duration,
            title: metadata.title
        });
    } catch (e) {
        console.error('Parse error:', e);
    }
});
