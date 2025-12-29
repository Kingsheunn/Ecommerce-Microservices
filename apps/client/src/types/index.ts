import z from "zod";

export const shippingFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
});

export type ProductType = {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  price: number;
  sizes: string[];
  colors: string[];
  images: Record<string, string>;
  categorySlug: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ProductsType = ProductType[];

export type CartItemsType = Array<{
  id: string;
  name: string;
  price: number;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
  images: Record<string, string>;
}>;

export type ShippingFormInputs = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
};

export type OrderType = {
  _id: string;
  id: string;
  userId: string;
  email?: string;
  amount: number;
  products: Array<{
    productId: string;
    quantity: number;
    price: number;
    name: string;
  }>;
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'success';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt: Date;
  updatedAt: Date;
};
