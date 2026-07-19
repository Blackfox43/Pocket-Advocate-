import React, { useRef } from "react";
import { X, Printer, Download, Mail, Signature, FileText } from "lucide-react";
import { motion } from "motion/react";

interface FormalPrintPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  letterContent: string;
  opponentName: string;
}

export default function FormalPrintPreview({
  isOpen,
  onClose,
  letterContent,
  opponentName
}: FormalPrintPreviewProps) {
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Custom trigger browser print of just the letter container
  const handlePrint = () => {
    const printContent = printAreaRef.current?.innerHTML;
    if (!printContent) return;

    const originalContent = document.body.innerHTML;

    // Create custom print window or set body innerHTML temporarily for a clean print
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>FORMAL DISPUTE NOTICE - ${opponentName || "OPPOSING PARTY"}</title>
            <style>
              body {
                font-family: "Georgia", "Times New Roman", serif;
                padding: 40px;
                color: #111;
                line-height: 1.6;
                background-color: #fff;
              }
              .letterhead {
                text-align: center;
                border-bottom: 2px solid #222;
                padding-bottom: 15px;
                margin-bottom: 30px;
              }
              .letterhead h1 {
                font-family: "Georgia", serif;
                font-size: 24px;
                letter-spacing: 2px;
                margin: 0;
                text-transform: uppercase;
              }
              .letterhead p {
                font-size: 10px;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin: 5px 0 0 0;
                color: #555;
              }
              .certified-stamp {
                border: 2px solid #b91c1c;
                color: #b91c1c;
                display: inline-block;
                padding: 6px 12px;
                font-weight: bold;
                font-family: "Courier New", monospace;
                text-transform: uppercase;
                font-size: 11px;
                margin-bottom: 20px;
                letter-spacing: 1px;
              }
              pre {
                white-space: pre-wrap;
                font-family: "Georgia", "Times New Roman", serif;
                font-size: 14px;
                margin-top: 20px;
              }
              .signature-line {
                margin-top: 50px;
                border-top: 1px solid #777;
                width: 250px;
                padding-top: 5px;
                font-size: 12px;
              }
              @media print {
                body { padding: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            ${printContent}
            <script>
              window.onload = function() {
                window.print();
                window.close();
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  // Download a highly styled, print-ready HTML file
  const handleDownloadHTML = () => {
    const printContent = printAreaRef.current?.innerHTML;
    if (!printContent) return;

    const fullHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>FORMAL DISPUTE NOTICE - ${opponentName || "OPPOSING PARTY"}</title>
  <style>
    body {
      font-family: "Georgia", "Times New Roman", serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 40px;
      color: #111;
      line-height: 1.6;
      background-color: #fff;
      box-shadow: 0 4px 15px rgba(0,0,0,0.08);
      border: 1px solid #e2e8f0;
      border-radius: 4px;
    }
    .letterhead {
      text-align: center;
      border-bottom: 2px solid #222;
      padding-bottom: 15px;
      margin-bottom: 30px;
    }
    .letterhead h1 {
      font-family: "Georgia", serif;
      font-size: 24px;
      letter-spacing: 2px;
      margin: 0;
      text-transform: uppercase;
    }
    .letterhead p {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin: 5px 0 0 0;
      color: #555;
    }
    .certified-stamp {
      border: 2px solid #b91c1c;
      color: #b91c1c;
      display: inline-block;
      padding: 6px 12px;
      font-weight: bold;
      font-family: "Courier New", monospace;
      text-transform: uppercase;
      font-size: 11px;
      margin-bottom: 20px;
      letter-spacing: 1px;
    }
    pre {
      white-space: pre-wrap;
      font-family: "Georgia", "Times New Roman", serif;
      font-size: 14px;
      margin-top: 20px;
    }
    .actions-bar {
      margin-bottom: 20px;
      background: #f8fafc;
      padding: 12px;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
      display: flex;
      gap: 10px;
    }
    .btn {
      background: #4f46e5;
      color: white;
      border: none;
      padding: 8px 16px;
      font-size: 12px;
      font-family: sans-serif;
      font-weight: bold;
      border-radius: 4px;
      cursor: pointer;
    }
    .btn-secondary {
      background: #475569;
    }
    @media print {
      body {
        box-shadow: none;
        border: none;
        margin: 0;
        padding: 0;
      }
      .actions-bar {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="actions-bar">
    <button class="btn" onclick="window.print()">Print This Document</button>
    <p style="margin: auto 0; font-family: sans-serif; font-size: 11px; color: #64748b;">This file contains premium legal-grade formatting styles. Save or print directly to PDF.</p>
  </div>
  ${printContent}
</body>
</html>`;

    const blob = new Blob([fullHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Formal_Notice_${(opponentName || "opponent").replace(/\s+/g, "_")}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Premium Letterhead Print Preview</h3>
              <p className="text-[10px] text-slate-500 font-mono">Formal Legal Layout & Letterhead Print Styling</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Toolbar */}
        <div className="px-6 py-3 bg-slate-950/50 border-b border-slate-800/60 flex items-center justify-between gap-3 flex-wrap">
          <p className="text-[10px] text-slate-400 font-mono">
            This preview applies standard 1-inch margins, traditional Georgia typography, and Certified Mail tags.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadHTML}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download HTML Notice
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shadow-lg shadow-indigo-600/10"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
          </div>
        </div>

        {/* Printable Area preview panel */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-950 flex justify-center">
          <div 
            ref={printAreaRef}
            className="w-full max-w-[650px] bg-white text-slate-900 p-8 md:p-12 font-serif text-[13px] leading-relaxed shadow-xl border border-slate-200 rounded-sm"
            style={{ fontFamily: '"Georgia", "Times New Roman", serif' }}
          >
            {/* Formal Letterhead */}
            <div className="text-center border-b-2 border-slate-800 pb-4 mb-6">
              <h1 className="text-lg font-bold uppercase tracking-widest text-slate-900 m-0">
                Formal Notice of Dispute
              </h1>
              <p className="text-[9px] font-mono uppercase tracking-wider text-slate-500 m-0 mt-1">
                Prepared via AI Pocket Advocate &bull; Legal Rights Reserved
              </p>
            </div>

            {/* Certified Mail stamp */}
            <div className="inline-block border-2 border-red-700 text-red-700 font-mono font-bold uppercase tracking-wider px-2.5 py-1 text-[10px] mb-6">
              SENT VIA REGISTERED MAIL / RETURN RECEIPT REQUESTED
            </div>

            {/* Main Letter Text */}
            <pre className="whitespace-pre-wrap leading-relaxed font-serif text-[13px] text-slate-900 m-0" style={{ fontFamily: '"Georgia", "Times New Roman", serif' }}>
              {letterContent}
            </pre>

            {/* Traditional Signature box */}
            <div className="mt-8 pt-4 border-t border-slate-200 max-w-[200px]">
              <div className="text-[10px] font-sans uppercase tracking-wider text-slate-400 mb-6">
                Claimant Signature
              </div>
              <div className="h-6 font-mono text-slate-300 italic select-none">
                (Signature)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
