import { useState, useEffect, useCallback } from 'react';

// Cache simples em memória
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 segundos

interface UseOptimizedFetchOptions {
  cacheKey?: string;
  cacheDuration?: number;
  dependencies?: any[];
}

export function useOptimizedFetch<T>(
  url: string,
  options: UseOptimizedFetchOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { cacheKey = url, cacheDuration = CACHE_DURATION, dependencies = [] } = options;

  const fetchData = useCallback(async () => {
    try {
      // Verificar cache
      const cached = cache.get(cacheKey);
      const now = Date.now();
      
      if (cached && (now - cached.timestamp) < cacheDuration) {
        setData(cached.data);
        setLoading(false);
        return cached.data;
      }

      setLoading(true);
      setError(null);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Salvar no cache
      cache.set(cacheKey, { data: result, timestamp: now });
      
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Fetch error:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [url, cacheKey, cacheDuration]);

  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]);

  const invalidateCache = useCallback(() => {
    cache.delete(cacheKey);
  }, [cacheKey]);

  const refetch = useCallback(() => {
    invalidateCache();
    return fetchData();
  }, [fetchData, invalidateCache]);

  return { data, loading, error, refetch, invalidateCache };
}

// Hook para mutações (POST, PUT, DELETE) com invalidação de cache
export function useOptimizedMutation<T = any>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (
    url: string,
    options: RequestInit = {},
    invalidateKeys: string[] = []
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Invalidar caches relacionados
      invalidateKeys.forEach(key => cache.delete(key));

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}
