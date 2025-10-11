import React from "react";
import { AlertTriangle } from "lucide-react";

export default function ErrorState({ message = "Failed to load summary.", onRetry }) {
  return (
    <div className="p-6 border border-rose-200 rounded-2xl bg-rose-50 text-rose-700">
      <div className="flex items-center space-x-3">
        <AlertTriangle className="w-6 h-6" />
        <div>
          <h3 className="font-semibold">{message}</h3>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 px-4 py-2 bg-rose-100 hover:bg-rose-200 rounded-lg text-sm font-medium transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
