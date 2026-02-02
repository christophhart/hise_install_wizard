import { NextRequest, NextResponse } from 'next/server';
import { UpdateScriptConfig, UpdateScriptResponse } from '@/types/wizard';
import { generateUpdateScript } from '@/lib/scripts/generator';

export async function POST(request: NextRequest) {
  try {
    const body: UpdateScriptConfig = await request.json();
    
    // Validate required fields
    if (!body.platform || !body.architecture || !body.hisePath) {
      return NextResponse.json(
        { error: 'Missing required fields: platform, architecture, hisePath' },
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
    
    const result: UpdateScriptResponse = generateUpdateScript({
      platform: body.platform,
      architecture: body.architecture,
      hisePath: body.hisePath,
      hasFaust: body.hasFaust ?? false,
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating update script:', error);
    return NextResponse.json(
      { error: 'Failed to generate update script' },
      { status: 500 }
    );
  }
}
