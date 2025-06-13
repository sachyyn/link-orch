import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { 
  getSessionById, 
  getProjectById, 
  createAsset,
  createUsageLog 
} from '@/db/services/ai-creator-service';

// Request validation schema for asset generation
const generateAssetSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  assetType: z.enum(['image', 'carousel', 'infographic', 'banner', 'thumbnail', 'logo', 'chart']),
  prompt: z.string().min(10, 'Asset prompt must be at least 10 characters'),
  style: z.string().optional().default('professional'), // Image style preference
  dimensions: z.string().optional().default('1080x1080'), // Square format for LinkedIn
  model: z.string().optional().default('dall-e-3'), // Default to DALL-E 3
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
    const validation = generateAssetSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: validation.error.issues 
        },
        { status: 400 }
      );
    }

    const { sessionId, assetType, prompt, style, dimensions, model } = validation.data;

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
      projectId: session.projectId,
      sessionId: sessionId,
      actionType: 'image_generation',
      modelUsed: 'dall-e-3',
      requestPayload: JSON.stringify({
        sessionId,
        assetType,
        style,
        prompt: prompt,
      }),
    });

    // For now, we'll create a mock asset since we need to set up the actual image generation service
    // In a real implementation, this would call DALL-E, Midjourney, or similar
    const mockAssetUrl = await generateMockAsset(assetType, style, dimensions);
    
    // Save asset to database
    const savedAsset = await createAsset(userId, sessionId, {
      sessionId: sessionId,
      assetType: assetType as any,
      fileName: `${sessionId}-${Date.now()}.png`,
      fileUrl: mockAssetUrl,
      fileSize: 0, // We'll get this from the actual file
      prompt: prompt,
      model: 'dall-e-3',
      style,
      dimensions: '1024x1024',
      generationTime: 0, // We'll track this in future iteration
      generationCost: '0.04', // DALL-E 3 pricing
      isSelected: false,
    });

    // Log successful generation
    await createUsageLog({
      userId,
      projectId: session.projectId,
      sessionId: sessionId,
      actionType: 'image_generation',
      modelUsed: 'dall-e-3',
      tokensUsed: 0, // Images don't use tokens
      processingTime: 0,
      responseSize: mockAssetUrl.length,
      requestPayload: JSON.stringify({
        sessionId,
        assetGenerated: true,
        fileUrl: mockAssetUrl,
        generationTime: 0,
      }),
    });

    return NextResponse.json({
      success: true,
      data: {
        asset: savedAsset,
        metadata: {
          model,
          assetType,
          style,
          dimensions,
          generationTime: 0,
        },
      },
    });

  } catch (error) {
    console.error('Asset generation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate asset',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Mock asset generation function
// In a real implementation, this would integrate with actual AI image generation services
async function generateMockAsset(
  assetType: string, 
  style: string, 
  dimensions: string
): Promise<string> {
  // Mock asset URLs - in production, these would be real generated images
  const mockAssets = {
    image: `https://picsum.photos/${dimensions.replace('x', '/')}?random=${Date.now()}`,
    carousel: `https://picsum.photos/${dimensions.replace('x', '/')}?random=${Date.now()}&carousel=true`,
    infographic: `https://picsum.photos/${dimensions.replace('x', '/')}?random=${Date.now()}&info=true`,
    banner: `https://picsum.photos/${dimensions.replace('x', '/')}?random=${Date.now()}&banner=true`,
    thumbnail: `https://picsum.photos/${dimensions.replace('x', '/')}?random=${Date.now()}&thumb=true`,
    logo: `https://picsum.photos/${dimensions.replace('x', '/')}?random=${Date.now()}&logo=true`,
    chart: `https://picsum.photos/${dimensions.replace('x', '/')}?random=${Date.now()}&chart=true`,
  };

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  return mockAssets[assetType as keyof typeof mockAssets] || mockAssets.image;
}

// Get asset generation status for a session
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Verify session exists and user owns it
    const session = await getSessionById(userId, sessionId);
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        sessionId,
        needsAsset: session.needsAsset,
        assetGenerated: session.assetGenerated,
        status: session.status,
      },
    });

  } catch (error) {
    console.error('Asset status check error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to check asset status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 