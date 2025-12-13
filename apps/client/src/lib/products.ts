export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  description: string;
  sale?: boolean;
}

// Sample products data from SeoCommerce - adapt this to fetch from your backend
export const products: Product[] = [
  {
    id: "1",
    name: "Tie Layered Knit Sweater - Brown",
    category: "Tees & Polo",
    price: 50000,
    originalPrice: 92958,
    image: "/products/seocommerce/Brown_tie_layered_sweater_7bb3c16f.png",
    description: "NEW ARRIVAL!!! Your steps should speak before you do. Explore our curated luxury arrivals, elegance, without compromise.",
    sale: true,
  },
  {
    id: "2",
    name: "ADIDAS VENTO XLG DELUXE",
    category: "Shoes",
    price: 95000,
    originalPrice: 135000,
    image: "/products/seocommerce/Black_luxury_sneakers_623027ef.png",
    description: "Premium athletic sneakers with cutting-edge design and superior comfort.",
    sale: true,
  },
  {
    id: "3",
    name: "Vintage Academic Knitted Vest",
    category: "Two-piece Collection",
    price: 25000,
    originalPrice: 45000,
    image: "/products/seocommerce/Vintage_academic_vest_5d5a3e73.png",
    description: "Classic preppy style vest perfect for layering.",
    sale: true,
  },
  {
    id: "4",
    name: "Denim Jean Forgiveness Polo Shirt - Brown",
    category: "Tees & Polo",
    price: 15000,
    originalPrice: 55000,
    image: "/products/seocommerce/Brown_denim_jacket_4c49b7f3.png",
    description: "Versatile denim piece for the modern wardrobe.",
    sale: true,
  },
  {
    id: "5",
    name: "Sun & Moon Crochet Knit Shirt",
    category: "Tees & Polo",
    price: 45000,
    image: "/products/seocommerce/White_artistic_polo_4be7d232.png",
    description: "Artistic minimalist polo with unique line art design.",
  },
  {
    id: "6",
    name: "Men's Cityboy Denim Pants Dark Grey",
    category: "Pants",
    price: 15000,
    originalPrice: 50000,
    image: "/products/seocommerce/Dark_grey_tailored_pants_bf53394b.png",
    description: "Tailored pants for the modern gentleman.",
    sale: true,
  },
  {
    id: "7",
    name: "Star Print Patchwork | Leather-Neck Sweatshirt",
    category: "Two-piece Collection",
    price: 85000,
    image: "/products/seocommerce/Black_leather_patch_jacket_226e0b88.png",
    description: "Statement piece with unique patchwork detailing.",
  },
  {
    id: "8",
    name: "Big Boss Rottweiler Kennels Graphic",
    category: "Tees & Polo",
    price: 35000,
    image: "/products/seocommerce/Beige_casual_shirt_a1dfb911.png",
    description: "Casual shirt with distinctive graphic print.",
  },
];

export const categories = [
  "All",
  "Tees & Polo",
  "Pants",
  "Shoes",
  "Accessories",
  "Two-piece Collection",
];
