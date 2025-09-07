import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';

const PROMPTS_DIR = join(process.cwd(), 'prompts');

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug is required' },
        { status: 400 }
      );
    }

    const filePath = join(PROMPTS_DIR, `${slug}.md`);

    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      );
    }

    // Read existing file
    const fileContents = readFileSync(filePath, 'utf8');
    const { data: frontmatter, content } = matter(fileContents);

    // Increment likes count
    const currentLikes = frontmatter.likes || 0;
    const newLikes = currentLikes + 1;

    // Update frontmatter
    const updatedFrontmatter = {
      ...frontmatter,
      likes: newLikes,
      updatedAt: new Date().toISOString(),
    };

    // Create updated markdown content
    const updatedMarkdownContent = matter.stringify(content, updatedFrontmatter);

    // Write updated file
    writeFileSync(filePath, updatedMarkdownContent, 'utf8');

    // Trigger catalog rebuild in background
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/rebuild-catalog`, {
      method: 'POST'
    }).catch(err => console.error('Failed to rebuild catalog:', err));

    // Return updated likes count
    return NextResponse.json({
      slug,
      likes: newLikes,
      success: true,
    });

  } catch (error) {
    console.error('Failed to update likes:', error);
    return NextResponse.json(
      { error: 'Failed to update likes' },
      { status: 500 }
    );
  }
}
