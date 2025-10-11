import React from "react";
import { BarChart3, Download } from "lucide-react";

export default function ReportsHeader({ onGenerateReport, isGenerating, isDisabled }) {
  return (
    <div className="reports-header">
      <div className="reports-header-inner">
        <div className="reports-header-title">
          <div className="reports-header-icon">
            <BarChart3 style={{ width: 20, height: 20 }} />
          </div>
          <h1 className="reports-title">Reports</h1>
        </div>
        <button
          onClick={onGenerateReport}
          disabled={isDisabled || isGenerating}
          className="reports-btn"
          title="Download PDF report"
        >
          <Download style={{ width: 16, height: 16, transition: 'transform 0.2s' }} />
          {isGenerating ? "Generating…" : "Generate Report"}
        </button>
      </div>
    </div>
  );
}
