import { NextRequest, NextResponse } from 'next/server';
import { GenerateScriptRequest, GenerateScriptResponse } from '@/types/wizard';
import { generateScript } from '@/lib/scripts/generator';

export async function POST(request: NextRequest) {
  try {
    const body: GenerateScriptRequest = await request.json();
    
    // Validate required fields
    if (!body.platform || !body.architecture || !body.installPath) {
      return NextResponse.json(
        { error: 'Missing required fields: platform, architecture, installPath' },
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
    
    // Validate architecture
    if (!['x64', 'arm64'].includes(body.architecture)) {
      return NextResponse.json(
        { error: 'Invalid architecture. Must be x64 or arm64' },
        { status: 400 }
      );
    }
    
    const result: GenerateScriptResponse = generateScript({
      platform: body.platform,
      architecture: body.architecture,
      installPath: body.installPath,
      includeFaust: body.includeFaust ?? false,
      includeIPP: body.includeIPP ?? false,
      skipPhases: body.skipPhases ?? [],
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating script:', error);
    return NextResponse.json(
      { error: 'Failed to generate script' },
      { status: 500 }
    );
  }
}
