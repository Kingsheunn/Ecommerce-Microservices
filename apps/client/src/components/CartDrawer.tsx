import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, X } from "lucide-react";
import Link from "next/link";

interface CartItem {
  product: {
    id: string;
    name: string;
    price: number;
    image?: string;
  };
  quantity: number;
}

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CartItem[];
  onUpdateQuantity?: (productId: string, quantity: number) => void;
  onRemove?: (productId: string) => void;
}

export default function CartDrawer({ 
  open, 
  onOpenChange, 
  items,
  onUpdateQuantity,
  onRemove 
}: CartDrawerProps) {
  const formatPrice = (price: number) => {
    return `₦${price.toLocaleString()}.00`;
  };

  const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col" data-testid="drawer-cart">
        <SheetHeader>
          <SheetTitle className="text-2xl font-serif">Shopping Cart</SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto py-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4" data-testid="text-cart-empty">
              <p className="text-muted-foreground">Your cart is empty</p>
              <Button onClick={() => onOpenChange(false)} data-testid="button-continue-shopping">
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-4" data-testid={`cart-item-${item.product.id}`}>
                  <div className="w-24 h-24 bg-muted rounded-md overflow-hidden flex-shrink-0">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-sm line-clamp-2" data-testid={`text-cart-product-${item.product.id}`}>
                        {item.product.name}
                      </h4>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 flex-shrink-0"
                        onClick={() => onRemove?.(item.product.id)}
                        data-testid={`button-remove-${item.product.id}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <p className="text-sm font-semibold mt-1" data-testid={`text-cart-price-${item.product.id}`}>
                      {formatPrice(item.product.price)}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-3">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8"
                        onClick={() => onUpdateQuantity?.(item.product.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        data-testid={`button-decrease-${item.product.id}`}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium" data-testid={`text-quantity-${item.product.id}`}>
                        {item.quantity}
                      </span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8"
                        onClick={() => onUpdateQuantity?.(item.product.id, item.quantity + 1)}
                        data-testid={`button-increase-${item.product.id}`}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {items.length > 0 && (
          <div className="space-y-4 border-t pt-6">
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Subtotal:</span>
              <span data-testid="text-cart-subtotal">{formatPrice(subtotal)}</span>
            </div>
            
            <Link href="/cart">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => onOpenChange(false)}
                data-testid="button-view-cart"
              >
                View Cart
              </Button>
            </Link>
            
            <Link href="/checkout">
              <Button 
                className="w-full uppercase tracking-wide" 
                onClick={() => onOpenChange(false)}
                data-testid="button-checkout"
              >
                Checkout
              </Button>
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
