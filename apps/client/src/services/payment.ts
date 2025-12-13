import { fetchAPI, apiConfig } from './api';

export interface CheckoutSession {
  sessionId: string;
  url: string;
}

export const paymentService = {
  // Create Stripe checkout session
  async createCheckoutSession(data: {
    items: Array<{
      productId: string;
      name: string;
      price: number;
      quantity: number;
      image?: string;
    }>;
    successUrl: string;
    cancelUrl: string;
  }, token: string): Promise<CheckoutSession> {
    return fetchAPI<CheckoutSession>(`${apiConfig.payment}/api/create-checkout-session`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  },

  // Verify payment session
  async verifySession(sessionId: string, token: string): Promise<{
    success: boolean;
    order?: any;
  }> {
    return fetchAPI(`${apiConfig.payment}/api/verify-session/${sessionId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
