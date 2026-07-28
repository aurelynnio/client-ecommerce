import { useMutation } from '@tanstack/react-query';
import instance from '@/api/api';
import { extractApiData } from '@/api';
import { errorHandler } from '@/services/errorHandler';

interface NewsletterSubscriptionPayload {
  email: string;
  source?: string;
}

interface NewsletterSubscriptionResponse {
  email: string;
  alreadySubscribed: boolean;
}

const newsletterApi = {
  subscribe: async (
    data: NewsletterSubscriptionPayload,
  ): Promise<NewsletterSubscriptionResponse> => {
    const response = await instance.post('/newsletter/subscribe', data);
    return extractApiData(response);
  },
};

export function useSubscribeNewsletter() {
  return useMutation({
    mutationFn: newsletterApi.subscribe,
    onError: (error) => {
      errorHandler.log(error, { context: 'Newsletter subscription failed' });
    },
  });
}
