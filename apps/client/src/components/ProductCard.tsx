import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Product } from "@/services/products";
import Link from "next/link";
import { Check } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return `₦${price.toLocaleString()}.00`;
  };

  return (
    <Card className="group overflow-hidden border hover-elevate transition-all">
      <CardContent className="p-0">
        <Link href={`/product/${product.id}`}
              className="block relative aspect-square bg-muted overflow-hidden"
              data-testid={`link-product-${product.id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
        </Link>

        <div className="p-4 space-y-3">
          <Link href={`/product/${product.id}`}
                className="block"
                data-testid={`text-product-name-${product.id}`}>
            <h3 className="font-medium text-sm leading-tight line-clamp-2 hover:text-foreground/80 transition-colors">
              {product.name}
            </h3>
          </Link>
          
          <div className="flex items-center gap-2" data-testid={`text-price-${product.id}`}>
            <span className="text-lg font-semibold">
              {formatPrice(product.price)}
            </span>
          </div>
          
          <Button 
            className="w-full uppercase text-xs font-medium tracking-wide"
            onClick={() => onAddToCart?.(product)}
            data-testid={`button-buy-now-${product.id}`}
          >
            <Check className="w-4 h-4 mr-2" />
            Buy Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
