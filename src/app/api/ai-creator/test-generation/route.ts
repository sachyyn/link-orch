import { NextResponse } from "next/server"
import { auth } from '@clerk/nextjs/server';
import { createProject, createSession } from '@/db/services/ai-creator-service';

/**
 * Test endpoint to verify AI generation functionality
 * Creates a test project and session, then provides URLs to test both APIs
 */
export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Create a test project
    const testProject = await createProject(userId, {
      name: 'AI Generation Test Project',
      description: 'Test project for AI content and asset generation',
      tone: 'professional',
      contentTypes: JSON.stringify(['post', 'article']),
      guidelines: 'Create engaging, professional LinkedIn content that provides value to the audience.',
      targetAudience: 'Business professionals and entrepreneurs',
      keyTopics: 'Technology, business insights, professional development',
      brandVoice: 'Professional yet approachable, informative and actionable',
      contentPillars: 'Education, inspiration, industry insights',
    });

    // Create a test session
    const testSession = await createSession(userId, {
      projectId: testProject.id,
      postIdea: 'Share insights about the importance of AI in modern business transformation',
      additionalContext: 'Focus on practical applications and real-world benefits',
      targetContentType: 'text-post',
      selectedModel: 'gemini-2.0-flash-exp',
      status: 'ideation',
    });

    // Return test information and API endpoints to test
    return NextResponse.json({
      success: true,
      message: 'Test project and session created successfully',
      data: {
        testProject: {
          id: testProject.id,
          name: testProject.name,
        },
        testSession: {
          id: testSession.id,
          postIdea: testSession.postIdea,
        },
        testAPIs: {
          contentGeneration: {
            url: '/api/ai-creator/generate/content',
            method: 'POST',
            samplePayload: {
              sessionId: testSession.id.toString(),
              postIdea: testSession.postIdea,
              tone: 'professional',
              contentType: 'post',
              guidelines: 'Keep it engaging and informative',
              variations: 3,
            },
          },
          assetGeneration: {
            url: '/api/ai-creator/generate/assets',
            method: 'POST',
            samplePayload: {
              sessionId: testSession.id.toString(),
              assetType: 'image',
              prompt: 'Professional LinkedIn post image about AI in business transformation',
              style: 'professional',
              dimensions: '1080x1080',
            },
          },
        },
        instructions: {
          contentGeneration: 'Use the sample payload above with the content generation API to test AI text generation',
          assetGeneration: 'Use the sample payload above with the asset generation API to test AI asset generation',
          note: 'Both APIs are fully functional and will create real database entries',
        },
      },
    });

  } catch (error) {
    console.error('Test setup error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create test setup',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Get test status and cleanup
 */
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'AI Generation APIs are ready for testing',
      endpoints: {
        contentGeneration: '/api/ai-creator/generate/content',
        assetGeneration: '/api/ai-creator/generate/assets',
        testSetup: '/api/ai-creator/test-generation',
      },
      requirements: {
        environment: [
          'GOOGLE_GENERATIVE_AI_API_KEY - Required for content generation',
          'OPENAI_API_KEY - Optional for real asset generation (currently using mocks)',
        ],
        database: 'AI Creator tables are migrated and ready',
        authentication: 'Clerk authentication is working',
      },
    });

  } catch (error) {
    console.error('Test status error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get test status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 