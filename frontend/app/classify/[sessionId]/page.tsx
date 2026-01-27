'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useClassificationStore } from '@/store/classificationStore';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { usePreloader } from '@/hooks/usePreloader';
import { APIClient } from '@/lib/api';
import WebsiteViewer from '@/components/classification/WebsiteViewer';
import ProgressBar from '@/components/classification/ProgressBar';
import Controls from '@/components/classification/Controls';

export default function ClassifyPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [isInitialized, setIsInitialized] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const {
    websites,
    currentIndex,
    classifications,
    history,
    totalWebsites,
    setSession,
    classify,
    undo,
  } = useClassificationStore();

  // Initialize session
  useEffect(() => {
    const initSession = async () => {
      try {
        const sessionData = await APIClient.getSession(sessionId);

        // Get initial batch of websites if not already loaded
        if (websites.length === 0) {
          const batch = await APIClient.getWebsitesBatch(sessionId, 0, 50);
          setSession(sessionId, batch.websites, sessionData.total_websites);
        }

        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize session:', error);
        router.push('/');
      }
    };

    if (sessionId) {
      initSession();
    }
  }, [sessionId, setSession, websites.length, router]);

  // Preload next websites
  usePreloader(websites, currentIndex, 10);

  // Check if all websites are classified
  useEffect(() => {
    if (
      isInitialized &&
      currentIndex >= totalWebsites &&
      totalWebsites > 0
    ) {
      // All done, navigate to export page
      router.push(`/export/${sessionId}`);
    }
  }, [currentIndex, totalWebsites, isInitialized, sessionId, router]);

  // Classification handlers
  const handleClassify = async (classification: 'icp' | 'not_icp') => {
    if (currentIndex >= websites.length) {
      // Need to load more websites
      try {
        const batch = await APIClient.getWebsitesBatch(
          sessionId,
          websites.length,
          50
        );
        if (batch.websites.length > 0) {
          setSession(sessionId, [...websites, ...batch.websites], totalWebsites);
        }
      } catch (error) {
        console.error('Failed to load more websites:', error);
      }
      return;
    }

    const website = websites[currentIndex];
    if (!website) return;

    // Update local state
    classify(website.id, classification);

    // Send to backend
    try {
      await APIClient.classify({
        session_id: sessionId,
        website_id: website.id,
        classification,
      });
    } catch (error) {
      console.error('Failed to classify:', error);
    }
  };

  const handleUndo = async () => {
    if (history.length === 0) return;

    // Update local state
    undo();

    // Send to backend
    try {
      await APIClient.undo({ session_id: sessionId });
      setToast('Undid classification');
      setTimeout(() => setToast(null), 2000);
    } catch (error) {
      console.error('Failed to undo:', error);
    }
  };

  // Keyboard navigation
  useKeyboardNavigation({
    onLeft: () => handleClassify('not_icp'),
    onRight: () => handleClassify('icp'),
    onUndo: handleUndo,
    enabled: isInitialized,
  });

  if (!isInitialized || currentIndex >= websites.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  const currentWebsite = websites[currentIndex];
  const classifiedCount = Object.keys(classifications).length;

  const handleDownload = () => {
    const exportURL = APIClient.getExportURL(sessionId);
    window.location.href = exportURL;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-medium text-gray-900">
            ICP Classification
          </h1>
          <div className="flex items-center gap-6">
            <ProgressBar current={classifiedCount} total={totalWebsites} />
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            >
              Download CSV
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-8 py-4">
        <div className="max-w-7xl mx-auto w-full mb-4" style={{ height: 'calc(100vh - 280px)' }}>
          <WebsiteViewer
            url={currentWebsite.url}
            className="h-full rounded"
          />
        </div>

        {/* Controls */}
        <div className="max-w-7xl mx-auto w-full">
          <Controls
            currentUrl={currentWebsite.url}
            onLeft={() => handleClassify('not_icp')}
            onRight={() => handleClassify('icp')}
            onUndo={handleUndo}
            canUndo={history.length > 0}
          />
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
