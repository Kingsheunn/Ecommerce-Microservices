"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { productService, type Product, type Category } from "@/services/products";
import SeoProductCard from "@/components/SeoProductCard";
import CategoryFilter from "@/components/CategoryFilter";
import useCartStore from "@/stores/cartStore";
import { toast } from "react-toastify";

function CollectionsContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryNameToSlug, setCategoryNameToSlug] = useState<{ [key: string]: string }>({});
  const [categorySlugToName, setCategorySlugToName] = useState<{ [key: string]: string }>({});
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
        setCategories(categoriesData);

        // Create mappings for category filtering
        const nameToSlug: { [key: string]: string } = {};
        const slugToName: { [key: string]: string } = {};
        categoriesData.forEach((c) => {
          nameToSlug[c.name] = c.slug;
          slugToName[c.slug] = c.name;
        });
        setCategoryNameToSlug(nameToSlug);
        setCategorySlugToName(slugToName);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update selected category when URL parameter changes
  useEffect(() => {
    if (categoryParam) {
      // If categoryParam is a slug, find the corresponding name
      const categoryName = categorySlugToName[categoryParam] || categoryParam;
      setSelectedCategory(categoryName);
    } else {
      setSelectedCategory("All");
    }
  }, [categoryParam, categorySlugToName]);

  const categoryNames = ["All", ...categories.map(c => c.name)];

  const filteredProducts = selectedCategory === "All"
    ? products
    : products.filter((p) => p.category === categoryNameToSlug[selectedCategory]);

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
      <main className="min-h-screen pt-24">
        <div className="container mx-auto px-4">
          <div className="text-center py-16">
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl md:text-5xl font-medium mb-4">
            Our Collections
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore our curated selection of premium products
          </p>
        </div>

        <div className="mb-8">
          <CategoryFilter
            selected={selectedCategory}
            onSelect={setSelectedCategory}
            categories={categoryNames}
          />
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No products found in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <SeoProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default function CollectionsPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen pt-24">
        <div className="container mx-auto px-4">
          <div className="text-center py-16">
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        </div>
      </main>
    }>
      <CollectionsContent />
    </Suspense>
  );
}
