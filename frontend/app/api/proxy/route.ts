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

    const contentType = response.headers.get('content-type') || 'text/html';

    // Only modify HTML content
    if (contentType.includes('text/html')) {
      const html = await response.text();

      // Get the base URL for the site
      const parsedUrl = new URL(url);
      const baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}`;

      // Modify HTML to work in iframe
      let modifiedHTML = html
        // Remove security headers that block iframe embedding
        .replace(/<meta[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/gi, '')
        .replace(/<meta[^>]*http-equiv=["']X-Frame-Options["'][^>]*>/gi, '')
        // Remove existing base tags that might conflict
        .replace(/<base[^>]*>/gi, '');

      // Inject base tag to fix relative URLs
      const baseTag = `<base href="${baseUrl}/" target="_parent">`;

      // Try to inject after <head> tag
      if (modifiedHTML.match(/<head>/i)) {
        modifiedHTML = modifiedHTML.replace(/<head>/i, `<head>${baseTag}`);
      } else {
        // If no head tag, create one
        if (modifiedHTML.match(/<html[^>]*>/i)) {
          modifiedHTML = modifiedHTML.replace(/<html([^>]*)>/i, `<html$1><head>${baseTag}</head>`);
        } else {
          modifiedHTML = `<head>${baseTag}</head>` + modifiedHTML;
        }
      }

      return new NextResponse(modifiedHTML, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'X-Frame-Options': 'ALLOWALL',
          'Content-Security-Policy': 'frame-ancestors *',
        },
      });
    } else {
      // For non-HTML content (CSS, JS, images), just return as-is
      const content = await response.arrayBuffer();
      return new NextResponse(content, {
        status: 200,
        headers: {
          'Content-Type': contentType,
        },
      });
    }
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch website' },
      { status: 500 }
    );
  }
}
