import React, { useState, useEffect } from 'react';
import { useDailyStock, useUpdateDailyStock, useLockDay, useUnlockDay } from '../hooks/useStockManagement';
import { formatCurrency } from '../utils/formatters';

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

export default function DailyStockTable() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [editMode, setEditMode] = useState<Record<string, boolean>>({});
  const [localData, setLocalData] = useState<DailyStockEntry[]>([]);

  const { data: dailyStockData, isLoading, error } = useDailyStock(date);
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

  const handleEdit = (productId: string) => {
    setEditMode(prev => ({ ...prev, [productId]: true }));
  };

  const handleSave = async (entry: DailyStockEntry) => {
    try {
      await updateDailyStock.mutateAsync({
        date,
        productId: entry.productId,
        update: {
          newStock: entry.newStock,
          soldQuantity: entry.soldQuantity,
          buyingPrice: entry.buyingPrice,
          sellingPrice: entry.sellingPrice,
        },
      });
      setEditMode(prev => ({ ...prev, [entry.productId]: false }));
    } catch (error) {
      console.error('Failed to update daily stock:', error);
      // Handle error (e.g., show error message to user)
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
      await lockDay.mutateAsync(date);
      // Refresh data after locking
      // This should be handled automatically by the queryClient in useStockManagement.ts
    } catch (error) {
      console.error('Failed to lock day:', error);
      // Handle error (e.g., show error message to user)
    }
  };

  const handleUnlockDay = async () => {
    // In a real application, you'd prompt for the editHash
    const editHash = prompt('Enter edit hash to unlock:');
    if (editHash) {
      try {
        await unlockDay.mutateAsync({ date, editHash });
        // Refresh data after unlocking
        // This should be handled automatically by the queryClient in useStockManagement.ts
      } catch (error) {
        console.error('Failed to unlock day:', error);
        // Handle error (e.g., show error message to user)
      }
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border rounded px-2 py-1"
        />
        <div>
          <button
            onClick={handleLockDay}
            className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
            disabled={localData.some(entry => entry.isLocked)}
          >
            Lock Day
          </button>
          <button
            onClick={handleUnlockDay}
            className="bg-yellow-500 text-white px-4 py-2 rounded"
            disabled={!localData.some(entry => entry.isLocked)}
          >
            Unlock Day
          </button>
        </div>
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
                  <input
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
                  <input
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
                  <input
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
                  <input
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
                    <button
                      onClick={() => handleSave(entry)}
                      className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEdit(entry.productId)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded"
                    >
                      Edit
                    </button>
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

