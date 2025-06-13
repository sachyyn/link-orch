import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { z } from 'zod';
import { 
  getSessionById, 
  getProjectById, 
  createContentVersions,
  updateSession,
  createUsageLog 
} from '@/db/services/ai-creator-service';

// Request validation schema
const generateContentSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  postIdea: z.string().min(10, 'Post idea must be at least 10 characters'),
  tone: z.enum(['professional', 'casual', 'thought_leadership', 'educational', 'promotional']).optional(),
  contentType: z.enum(['post', 'article', 'poll', 'carousel']).optional(),
  guidelines: z.string().optional(),
  variations: z.number().min(1).max(5).default(3), // Number of content variations to generate
});

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = generateContentSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: validation.error.issues 
        },
        { status: 400 }
      );
    }

    const { sessionId, postIdea, tone = 'professional', contentType = 'post', guidelines, variations } = validation.data;

    // Verify session exists and user owns it
    const session = await getSessionById(userId, sessionId);
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Get project details for context
    const project = await getProjectById(userId, session.projectId);
    if (!project || project.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized access to project' },
        { status: 403 }
      );
    }

    // Build AI prompt based on project context and user input
    const systemPrompt = buildSystemPrompt(project, contentType, tone, guidelines);
    const userPrompt = buildUserPrompt(postIdea, variations);

    // Log AI usage start
    await createUsageLog({
      userId,
      projectId: project.id,
      sessionId: sessionId,
      actionType: 'content_generation',
      modelUsed: 'gemini-2.0-flash-exp',
      requestPayload: JSON.stringify({
        sessionId,
        contentType,
        tone,
        variations,
        postIdea,
      }),
    });

    // Generate content using Gemini 2.0 Pro
    const result = await generateText({
      model: google('gemini-2.0-flash-exp'), // Using latest Gemini model
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.7, // Balance creativity and consistency
      maxTokens: 2000,
    });

    // Parse generated content into variations
    const contentVariations = parseGeneratedContent(result.text, variations);

    // Save all content versions to database
    const savedVersions = [];
    for (let i = 0; i < contentVariations.length; i++) {
      const version = await createContentVersions(userId, sessionId, [{
        sessionId: sessionId,
        versionNumber: i + 1,
        content: contentVariations[i],
        modelUsed: 'gemini-2.0-flash-exp',
        tokensUsed: Math.floor((result.usage?.totalTokens || 0) / contentVariations.length),
        generationTime: 0, // We'll track this in a future iteration
        prompt: userPrompt,
        isSelected: false,
      }]);
      savedVersions.push(...version);
    }

    // Update usage log with token consumption
    await createUsageLog({
      userId,
      projectId: project.id,
      sessionId: sessionId,
      actionType: 'content_generation',
      modelUsed: 'gemini-2.0-flash-exp',
      tokensUsed: result.usage?.totalTokens || 0,
      processingTime: 0, // We'll track this in future iteration
      responseSize: result.text.length,
      requestPayload: JSON.stringify({
        sessionId,
        versionsGenerated: contentVariations.length,
        promptTokens: result.usage?.promptTokens || 0,
        completionTokens: result.usage?.completionTokens || 0,
      }),
    });

    // Update session with generation details
    await updateSession(userId, sessionId, {
      postIdea,
      additionalContext: guidelines || '',
      status: 'generating',
    });

    return NextResponse.json({
      success: true,
      data: {
        sessionId,
        versions: savedVersions,
        usage: {
          totalTokens: result.usage?.totalTokens || 0,
          promptTokens: result.usage?.promptTokens || 0,
          completionTokens: result.usage?.completionTokens || 0,
        },
        metadata: {
          model: 'gemini-2.0-pro',
          tone,
          contentType,
          variationsGenerated: contentVariations.length,
        },
      },
    });

  } catch (error) {
    console.error('Content generation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate content',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Build system prompt based on project context
function buildSystemPrompt(
  project: any,
  contentType: string,
  tone: string,
  guidelines?: string
): string {
  return `You are a professional LinkedIn content creator specializing in ${contentType} creation.

PROJECT CONTEXT:
- Project Name: ${project.name}
- Project Tone: ${project.tone || tone}
- Content Type: ${contentType}
- Project Guidelines: ${project.guidelines || 'Standard LinkedIn best practices'}
${guidelines ? `- Additional Guidelines: ${guidelines}` : ''}

CONTENT REQUIREMENTS:
- Create engaging LinkedIn ${contentType} content
- Use ${tone} tone throughout
- Follow LinkedIn best practices
- Include relevant hashtags (3-5 maximum)
- Optimize for LinkedIn algorithm
- Keep posts concise but impactful

TONE GUIDELINES:
${getToneGuidelines(tone)}

OUTPUT FORMAT:
Generate multiple variations of the content, clearly separated by "---VARIATION---" markers.
Each variation should be complete and ready to post on LinkedIn.
Focus on different angles or approaches while maintaining the core message.`;
}

// Build user prompt with specific post idea
function buildUserPrompt(postIdea: string, variations: number): string {
  return `Create ${variations} different LinkedIn post variations based on this idea:

POST IDEA: ${postIdea}

Requirements:
- Each variation should approach the topic from a different angle
- Maintain professional LinkedIn standards
- Include appropriate hashtags
- Make each post engaging and actionable
- Optimize for LinkedIn engagement

Please generate ${variations} complete post variations, separated by "---VARIATION---" markers.`;
}

// Get tone-specific guidelines
function getToneGuidelines(tone: string): string {
  switch (tone) {
    case 'professional':
      return '- Use formal language and industry terminology\n- Focus on expertise and credibility\n- Include data or insights when relevant';
    case 'casual':
      return '- Use conversational language\n- Be approachable and relatable\n- Include personal anecdotes when appropriate';
    case 'thought_leadership':
      return '- Position as industry expert\n- Share unique insights and perspectives\n- Reference trends and future predictions';
    case 'educational':
      return '- Focus on teaching and value delivery\n- Use clear, explanatory language\n- Include actionable tips or steps';
    case 'promotional':
      return '- Highlight benefits and value propositions\n- Use persuasive language\n- Include clear calls-to-action';
    default:
      return '- Maintain professional standards\n- Focus on value delivery\n- Engage with the audience';
  }
}

// Parse generated content into separate variations
function parseGeneratedContent(generatedText: string, expectedVariations: number): string[] {
  // Split by variation markers
  const variations = generatedText
    .split('---VARIATION---')
    .map(variation => variation.trim())
    .filter(variation => variation.length > 0);

  // If parsing failed, try alternative splitting methods
  if (variations.length < expectedVariations) {
    // Try splitting by numbered variations
    const numberedSplit = generatedText
      .split(/\d+\./g)
      .map(variation => variation.trim())
      .filter(variation => variation.length > 50); // Filter out short fragments

    if (numberedSplit.length >= expectedVariations) {
      return numberedSplit.slice(0, expectedVariations);
    }

    // Fallback: return the entire text as single variation and generate more
    return [generatedText];
  }

  return variations.slice(0, expectedVariations);
} 