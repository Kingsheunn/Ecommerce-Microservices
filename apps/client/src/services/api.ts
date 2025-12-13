// API configuration and base URLs for microservices
const API_BASE_URLS = {
  product: process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL || 'http://localhost:8000',
  order: process.env.NEXT_PUBLIC_ORDER_SERVICE_URL || 'http://localhost:8001',
  payment: process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL || 'http://localhost:8002',
  auth: process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:8004',
};

export const apiConfig = API_BASE_URLS;

// Generic fetch wrapper with error handling
export async function fetchAPI<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}
