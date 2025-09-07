import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';
import { EXCERPT_LENGTH } from '@/config/constants';

const PROMPTS_DIR = join(process.cwd(), 'prompts');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, tags, collection } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Create slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Check if file already exists
    const filePath = join(PROMPTS_DIR, `${slug}.md`);
    if (existsSync(filePath)) {
      return NextResponse.json(
        { error: 'A prompt with this title already exists' },
        { status: 409 }
      );
    }

    // Create frontmatter - only include defined values
    const frontmatter: any = {
      title,
      tags: tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likes: 0,
    };

    // Only add collection if it has a value
    if (collection && collection.trim()) {
      frontmatter.collection = collection.trim();
    }

    // Create markdown content with frontmatter
    const markdownContent = matter.stringify(content, frontmatter);

    // Write file
    writeFileSync(filePath, markdownContent, 'utf8');

    // Trigger catalog rebuild in background (don't wait for it)
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/rebuild-catalog`, {
      method: 'POST'
    }).catch(err => console.error('Failed to rebuild catalog:', err));

    // Return the created prompt info
    return NextResponse.json({
      slug,
      title,
      tags: tags || [],
      collection,
      excerpt: content.length > EXCERPT_LENGTH 
        ? content.slice(0, EXCERPT_LENGTH) + '...'
        : content,
      updatedAt: frontmatter.updatedAt,
    });

  } catch (error) {
    console.error('Failed to create prompt:', error);
    return NextResponse.json(
      { error: 'Failed to create prompt' },
      { status: 500 }
    );
  }
}
