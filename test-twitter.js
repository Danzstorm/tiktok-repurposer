const { exec } = require('child_process');
const path = require('path');

// Sample Tweet URL (replace with a live one if needed, or pass as arg)
const url = process.argv[2] || 'https://twitter.com/Twitter/status/165565656565'; // Placeholder

const command = `yt-dlp --print-json --no-playlist --skip-download "${url}"`;

console.log(`Running: ${command}`);

exec(command, (error, stdout, stderr) => {
    if (error) {
        console.error(`Error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.error(`Stderr: ${stderr}`);
    }

    try {
        const metadata = JSON.parse(stdout);
        console.log('--- Metadata Extracted ---');
        console.log('ID:', metadata.id);
        console.log('Extractor:', metadata.extractor);
        console.log('Description (Text):', metadata.description);
        console.log('Thumbnail (Image):', metadata.thumbnail);
        console.log('Duration:', metadata.duration); // Undefined for text?
    } catch (e) {
        console.error('Failed to parse JSON:', e);
        console.log('Raw Output:', stdout);
    }
});
