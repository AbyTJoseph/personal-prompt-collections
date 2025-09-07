import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';

const PROMPTS_DIR = join(process.cwd(), 'prompts');
const EXCERPT_LENGTH = 500;
const EXCERPT_LINES = 5;

function getPromptSlugs(): string[] {
  try {
    return readdirSync(PROMPTS_DIR)
      .filter(file => file.endsWith('.md'))
      .map(file => file.replace(/\.md$/, ''));
  } catch (error) {
    console.error('Error reading prompts directory:', error);
    return [];
  }
}

function getPromptBySlug(slug: string) {
  try {
    const fullPath = join(PROMPTS_DIR, `${slug}.md`);
    const fileContents = readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);
    
    return {
      slug,
      content,
      frontmatter: data,
    };
  } catch (error) {
    console.error(`Error reading prompt ${slug}:`, error);
    return null;
  }
}

function generateCatalogEntry(prompt: any) {
  if (!prompt) return null;

  const processedText = prompt.content
    .split('\n')
    .filter((line: string) => line.trim() !== '')
    .slice(0, EXCERPT_LINES)
    .join(' ');

  const excerpt = processedText.length > EXCERPT_LENGTH
    ? processedText.slice(0, EXCERPT_LENGTH) + '...'
    : processedText;

  return {
    slug: prompt.slug,
    title: prompt.frontmatter.title,
    tags: prompt.frontmatter.tags || [],
    aliases: prompt.frontmatter.aliases,
    collection: prompt.frontmatter.collection,
    createdAt: prompt.frontmatter.createdAt,
    updatedAt: prompt.frontmatter.updatedAt,
    likes: prompt.frontmatter.likes || 0,
    excerpt,
  };
}

export async function GET(request: NextRequest) {
  try {
    const slugs = getPromptSlugs();
    const prompts = slugs
      .map(slug => getPromptBySlug(slug))
      .filter(Boolean);
    
    const catalog = prompts
      .map(generateCatalogEntry)
      .filter(Boolean);

    return NextResponse.json(catalog);
  } catch (error) {
    console.error('Error generating catalog:', error);
    return NextResponse.json(
      { error: 'Failed to generate catalog' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Slug parameter is required' },
        { status: 400 }
      );
    }

    const fs = require('fs');
    const path = require('path');
    const promptPath = path.join(process.cwd(), 'prompts', `${slug}.md`);
    
    // Check if file exists
    if (!fs.existsSync(promptPath)) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      );
    }

    // Delete the file
    fs.unlinkSync(promptPath);
    
    return NextResponse.json({ success: true, message: 'Prompt deleted successfully' });
  } catch (error) {
    console.error('Error deleting prompt:', error);
    return NextResponse.json(
      { error: 'Failed to delete prompt' },
      { status: 500 }
    );
  }
}
