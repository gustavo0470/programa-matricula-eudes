import { useMemo } from 'react';
import { useOptimizedFetch } from '../hooks/useOptimizedFetch';

interface UseStudentsOptions {
  searchTerm?: string;
  cacheKey?: string;
}

export function useStudents({ searchTerm = '', cacheKey = 'students-list' }: UseStudentsOptions = {}) {
  const { data: students, loading, error, refetch } = useOptimizedFetch<any[]>('/api/students', {
    cacheKey,
    cacheDuration: 60000 // 1 minuto
  });

  const filteredStudents = useMemo(() => {
    if (!students || !Array.isArray(students) || !searchTerm) return students || [];
    
    const term = searchTerm.toLowerCase();
    return students.filter((student: any) => 
      student.name.toLowerCase().includes(term) ||
      student.enrollment.toLowerCase().includes(term) ||
      student.email?.toLowerCase().includes(term) ||
      student.cpf?.includes(term)
    );
  }, [students, searchTerm]);

  return {
    students: filteredStudents,
    loading,
    error,
    refetch,
    total: Array.isArray(students) ? students.length : 0
  };
}

interface UseCachedDataOptions {
  endpoint: string;
  cacheKey: string;
  cacheDuration?: number;
}

export function useCachedData<T>({ endpoint, cacheKey, cacheDuration = 60000 }: UseCachedDataOptions) {
  return useOptimizedFetch<T>(endpoint, {
    cacheKey,
    cacheDuration
  });
}
