import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 3,       // 3 minutes cached for instant 0ms display
      gcTime: 1000 * 60 * 15,         // 15 minutes kept in memory
      refetchOnWindowFocus: true,     // Auto-check when tab is focused
      refetchOnMount: 'always',        // Always check silently in background
      retry: 1,
    },
  },
});

/**
 * Automatically invalidate relevant queries across the entire application
 * whenever any admin or user mutation is executed.
 */
export const invalidateAllCaches = (url = '', method = '') => {
  const normalizedUrl = String(url).toLowerCase();
  
  // Invalidate Admin Dashboard stats and logs
  queryClient.invalidateQueries({ queryKey: ['admin'] });

  if (normalizedUrl.includes('destinations')) {
    queryClient.invalidateQueries({ queryKey: ['destinations'] });
    queryClient.invalidateQueries({ queryKey: ['categories'] });
  } else if (normalizedUrl.includes('businesses')) {
    queryClient.invalidateQueries({ queryKey: ['businesses'] });
    queryClient.invalidateQueries({ queryKey: ['categories'] });
  } else if (normalizedUrl.includes('categories')) {
    queryClient.invalidateQueries({ queryKey: ['categories'] });
    queryClient.invalidateQueries({ queryKey: ['destinations'] });
    queryClient.invalidateQueries({ queryKey: ['businesses'] });
  } else if (normalizedUrl.includes('promotions')) {
    queryClient.invalidateQueries({ queryKey: ['promotions'] });
  } else if (normalizedUrl.includes('advertisements') || normalizedUrl.includes('featured-placements')) {
    queryClient.invalidateQueries({ queryKey: ['featured-placements'] });
    queryClient.invalidateQueries({ queryKey: ['advertisements'] });
  } else if (normalizedUrl.includes('reviews')) {
    queryClient.invalidateQueries({ queryKey: ['reviews'] });
    queryClient.invalidateQueries({ queryKey: ['destinations'] });
    queryClient.invalidateQueries({ queryKey: ['businesses'] });
  } else if (normalizedUrl.includes('bookings')) {
    queryClient.invalidateQueries({ queryKey: ['bookings'] });
  } else if (normalizedUrl.includes('packages')) {
    queryClient.invalidateQueries({ queryKey: ['packages'] });
  } else {
    // Default fallback: invalidate primary resource queries
    queryClient.invalidateQueries({ queryKey: ['destinations'] });
    queryClient.invalidateQueries({ queryKey: ['businesses'] });
    queryClient.invalidateQueries({ queryKey: ['categories'] });
  }
};
