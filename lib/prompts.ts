import { VideoMetadata } from './ytdlp';

interface PromptOptions {
    metadata: VideoMetadata;
    targetAudience?: string;
    tone?: string;
    goal?: string;
    language?: string;
    hasDocuments?: boolean;
}

export function generatePrompt(options: PromptOptions): string {
    const { metadata, targetAudience, tone, goal, language, hasDocuments } = options;
    const targetLanguage = language || 'Spanish';

    const baseContext = `
You are an expert social media content strategist and scriptwriter.
Your goal is to repurpose existing content into high-performing short-form video scripts (TikTok, Instagram Reels, YouTube Shorts).

**Input Content:**
${metadata.text_content
            ? `- Type: Text Post (Twitter/LinkedIn)\n- Text: "${metadata.text_content}"\n- Author: ${metadata.uploader}\n- Image: ${metadata.image_url ? 'Attached' : 'None'}`
            : `- Type: Video\n- Title: ${metadata.title}\n- Description: ${metadata.description}\n- Views: ${metadata.view_count}\n- Likes: ${metadata.like_count}`
        }

${hasDocuments ? `\n**Reference Documents:**\nI have attached reference documents. Use them to strictly follow the brand voice, style guidelines, or specific instructions provided in them.` : ''}

**Strategy:**
- Target Audience: ${targetAudience || 'General Audience'}
- Tone: ${tone || 'Engaging and Viral'}
- Goal: ${goal || 'Maximize Engagement and Reach'}
- Output Language: ${targetLanguage}
`;

    const taskInstructions = metadata.text_content
        ? `
**Task:**
1.  **Analyze**: Understand the core message and sentiment of the post.
2.  **Repurpose**: Create a dynamic short-form video script that visualizes this text.
    -   *Idea*: How can this text be turned into a skit, a visual story, or a direct-to-camera explanation?
    -   *Hook*: Create a visual or audio hook that stops the scroll immediately.
`
        : `
**Task:**
1.  **Analyze**: Detect the spoken language and understand the video's success factors.
2.  **Transcribe**: Provide a verbatim transcription of the original audio (in its original language).
3.  **Repurpose**: Create a NEW, optimized script based on the original video's topic but tailored for the new goal/audience.
`;

    const outputFormat = `
**Output Format (Strict JSON):**
\`\`\`json
{
  "detectedLanguage": "Language of the input content",
  "transcription": "Verbatim transcription (if video) or the original text (if post)",
  "analysis": "Brief strategic analysis of why this content is valuable (in ${targetLanguage})",
  "newContent": {
    "hook": "The first 3 seconds (Visual & Audio) - Make it punchy! (in ${targetLanguage})",
    "script": "Full script with clear [Visual Cue] and (Spoken Audio) markers. Use emojis. (in ${targetLanguage})",
    "cta": "Strong Call to Action (in ${targetLanguage})"
  }
}
\`\`\`
`;

    return `${baseContext}\n${taskInstructions}\n${outputFormat}`;
}
