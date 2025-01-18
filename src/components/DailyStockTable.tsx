import React, { useState, useEffect } from 'react';
import { useDailyStock, useUpdateDailyStock, useLockDay, useUnlockDay } from '@/hooks/useStockManagement';
import { formatCurrency } from '@/utils/formatters';
import { Lock, Unlock, Edit, Save } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import toast from 'react-hot-toast';
import Decimal from 'decimal.js';

interface DailyStockEntry {
  id: string;
  productId: string;
  openingStock: number;
  newStock: number;
  soldQuantity: number;
  closingStock: number;
  buyingPrice: number;
  sellingPrice: number;
  isLocked: boolean;
}

interface DailyStockTableProps {
  date: Date;
}

export default function DailyStockTable({ date }: DailyStockTableProps) {
  const [editMode, setEditMode] = useState<Record<string, boolean>>({});
  const [localData, setLocalData] = useState<DailyStockEntry[]>([]);
  const [unlockHash, setUnlockHash] = useState('');

  const formattedDate = format(date, 'yyyy-MM-dd');
  const { data: dailyStockData, isLoading, error, refetch } = useDailyStock(formattedDate);
  const updateDailyStock = useUpdateDailyStock();
  const lockDay = useLockDay();
  const unlockDay = useUnlockDay();

  useEffect(() => {
    if (dailyStockData) {
      setLocalData(dailyStockData.map(entry => ({
        ...entry,
        buyingPrice: Number(entry.buyingPrice),
        sellingPrice: Number(entry.sellingPrice),
      })));
    }
  }, [dailyStockData]);

  useEffect(() => {
    refetch();
  }, [date, refetch]);

  const handleEdit = (productId: string) => {
    setEditMode(prev => ({ ...prev, [productId]: true }));
  };

  const handleSave = async (entry: DailyStockEntry) => {
    try {
      await updateDailyStock.mutateAsync({
        date: formattedDate,
        productId: entry.productId,
        update: {
          newStock: entry.newStock,
          soldQuantity: entry.soldQuantity,
          buyingPrice: new Decimal(entry.buyingPrice), // Convert to Decimal
          sellingPrice: new Decimal(entry.sellingPrice),
        },
      });
      setEditMode(prev => ({ ...prev, [entry.productId]: false }));
      toast.success('Stock entry updated successfully');
    } catch (error) {
      console.error('Failed to update daily stock:', error);
      toast.error('Failed to update stock entry');
    }
  };

  const handleInputChange = (productId: string, field: keyof DailyStockEntry, value: number) => {
    setLocalData(prev =>
      prev.map(entry =>
        entry.productId === productId
          ? {
            ...entry,
            [field]: value,
            closingStock:
              field === 'newStock' || field === 'soldQuantity'
                ? entry.openingStock + (field === 'newStock' ? value : entry.newStock) - (field === 'soldQuantity' ? value : entry.soldQuantity)
                : entry.closingStock,
          }
          : entry
      )
    );
  };

  const handleLockDay = async () => {
    try {
      await lockDay.mutateAsync(formattedDate);
      refetch();
      toast.success('Day locked successfully');
    } catch (error) {
      console.error('Failed to lock day:', error);
      toast.error('Failed to lock day');
    }
  };

  const handleUnlockDay = async () => {
    if (unlockHash) {
      try {
        await unlockDay.mutateAsync({ date: formattedDate, editHash: unlockHash });
        setUnlockHash('');
        refetch();
        toast.success('Day unlocked successfully');
      } catch (error) {
        console.error('Failed to unlock day:', error);
        toast.error('Failed to unlock day. Please check the edit hash.');
      }
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {(error as Error).message}</div>;

  return (
    <div className="overflow-x-auto">
      <div className="flex justify-end mb-4">
        <Button
          onClick={handleLockDay}
          disabled={localData.some(entry => entry.isLocked)}
          className="mr-2"
        >
          <Lock className="mr-2 h-4 w-4" /> Lock Day
        </Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              disabled={!localData.some(entry => entry.isLocked)}
            >
              <Unlock className="mr-2 h-4 w-4" /> Unlock Day
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Unlock Day</DialogTitle>
              <DialogDescription>
                Enter the edit hash to unlock the day.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                id="unlockHash"
                value={unlockHash}
                onChange={(e) => setUnlockHash(e.target.value)}
                placeholder="Enter edit hash"
              />
            </div>
            <DialogFooter>
              <Button onClick={handleUnlockDay}>Unlock</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border-b">Product Name</th>
            <th className="py-2 px-4 border-b">Opening Stock</th>
            <th className="py-2 px-4 border-b">New Stock</th>
            <th className="py-2 px-4 border-b">Sold Quantity</th>
            <th className="py-2 px-4 border-b">Closing Stock</th>
            <th className="py-2 px-4 border-b">Buying Price</th>
            <th className="py-2 px-4 border-b">Selling Price</th>
            <th className="py-2 px-4 border-b">Profit</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {localData.map((entry) => (
            <tr key={entry.id} className={entry.isLocked ? 'bg-gray-100' : ''}>
              <td className="py-2 px-4 border-b">{entry.productId}</td>
              <td className="py-2 px-4 border-b text-right">{entry.openingStock}</td>
              <td className="py-2 px-4 border-b text-right">
                {editMode[entry.productId] ? (
                  <Input
                    type="number"
                    value={entry.newStock}
                    onChange={(e) => handleInputChange(entry.productId, 'newStock', Number(e.target.value))}
                    className="w-full text-right"
                  />
                ) : (
                  entry.newStock
                )}
              </td>
              <td className="py-2 px-4 border-b text-right">
                {editMode[entry.productId] ? (
                  <Input
                    type="number"
                    value={entry.soldQuantity}
                    onChange={(e) => handleInputChange(entry.productId, 'soldQuantity', Number(e.target.value))}
                    className="w-full text-right"
                  />
                ) : (
                  entry.soldQuantity
                )}
              </td>
              <td className="py-2 px-4 border-b text-right">{entry.closingStock}</td>
              <td className="py-2 px-4 border-b text-right">
                {editMode[entry.productId] ? (
                  <Input
                    type="number"
                    value={entry.buyingPrice}
                    onChange={(e) => handleInputChange(entry.productId, 'buyingPrice', Number(e.target.value))}
                    className="w-full text-right"
                  />
                ) : (
                  formatCurrency(entry.buyingPrice)
                )}
              </td>
              <td className="py-2 px-4 border-b text-right">
                {editMode[entry.productId] ? (
                  <Input
                    type="number"
                    value={entry.sellingPrice}
                    onChange={(e) => handleInputChange(entry.productId, 'sellingPrice', Number(e.target.value))}
                    className="w-full text-right"
                  />
                ) : (
                  formatCurrency(entry.sellingPrice)
                )}
              </td>
              <td className="py-2 px-4 border-b text-right">
                {formatCurrency((entry.sellingPrice - entry.buyingPrice) * entry.soldQuantity)}
              </td>
              <td className="py-2 px-4 border-b">
                {!entry.isLocked && (
                  editMode[entry.productId] ? (
                    <Button
                      onClick={() => handleSave(entry)}
                      size="sm"
                      className="mr-2"
                    >
                      <Save className="mr-2 h-4 w-4" /> Save
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleEdit(entry.productId)}
                      size="sm"
                      variant="outline"
                    >
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </Button>
                  )
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

