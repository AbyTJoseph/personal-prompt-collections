import { NextResponse } from 'next/server';
import { getPromptBySlug } from '@/lib/prompts';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const prompt = getPromptBySlug(slug);
    return NextResponse.json(prompt);
  } catch (error) {
    return new NextResponse('Prompt not found', { status: 404 });
  }
}
