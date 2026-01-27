'use client';

interface ControlsProps {
  currentUrl: string;
  onLeft: () => void;
  onRight: () => void;
  onUndo: () => void;
  canUndo: boolean;
}

export default function Controls({
  currentUrl,
  onLeft,
  onRight,
  onUndo,
  canUndo,
}: ControlsProps) {
  return (
    <div className="space-y-4">
      {/* Current URL */}
      <div className="text-center">
        <div className="text-sm text-gray-600 mb-1">Current Website</div>
        <div className="text-sm font-medium text-gray-900 truncate px-4">
          {currentUrl}
        </div>
      </div>

      {/* Classification Buttons */}
      <div className="flex items-center justify-center gap-8">
        <button
          onClick={onLeft}
          className="flex-1 max-w-xs px-8 py-4 bg-gray-800 text-white rounded font-medium hover:bg-gray-900 transition-colors"
        >
          ← Not ICP
        </button>

        <button
          onClick={onRight}
          className="flex-1 max-w-xs px-8 py-4 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors"
        >
          ICP →
        </button>
      </div>

      {/* Keyboard Hints */}
      <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
        <div>← Left Arrow: Not ICP</div>
        <div>→ Right Arrow: ICP</div>
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
