'use client';

import { useState, useEffect } from 'react';
import { preloader } from '@/lib/preloader';
import { Spinner } from '@/components/ui/spinner';

interface WebsiteViewerProps {
  url: string;
  className?: string;
}

export default function WebsiteViewer({ url, className = '' }: WebsiteViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);

  const proxyURL = `/api/proxy?url=${encodeURIComponent(url)}`;

  // Check if content is preloaded or wait for it to finish loading
  useEffect(() => {
    let mounted = true;

    // Reset state when URL changes
    setError(false);

    const checkPreloaded = async () => {
      const preloadedContent = preloader.get(url);
      if (preloadedContent) {
        console.log(`[WebsiteViewer] ✓ Using preloaded content for ${url}`);
        if (mounted) {
          setHtmlContent(preloadedContent);
          setIsLoading(false);
          setError(false);
        }
      } else if (preloader.isLoading(url)) {
        console.log(`[WebsiteViewer] ⏳ Waiting for ${url} to finish preloading...`);
        // Don't show loading state - content is being preloaded and will arrive very soon
        setIsLoading(false);
        // Wait for preload to complete
        const interval = setInterval(() => {
          const content = preloader.get(url);
          if (content && mounted) {
            setHtmlContent(content);
            setIsLoading(false);
            setError(false);
            clearInterval(interval);
          }
        }, 50); // Check more frequently (50ms instead of 100ms)

        // Timeout after 5 seconds
        setTimeout(() => {
          clearInterval(interval);
          if (mounted && !preloader.get(url)) {
            setHtmlContent(null);
            // Don't set isLoading here, let the iframe load naturally
          }
        }, 5000);
      } else {
        console.log(`[WebsiteViewer] ⚠️ NOT preloaded: ${url} - loading via proxy iframe`);
        if (mounted) {
          setHtmlContent(null);
          setIsLoading(true); // Show loading for non-preloaded content
        }
      }
    };

    checkPreloaded();

    return () => {
      mounted = false;
    };
  }, [url]);

  const handleLoad = () => {
    setIsLoading(false);
    setError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setError(true);
  };

  // Extract domain from URL
  const getDomain = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace(/^www\./, '');
    } catch {
      return url;
    }
  };

  return (
    <div
      className={className}
      style={{
        background: '#F8F9FB',
        border: '1px solid #EAEBEF',
        borderRadius: '18px',
        padding: '10px'
      }}
    >
      <div className="relative bg-white w-full h-full" style={{ borderRadius: '8px', overflow: 'hidden' }}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
            <div className="inline-flex items-center px-3 py-1 rounded-lg bg-black text-white" style={{ gap: '6px', fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 400, boxShadow: 'inset 0 -0.9px 0.9px 1.8px rgba(255, 255, 255, 0.1)' }}>
              <Spinner className="text-white" />
              Loading...
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white p-8 z-10">
            <div className="text-gray-900 font-medium mb-2">
              Unable to load website
            </div>
            <div className="text-sm text-gray-600 mb-4">
              Some websites block iframe embedding
            </div>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-transform active:scale-[0.97]"
            >
              Open in new tab
            </a>
          </div>
        )}

        {!isLoading && !error && (
          <>
            {htmlContent ? (
              <iframe
                key={`preloaded-${url}`}
                srcDoc={htmlContent}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-top-navigation-by-user-activation allow-popups-to-escape-sandbox"
                onError={handleError}
                title="Website Preview"
                tabIndex={-1}
              />
            ) : (
              <iframe
                key={`proxy-${url}`}
                src={proxyURL}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-top-navigation-by-user-activation allow-popups-to-escape-sandbox"
                onLoad={handleLoad}
                onError={handleError}
                title="Website Preview"
                tabIndex={-1}
              />
            )}
          </>
        )}

        {/* URL Button */}
        <div className="absolute bottom-2 left-0 right-0 flex justify-center z-20 pointer-events-none">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto transition-all duration-200 opacity-80 hover:opacity-100 active:scale-[0.97] truncate max-w-[90%]"
            style={{
              backgroundColor: 'white',
              border: '1px solid #E1E2EA',
              color: '#1F2937',
              fontSize: '14px',
              paddingLeft: '20px',
              paddingRight: '20px',
              paddingTop: '4px',
              paddingBottom: '4px',
              borderRadius: '10px',
              boxShadow: 'inset 0 -0.9px 0.9px 1.8px #E8E9ED',
            }}
          >
            {getDomain(url)}
          </a>
        </div>
      </div>
    </div>
  );
}
