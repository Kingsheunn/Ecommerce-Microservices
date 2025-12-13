import { fetchAPI, apiConfig } from './api';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
  _id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const orderService = {
  // Get user orders
  async getUserOrders(token: string): Promise<Order[]> {
    return fetchAPI<Order[]>(`${apiConfig.order}/user-orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Get all orders (admin only)
  async getAllOrders(token: string, limit?: number): Promise<Order[]> {
    const url = limit
      ? `${apiConfig.order}/orders?limit=${limit}`
      : `${apiConfig.order}/orders`;

    return fetchAPI<Order[]>(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Create order
  async createOrder(orderData: {
    items: OrderItem[];
    totalAmount: number;
    shippingAddress: Order['shippingAddress'];
  }, token: string): Promise<Order> {
    return fetchAPI<Order>(`${apiConfig.order}/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });
  },
};
