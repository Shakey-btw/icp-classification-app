import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  try {
    // Fetch the website
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch: ${response.statusText}` },
        { status: response.status }
      );
    }

    const html = await response.text();

    // Modify HTML to work in iframe
    const modifiedHTML = html
      // Remove CSP headers that block iframe
      .replace(/<meta[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/gi, '')
      // Convert relative URLs to absolute
      .replace(/href=["'](\/)([^"']*)["']/gi, `href="${new URL('/', url).origin}/$2"`)
      .replace(/src=["'](\/)([^"']*)["']/gi, `src="${new URL('/', url).origin}/$2"`);

    return new NextResponse(modifiedHTML, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        // Allow iframe embedding
        'X-Frame-Options': 'ALLOWALL',
        'Content-Security-Policy': 'frame-ancestors *',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch website' },
      { status: 500 }
    );
  }
}
