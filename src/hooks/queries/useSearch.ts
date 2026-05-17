import { useQuery } from '@tanstack/react-query';
import instance from '@/api/api';
import { extractApiData } from '@/api';
import { STALE_TIME } from '@/constants/cache';
import { SearchSuggestions } from '@/types/search';

import { searchKeys } from '@/lib/queryKeys';

const searchApi = {
  getSuggestions: async (keyword: string, limit: number = 10): Promise<SearchSuggestions> => {
    const response = await instance.get('/search/suggestions', {
      params: { q: keyword, limit },
    });
    return extractApiData(response);
  },
};

export function useSearchSuggestions(keyword: string, limit: number = 10) {
  const normalizedKeyword = keyword.trim();

  return useQuery({
    queryKey: searchKeys.suggestions(normalizedKeyword, limit),
    queryFn: () => searchApi.getSuggestions(normalizedKeyword, limit),
    enabled: normalizedKeyword.length >= 2,
    staleTime: STALE_TIME.MEDIUM,
  });
}
