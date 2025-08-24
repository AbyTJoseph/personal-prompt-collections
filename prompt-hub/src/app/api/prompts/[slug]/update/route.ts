import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';
import { EXCERPT_LENGTH } from '@/config/constants';

const PROMPTS_DIR = join(process.cwd(), 'prompts');

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const body = await request.json();
    const { tags, title, content } = body;
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
    const { data: frontmatter, content: existingContent } = matter(fileContents);

    // Update frontmatter
    const updatedFrontmatter = {
      ...frontmatter,
      title: title || frontmatter.title,
      tags: tags || frontmatter.tags,
      updatedAt: new Date().toISOString(),
    };

    // Use provided content or existing content
    const updatedContent = content !== undefined ? content : existingContent;

    // Create updated markdown content
    const updatedMarkdownContent = matter.stringify(updatedContent, updatedFrontmatter);

    // Write updated file
    writeFileSync(filePath, updatedMarkdownContent, 'utf8');

    // Trigger catalog rebuild in background
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/rebuild-catalog`, {
      method: 'POST'
    }).catch(err => console.error('Failed to rebuild catalog:', err));

    // Return updated prompt info
    return NextResponse.json({
      slug,
      title: updatedFrontmatter.title,
      tags: updatedFrontmatter.tags,
      collection: updatedFrontmatter.collection,
      excerpt: updatedContent.length > EXCERPT_LENGTH 
        ? updatedContent.slice(0, EXCERPT_LENGTH) + '...'
        : updatedContent,
      updatedAt: updatedFrontmatter.updatedAt,
    });

  } catch (error) {
    console.error('Failed to update prompt:', error);
    return NextResponse.json(
      { error: 'Failed to update prompt' },
      { status: 500 }
    );
  }
}
