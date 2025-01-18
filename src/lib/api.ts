import axios from './axios';
import { Product, DailyStock, DailySummary } from '@prisma/client';

// Products
export const getProducts = async () => {
  const { data } = await axios.get<Product[]>('/products');
  return data;
};

export const createProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
  const { data } = await axios.post<Product>('/products', product);
  return data;
};

export const updateProduct = async (id: string, product: Partial<Product>) => {
  const { data } = await axios.patch<Product>(`/products/${id}`, product);
  return data;
};

export const deleteProduct = async (id: string) => {
  const { data } = await axios.delete<{ message: string; }>(`/products/${id}`);
  return data;
};

// Daily Stock
export const initiateDailyStock = async (date: string) => {
  const { data } = await axios.post<DailyStock[]>('/daily-stock', { date });
  return data;
};

export const getDailyStock = async (date: string) => {
  const { data } = await axios.get<DailyStock[]>(`/daily-stock/${date}`);
  return data;
};

export const updateDailyStock = async (date: string, productId: string, update: Partial<DailyStock>) => {
  const { data } = await axios.patch<DailyStock>(`/daily-stock/${date}/${productId}`, {
    ...update,
    buyingPrice: update.buyingPrice?.toNumber(), // Convert Decimal to number
    sellingPrice: update.sellingPrice?.toNumber(), // Convert Decimal to number
  });
  return data;
};

export const lockDay = async (date: string) => {
  const { data } = await axios.post<{ message: string; dailySummary: DailySummary; }>(`/daily-stock/${date}/lock`);
  return data;
};

export const unlockDay = async (date: string, editHash: string) => {
  const { data } = await axios.post<{ message: string; }>(`/daily-stock/${date}/unlock`, { editHash });
  return data;
};

// Daily Summary
export const getDailySummary = async (date: string) => {
  const { data } = await axios.get<DailySummary>(`/summary/${date}`);
  return data;
};

export const getDailySummaryRange = async (startDate: string, endDate: string) => {
  const { data } = await axios.get<DailySummary[]>(`/summary/range`, { params: { startDate, endDate } });
  return data;
};

export const getMonthlySummary = async (year: number, month: number) => {
  const { data } = await axios.get<DailySummary>(`/summary/monthly/${year}/${month}`);
  return data;
};

// Analysis
export const getProfitAnalysis = async (date: string) => {
  const { data } = await axios.get(`/analysis/profit/${date}`);
  return data;
};

export const getProfitAnalysisRange = async (startDate: string, endDate: string) => {
  const { data } = await axios.get(`/analysis/profit/range`, { params: { startDate, endDate } });
  return data;
};

export const getStockMovements = async (productId: string, startDate?: string, endDate?: string) => {
  const { data } = await axios.get(`/analysis/stock-movements/${productId}`, { params: { startDate, endDate } });
  return data;
};

export const getLowStockProducts = async (threshold?: number) => {
  const { data } = await axios.get(`/analysis/low-stock`, { params: { threshold } });
  return data;
};

