'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { usePreloader } from '@/hooks/usePreloader';
import { storage, Session, Industry } from '@/lib/storage';
import { exportToCSV } from '@/lib/csvParser';
import WebsiteViewer from '@/components/classification/WebsiteViewer';
import ProgressBar from '@/components/classification/ProgressBar';
import Controls from '@/components/classification/Controls';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

export type ClassificationMode = 'icp' | 'industry';

export default function ClassifyPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<Session | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [mode, setMode] = useState<ClassificationMode>('icp');

  // Load session from IndexedDB
  useEffect(() => {
    const loadSession = async () => {
      const sessionData = await storage.getSession(sessionId);
      if (!sessionData) {
        router.push('/');
        return;
      }
      setSession(sessionData);
    };

    loadSession();
  }, [sessionId, router]);

  // Preload next websites
  const websites = session?.websites || [];
  const currentIndex = session?.current_index || 0;
  usePreloader(websites.map(w => w.url), currentIndex, 20);

  // Check if all websites are classified
  useEffect(() => {
    if (session && session.current_index >= session.total_websites) {
      // All done, navigate to export page
      router.push(`/export/${sessionId}`);
    }
  }, [session, sessionId, router]);

  // Classification handlers
  const handleClassify = async (classification: 'icp' | 'not_icp') => {
    if (!session) return;

    const website = session.websites[currentIndex];
    if (!website) return;

    // Update session in IndexedDB
    const updatedSession = await storage.classify(
      sessionId,
      website.id,
      classification
    );
    setSession(updatedSession);
  };

  const handleIndustryClassify = async (industry: Industry) => {
    if (!session) return;

    const website = session.websites[currentIndex];
    if (!website) return;

    // Update session in IndexedDB
    const updatedSession = await storage.classifyIndustry(
      sessionId,
      website.id,
      industry
    );
    setSession(updatedSession);
  };

  const handleUndo = async () => {
    if (!session || session.classification_history.length === 0) return;

    // Update session in IndexedDB
    const updatedSession = await storage.undo(sessionId);
    setSession(updatedSession);

    setToast('Undid classification');
    setTimeout(() => setToast(null), 2000);
  };

  const handleOpenInNewTab = () => {
    const website = session?.websites[currentIndex];
    if (website?.url) {
      window.open(website.url, '_blank', 'noopener,noreferrer');
    }
  };

  // Keyboard navigation (only for ICP mode)
  useKeyboardNavigation({
    onLeft: () => handleClassify('not_icp'),
    onRight: () => handleClassify('icp'),
    onUndo: handleUndo,
    onOpenInNewTab: handleOpenInNewTab,
    enabled: !!session && mode === 'icp',
  });

  if (!session || currentIndex >= websites.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  const currentWebsite = websites[currentIndex];
  const classifiedCount = Object.keys(session.classifications).length;

  const handleDownload = () => {
    exportToCSV(
      session.websites,
      session.classifications,
      session.industries,
      session.csv_filename
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="px-8 py-4" style={{ borderBottom: '1px solid #EAEBEF' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="text-xl font-medium text-gray-900 hover:text-blue-600 transition-colors"
            >
              Procuros Tinder
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 data-[state=open]:bg-gray-50 focus:outline-none transition-colors cursor-pointer">
                {mode === 'icp' ? 'ICP Check' : 'Industry'}
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => setMode('icp')}>
                  ICP Check
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setMode('industry')}>
                  Industry
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-6">
            <ProgressBar current={classifiedCount} total={session.total_websites} />
            <Button
              onClick={handleDownload}
              style={{
                backgroundColor: 'white',
                border: '1px solid #E1E2EA',
                color: '#1F2937',
                fontSize: '14px',
                paddingLeft: '17px',
                paddingRight: '17px',
                paddingTop: '11px',
                paddingBottom: '11px',
                borderRadius: '10px',
                boxShadow: '0 1px 3px 0 rgba(225, 229, 237, 0.72), inset 0 -1px 1px 2px #F5F6F9',
              }}
              className="transition-opacity duration-200 hover:opacity-90"
            >
              Download CSV
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-8 py-4">
        <div className="max-w-7xl mx-auto w-full mb-4" style={{ height: 'calc(100vh - 280px)' }}>
          <WebsiteViewer
            url={currentWebsite.url}
            className="h-full"
          />
        </div>

        {/* Controls */}
        <div className="max-w-7xl mx-auto w-full">
          <Controls
            currentUrl={currentWebsite.url}
            mode={mode}
            onLeft={() => handleClassify('not_icp')}
            onRight={() => handleClassify('icp')}
            onUndo={handleUndo}
            onOpenInNewTab={handleOpenInNewTab}
            onIndustrySelect={handleIndustryClassify}
            canUndo={session.classification_history.length > 0}
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
