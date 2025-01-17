"use client";

import React, { useState } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useDailyStockByDate, useUpdateDailyStock, useLockDailyStock, useUnlockDailyStock } from '@/hooks/useDailyStock';
import { DailyStock, Product } from '@prisma/client';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Lock, Unlock, History } from 'lucide-react';

type DailyStockWithProduct = DailyStock & { product: Product; };

const columnHelper = createColumnHelper<DailyStockWithProduct>();

interface EditableCellProps {
  getValue: () => string | number;
  row: { index: number; original: DailyStockWithProduct; };
  column: { id: string; };
  table: {
    options: {
      meta?: {
        updateData: (rowIndex: number, columnId: string, value: string | number) => void;
      };
    };
  };
}

const EditableCell: React.FC<EditableCellProps> = ({ getValue, row, column, table }) => {
  const initialValue = getValue();
  const [value, setValue] = useState(initialValue);
  const onBlur = () => {
    table.options.meta?.updateData(row.index, column.id, value);
  };

  return (
    <Input
      value={value.toString()}
      onChange={(e) => setValue(e.target.value)}
      onBlur={onBlur}
      disabled={row.original.isLocked}
      className="w-full"
    />
  );
};

interface DailyStockTableProps {
  date: string;
}

export function DailyStockTable({ date }: DailyStockTableProps) {
  const { data: dailyStocks, isLoading, error } = useDailyStockByDate(date);
  const updateDailyStock = useUpdateDailyStock();
  const lockDailyStock = useLockDailyStock();
  const unlockDailyStock = useUnlockDailyStock();

  const columns = [
    columnHelper.accessor('product.name', {
      cell: (info) => info.getValue(),
      header: 'Product Name',
    }),
    columnHelper.accessor('openingStock', {
      cell: (info) => info.getValue(),
      header: 'Opening Stock',
    }),
    columnHelper.accessor('newStock', {
      cell: (info) => <EditableCell {...info} />,
      header: 'New Stock',
    }),
    columnHelper.accessor('soldQuantity', {
      cell: (info) => <EditableCell {...info} />,
      header: 'Sold Quantity',
    }),
    columnHelper.accessor('closingStock', {
      cell: (info) => info.getValue(),
      header: 'Closing Stock',
    }),
    columnHelper.accessor('buyingPrice', {
      cell: (info) => <EditableCell {...info} />,
      header: 'Buying Price',
    }),
    columnHelper.accessor('sellingPrice', {
      cell: (info) => <EditableCell {...info} />,
      header: 'Selling Price',
    }),
    columnHelper.accessor((row) => {
      const sellingPrice = typeof row.sellingPrice === 'object' && row.sellingPrice !== null
        ? parseFloat(row.sellingPrice.toString())
        : parseFloat(row.sellingPrice);
      const buyingPrice = typeof row.buyingPrice === 'object' && row.buyingPrice !== null
        ? parseFloat(row.buyingPrice.toString())
        : parseFloat(row.buyingPrice);
      const profit = (sellingPrice - buyingPrice) * row.soldQuantity;
      return profit.toFixed(2);
    }, {
      id: 'profit',
      header: 'Profit',
    }),
    columnHelper.display({
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleLockUnlock(row.original)}
            disabled={isLoading}
          >
            {row.original.isLocked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleViewHistory(row.original)}
          >
            <History className="h-4 w-4" />
          </Button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: dailyStocks || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      updateData: (rowIndex: number, columnId: string, value: string | number) => {
        const dailyStock = dailyStocks?.[rowIndex];
        if (dailyStock) {
          updateDailyStock.mutate({
            date,
            productId: dailyStock.productId,
            data: { [columnId]: value },
          });
        }
      },
    },
  });

  const handleLockUnlock = (dailyStock: DailyStockWithProduct) => {
    if (dailyStock.isLocked) {
      // In a real app, you'd prompt for the editHash
      const editHash = "dummy-edit-hash";
      unlockDailyStock.mutate({ date, editHash });
    } else {
      lockDailyStock.mutate(date);
    }
  };

  const handleViewHistory = (dailyStock: DailyStockWithProduct) => {
    // Implement view history functionality
    console.log("View history for", dailyStock.product.name);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

