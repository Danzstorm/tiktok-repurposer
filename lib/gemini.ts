import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';

if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not defined');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);

export const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

export async function uploadToGemini(path: string, mimeType: string) {
    const uploadResult = await fileManager.uploadFile(path, {
        mimeType,
        displayName: path,
    });
    const file = uploadResult.file;
    console.log(`Uploaded file ${file.displayName} as: ${file.name}`);
    return file;
}

export async function waitForFileActive(file: any) {
    console.log("Waiting for file processing...");
    let fileStatus = await fileManager.getFile(file.name);
    while (fileStatus.state === "PROCESSING") {
        process.stdout.write(".");
        await new Promise((resolve) => setTimeout(resolve, 2000));
        fileStatus = await fileManager.getFile(file.name);
    }
    if (fileStatus.state !== "ACTIVE") {
        throw new Error(`File processing failed: ${fileStatus.state}`);
    }
    console.log("File ready");
    return fileStatus;
}
