"use client";

// import ProductList from "@/components/ProductList"; // Not used - API integration
import Hero from "@/components/Hero";
import SeoProductCard from "@/components/SeoProductCard";
import CategoryFilter from "@/components/CategoryFilter";
import { useState, useEffect } from "react";
import useCartStore from "@/stores/cartStore";
import { toast } from "react-toastify";
import { productService, type Product } from "@/services/products";

const Homepage = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCartStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          productService.getProducts(),
          productService.getCategories(),
        ]);
        setProducts(productsData);
        setCategories(["All", ...categoriesData.map((c) => c.name)]);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProducts = selectedCategory === "All"
    ? products
    : products.filter((p) => p.category === selectedCategory);

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: parseInt(product.id),
      name: product.name,
      price: product.price,
      quantity: 1,
      selectedSize: "M",
      selectedColor: "default",
      sizes: ["S", "M", "L", "XL"],
      colors: ["default"],
      images: { default: product.image },
      shortDescription: product.description,
      description: product.description,
      createdAt: new Date(product.createdAt || new Date()),
      updatedAt: new Date(product.updatedAt || new Date()),
      categorySlug: product.category.toLowerCase().replace(/\s+/g, "-"),
    });
    toast.success(`${product.name} added to cart!`);
  };

  if (loading) {
    return (
      <main className="min-h-screen">
        <Hero />
        <section className="container mx-auto px-4 py-16">
          <div className="text-center">
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <Hero />

      {/* SeoCommerce Featured Products Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl font-medium mb-2 border-b-2 border-foreground inline-block pb-1">
            NEW ARRIVALS
          </h2>
        </div>

        <div className="mb-8">
          <CategoryFilter
            selected={selectedCategory}
            onSelect={setSelectedCategory}
            categories={categories}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <SeoProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      </section>

      {/* Ways to Style Section */}
      <section className="bg-card py-16 border-y">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="font-serif text-3xl md:text-4xl font-medium">WAYS TO STYLE</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our "Ways to style" edit showcase how to combine our signature pieces with timeless wardrobe essentials,
              helping you create versatile outfits for every occasion.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              From casual sophistication to refined elegance, explore different ways to wear KINGSHEUNN and see how each piece
              transforms to fit your lifestyle.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Homepage;
