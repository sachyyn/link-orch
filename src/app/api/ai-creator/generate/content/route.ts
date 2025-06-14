import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
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
  sessionId: z.string().min(1, "Session ID is required"),
  postIdea: z.string().min(10, "Post idea must be at least 10 characters"),
  tone: z
    .enum([
      "professional",
      "casual",
      "thought_leadership",
      "provocative",
      "educational",
      "inspirational",
      "conversational",
    ])
    .optional(),
  contentType: z.enum(["post", "article", "poll", "carousel"]).optional(),
  guidelines: z.string().optional(),
  variations: z.number().min(1).max(6).default(3), // Allow up to 6 variations
});

// Content variation schema for generateObject
const contentVariationSchema = z.object({
  content: z.string().min(50).max(3000).describe("The complete LinkedIn post content"),
  approach: z.string().describe("The content approach/strategy used"),
  hashtags: z.array(z.string()).max(5).describe("Relevant hashtags for the post"),
  keyMessage: z.string().describe("The main message or takeaway"),
  callToAction: z.string().optional().describe("Call to action if present"),
  targetAudience: z.string().describe("Primary target audience for this variation"),
  estimatedEngagement: z.enum(['low', 'medium', 'high']).describe("Predicted engagement level"),
  uniqueAngle: z.string().describe("What makes this variation unique and different"),
  contentLength: z.number().describe("Character count of the content"),
  estimatedReadTime: z.number().describe("Estimated read time in seconds")
});

// Define content approaches for variety
const VARIATION_APPROACHES = [
  'thought-leadership',
  'story-driven', 
  'data-driven',
  'question-based',
  'actionable-tips',
  'personal-experience',
  'industry-insights',
  'contrarian-viewpoint',
  'educational-tutorial',
  'behind-the-scenes'
];

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

    // Log AI usage start
    await createUsageLog({
      userId,
      projectId: project.id,
      sessionId: sessionId,
      actionType: 'content_generation',
      modelUsed: 'gemini-2.5-flash-preview-05-20',
      requestPayload: JSON.stringify({
        sessionId,
        contentType,
        tone,
        variations,
        postIdea,
        approach: 'parallel_generation'
      }),
    });

    // Select diverse approaches for variations
    const selectedApproaches = selectDiverseApproaches(variations, tone);

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const results: any[] = [];
        let totalTokensUsed = 0;
        
        try {
          // Send initial progress
          controller.enqueue(encoder.encode(
            `data: ${JSON.stringify({ 
              type: 'started', 
              total: variations,
              approaches: selectedApproaches 
            })}\n\n`
          ));

          // Generate variations in parallel with different approaches
          const generationPromises = selectedApproaches.map(async (approach, index) => {
            try {
              const systemPrompt = buildApproachSpecificPrompt(approach, project, contentType, tone);
              const userPrompt = buildTargetedPrompt(postIdea, approach, guidelines);

              const result = await generateObject({
                model: google('gemini-2.5-flash-preview-05-20'),
                schema: contentVariationSchema,
                system: systemPrompt,
                prompt: userPrompt,
                temperature: 0.7 + (index * 0.05), // Slight temperature variation for diversity
              });

              // Calculate additional metadata
              const contentLength = result.object.content.length;
              const estimatedReadTime = Math.ceil(contentLength / 200 * 60); // ~200 chars per minute

              const variation = {
                ...result.object,
                versionNumber: index + 1,
                approach,
                contentLength,
                estimatedReadTime,
                tokensUsed: result.usage?.totalTokens || 0,
                generatedAt: new Date().toISOString()
              };

              results.push(variation);
              totalTokensUsed += result.usage?.totalTokens || 0;

              // Stream individual completion
              controller.enqueue(encoder.encode(
                `data: ${JSON.stringify({ 
                  type: 'variation_complete', 
                  variation,
                  progress: results.length,
                  total: variations,
                  tokensUsed: result.usage?.totalTokens || 0
                })}\n\n`
              ));

              return variation;
            } catch (error) {
              console.error(`Variation ${index + 1} (${approach}) failed:`, error);
              
              // Send error for this specific variation
              controller.enqueue(encoder.encode(
                `data: ${JSON.stringify({ 
                  type: 'variation_error', 
                  index: index + 1,
                  approach,
                  error: error instanceof Error ? error.message : 'Unknown error'
                })}\n\n`
              ));
              
              return null;
            }
          });

                     // Wait for all variations to complete
           const settledResults = await Promise.allSettled(generationPromises);
           const completedVariations = settledResults
             .map(result => result.status === 'fulfilled' ? result.value : null)
             .filter((variation): variation is NonNullable<typeof variation> => variation !== null);

          if (completedVariations.length === 0) {
            throw new Error('All variations failed to generate');
          }

          // Save to database in batch
          const savedVersions = await saveVariationsBatch(userId, sessionId, completedVariations);

          // Update session status
          await updateSession(userId, sessionId, {
            postIdea,
            additionalContext: guidelines || '',
            status: 'ready',
          });

          // Log final usage
          await createUsageLog({
            userId,
            projectId: project.id,
            sessionId: sessionId,
            actionType: 'content_generation',
            modelUsed: 'gemini-2.5-flash-preview-05-20',
            tokensUsed: totalTokensUsed,
            processingTime: 0,
            responseSize: completedVariations.reduce((acc, v) => acc + v.contentLength, 0),
            requestPayload: JSON.stringify({
              sessionId,
              versionsGenerated: completedVariations.length,
              totalTokens: totalTokensUsed,
              approaches: selectedApproaches,
              successRate: `${completedVariations.length}/${variations}`
            }),
          });

          // Send final result
          controller.enqueue(encoder.encode(
            `data: ${JSON.stringify({ 
              type: 'complete', 
              variations: savedVersions,
              total: completedVariations.length,
              totalTokensUsed,
              metadata: {
                model: 'gemini-2.5-flash-preview-05-20',
                tone,
                contentType,
                variationsGenerated: completedVariations.length,
                approaches: selectedApproaches
              }
            })}\n\n`
          ));

          controller.close();
        } catch (error) {
          console.error('Content generation error:', error);
          
          controller.enqueue(encoder.encode(
            `data: ${JSON.stringify({ 
              type: 'error', 
              error: error instanceof Error ? error.message : 'Unknown error'
            })}\n\n`
          ));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
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

// Helper function to select diverse approaches
function selectDiverseApproaches(count: number, tone: string): string[] {
  const approaches = [...VARIATION_APPROACHES];
  
  // Prioritize approaches based on tone
  if (tone === 'professional') {
    approaches.sort((a, b) => {
      const priority = ['thought-leadership', 'data-driven', 'industry-insights', 'educational-tutorial'];
      const aIndex = priority.indexOf(a);
      const bIndex = priority.indexOf(b);
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  } else if (tone === 'casual') {
    approaches.sort((a, b) => {
      const priority = ['story-driven', 'personal-experience', 'question-based', 'behind-the-scenes'];
      const aIndex = priority.indexOf(a);
      const bIndex = priority.indexOf(b);
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  } else if (tone === 'thought_leadership') {
    approaches.sort((a, b) => {
      const priority = ['thought-leadership', 'contrarian-viewpoint', 'industry-insights', 'data-driven'];
      const aIndex = priority.indexOf(a);
      const bIndex = priority.indexOf(b);
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  }
  
  return approaches.slice(0, count);
}

// Build approach-specific system prompts
function buildApproachSpecificPrompt(approach: string, project: any, contentType: string, tone: string): string {
  const baseContext = `You are a LinkedIn content expert specializing in ${approach} content creation.

PROJECT CONTEXT:
- Project Name: ${project.name}
- Project Tone: ${project.tone || tone}
- Content Type: ${contentType}
- Project Guidelines: ${project.guidelines || 'Standard LinkedIn best practices'}`;

  const approachPrompts: Record<string, string> = {
    'thought-leadership': `${baseContext}

APPROACH: Position the author as a thought leader and industry expert.
FOCUS: Industry insights, future predictions, expert perspectives, and strategic thinking.
STYLE: Authoritative yet accessible, forward-thinking, confident.`,

    'story-driven': `${baseContext}

APPROACH: Use narrative techniques and storytelling to engage the audience.
FOCUS: Personal anecdotes, case studies, customer stories, journey narratives.
STYLE: Engaging, relatable, emotional connection, clear story arc.`,

    'data-driven': `${baseContext}

APPROACH: Support arguments with statistics, research, and concrete data.
FOCUS: Research findings, market data, performance metrics, trend analysis.
STYLE: Factual, credible, analytical, evidence-based.`,

    'question-based': `${baseContext}

APPROACH: Start with compelling questions that provoke thought and engagement.
FOCUS: Interactive content, audience participation, discussion starters.
STYLE: Conversational, curious, engaging, thought-provoking.`,

    'actionable-tips': `${baseContext}

APPROACH: Provide practical, implementable advice.
FOCUS: Step-by-step guidance, how-to content, practical frameworks, tools.
STYLE: Clear, instructional, helpful, immediately useful.`,

    'personal-experience': `${baseContext}

APPROACH: Share personal insights and experiences.
FOCUS: Lessons learned, personal journey, authentic experiences, vulnerability.
STYLE: Authentic, relatable, honest, inspiring.`,

    'industry-insights': `${baseContext}

APPROACH: Provide deep industry knowledge and analysis.
FOCUS: Market trends, industry changes, professional insights, sector expertise.
STYLE: Knowledgeable, analytical, insider perspective, authoritative.`,

    'contrarian-viewpoint': `${baseContext}

APPROACH: Challenge conventional wisdom with a different perspective.
FOCUS: Alternative viewpoints, debate topics, unconventional thinking.
STYLE: Bold, thoughtful, well-reasoned, respectful but challenging.`,

    'educational-tutorial': `${baseContext}

APPROACH: Teach concepts and skills in an educational format.
FOCUS: Learning objectives, educational content, skill development, knowledge sharing.
STYLE: Clear, structured, informative, progressive learning.`,

    'behind-the-scenes': `${baseContext}

APPROACH: Show the process, journey, or inner workings.
FOCUS: Process insights, team dynamics, company culture, work methods.
STYLE: Transparent, authentic, insider view, relatable.`
  };

  return approachPrompts[approach] || `${baseContext}

APPROACH: Create engaging ${contentType} content with a ${tone} tone.
FOCUS: Value delivery, audience engagement, professional standards.
STYLE: Clear, engaging, valuable, appropriate for LinkedIn.`;
}

// Build targeted prompts for specific approaches
function buildTargetedPrompt(postIdea: string, approach: string, guidelines?: string): string {
  return `Create a LinkedIn post using the ${approach} approach for this idea:

POST IDEA: ${postIdea}

${guidelines ? `ADDITIONAL GUIDELINES: ${guidelines}` : ''}

REQUIREMENTS:
- Make this variation distinctly different by focusing on ${approach} elements
- Include 3-5 relevant hashtags
- Ensure the content is engaging and LinkedIn-appropriate
- Make it actionable and valuable for the target audience
- Keep within LinkedIn's best practices for post length and engagement

Focus specifically on delivering this content through the lens of ${approach}, making it unique from other potential approaches.`;
}

// Save variations to database in batch
async function saveVariationsBatch(userId: string, sessionId: string, variations: any[]) {
  const savedVersions = [];
  
  for (let i = 0; i < variations.length; i++) {
    const variation = variations[i];
    const version = await createContentVersions(userId, sessionId, [{
      sessionId: sessionId,
      versionNumber: variation.versionNumber,
      content: variation.content,
      modelUsed: 'gemini-2.5-flash-preview-05-20',
      tokensUsed: variation.tokensUsed,
      generationTime: 0,
      prompt: `Approach: ${variation.approach} | Target: ${variation.targetAudience}`,
      isSelected: false,
      // Content metadata
      hashtags: variation.hashtags ? JSON.stringify(variation.hashtags) : undefined,
      callToAction: variation.callToAction,
      contentLength: variation.contentLength,
      estimatedReadTime: variation.estimatedReadTime,
      // Optional fields with defaults
      generationBatch: 1,
    }]);
    savedVersions.push(...version);
  }
  
  return savedVersions;
} 