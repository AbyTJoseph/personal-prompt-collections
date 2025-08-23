import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST() {
  try {
    // Run the build script to regenerate catalog
    await execAsync('node scripts/build-simple.js');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Catalog rebuilt successfully' 
    });
  } catch (error) {
    console.error('Failed to rebuild catalog:', error);
    return NextResponse.json(
      { error: 'Failed to rebuild catalog' },
      { status: 500 }
    );
  }
}
