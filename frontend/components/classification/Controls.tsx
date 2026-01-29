'use client';

import { Industry } from '@/lib/storage';

type ClassificationMode = 'icp' | 'industry';

interface ControlsProps {
  currentUrl: string;
  mode: ClassificationMode;
  onLeft: () => void;
  onRight: () => void;
  onUndo: () => void;
  onOpenInNewTab: () => void;
  onIndustrySelect: (industry: Industry) => void;
  canUndo: boolean;
}

export default function Controls({
  currentUrl,
  mode,
  onLeft,
  onRight,
  onUndo,
  onOpenInNewTab,
  onIndustrySelect,
  canUndo,
}: ControlsProps) {
  const industries: Industry[] = [
    'Grocery',
    'Beauty & Cosmetics',
    'DIY',
    'Fashion & Apparel',
    'Furniture',
    'Logistics',
    'Electronics',
    'Pharma',
    'Machinery & Manufacturing',
    'Other',
  ];
  return (
    <div className="space-y-4">
      {/* Current URL */}
      <div className="text-center">
        <div className="text-sm text-gray-600 mb-1">Current Website</div>
        <button
          onClick={onOpenInNewTab}
          className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline truncate px-4 transition-colors"
          title="Click to open in new tab (or press P)"
        >
          {currentUrl}
        </button>
      </div>

      {/* Classification Buttons */}
      {mode === 'icp' ? (
        <div className="flex items-center justify-center gap-8">
          <button
            onClick={onLeft}
            className="flex-1 max-w-xs px-8 py-4 font-medium transition-opacity duration-200 hover:opacity-90"
            style={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              color: 'white',
              fontSize: '14px',
              borderRadius: '10px',
              boxShadow: '0 2px 2px 0 #E1E5ED, inset 0 1px 3px 3px #4B5563',
            }}
          >
            ← Not ICP
          </button>

          <button
            onClick={onRight}
            className="flex-1 max-w-xs px-8 py-4 font-medium transition-opacity duration-200 hover:opacity-90"
            style={{
              backgroundColor: '#00A2EF',
              border: '1px solid #11AAF3',
              color: 'white',
              fontSize: '14px',
              borderRadius: '10px',
              boxShadow: '0 2px 2px 0 #E1E5ED, inset 0 1px 3px 3px #1FB7FF',
            }}
          >
            ICP →
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2">
          {/* First Row */}
          <div className="flex gap-2">
            {industries.slice(0, 5).map((industry) => (
              <button
                key={industry}
                onClick={() => onIndustrySelect(industry)}
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                {industry}
              </button>
            ))}
          </div>
          {/* Second Row */}
          <div className="flex gap-2">
            {industries.slice(5, 10).map((industry) => (
              <button
                key={industry}
                onClick={() => onIndustrySelect(industry)}
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                {industry}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Keyboard Hints */}
      <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
        {mode === 'icp' && (
          <>
            <div>← Left Arrow: Not ICP</div>
            <div>→ Right Arrow: ICP</div>
          </>
        )}
        <div>P: Open in new tab</div>
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`font-medium ${
            canUndo
              ? 'text-gray-900 hover:text-gray-600'
              : 'text-gray-400 cursor-not-allowed'
          }`}
        >
          ⌘Z: Undo
        </button>
      </div>
    </div>
  );
}
