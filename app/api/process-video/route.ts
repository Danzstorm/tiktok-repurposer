import { NextResponse } from 'next/server';
import { downloadVideo } from '@/lib/ytdlp';
import { uploadToGemini, waitForFileActive, model } from '@/lib/gemini';
import { generatePrompt } from '@/lib/prompts';
import fs from 'fs';
import path from 'path';
import os from 'os';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const url = formData.get('url') as string;
        const targetAudience = formData.get('targetAudience') as string;
        const tone = formData.get('tone') as string;
        const goal = formData.get('goal') as string;
        const language = formData.get('language') as string;
        const scriptStructure = formData.get('scriptStructure') as string;
        const files = formData.getAll('files') as File[];

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        // Define public temp directory for serving files
        const publicDir = path.join(process.cwd(), 'public');
        const tempDir = path.join(publicDir, 'temp');

        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        // Clean up old files in temp dir
        try {
            const files = fs.readdirSync(tempDir);
            for (const file of files) {
                fs.unlinkSync(path.join(tempDir, file));
            }
        } catch (e) {
            console.error("Failed to clean temp dir:", e);
        }

        // 1. Download Video & Get Metadata
        console.log('Downloading video...');
        const metadata = await downloadVideo(url, tempDir);
        console.log('Video downloaded:', metadata.filepath);

        // Get relative path for frontend
        const relativeVideoPath = `/temp/${path.basename(metadata.filepath)}`;

        // 1.5 Process Uploaded Documents (RAG)
        const uploadedDocs: { path: string, mimeType: string, name: string }[] = [];

        for (const file of files) {
            if (file instanceof File) {
                const buffer = Buffer.from(await file.arrayBuffer());
                const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
                const filePath = path.join(tempDir, `doc_${Date.now()}_${safeName}`);
                fs.writeFileSync(filePath, buffer);

                let mimeType = file.type;
                // Fallback for common types if browser didn't send it correctly
                if (!mimeType) {
                    const ext = path.extname(filePath).toLowerCase();
                    if (ext === '.pdf') mimeType = 'application/pdf';
                    else if (ext === '.docx') mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                    else if (ext === '.txt') mimeType = 'text/plain';
                }

                uploadedDocs.push({
                    path: filePath,
                    mimeType,
                    name: file.name
                });
                console.log(`Saved uploaded doc: ${filePath} (${mimeType})`);
            }
        }

        // 2. Upload to Gemini (if file exists)
        let uploadResponse;
        if (metadata.filepath) {
            console.log('Uploading to Gemini...');
            const ext = path.extname(metadata.filepath).toLowerCase();
            let mimeType = 'video/mp4'; // Default
            if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
            else if (ext === '.png') mimeType = 'image/png';
            else if (ext === '.webp') mimeType = 'image/webp';

            uploadResponse = await uploadToGemini(metadata.filepath, mimeType);

            // 3. Wait for processing (only needed for videos usually, but good practice)
            await waitForFileActive(uploadResponse);
        }

        // 2.5 Upload Documents to Gemini
        const docParts: any[] = [];
        if (uploadedDocs.length > 0) {
            console.log(`Uploading ${uploadedDocs.length} documents to Gemini...`);
            for (const doc of uploadedDocs) {
                const docUpload = await uploadToGemini(doc.path, doc.mimeType);
                await waitForFileActive(docUpload);
                docParts.push({
                    fileData: {
                        mimeType: docUpload.mimeType,
                        fileUri: docUpload.uri
                    }
                });
            }
        }

        // 4. Generate Content
        console.log('Generating content...');
        const targetLanguage = language || 'Spanish';

        const prompt = generatePrompt({
            metadata,
            targetAudience,
            tone,
            goal,
            language: targetLanguage,
            hasDocuments: uploadedDocs.length > 0,
            scriptStructure: scriptStructure || undefined
        });

        const parts: any[] = [
            { text: prompt },
            ...docParts
        ];

        if (uploadResponse) {
            parts.unshift({
                fileData: {
                    mimeType: uploadResponse.mimeType,
                    fileUri: uploadResponse.uri
                }
            });
        }

        const result = await model.generateContent(parts);

        const responseText = result.response.text();

        // Clean up JSON block if present
        const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/```\n([\s\S]*?)\n```/);
        const jsonString = jsonMatch ? jsonMatch[1] : responseText;

        let parsedResult;
        try {
            parsedResult = JSON.parse(jsonString);
        } catch (e) {
            console.error("Failed to parse JSON from Gemini:", responseText);
            parsedResult = { rawOutput: responseText };
        }

        // Note: We are NOT deleting the file here so it can be played by the frontend.
        // It will be cleaned up on the next request.

        return NextResponse.json({
            metadata,
            videoPath: relativeVideoPath,
            ...parsedResult
        });

    } catch (error: any) {
        console.error('Error processing video:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
