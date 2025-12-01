const { exec } = require('child_process');
const ffmpegPath = require('ffmpeg-static');

// A popular public reel for testing
const url = 'https://www.instagram.com/reel/C3_r-y_LqJq/';

const command = `yt-dlp --print-json --no-playlist --ffmpeg-location "${ffmpegPath}" "${url}"`;

console.log('Running command...');
exec(command, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
    if (error) {
        console.error('Error:', error.message);
        return;
    }
    try {
        const metadata = JSON.parse(stdout);
        console.log('Keys:', Object.keys(metadata));
        console.log('Metrics:', {
            view_count: metadata.view_count,
            like_count: metadata.like_count,
            comment_count: metadata.comment_count,
            repost_count: metadata.repost_count,
            share_count: metadata.share_count
        });
    } catch (e) {
        console.error('Parse error:', e);
        console.log('Raw output snippet:', stdout.substring(0, 200));
    }
});
