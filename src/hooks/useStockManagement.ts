// file location: src/hooks/useStockManagement.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../lib/api';
import { Product, DailyStock } from '@prisma/client';
import { format, subDays } from 'date-fns';
import toast from 'react-hot-toast';

interface ProductsParams {
  page: number;
  limit: number;
  search: string;
  sortBy: string;
  order: 'asc' | 'desc';
}

export const useProducts = (params: ProductsParams) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => api.getProducts(params),
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, product }: { id: string; product: Partial<Product>; }) => api.updateProduct(id, product),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

// Daily Stock
export const useStartDay = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (date: string) => {
      const previousDate = format(subDays(new Date(date), 1), "yyyy-MM-dd");
      const previousDayData = await api.getDailyStock(previousDate);

      if (!previousDayData || previousDayData.length === 0) {
        throw new Error("Previous day's entries are not complete");
      }

      return api.initiateDailyStock(date);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["dailyStock", variables] });
    },
  });
};

export const useDailyStock = (date: string) => {
  return useQuery({ queryKey: ['dailyStock', date], queryFn: () => api.getDailyStock(date) });
};

export const useUpdateDailyStock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ date, productId, update }: { date: string; productId: string; update: Partial<DailyStock>; }) =>
      api.updateDailyStock(date, productId, update),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dailyStock', variables.date] });
    },
  });
};

export const useLockDay = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.lockDay,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dailyStock', variables] });
      queryClient.invalidateQueries({ queryKey: ['dailySummary', variables] });
    },
  });
};

export const useUnlockDay = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ date, editHash }: { date: string; editHash: string; }) => api.unlockDay(date, editHash),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dailyStock', variables.date] });
      queryClient.invalidateQueries({ queryKey: ['dailySummary', variables.date] });
    },
  });
};

// Daily Summary
export const useDailySummary = (date: string) => {
  return useQuery({ queryKey: ['dailySummary', date], queryFn: () => api.getDailySummary(date) });
};

export const useDailySummaryRange = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['dailySummaryRange', startDate, endDate],
    queryFn: () => api.getDailySummaryRange(startDate, endDate),
  });
};

export const useMonthlySummary = (year: number, month: number) => {
  return useQuery({
    queryKey: ['monthlySummary', year, month],
    queryFn: () => api.getMonthlySummary(year, month),
  });
};

// Analysis
export const useProfitAnalysis = (date: string) => {
  return useQuery({ queryKey: ['profitAnalysis', date], queryFn: () => api.getProfitAnalysis(date) });
};

export const useProfitAnalysisRange = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['profitAnalysisRange', startDate, endDate],
    queryFn: () => api.getProfitAnalysisRange(startDate, endDate),
  });
};

export const useStockMovements = (productId: string, startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['stockMovements', productId, startDate, endDate],
    queryFn: () => api.getStockMovements(productId, startDate, endDate),
  });
};

export const useLowStockProducts = (threshold?: number) => {
  return useQuery({
    queryKey: ['lowStockProducts', threshold],
    queryFn: () => api.getLowStockProducts(threshold),
  });
};


export const useDayHashes = (date: string) => {
  return useQuery({ queryKey: ['dayHashes', date], queryFn: () => api.getHashes(date) });
};


export const useLoadPreviousDayData = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.loadPreviousDayData,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dailyStock', variables] });
      toast.success('Previous day data loaded successfully');
    },
    onError: (error) => {
      console.error('Failed to load previous day data:', error);
      toast.error('Failed to load previous day data');
    },
  });
};