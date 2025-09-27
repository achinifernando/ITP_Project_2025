// src/pages/ReportsPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../utils/apiPaths";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  BarChart3,
  PackageCheck,
  AlertTriangle,
  CalendarClock,
  Download,
  Gauge,
  Layers3,
} from "lucide-react";
import '../../CSS/InventoryCSS/reportsPage.css';

/* ----------------------- Tiny Toasts ----------------------- */
function useToasts() {
  const [toasts, setToasts] = useState([]);
  const push = (t) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, ...t }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== 
      id));
    }, 2800);
  };
  return { toasts, push };
}
function ToastStack({ toasts }) {
  return (
    <div className="toast-stack">
      {toasts.map((t) => (
        <div key={t.id} className="toast">
          <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
            <div style={{ marginTop: '2px' }}>
              <PackageCheck style={{ width: 20, height: 20, color: '#0369a1' }} />
            </div>
            <div>
              <div className="toast-title">{t.title}</div>
              {t.desc ? (
                <div className="toast-desc">{t.desc}</div>
              ) : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}


/* ----------------------- Helpers ----------------------- */
async function toDataUrl(url) {
  try {
    const res = await fetch(url, { cache: "no-cache" });
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return "";
  }
}

/* ----------------------- Page ----------------------- */
export default function ReportsPage() {
  const [sum, setSum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const { toasts, push } = useToasts();

  // Fetch report summary data on mount
  useEffect(() => {
    setLoading(true);
    api.get('/api/reports/stock-summary')
      .then(data => setSum(data))
      .catch(() => setSum(null))
      .finally(() => setLoading(false));
  }, []);

  const totalsArray = useMemo(
    () =>
      Object.entries(sum?.totalsByUnit ?? {}).sort(([a], [b]) =>
        a.localeCompare(b)
      ),
    [sum]
  );

  async function generatePdf() {
    if (!sum) return;
    try {
      setDownloading(true);
      const doc = new jsPDF({ orientation: "landscape", unit: "pt" });
      const pageWidth = doc.internal.pageSize.getWidth();
      // Optional logo if present in public/
      // const logo = await toDataUrl("/fav.jpg");
      // if (logo) doc.addImage(logo, "JPEG", 40, 24, 40, 40);
      let y = 36;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(30, 41, 59);
      doc.text("Inventory Project", pageWidth / 2, y, { align: "center" });
      y += 18;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(71, 85, 105);
      doc.text("Inventory Stock Summary Report", pageWidth / 2, y, { align: "center" });
      y += 14;
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, y, { align: "center" });
      y += 18;
      const firstStartY = Math.max(y, 92);
      // Summary table
      autoTable(doc, {
        startY: firstStartY,
        theme: "grid",
        head: [["Summary", "Value"]],
        body: [
          ["Total Items", String(sum.totalItems)],
          ["Low Stock Items", String(sum.lowStock)],
          ["Items with Expiry", String(sum.withExpiry)],
        ],
        styles: { halign: "left", fontSize: 10 },
        headStyles: { fillColor: "#0ea5e9", textColor: "#ffffff" },
        alternateRowStyles: { fillColor: "#f1f5f9" },
        margin: { left: 40, right: 40 },
        tableWidth: 360,
      });
      const afterSummaryY = doc.lastAutoTable.finalY;
      // Totals by unit table
      autoTable(doc, {
        startY: afterSummaryY + 14,
        theme: "grid",
        head: [["Unit", "Total Quantity"]],
        body: totalsArray.length
          ? totalsArray.map(([unit, qty]) => [unit, String(qty)])
          : [["—", "0"]],
        styles: { halign: "left", fontSize: 10 },
        headStyles: { fillColor: "#6366f1", textColor: "#ffffff" },
        alternateRowStyles: { fillColor: "#eef2ff" },
        margin: { left: 40, right: 40 },
        tableWidth: pageWidth - 80,
      });
      const ts = new Date().toISOString().slice(0, 10);
      doc.save(`inventory_stock_summary_${ts}.pdf`);
      push({
        title: "Report downloaded",
        desc: "The Inventory Stock Summary PDF has been saved.",
      });
    } catch (e) {
      alert(e?.message ?? "Failed to generate report");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="reports-root">
      {/* Header bar */}
      <div className="reports-header">
        <div className="reports-header-inner">
          <div className="reports-header-title">
            <div className="reports-header-icon">
              <BarChart3 style={{ width: 20, height: 20 }} />
            </div>
            <h1 className="reports-title">Reports</h1>
          </div>
          <button
            onClick={generatePdf}
            disabled={!sum || downloading}
            className="reports-btn"
            title="Download PDF report"
          >
            <Download style={{ width: 16, height: 16, transition: 'transform 0.2s' }} />
            {downloading ? "Generating…" : "Generate Report"}
          </button>
        </div>
      </div>
      {/* Content */}
      <div className="reports-content">
        {loading ? (
          <div className="reports-grid">
            <div className="reports-card">
              <div className="reports-card-pulse" />
              <div className="reports-card-space">
                <div className="reports-card-pulse" style={{ width: '14rem' }} />
                <div className="reports-card-pulse" style={{ width: '12rem' }} />
                <div className="reports-card-pulse" style={{ width: '15rem' }} />
              </div>
            </div>
          </div>
        ) : !sum ? (
          <div className="p-6 border border-rose-200 rounded-2xl bg-rose-50 text-rose-700">
            Failed to load summary.
          </div>
        ) : (
          <div>
            {/* KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* ...loaded state code... */}
            </div>
            {/* Detail Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ...loaded state code... */}
            </div>
            {/* Bottom CTA */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {/* ...loaded state code... */}
            </div>
          </div>
        )}
      </div>
      <ToastStack toasts={toasts} />
    </div>
  );
}
