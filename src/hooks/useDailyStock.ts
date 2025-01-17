import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../lib/api';
import { DailyStock } from '@prisma/client';

export const useStartDay = () => {
  const queryClient = useQueryClient();
  return useMutation<DailyStock[], Error, string>({
    mutationFn: async (date: string) => (await api.startDay(date)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyStocks'] });
    },
  });
};

export const useDailyStocks = () => {
  return useQuery<DailyStock[], Error>({
    queryKey: ['dailyStocks'],
    queryFn: () => api.getDailyStocks().then(res => res.data),
  });
};

export const useDailyStockByDate = (date: string) => {
  return useQuery<DailyStock[], Error>({
    queryKey: ['dailyStocks', date],
    queryFn: () => api.getDailyStockByDate(date).then(res => res.data),
  });
};

export const useUpdateDailyStock = () => {
  const queryClient = useQueryClient();
  return useMutation<
    DailyStock,
    Error,
    { date: string; productId: string; data: Parameters<typeof api.updateDailyStock>[2]; }
  >({
    mutationFn: ({ date, productId, data }) => api.updateDailyStock(date, productId, data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyStocks'] });
    },
  });
};

export const useLockDailyStock = () => {
  const queryClient = useQueryClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return useMutation<{ message: string; dailySummary: any; }, Error, string>({
    mutationFn: async (date: string) => (await api.lockDailyStock(date)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyStocks'] });
    },
  });
};

export const useUnlockDailyStock = () => {
  const queryClient = useQueryClient();
  return useMutation<
    { message: string; },
    Error,
    { date: string; editHash: string; }
  >({
    mutationFn: ({ date, editHash }) => api.unlockDailyStock(date, editHash).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyStocks'] });
    },
  });
};

