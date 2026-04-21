"use client";

import { useState, useCallback } from "react";
import { type AxiosError } from "axios";

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// Generic hook for API calls with loading and error state
// Usage: const { execute, loading, error } = useApi(ngoApi.approve)
export function useApi<T, Args extends unknown[]>(
  apiFunction: (...args: Args) => Promise<{ data: { data: T } }>,
) {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: Args): Promise<T | null> => {
      setState({ data: null, loading: true, error: null });

      try {
        const response = await apiFunction(...args);
        const data = response.data.data;
        setState({ data, loading: false, error: null });
        return data;
      } catch (err) {
        const error = err as AxiosError<{ message: string }>;
        const message =
          error.response?.data?.message ??
          "Something went wrong. Please try again.";
        setState({ data: null, loading: false, error: message });
        return null;
      }
    },
    [apiFunction],
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}
