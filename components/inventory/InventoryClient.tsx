'use client';

import React, { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/common/DataTable';
import { updateStockAction } from '@/lib/admin/actions';
import { Plus, Minus, Camera, QrCode, Boxes, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface InventoryClientProps {
  initialVariants: any[];
}

export function InventoryClient({ initialVariants }: InventoryClientProps) {
  const [variants, setVariants] = useState(initialVariants);
  const [isScanning, setIsScanning] = useState(false);
  const [barcodeSearch, setBarcodeSearch] = useState('');

  const handleAdjustStock = async (variantId: string, change: number) => {
    try {
      const reason = change > 0 ? 'Batch restock / return arrival' : 'Dispatch / damage adjustment';
      const res = await updateStockAction(variantId, change, reason);
      setVariants((prev) =>
        prev.map((v) => (v.id === variantId ? { ...v, stock: res.newStock } : v))
      );
      toast.success(`Updated stock to ${res.newStock} units`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update stock');
    }
  };

  const handleSimulateBarcodeScan = () => {
    setIsScanning(true);
    toast.info('Accessing camera sensor to scan garment tag barcode...');
    setTimeout(() => {
      // Pick a real SKU from the variants list
      const randomVariant = variants[Math.floor(Math.random() * variants.length)];
      setBarcodeSearch(randomVariant.sku);
      setIsScanning(false);
      toast.success(`Scanned barcode: ${randomVariant.sku} (${randomVariant.productName})`);
    }, 1200);
  };

  const filteredVariants = barcodeSearch
    ? variants.filter(
        (v) =>
          v.sku.toLowerCase().includes(barcodeSearch.toLowerCase()) ||
          v.productName.toLowerCase().includes(barcodeSearch.toLowerCase())
      )
    : variants;

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'sku',
      header: 'SKU / BARCODE',
      cell: ({ row }) => (
        <div className="font-mono font-bold text-xs text-[#F5F1E8] flex items-center gap-1.5">
          <QrCode className="w-3.5 h-3.5 text-[#8A8A8A]" />
          <span>{row.original.sku}</span>
        </div>
      ),
    },
    {
      accessorKey: 'productName',
      header: 'PRODUCT & COLOR',
      cell: ({ row }) => (
        <div>
          <div className="text-xs font-semibold text-[#F5F1E8]">{row.original.productName}</div>
          <div className="text-[11px] text-[#8A8A8A]">
            Colorway: <span className="text-[#A0A0A0]">{row.original.color}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'size',
      header: 'SIZE',
      cell: ({ row }) => (
        <span className="font-mono px-2 py-0.5 rounded bg-[#181818] border border-[#282828] text-xs font-bold text-[#F5F1E8]">
          {row.original.size}
        </span>
      ),
    },
    {
      accessorKey: 'stock',
      header: 'AVAILABLE STOCK',
      cell: ({ row }) => {
        const stock = row.original.stock;
        return (
          <div className="flex items-center gap-2">
            <span
              className={`font-mono text-sm font-black tabular-nums ${
                stock === 0
                  ? 'text-rose-400'
                  : stock < 10
                  ? 'text-amber-400'
                  : 'text-[#C6FF00]'
              }`}
            >
              {stock}
            </span>
            {stock < 10 && stock > 0 && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-mono text-amber-400">
                <AlertTriangle className="w-3 h-3" /> LOW
              </span>
            )}
            {stock === 0 && (
              <span className="text-[10px] font-mono text-rose-400">SOLD OUT</span>
            )}
          </div>
        );
      },
    },
    {
      id: 'stepper',
      header: 'STOCK STEPPERS',
      cell: ({ row }) => {
        const variant = row.original;
        return (
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleAdjustStock(variant.id, -5)}
              disabled={variant.stock < 5}
              className="px-2 py-1 bg-[#181818] hover:bg-[#222222] disabled:opacity-30 border border-[#262626] rounded text-[11px] font-mono text-[#8A8A8A] hover:text-[#F5F1E8] transition-colors"
              title="-5 Stock"
            >
              -5
            </button>
            <button
              onClick={() => handleAdjustStock(variant.id, -1)}
              disabled={variant.stock === 0}
              className="p-1 bg-[#181818] hover:bg-[#222222] disabled:opacity-30 border border-[#262626] rounded text-[#8A8A8A] hover:text-[#F5F1E8] transition-colors"
              title="-1 Stock"
            >
              <Minus className="w-3 h-3" />
            </button>
            <button
              onClick={() => handleAdjustStock(variant.id, 1)}
              className="p-1 bg-[#181818] hover:bg-[#222222] border border-[#262626] rounded text-[#8A8A8A] hover:text-[#F5F1E8] transition-colors"
              title="+1 Stock"
            >
              <Plus className="w-3 h-3" />
            </button>
            <button
              onClick={() => handleAdjustStock(variant.id, 10)}
              className="px-2 py-1 bg-[#181818] hover:bg-[#222222] border border-[#262626] rounded text-[11px] font-mono text-[#C6FF00] hover:bg-[#C6FF00]/10 transition-colors"
              title="+10 Restock"
            >
              +10
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      {/* Barcode Scanner & Search Banner */}
      <div className="rounded-xl border border-[#222222] bg-[#121212] p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#181818] border border-[#282828] flex items-center justify-center text-[#C6FF00] flex-shrink-0">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#F5F1E8]">Physical Barcode Scanner</div>
            <div className="text-[11px] text-[#8A8A8A]">
              Scan product hangtags with phone camera for instant inventory verification
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {barcodeSearch && (
            <button
              onClick={() => setBarcodeSearch('')}
              className="text-xs font-mono text-[#8A8A8A] hover:text-[#F5F1E8]"
            >
              Clear Filter ({barcodeSearch})
            </button>
          )}
          <button
            onClick={handleSimulateBarcodeScan}
            disabled={isScanning}
            className="h-9 px-3.5 bg-[#C6FF00] hover:bg-[#b0e600] active:scale-95 text-[#0A0A0A] font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap"
          >
            <Camera className="w-3.5 h-3.5" />
            {isScanning ? 'Reading Optics...' : 'Scan Hangtag Barcode'}
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredVariants}
        searchPlaceholder="Filter inventory by SKU, product, size, or color..."
        pageSize={15}
      />
    </div>
  );
}
