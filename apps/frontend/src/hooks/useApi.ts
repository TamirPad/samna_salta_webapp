import { useState, useCallback } from "react";
import { enhancedApiService } from "../services/apiService";

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

export function useApi<T = any>(
  apiMethod: (...args: any[]) => Promise<any>,
  initialData: T | null = null,
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: initialData,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: any[]) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const result = await apiMethod(...args);
        setState((prev) => ({ ...prev, data: result, loading: false }));
        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An error occurred";
        setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
        return null;
      }
    },
    [apiMethod],
  );

  const reset = useCallback(() => {
    setState({
      data: initialData,
      loading: false,
      error: null,
    });
  }, [initialData]);

  return {
    ...state,
    execute,
    reset,
  };
}

// Specific API hooks
export function useProducts() {
  return useApi(enhancedApiService.getProducts.bind(enhancedApiService));
}

export function useProduct(id: number) {
  return useApi(() => enhancedApiService.getProduct(id), null);
}

export function useCategories() {
  return useApi(enhancedApiService.getCategories.bind(enhancedApiService));
}

export function useOrders() {
  return useApi(enhancedApiService.getOrders.bind(enhancedApiService));
}

export function useOrder(id: number) {
  return useApi(() => enhancedApiService.getOrder(id), null);
}

export function useCustomers() {
  return useApi(enhancedApiService.getCustomers.bind(enhancedApiService));
}

export function useCustomer(id: number) {
  return useApi(() => enhancedApiService.getCustomer(id), null);
}

export function useAnalytics() {
  return useApi(
    enhancedApiService.getDashboardAnalytics.bind(enhancedApiService),
  );
}
