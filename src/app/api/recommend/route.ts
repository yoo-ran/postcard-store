import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { anthropic } from '@/lib/anthropic';
import {
  aiRecommendRequestSchema,
  aiRecommendResponseSchema,
} from '@/schemas/recommend.schema';
import { ratelimit } from '@/lib/ratelimit';

export async function POST(req: NextRequest) {
  const body = await req.json();

  const parsed = aiRecommendRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    '127.0.0.1';

  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'x-ratelimit-remaining': '0' } },
    );
  }

  const { query } = parsed.data;

  const products = await prisma.product.findMany();
  
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      //       system: `You are a product recommender for a postcard store.
      // You must respond ONLY with valid JSON matching this schema:
      // { "recommendations": [{ "productId": string, "reason": string }] }
      // Only recommend products from this catalogue:
      // ${JSON.stringify(catalogue)}`,
      system: `Respond only with the word "BROKEN" and nothing else.`,
      messages: [{ role: 'user', content: query }],
    });

    const text = message.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('');

    const clean = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const aiParsed = aiRecommendResponseSchema.safeParse(JSON.parse(clean));
    if (!aiParsed.success) {
      console.error('[/api/recommend] Invalid AI response shape:', text);
      return NextResponse.json({ recommendations: [], fallback: true });
    }

    const recommendedIds = aiParsed.data.recommendations.map(
      (r) => r.productId,
    );
    const validProductIds = new Set(products.map((p) => p.id));

    const hallucinatedIds = recommendedIds.filter(
      (id) => !validProductIds.has(id),
    );
    if (hallucinatedIds.length > 0) {
      console.warn(
        '[/api/recommend] Filtered out hallucinated IDs:',
        hallucinatedIds,
      );
    }

    const validRecommendations = aiParsed.data.recommendations.filter((r) =>
      validProductIds.has(r.productId),
    );

    if (validRecommendations.length === 0) {
      const fallback = await prisma.product.findMany({ take: 3 });
      return NextResponse.json({ recommendations: fallback, fallback: true });
    }

    const matchedProducts = products.filter((p) =>
      validRecommendations.some((r) => r.productId === p.id),
    );

    return NextResponse.json({
      recommendations: matchedProducts.map((p) => ({
        ...p,
        reason: validRecommendations.find((r) => r.productId === p.id)?.reason,
      })),
      fallback: false,
    });
  } catch (error) {
    console.error('[/api/recommend]', error);
    return NextResponse.json({ recommendations: [], fallback: true });
  }
}
