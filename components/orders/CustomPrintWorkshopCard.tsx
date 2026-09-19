'use client';

import React, { useState } from 'react';
import {
  Download,
  Printer,
  Maximize2,
  Copy,
  Check,
  Sparkles,
  Layers,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

interface CustomPrintWorkshopCardProps {
  order: any;
  item: any;
}

function generateQuoteSvg(quote: string, textColor: string = '#EFEBE1'): string {
  const clean = quote.trim().toUpperCase();
  const words = clean.split(/\s+/);
  let line1 = clean;
  let line2 = '';

  if (words.length >= 3) {
    const mid = Math.ceil(words.length / 2);
    line1 = words.slice(0, mid).join(' ');
    line2 = words.slice(mid).join(' ');
  }

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 360" width="800" height="360">
  <defs>
    <filter id="distress" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.5" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </defs>
  <style>
    .quote-text {
      font-family: 'Impact', 'Arial Black', -apple-system, sans-serif;
      font-weight: 900;
      letter-spacing: 5px;
      fill: ${textColor};
      text-anchor: middle;
      filter: url(#distress);
    }
  </style>
  ${
    line2
      ? `<text x="400" y="160" font-size="90" class="quote-text">${line1}</text>
         <text x="400" y="270" font-size="90" class="quote-text">${line2}</text>`
      : `<text x="400" y="210" font-size="94" class="quote-text">${line1}</text>`
  }
</svg>`.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function CustomPrintWorkshopCard({ order, item }: CustomPrintWorkshopCardProps) {
  const [bgMode, setBgMode] = useState<'checker' | 'dark' | 'cream'>('checker');
  const [isCopied, setIsCopied] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const rawArtworkUrl = item.customArtworkUrl || item.custom_artwork_url || '';
  const placement = item.customPlacement || item.custom_placement || (order?.notes?.includes('Placement: front') ? 'front_center' : 'back');
  const scale = item.customScale || item.custom_scale || (order?.notes?.includes('Scale: large') ? 'large' : 'medium');
  
  let quoteText = item.customQuoteText || item.custom_quote_text || '';
  if (!quoteText && !rawArtworkUrl && (item.productName?.includes('Custom') || item.product_name?.includes('Custom') || order?.notes?.includes('CUSTOM PRINT'))) {
    quoteText = 'NOT FOR EVERYONE.';
  }

  const artworkUrl = rawArtworkUrl || (quoteText ? generateQuoteSvg(quoteText, '#F0EBE1') : '');
  const isQuote = Boolean(quoteText) || (artworkUrl && artworkUrl.includes('data:image/svg'));

  if (!artworkUrl && !quoteText && item.edition !== 'custom' && !order?.notes?.includes('CUSTOM PRINT')) {
    return null;
  }

  const getPlacementLabel = (p: string) => {
    switch (p) {
      case 'front_center':
        return 'Front Center (Chest)';
      case 'front_chest':
        return 'Left Chest Insignia';
      case 'back':
      default:
        return 'Rear Back (Shoulder Blades)';
    }
  };

  const getScaleLabel = (s: string) => {
    switch (s) {
      case 'small':
        return 'Small (~15 cm / 6 in)';
      case 'large':
        return 'Large (~35 cm / 14 in)';
      case 'medium':
      default:
        return 'Medium (~25 cm / 10 in)';
    }
  };

  const handleDownload = async () => {
    if (!artworkUrl) {
      toast.error('No artwork URL found for this item.');
      return;
    }

    try {
      const filename = `MENANCE-PRINT_${order.id}_${item.id}_${placement.toUpperCase()}_${item.size || 'M'}.png`;

      if (artworkUrl.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = artworkUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`Downloaded ${filename}`);
        return;
      }

      const res = await fetch(artworkUrl);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      toast.success(`Downloaded ${filename}`);
    } catch (err) {
      console.error('[Download error]', err);
      toast.error('Failed to download artwork file. Try opening in fullscreen.');
    }
  };

  const handleCopy = () => {
    if (!artworkUrl) return;
    navigator.clipboard.writeText(artworkUrl);
    setIsCopied(true);
    toast.success('Artwork source copied to clipboard');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handlePrintSpecSheet = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to print workshop spec sheet.');
      return;
    }

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>MENANCE WORKSHOP SPEC SHEET - ${order.id}</title>
  <style>
    @page { size: A4 portrait; margin: 15mm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace, sans-serif;
      color: #000;
      background: #fff;
      margin: 0;
      padding: 0;
    }
    .header {
      border-bottom: 2px solid #000;
      padding-bottom: 12px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .title {
      font-size: 20px;
      font-weight: 900;
      letter-spacing: 2px;
      text-transform: uppercase;
    }
    .badge {
      font-size: 11px;
      font-weight: 700;
      background: #000;
      color: #fff;
      padding: 4px 8px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-bottom: 20px;
      border: 1px solid #ccc;
      padding: 12px;
      background: #fafafa;
    }
    .grid-item {
      font-size: 12px;
    }
    .label {
      font-size: 10px;
      color: #666;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .val {
      font-size: 13px;
      font-weight: 700;
      margin-top: 2px;
    }
    .artwork-box {
      border: 2px dashed #000;
      padding: 20px;
      text-align: center;
      margin: 20px 0;
      min-height: 380px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #fdfdfd;
      position: relative;
    }
    .artwork-box img {
      max-width: 100%;
      max-height: 340px;
      object-fit: contain;
    }
    .crosshair {
      position: absolute;
      width: 20px;
      height: 20px;
      border-left: 1px solid #999;
      border-top: 1px solid #999;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
      opacity: 0.3;
    }
    .qa-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
      font-size: 11px;
    }
    .qa-table th, .qa-table td {
      border: 1px solid #000;
      padding: 8px 10px;
      text-align: left;
    }
    .qa-table th {
      background: #f0f0f0;
      text-transform: uppercase;
      font-size: 10px;
    }
    .checkbox-box {
      display: inline-block;
      width: 14px;
      height: 14px;
      border: 1px solid #000;
      margin-right: 6px;
      vertical-align: middle;
    }
    .footer {
      margin-top: 24px;
      border-top: 1px solid #ccc;
      padding-top: 8px;
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="title">MENANCE // PRODUCTION WORKSHOP SPEC</div>
      <div style="font-size: 12px; margin-top: 4px; font-weight: 600;">Custom Garment Print & Quality Signoff</div>
    </div>
    <div class="badge">PRINT OPERATOR COPY</div>
  </div>

  <div class="grid">
    <div class="grid-item">
      <div class="label">Order ID</div>
      <div class="val">${order.id}</div>
    </div>
    <div class="grid-item">
      <div class="label">Customer</div>
      <div class="val">${order.customer?.name || order.customer_name || 'Customer'} (${order.customer?.phone || order.customer_phone || 'N/A'})</div>
    </div>
    <div class="grid-item">
      <div class="label">Garment Silhouette</div>
      <div class="val">${item.productName || item.product?.name || 'Menance Garment'}</div>
    </div>
    <div class="grid-item">
      <div class="label">Size / Colorway</div>
      <div class="val">SIZE: ${item.size || item.variant?.size || 'M'} • COLOR: ${item.color || item.variant?.color || 'Black'}</div>
    </div>
    <div class="grid-item">
      <div class="label">Print Placement</div>
      <div class="val" style="color: #c00;">${getPlacementLabel(placement).toUpperCase()}</div>
    </div>
    <div class="grid-item">
      <div class="label">Target Print Scale</div>
      <div class="val">${getScaleLabel(scale).toUpperCase()}</div>
    </div>
    ${
      quoteText
        ? `<div class="grid-item" style="grid-column: span 2;">
            <div class="label">Quote Typography Text</div>
            <div class="val" style="font-family: monospace; font-size: 14px;">"${quoteText}"</div>
          </div>`
        : ''
    }
  </div>

  <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">
    PRODUCTION ARTWORK GRAPHIC (HIGH RES)
  </div>

  <div class="artwork-box">
    <div class="crosshair"></div>
    <img src="${artworkUrl}" alt="Custom Artwork" />
  </div>

  <table class="qa-table">
    <thead>
      <tr>
        <th>Station Checklist</th>
        <th>Operator ID</th>
        <th>Status</th>
        <th>Timestamp</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><span class="checkbox-box"></span> 1. Blank Garment Inspection (240 GSM Fabric & Collar QA)</td>
        <td>________________</td>
        <td>PASS / FAIL</td>
        <td>____:____</td>
      </tr>
      <tr>
        <td><span class="checkbox-box"></span> 2. Pre-Treatment & Heat Press Alignment</td>
        <td>________________</td>
        <td>PASS / FAIL</td>
        <td>____:____</td>
      </tr>
      <tr>
        <td><span class="checkbox-box"></span> 3. Direct Garment Printing (High Density Ink Cure @ 160°C)</td>
        <td>________________</td>
        <td>PASS / FAIL</td>
        <td>____:____</td>
      </tr>
      <tr>
        <td><span class="checkbox-box"></span> 4. Final Color Fastness & Pack into Stealth Bag</td>
        <td>________________</td>
        <td>APPROVED</td>
        <td>____:____</td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    <span>MENANCE APPAREL PVT LTD • NOT FOR EVERYONE.</span>
    <span>DOC REF: SPEC-${order.id}-${item.id}</span>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <>
      <div className="mt-3 p-4 rounded-lg bg-[#0A0A0A] border border-[#C6FF00]/30 shadow-lg relative overflow-hidden space-y-4">
        {/* Top Glow Accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C6FF00] to-transparent" />

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#1A1A1A]">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C6FF00] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C6FF00]"></span>
            </span>
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-[#C6FF00] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Custom Print Production Unit
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#181818] border border-[#282828] text-[#D4D4D4]">
              {getPlacementLabel(placement)}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#181818] border border-[#282828] text-[#8A8A8A]">
              Scale: {scale}
            </span>
            {isQuote ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-purple-500/10 border border-purple-500/30 text-purple-300">
                Typographic Quote
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-blue-500/10 border border-blue-500/30 text-blue-300">
                Uploaded Graphic
              </span>
            )}
          </div>
        </div>

        {/* Quote text highlight if applicable */}
        {quoteText && (
          <div className="p-2.5 rounded bg-[#121212] border border-[#222] flex items-center justify-between gap-2">
            <div className="text-[12px] font-mono text-[#E5E5E5]">
              <span className="text-[#8A8A8A] mr-2">CUSTOM TEXT:</span>
              <strong className="text-[#C6FF00] font-sans text-[13px]">&ldquo;{quoteText}&rdquo;</strong>
            </div>
          </div>
        )}

        {/* Artwork Preview Canvas */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#8A8A8A]">
            <span className="flex items-center gap-1">
              <Layers className="w-3 h-3 text-[#C6FF00]" />
              Archival Artwork Preview
            </span>

            {/* Background Texture Switcher */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-[#666] mr-1">Preview Grid:</span>
              <button
                type="button"
                onClick={() => setBgMode('checker')}
                className={`px-1.5 py-0.5 text-[9px] font-mono rounded border transition-colors ${
                  bgMode === 'checker'
                    ? 'bg-[#222] text-[#C6FF00] border-[#C6FF00]/40'
                    : 'bg-[#141414] text-[#666] border-[#222] hover:text-[#aaa]'
                }`}
                title="Checkerboard Transparent Grid"
              >
                Grid
              </button>
              <button
                type="button"
                onClick={() => setBgMode('dark')}
                className={`px-1.5 py-0.5 text-[9px] font-mono rounded border transition-colors ${
                  bgMode === 'dark'
                    ? 'bg-[#222] text-[#C6FF00] border-[#C6FF00]/40'
                    : 'bg-[#141414] text-[#666] border-[#222] hover:text-[#aaa]'
                }`}
                title="Black Garment View"
              >
                Noir
              </button>
              <button
                type="button"
                onClick={() => setBgMode('cream')}
                className={`px-1.5 py-0.5 text-[9px] font-mono rounded border transition-colors ${
                  bgMode === 'cream'
                    ? 'bg-[#222] text-[#C6FF00] border-[#C6FF00]/40'
                    : 'bg-[#141414] text-[#666] border-[#222] hover:text-[#aaa]'
                }`}
                title="Raw Natural Cotton View"
              >
                Cream
              </button>
            </div>
          </div>

          <div
            className={`w-full min-h-[160px] max-h-[260px] rounded-lg border border-[#222] flex items-center justify-center p-4 relative group overflow-hidden transition-all ${
              bgMode === 'checker'
                ? 'bg-[radial-gradient(#222_1px,transparent_1px)] [background-size:12px_12px] bg-[#101010]'
                : bgMode === 'dark'
                ? 'bg-[#0a0a0a]'
                : 'bg-[#EAE5D9]'
            }`}
          >
            {artworkUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={artworkUrl}
                alt="Custom Print"
                className="max-h-[220px] max-w-full object-contain drop-shadow-md select-none transition-transform group-hover:scale-105 duration-200"
              />
            ) : (
              <span className="text-[12px] font-mono text-[#666]">No graphic data found</span>
            )}

            {/* Hover overlay for zoom */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsLightboxOpen(true)}
                className="px-3 py-1.5 bg-[#1F1F1F] hover:bg-[#2A2A2A] text-[#F5F1E8] rounded text-[11px] font-mono flex items-center gap-1.5 border border-[#3A3A3A] transition-colors"
              >
                <Maximize2 className="w-3.5 h-3.5 text-[#C6FF00]" />
                Inspect Fullscreen
              </button>
            </div>
          </div>
        </div>

        {/* Workshop Operator Actions */}
        <div className="pt-2 border-t border-[#1A1A1A] grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center justify-center gap-1.5 h-9 px-3 bg-[#161616] hover:bg-[#202020] text-[#F5F1E8] border border-[#2B2B2B] hover:border-[#C6FF00]/40 rounded text-[11px] font-mono transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#C6FF00]" />
            <span>Download Print File</span>
          </button>

          <button
            type="button"
            onClick={handlePrintSpecSheet}
            className="flex items-center justify-center gap-1.5 h-9 px-3 bg-[#C6FF00] hover:bg-[#b0e600] text-[#0A0A0A] font-bold rounded text-[11px] font-mono transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Workshop Sheet</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center justify-center gap-1.5 h-9 px-3 bg-[#161616] hover:bg-[#202020] text-[#8A8A8A] hover:text-[#F5F1E8] border border-[#2B2B2B] rounded text-[11px] font-mono transition-colors"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-[#C6FF00]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{isCopied ? 'Copied' : 'Copy Image Link'}</span>
          </button>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full bg-[#121212] border border-[#2B2B2B] rounded-xl p-6 flex flex-col items-center justify-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between border-b border-[#222] pb-3">
              <div>
                <h3 className="text-sm font-bold font-mono text-[#F5F1E8]">
                  Custom Print Artwork // {order.id}
                </h3>
                <p className="text-[11px] font-mono text-[#8A8A8A]">
                  Placement: {getPlacementLabel(placement)} • Scale: {scale}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="p-1 rounded bg-[#1C1C1C] hover:bg-[#282828] text-[#8A8A8A] hover:text-[#F5F1E8] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="w-full flex-1 min-h-[300px] max-h-[65vh] flex items-center justify-center p-4 rounded-lg bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:16px_16px] bg-[#0A0A0A] border border-[#222] overflow-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={artworkUrl} alt="Custom Artwork Fullscreen" className="max-w-full max-h-[60vh] object-contain" />
            </div>

            <div className="w-full flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleDownload}
                className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#242424] text-[#F5F1E8] border border-[#333] rounded text-xs font-mono flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-[#C6FF00]" />
                Download Raw File
              </button>
              <button
                type="button"
                onClick={handlePrintSpecSheet}
                className="px-4 py-2 bg-[#C6FF00] hover:bg-[#b0e600] text-[#0A0A0A] font-bold rounded text-xs font-mono flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Workshop Spec Sheet
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
