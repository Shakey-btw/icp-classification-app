'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { usePreloader } from '@/hooks/usePreloader';
import { storage, Session, Industry } from '@/lib/storage';
import { exportToCSV } from '@/lib/csvParser';
import WebsiteViewer from '@/components/classification/WebsiteViewer';
import ProgressBar from '@/components/classification/ProgressBar';
import Controls from '@/components/classification/Controls';
import BadgeAnimation from '@/components/classification/BadgeAnimation';
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
  const [badgeAnimation, setBadgeAnimation] = useState<'icp' | 'not_icp' | Industry | null>(null);

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

    // Show badge animation only in ICP mode
    if (mode === 'icp') {
      setBadgeAnimation(classification);
    }

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

    // Show badge animation
    setBadgeAnimation(industry);

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

  // Keyboard navigation
  useKeyboardNavigation({
    onLeft: mode === 'icp' ? () => handleClassify('not_icp') : () => {},
    onRight: mode === 'icp' ? () => handleClassify('icp') : () => {},
    onUndo: handleUndo,
    onOpenInNewTab: handleOpenInNewTab,
    enabled: !!session,
  });

  if (!session || currentIndex >= websites.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  const currentWebsite = websites[currentIndex];
  const classifiedCount = session.current_index;

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
      <header className="px-8 py-2 bg-white" style={{ borderBottom: '1px solid #EAEBEF' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => router.push('/')}
              className="flex items-center font-medium text-gray-900"
              style={{ gap: '6px', fontSize: '30px', fontFamily: 'Inter, sans-serif', letterSpacing: '-1px' }}
            >
              <Image
                src="/procuros-logo.svg"
                alt="Logo"
                width={32}
                height={32}
                style={{ borderRadius: '6px', boxShadow: 'inset 0 0.5px 1.5px 1.5px rgba(75, 85, 99, 0.273)' }}
              />
              tinder
            </button>
          </div>
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center bg-white focus:outline-none cursor-pointer border border-transparent hover:border-[#E1E2EA] data-[state=open]:border-[#E1E2EA] rounded-md px-2 py-1" style={{ fontSize: '14px', gap: '6px', fontWeight: '500' }}>
                {mode === 'icp' ? 'Qualification' : 'Industry'}
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center">
                <DropdownMenuItem onClick={() => setMode('icp')}>
                  Qualification
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
                boxShadow: '0 0.9px 2.7px 0 rgba(225, 229, 237, 0.648), inset 0 -0.9px 0.9px 1.8px #F5F6F9',
              }}
              className="transition-all duration-200 hover:opacity-90 active:scale-[0.97]"
            >
              Download CSV
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-8 py-4">
        <div className="max-w-7xl mx-auto w-full mb-4" style={{ height: 'calc(100vh - 204px)' }}>
          <WebsiteViewer
            url={currentWebsite.url}
            className="h-full"
          />
        </div>

        {/* Controls */}
        <div className="max-w-7xl mx-auto w-full">
          <Controls
            mode={mode}
            onLeft={() => handleClassify('not_icp')}
            onRight={() => handleClassify('icp')}
            onUndo={handleUndo}
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

      {/* Badge Animation */}
      {badgeAnimation && (
        <BadgeAnimation
          type={badgeAnimation}
          onComplete={() => setBadgeAnimation(null)}
        />
      )}
    </div>
  );
}
