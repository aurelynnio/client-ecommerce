import { useMutation } from '@tanstack/react-query';
import instance from '@/api/api';
import { ENDPOINT_NEWSLETTER } from '@/constants/endpoint';
import { extractApiData } from '@/api';
import { errorHandler } from '@/lib/error-handler';

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
    const response = await instance.post(ENDPOINT_NEWSLETTER.SUBSCRIBE, data);
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
