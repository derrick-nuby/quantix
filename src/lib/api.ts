import axios, { AxiosResponse } from 'axios';
import { Product, DailyStock } from '@prisma/client';

// Products
export const createProduct = (data: { name: string; imageUrl?: string; }): Promise<AxiosResponse<Product>> =>
  axios.post('/api/products', data);

export const getProducts = (params?: { page?: number; limit?: number; sortBy?: string; order?: 'asc' | 'desc'; }): Promise<AxiosResponse<{ products: Product[]; pagination: { page: number; limit: number; total: number; totalPages: number; }; }>> =>
  axios.get('/api/products', { params });

export const updateProduct = (id: string, data: { name?: string; imageUrl?: string; }): Promise<AxiosResponse<Product>> =>
  axios.patch(`/api/products/${id}`, data);

export const deleteProduct = (id: string): Promise<AxiosResponse<void>> =>
  axios.delete(`/api/products/${id}`);

// Daily Stock
export const startDay = (date: string): Promise<AxiosResponse<DailyStock[]>> =>
  axios.post('/api/daily-stock', { date });

export const getDailyStocks = (): Promise<AxiosResponse<DailyStock[]>> =>
  axios.get('/api/daily-stock');

export const getDailyStockByDate = (date: string): Promise<AxiosResponse<DailyStock[]>> =>
  axios.get(`/api/daily-stock/${date}`);

export const updateDailyStock = (date: string, productId: string, data: { soldQuantity?: number; newStock?: number; buyingPrice?: number; sellingPrice?: number; }): Promise<AxiosResponse<DailyStock>> =>
  axios.patch(`/api/daily-stock/${date}/${productId}`, data);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const lockDailyStock = (date: string): Promise<AxiosResponse<{ message: string; dailySummary: any; }>> =>
  axios.post(`/api/daily-stock/${date}/lock`);

export const unlockDailyStock = (date: string, editHash: string): Promise<AxiosResponse<{ message: string; }>> =>
  axios.post(`/api/daily-stock/${date}/unlock`, { editHash });
