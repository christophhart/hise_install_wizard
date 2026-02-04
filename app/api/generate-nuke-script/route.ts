import { NextRequest, NextResponse } from 'next/server';
import { NukeScriptConfig, NukeScriptResponse } from '@/types/wizard';
import { generateNukeScript } from '@/lib/scripts/generator';

export async function POST(request: NextRequest) {
  try {
    const body: NukeScriptConfig = await request.json();
    
    // Validate required fields
    if (!body.platform || !body.installationPaths || body.installationPaths.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: platform, installationPaths' },
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
    
    // Validate paths are non-empty strings
    const invalidPaths = body.installationPaths.filter(p => !p || typeof p !== 'string');
    if (invalidPaths.length > 0) {
      return NextResponse.json(
        { error: 'All installation paths must be non-empty strings' },
        { status: 400 }
      );
    }
    
    const result: NukeScriptResponse = generateNukeScript({
      platform: body.platform,
      installationPaths: body.installationPaths,
      removeSettings: body.removeSettings ?? true,
      removePathEntries: body.removePathEntries ?? true,
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating nuke script:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to generate nuke script: ${errorMessage}` },
      { status: 500 }
    );
  }
}
