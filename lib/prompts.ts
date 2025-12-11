import { VideoMetadata } from './ytdlp';

interface PromptOptions {
  metadata: VideoMetadata;
  targetAudience?: string;
  tone?: string;
  goal?: string;
  language?: string;
  hasDocuments?: boolean;
  scriptStructure?: string;
}

export function generatePrompt(options: PromptOptions): string {
  const { metadata, targetAudience, tone, goal, language, hasDocuments, scriptStructure } = options;
  const targetLanguage = language || 'Spanish';

  const structureSection = scriptStructure ? `
**REQUIRED SCRIPT STRUCTURE:**
You MUST follow this exact structure for the new content:
${scriptStructure}

Adapt each section to the topic while maintaining this framework.
` : '';

  const baseContext = `
You are an expert social media content strategist and viral video scriptwriter.

**YOUR MISSION:** 
Use the attached video/post as INSPIRATION and REFERENCE to create a COMPLETELY NEW, ORIGINAL video script that the user can film themselves. 
DO NOT describe what happens in the original video. CREATE NEW CONTENT.

**Reference Content (for inspiration only):**
${metadata.text_content
      ? `- Type: Text Post\n- Text: "${metadata.text_content}"\n- Author: ${metadata.uploader}`
      : `- Type: Video\n- Topic: ${metadata.title}\n- Context: ${metadata.description}\n- Engagement: ${metadata.view_count} views, ${metadata.like_count} likes`
    }

${hasDocuments ? `\n**Brand Guidelines:**\nI have attached reference documents with brand voice and style guidelines. Follow them strictly for the new content.` : ''}
${structureSection}
**Content Strategy:**
- Target Audience: ${targetAudience || 'General Audience'}
- Tone: ${tone || 'Engaging and Viral'}
- Goal: ${goal || 'Maximize Engagement and Reach'}
- Output Language: ${targetLanguage}
`;

  const taskInstructions = metadata.text_content
    ? `
**Task:**
1. **Analyze**: What makes this post engaging? What's the core message?
2. **Create NEW Content**: Write an ORIGINAL video script that:
   - Takes the SAME TOPIC or IDEA as inspiration
   - Creates something the user can actually FILM and POST themselves
   - Is NOT a description of the original post
   - Is a complete, ready-to-use script with visuals and dialogue
`
    : `
**Task:**
1. **Analyze**: Watch the video. What hooks people? What's the format? Why does it work?
2. **Transcribe**: 
   - Listen to the ACTUAL AUDIO and transcribe what is spoken verbatim.
   - Do NOT use the video description as transcription.
3. **Create NEW Content**: 
   - Write a COMPLETELY NEW video script on a SIMILAR TOPIC
   - The user will FILM THIS THEMSELVES - it's not about the original video
   - Use the same FORMAT/STYLE as inspiration (hook style, pacing, structure)
   - But the CONTENT must be ORIGINAL and ACTIONABLE for the user
   - Example: If original is about "productivity tips", create NEW productivity tips the user can share
   - Example: If original shows a recipe, create a DIFFERENT recipe in the same engaging style
`;

  const outputFormat = scriptStructure ? `
**CRITICAL: Follow the REQUIRED SCRIPT STRUCTURE above!**

**Output Format (Strict JSON, no markdown):**
{
  "detectedLanguage": "Language of the original content",
  "transcription": "Verbatim transcription of spoken words (from audio, NOT description)",
  "analysis": "Why this content works and what we can learn from it (in ${targetLanguage})",
  "newContent": {
    "concept": "Brief description of the NEW video concept you're creating (in ${targetLanguage})",
    "hook": {
      "visual": "What the USER shows on camera in the first 3 seconds (in ${targetLanguage})",
      "audio": "What the USER says to grab attention (in ${targetLanguage})"
    },
    "visualStoryboard": [
      { "scene": 1, "section": "Name of structure section (e.g., HOOK, PROBLEMA, etc.)", "description": "What the USER films/shows (in ${targetLanguage})" },
      { "scene": 2, "section": "Next section name", "description": "What the USER films/shows (in ${targetLanguage})" }
    ],
    "script": [
      { "line": 1, "section": "Name of structure section", "text": "What the USER says (in ${targetLanguage})" },
      { "line": 2, "section": "Next section name", "text": "What the USER says (in ${targetLanguage})" }
    ],
    "cta": "Call to action the USER says at the end (in ${targetLanguage})"
  }
}

Remember: Follow the REQUIRED SCRIPT STRUCTURE and write content FOR THE USER to create!
` : `
**CRITICAL RULES FOR NEW CONTENT:**
1. The newContent is for the USER to create their OWN video - NOT describing the original
2. visualStoryboard = What the USER should SHOW when they film their video
3. script = What the USER should SAY in their video
4. Create ORIGINAL ideas inspired by the reference, not a copy or description

**Output Format (Strict JSON, no markdown):**
{
  "detectedLanguage": "Language of the original content",
  "transcription": "Verbatim transcription of spoken words (from audio, NOT description)",
  "analysis": "Why this content works and what we can learn from it (in ${targetLanguage})",
  "newContent": {
    "concept": "Brief description of the NEW video concept you're creating (in ${targetLanguage})",
    "hook": {
      "visual": "What the USER shows on camera in the first 3 seconds (in ${targetLanguage})",
      "audio": "What the USER says to grab attention (in ${targetLanguage})"
    },
    "visualStoryboard": [
      { "scene": 1, "description": "What the USER films/shows for scene 1 (in ${targetLanguage})" },
      { "scene": 2, "description": "What the USER films/shows for scene 2 (in ${targetLanguage})" }
    ],
    "script": [
      { "line": 1, "text": "What the USER says - line 1 (in ${targetLanguage})" },
      { "line": 2, "text": "What the USER says - line 2 (in ${targetLanguage})" }
    ],
    "cta": "Call to action the USER says at the end (in ${targetLanguage})"
  }
}

Remember: You are writing content FOR THE USER to create, not describing the original video!
`;

  return `${baseContext}\n${taskInstructions}\n${outputFormat}`;
}
