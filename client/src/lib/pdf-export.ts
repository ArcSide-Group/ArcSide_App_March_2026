import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const BRAND_CYAN = [0, 188, 212] as [number, number, number];
const BRAND_ORANGE = [255, 87, 34] as [number, number, number];
const DARK_NAVY = [2, 28, 71] as [number, number, number];
const WHITE = [255, 255, 255] as [number, number, number];
const LIGHT_GRAY = [245, 247, 250] as [number, number, number];
const MID_GRAY = [100, 116, 139] as [number, number, number];
const DARK_TEXT = [15, 23, 42] as [number, number, number];

function addHeader(doc: jsPDF, subtitle: string) {
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(...DARK_NAVY);
  doc.rect(0, 0, pageWidth, 28, "F");

  doc.setTextColor(...BRAND_CYAN);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("ArcSide", 14, 13);

  doc.setTextColor(...WHITE);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("Made by Tradesmen for Tradesmen", 14, 19);

  doc.setTextColor(...BRAND_CYAN);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(subtitle, pageWidth - 14, 12, { align: "right" });

  doc.setTextColor(...MID_GRAY);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 14, 19, { align: "right" });
}

function addFooter(doc: jsPDF) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setFillColor(...LIGHT_GRAY);
  doc.rect(0, pageHeight - 12, pageWidth, 12, "F");

  doc.setTextColor(...MID_GRAY);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("ArcSide™ — Professional Welding Tools", 14, pageHeight - 4);
  doc.text("This document is AI-generated. Always verify with a certified welding engineer.", pageWidth - 14, pageHeight - 4, { align: "right" });
}

function sectionTitle(doc: jsPDF, text: string, y: number): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFillColor(...BRAND_CYAN);
  doc.rect(14, y, 3, 6, "F");
  doc.setTextColor(...DARK_TEXT);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(text, 20, y + 4.5);
  return y + 12;
}

export function exportWpsPdf(wpsResult: any, formData: any) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 36;

  addHeader(doc, "Welding Procedure Specification");

  const result = wpsResult.result || wpsResult;

  doc.setFillColor(...LIGHT_GRAY);
  doc.roundedRect(14, y, pageWidth - 28, 28, 2, 2, "F");

  doc.setTextColor(...DARK_TEXT);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(formData.projectName || "WPS Document", 20, y + 9);

  doc.setTextColor(...MID_GRAY);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`WPS No: ${result.wpsNumber || "WPS-001"}`, 20, y + 17);
  doc.text(`Standard: ${formData.standard || "N/A"}`, 20, y + 23);

  doc.setTextColor(...DARK_TEXT);
  doc.setFontSize(8);
  doc.text(`Revision: 0`, pageWidth - 20, y + 17, { align: "right" });
  doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 20, y + 23, { align: "right" });
  y += 36;

  y = sectionTitle(doc, "Base Material & Joint", y);
  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    head: [["Parameter", "Value"]],
    body: [
      ["Base Material", formData.baseMaterial || "N/A"],
      ["Thickness", formData.thickness ? `${formData.thickness} mm` : "N/A"],
      ["Joint Type", formData.jointType || "N/A"],
      ["Welding Process", formData.process || "N/A"],
    ],
    headStyles: { fillColor: DARK_NAVY, textColor: WHITE, fontSize: 8 },
    bodyStyles: { fontSize: 8, textColor: DARK_TEXT },
    alternateRowStyles: { fillColor: LIGHT_GRAY },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 55 } },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  y = sectionTitle(doc, "Filler Metal", y);
  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    head: [["Parameter", "Value"]],
    body: [
      ["Filler Metal Classification", result.fillerMetal || "N/A"],
    ],
    headStyles: { fillColor: DARK_NAVY, textColor: WHITE, fontSize: 8 },
    bodyStyles: { fontSize: 8, textColor: DARK_TEXT },
    alternateRowStyles: { fillColor: LIGHT_GRAY },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 55 } },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  if (result.parameters && Object.keys(result.parameters).length > 0) {
    y = sectionTitle(doc, "Welding Parameters", y);
    const paramRows = Object.entries(result.parameters).map(([key, value]) => [
      key.replace(/([A-Z])/g, " $1").replace(/^./, (s: string) => s.toUpperCase()),
      String(value),
    ]);
    autoTable(doc, {
      startY: y,
      margin: { left: 14, right: 14 },
      head: [["Parameter", "Value"]],
      body: paramRows,
      headStyles: { fillColor: DARK_NAVY, textColor: WHITE, fontSize: 8 },
      bodyStyles: { fontSize: 8, textColor: DARK_TEXT },
      alternateRowStyles: { fillColor: LIGHT_GRAY },
      columnStyles: { 0: { fontStyle: "bold", cellWidth: 55 } },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  if (result.preHeat || result.postWeldHeatTreatment) {
    y = sectionTitle(doc, "Heat Treatment", y);
    const heatRows: [string, string][] = [];
    if (result.preHeat) heatRows.push(["Pre-Heat Requirements", result.preHeat]);
    if (result.postWeldHeatTreatment) heatRows.push(["Post-Weld Heat Treatment", result.postWeldHeatTreatment]);
    autoTable(doc, {
      startY: y,
      margin: { left: 14, right: 14 },
      head: [["Parameter", "Value"]],
      body: heatRows,
      headStyles: { fillColor: DARK_NAVY, textColor: WHITE, fontSize: 8 },
      bodyStyles: { fontSize: 8, textColor: DARK_TEXT },
      alternateRowStyles: { fillColor: LIGHT_GRAY },
      columnStyles: { 0: { fontStyle: "bold", cellWidth: 55 } },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  if (result.qualificationRequirements && result.qualificationRequirements.length > 0) {
    y = sectionTitle(doc, "Qualification Requirements", y);
    result.qualificationRequirements.forEach((req: string) => {
      doc.setFillColor(...LIGHT_GRAY);
      doc.roundedRect(14, y, pageWidth - 28, 7, 1, 1, "F");
      doc.setTextColor(...DARK_TEXT);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(`• ${req}`, 18, y + 4.5);
      y += 9;
    });
    y += 4;
  }

  addFooter(doc);

  const filename = `WPS_${(formData.projectName || "document").replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(filename);
}

export function exportDefectAnalysisPdf(analysis: any, imageDataUrl?: string) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 36;

  addHeader(doc, "Weld Defect Analysis Report");

  const result = analysis.result || analysis;

  const severityColors: Record<string, [number, number, number]> = {
    low: [34, 197, 94],
    medium: [234, 179, 8],
    high: [239, 68, 68],
    critical: [185, 28, 28],
  };
  const sColor = severityColors[result.severity] || MID_GRAY;

  doc.setFillColor(...LIGHT_GRAY);
  doc.roundedRect(14, y, pageWidth - 28, 22, 2, 2, "F");
  doc.setTextColor(...DARK_TEXT);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(result.defectType || "Weld Defect", 20, y + 9);
  doc.setFillColor(...sColor);
  doc.roundedRect(pageWidth - 46, y + 4, 32, 8, 2, 2, "F");
  doc.setTextColor(...WHITE);
  doc.setFontSize(8);
  doc.text((result.severity || "unknown").toUpperCase(), pageWidth - 30, y + 9.5, { align: "center" });
  doc.setTextColor(...MID_GRAY);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`Analysis Date: ${new Date().toLocaleString()}`, 20, y + 17);
  y += 30;

  if (result.description) {
    y = sectionTitle(doc, "Description", y);
    doc.setTextColor(...DARK_TEXT);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    const descLines = doc.splitTextToSize(result.description, pageWidth - 28);
    doc.text(descLines, 14, y);
    y += descLines.length * 5 + 8;
  }

  if (result.causes && result.causes.length > 0) {
    y = sectionTitle(doc, "Probable Causes", y);
    autoTable(doc, {
      startY: y,
      margin: { left: 14, right: 14 },
      body: result.causes.map((c: string, i: number) => [`${i + 1}.`, c]),
      bodyStyles: { fontSize: 8, textColor: DARK_TEXT },
      alternateRowStyles: { fillColor: LIGHT_GRAY },
      columnStyles: { 0: { cellWidth: 8, fontStyle: "bold" } },
      theme: "plain",
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  if (result.solutions && result.solutions.length > 0) {
    y = sectionTitle(doc, "Recommended Solutions", y);
    autoTable(doc, {
      startY: y,
      margin: { left: 14, right: 14 },
      body: result.solutions.map((s: string, i: number) => [`${i + 1}.`, s]),
      bodyStyles: { fontSize: 8, textColor: DARK_TEXT },
      alternateRowStyles: { fillColor: LIGHT_GRAY },
      columnStyles: { 0: { cellWidth: 8, fontStyle: "bold" } },
      theme: "plain",
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  if (result.preventionTips && result.preventionTips.length > 0) {
    y = sectionTitle(doc, "Prevention Tips", y);
    doc.setFillColor(0, 188, 212, 0.08);
    const tipsHeight = result.preventionTips.length * 9 + 6;
    doc.setFillColor(240, 253, 255);
    doc.roundedRect(14, y - 2, pageWidth - 28, tipsHeight, 2, 2, "F");
    result.preventionTips.forEach((tip: string, i: number) => {
      doc.setTextColor(...[0, 150, 170] as [number, number, number]);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("•", 18, y + i * 9 + 4);
      doc.setTextColor(...DARK_TEXT);
      doc.setFont("helvetica", "normal");
      const tipLines = doc.splitTextToSize(tip, pageWidth - 40);
      doc.text(tipLines, 22, y + i * 9 + 4);
    });
    y += tipsHeight + 8;
  }

  if (result.standards) {
    y = sectionTitle(doc, "Standards Reference", y);
    doc.setFillColor(...LIGHT_GRAY);
    doc.roundedRect(14, y - 2, pageWidth - 28, 14, 2, 2, "F");
    doc.setTextColor(...DARK_TEXT);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    const stdLines = doc.splitTextToSize(result.standards, pageWidth - 32);
    doc.text(stdLines, 18, y + 5);
    y += 20;
  }

  addFooter(doc);

  const filename = `Defect_Analysis_${(result.defectType || "report").replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(filename);
}

export function exportMaterialCheckPdf(result: any, material1: string, material2: string) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 36;

  addHeader(doc, "Material Compatibility Report");

  const data = result.result || result;

  const statusColors: Record<string, [number, number, number]> = {
    compatible: [34, 197, 94],
    caution: [234, 179, 8],
    incompatible: [239, 68, 68],
  };
  const sColor = statusColors[data.status] || MID_GRAY;

  doc.setFillColor(...LIGHT_GRAY);
  doc.roundedRect(14, y, pageWidth - 28, 26, 2, 2, "F");
  doc.setTextColor(...DARK_TEXT);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`${material1}`, 20, y + 8);
  doc.setTextColor(...MID_GRAY);
  doc.setFontSize(8);
  doc.text("combined with", 20, y + 14);
  doc.setTextColor(...DARK_TEXT);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`${material2}`, 20, y + 21);
  doc.setFillColor(...sColor);
  doc.roundedRect(pageWidth - 50, y + 8, 36, 10, 2, 2, "F");
  doc.setTextColor(...WHITE);
  doc.setFontSize(8);
  doc.text((data.status || "unknown").toUpperCase(), pageWidth - 32, y + 14.5, { align: "center" });
  y += 34;

  if (data.compatibility) {
    y = sectionTitle(doc, "Compatibility Summary", y);
    doc.setTextColor(...DARK_TEXT);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    const summaryLines = doc.splitTextToSize(data.compatibility, pageWidth - 28);
    doc.text(summaryLines, 14, y);
    y += summaryLines.length * 5 + 8;
  }

  if (data.recommendations && data.recommendations.length > 0) {
    y = sectionTitle(doc, "Welding Recommendations", y);
    autoTable(doc, {
      startY: y,
      margin: { left: 14, right: 14 },
      head: [["#", "Recommendation", "Details"]],
      body: data.recommendations.map((rec: any, i: number) => [
        i + 1,
        rec.title || "",
        rec.description || "",
      ]),
      headStyles: { fillColor: DARK_NAVY, textColor: WHITE, fontSize: 8 },
      bodyStyles: { fontSize: 8, textColor: DARK_TEXT },
      alternateRowStyles: { fillColor: LIGHT_GRAY },
      columnStyles: { 0: { cellWidth: 10 }, 1: { cellWidth: 45, fontStyle: "bold" } },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  if (data.issues && data.issues.length > 0) {
    y = sectionTitle(doc, "Potential Issues", y);
    doc.setFillColor(255, 243, 243);
    doc.roundedRect(14, y - 2, pageWidth - 28, data.issues.length * 9 + 6, 2, 2, "F");
    data.issues.forEach((issue: string, i: number) => {
      doc.setTextColor(220, 38, 38);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("!", 18, y + i * 9 + 4);
      doc.setTextColor(...DARK_TEXT);
      doc.setFont("helvetica", "normal");
      doc.text(issue, 22, y + i * 9 + 4);
    });
  }

  addFooter(doc);

  const filename = `Material_Compatibility_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(filename);
}
