import { NextRequest, NextResponse } from 'next/server';
import { DetectScriptConfig, DetectScriptResponse } from '@/types/wizard';
import { generateDetectScript } from '@/lib/scripts/generator';

export async function POST(request: NextRequest) {
  try {
    const body: DetectScriptConfig = await request.json();
    
    // Validate required fields
    if (!body.platform) {
      return NextResponse.json(
        { error: 'Missing required field: platform' },
        { status: 400 }
      );
    }
    
    // Validate platform
    if (!['windows', 'macos', 'linux'].includes(body.platform)) {
      return NextResponse.json(
        { error: 'Invalid platform. Must be windows, macos, or linux' },
        { status: 400 }
      );
    }
    
    const result: DetectScriptResponse = generateDetectScript({
      platform: body.platform,
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating detect script:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to generate detect script: ${errorMessage}` },
      { status: 500 }
    );
  }
}
