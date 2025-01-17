import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../lib/api';
import { Product } from '@prisma/client';

export const useProducts = (params?: Parameters<typeof api.getProducts>[0]) => {
  return useQuery<{ products: Product[]; pagination: { page: number; limit: number; total: number; totalPages: number; }; }, Error>({
    queryKey: ['products', params],
    queryFn: () => api.getProducts(params).then(res => res.data),
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation<Product, Error, Parameters<typeof api.createProduct>[0]>({
    mutationFn: (data) => api.createProduct(data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation<
    Product,
    Error,
    { id: string; data: Parameters<typeof api.updateProduct>[1]; }
  >({
    mutationFn: ({ id, data }) => api.updateProduct(id, data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id: string) => api.deleteProduct(id).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

