"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Product } from "@/services/products";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export default function SeoProductCard({ product, onAddToCart }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return `$${price.toLocaleString()}`;
  };

  return (
    <Card className="group overflow-hidden border hover-elevate transition-all">
      <CardContent className="p-0">
        <Link href={`/products/${product.id}`}>
          <div className="block relative aspect-square bg-muted overflow-hidden">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <span className="text-sm">No Image</span>
              </div>
            )}
          </div>
        </Link>

        <div className="p-4 space-y-3">
          <Link href={`/products/${product.id}`}>
            <h3 className="font-medium text-sm leading-tight line-clamp-2 hover:text-foreground/80 transition-colors">
              {product.name}
            </h3>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">
              {formatPrice(product.price)}
            </span>
          </div>

          <Button
            className="w-full uppercase text-xs font-medium tracking-wide"
            onClick={() => onAddToCart?.(product)}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
