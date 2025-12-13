import { fetchAPI, apiConfig } from './api';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductApiResponse {
  id: number;
  name: string;
  shortDescription: string;
  description: string;
  price: number;
  sizes: string[];
  colors: string[];
  images: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  categorySlug: string;
  category: {
    id: number;
    name: string;
    slug: string;
  };
}

// Helper function to transform API response to client format
export function transformProductFromApi(apiProduct: ProductApiResponse): Product {
  // Get the first image URL available, default to empty string if none
  let firstImageUrl = '';
  if (apiProduct.images && Object.keys(apiProduct.images).length > 0) {
    const imageValues = Object.values(apiProduct.images);
    if (imageValues.length > 0 && imageValues[0]) {
      firstImageUrl = imageValues[0];
    }
  }

  return {
    id: apiProduct.id.toString(),
    name: apiProduct.name,
    description: apiProduct.description || apiProduct.shortDescription || '',
    price: apiProduct.price,
    image: firstImageUrl,
    category: apiProduct.categorySlug || apiProduct.category?.name || '',
    stock: 1, // Default stock value
    createdAt: apiProduct.createdAt,
    updatedAt: apiProduct.updatedAt,
  };
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export const productService = {
  // Get all products
  async getProducts(): Promise<Product[]> {
    const products = await fetchAPI<ProductApiResponse[]>(`${apiConfig.product}/api/products`);
    return products.map(transformProductFromApi);
  },

  // Get single product
  async getProduct(id: string): Promise<Product> {
    const product = await fetchAPI<ProductApiResponse>(`${apiConfig.product}/api/products/${id}`);
    return transformProductFromApi(product);
  },

  // Get all categories
  async getCategories(): Promise<Category[]> {
    return fetchAPI<Category[]>(`${apiConfig.product}/api/categories`);
  },

  // Create product (admin only)
  async createProduct(product: Omit<Product, 'id'>, token: string): Promise<Product> {
    return fetchAPI<Product>(`${apiConfig.product}/api/products`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(product),
    });
  },

  // Update product (admin only)
  async updateProduct(id: string, product: Partial<Product>, token: string): Promise<Product> {
    return fetchAPI<Product>(`${apiConfig.product}/api/products/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(product),
    });
  },

  // Delete product (admin only)
  async deleteProduct(id: string, token: string): Promise<void> {
    return fetchAPI<void>(`${apiConfig.product}/api/products/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
