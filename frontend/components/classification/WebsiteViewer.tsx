'use client';

import { useState, useEffect } from 'react';
import { APIClient } from '@/lib/api';
import { preloader } from '@/lib/preloader';

interface WebsiteViewerProps {
  url: string;
  className?: string;
}

export default function WebsiteViewer({ url, className = '' }: WebsiteViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);

  const proxyURL = APIClient.getProxyURL(url);

  // Check if content is preloaded
  useEffect(() => {
    const preloadedContent = preloader.get(url);
    if (preloadedContent) {
      setHtmlContent(preloadedContent);
      setIsLoading(false);
      setError(false);
    } else {
      setHtmlContent(null);
      setIsLoading(true);
    }
  }, [url]);

  const handleLoad = () => {
    setIsLoading(false);
    setError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setError(true);
  };

  return (
    <div className={`relative bg-white border border-gray-200 ${className}`}>
      {isLoading && !htmlContent && (
        <div className="absolute inset-0 flex items-center justify-center bg-white">
          <div className="text-gray-600">Loading website...</div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white p-8">
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
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Open in new tab
          </a>
        </div>
      )}

      {htmlContent ? (
        <iframe
          srcDoc={htmlContent}
          className={`w-full h-full border-0 ${error ? 'hidden' : ''}`}
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          onError={handleError}
          title="Website Preview"
        />
      ) : (
        <iframe
          src={proxyURL}
          className={`w-full h-full border-0 ${isLoading || error ? 'hidden' : ''}`}
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          onLoad={handleLoad}
          onError={handleError}
          title="Website Preview"
        />
      )}
    </div>
  );
}
