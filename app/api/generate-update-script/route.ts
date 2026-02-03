import { NextRequest, NextResponse } from 'next/server';
import { UpdateScriptConfig, UpdateScriptResponse, MigrationScriptConfig } from '@/types/wizard';
import { generateUpdateScript, generateMigrationScript } from '@/lib/scripts/generator';

// Extended request type to include migration mode options
interface UpdateOrMigrationRequest extends UpdateScriptConfig {
  migrationMode?: boolean;
  keepBackup?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: UpdateOrMigrationRequest = await request.json();
    
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
    
    let result: UpdateScriptResponse;
    
    // Check if this is a migration request
    if (body.migrationMode) {
      const migrationConfig: MigrationScriptConfig = {
        platform: body.platform,
        architecture: body.architecture,
        existingPath: body.hisePath,
        hasFaust: body.hasFaust ?? false,
        keepBackup: body.keepBackup ?? true,
        targetCommit: body.targetCommit,
        faustVersion: body.faustVersion,
      };
      
      result = generateMigrationScript(migrationConfig);
    } else {
      result = generateUpdateScript({
        platform: body.platform,
        architecture: body.architecture,
        hisePath: body.hisePath,
        hasFaust: body.hasFaust ?? false,
        targetCommit: body.targetCommit,
        faustVersion: body.faustVersion,
      });
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating update script:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to generate update script: ${errorMessage}` },
      { status: 500 }
    );
  }
}
