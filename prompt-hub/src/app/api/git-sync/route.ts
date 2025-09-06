import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);
const PROMPTS_DIR = path.join(process.cwd(), 'prompts');

export async function POST() {
  try {
    // Get the current branch name
    const { stdout: branchOutput } = await execAsync('git rev-parse --abbrev-ref HEAD');
    const currentBranch = branchOutput.trim();
    
    console.log(`Current branch: ${currentBranch}`);
    
    // Fetch the latest changes from remote
    console.log('Fetching latest changes from remote...');
    await execAsync('git fetch --prune');
    
    // Pull the latest changes for the current branch
    console.log(`Pulling latest changes for branch: ${currentBranch}`);
    const { stdout: pullOutput, stderr: pullError } = await execAsync(`git pull origin ${currentBranch}`);
    
    // Check if there were any changes to prompt files
    const { stdout: changedFiles } = await execAsync('git diff --name-only HEAD@{1} HEAD');
    const promptChanges = changedFiles
      .split('\n')
      .filter(file => file.startsWith('prompts/') && file.endsWith('.md'));
    
    // If prompt files changed, rebuild the catalog
    if (promptChanges.length > 0) {
      console.log('Prompt files changed, rebuilding catalog...');
      await execAsync('node scripts/build-simple.js');
      
      return NextResponse.json({ 
        success: true, 
        message: 'Git sync completed and catalog rebuilt successfully',
        changes: {
          files: promptChanges,
          count: promptChanges.length,
          pullOutput: pullOutput.trim()
        }
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Git sync completed successfully, no prompt changes detected',
      changes: {
        files: [],
        count: 0,
        pullOutput: pullOutput.trim()
      }
    });
  } catch (error: any) {
    console.error('Failed to sync with git repository:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to sync with git repository', 
        details: error.message || String(error)
      },
      { status: 500 }
    );
  }
}

