// src/pages/ReportsPage.tsx
import React, { useState } from "react";
import { useToasts, ToastStack } from "../../components/Toast";
import { useReportsData } from "../../hooks/useReportsData";
import { downloadInventoryReport } from "../../utils/pdfGenerator";
import {
  ReportsHeader,
  LoadingSkeleton,
  KPIGrid,
  ErrorState,
} from "../../components/Reports";
import '../../CSS/InventoryCSS/reportsPage.css';

/* ----------------------- Page ----------------------- */
export default function ReportsPage() {
  const [downloading, setDownloading] = useState(false);
  const { toasts, push } = useToasts();
  const { summaryData, totalsArray, loading, error, refetch } = useReportsData();

  const handleGeneratePdf = async () => {
    if (!summaryData) return;
    
    try {
      setDownloading(true);
      await downloadInventoryReport(summaryData, totalsArray);
      push({
        title: "Report downloaded",
        desc: "The Inventory Stock Summary PDF has been saved.",
      });
    } catch (err) {
      alert(err?.message ?? "Failed to generate report");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="reports-root">
      <ReportsHeader
        onGenerateReport={handleGeneratePdf}
        isGenerating={downloading}
        isDisabled={!summaryData}
      />
      
      <div className="reports-content">
        {loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : (
          <div>
            <KPIGrid data={summaryData} />
            {/* Additional content can be added here */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <div className="text-sm text-gray-600">
                Last updated: {new Date().toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <ToastStack toasts={toasts} />
    </div>
  );
}
