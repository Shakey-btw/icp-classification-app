'use client';

import { APIClient } from '@/lib/api';

interface ExportButtonProps {
  sessionId: string;
}

export default function ExportButton({ sessionId }: ExportButtonProps) {
  const handleExport = () => {
    const exportURL = APIClient.getExportURL(sessionId);
    window.location.href = exportURL;
  };

  return (
    <button
      onClick={handleExport}
      className="px-8 py-3 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors"
    >
      Download Results CSV
    </button>
  );
}
