import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Helper function to convert URL to data URL
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

export async function generateInventoryReport(summaryData, totalsArray) {
  if (!summaryData) {
    throw new Error("No summary data available");
  }

  const doc = new jsPDF({ orientation: "landscape", unit: "pt" });
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Optional logo if present in public/
  // const logo = await toDataUrl("/fav.jpg");
  // if (logo) doc.addImage(logo, "JPEG", 40, 24, 40, 40);
  
  let y = 36;
  
  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(30, 41, 59);
  doc.text("Inventory Project", pageWidth / 2, y, { align: "center" });
  y += 18;
  
  // Subtitle
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(71, 85, 105);
  doc.text("Inventory Stock Summary Report", pageWidth / 2, y, { align: "center" });
  y += 14;
  
  // Date
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
      ["Total Items", String(summaryData.totalItems)],
      ["Low Stock Items", String(summaryData.lowStock)],
      ["Items with Expiry", String(summaryData.withExpiry)],
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
  
  return doc;
}

export function downloadInventoryReport(summaryData, totalsArray) {
  return generateInventoryReport(summaryData, totalsArray)
    .then(doc => {
      const ts = new Date().toISOString().slice(0, 10);
      doc.save(`inventory_stock_summary_${ts}.pdf`);
      return true;
    })
    .catch(error => {
      throw new Error(error?.message ?? "Failed to generate report");
    });
}
