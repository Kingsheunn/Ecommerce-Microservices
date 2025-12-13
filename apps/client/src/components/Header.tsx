import { ShoppingCart, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

interface HeaderProps {
  cartCount?: number;
  onCartClick?: () => void;
}

export default function Header({ cartCount = 0, onCartClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Button size="icon" variant="ghost" className="md:hidden" data-testid="button-menu">
            <Menu className="h-5 w-5" />
          </Button>
          
          <Link href="/" className="flex items-center gap-2" data-testid="link-home">
            <h1 className="font-serif text-xl font-semibold tracking-tight">KINGSHEUNN</h1>
            <span className="text-xs text-muted-foreground">LUXURY</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:text-foreground/80 transition-colors" data-testid="link-nav-home">
            Home
          </Link>
          
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-sm font-medium" data-testid="button-collections">
                  Collections
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-4 w-[400px]">
                    <Link href="/collections" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover-elevate" data-testid="link-all-collections">
                      <div className="text-sm font-medium leading-none">All Collections</div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Browse our complete catalog
                      </p>
                    </Link>
                    <Link href="/collections?category=Tees+%26+Polo" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover-elevate" data-testid="link-tees">
                      <div className="text-sm font-medium leading-none">Tees & Polo</div>
                    </Link>
                    <Link href="/collections?category=Pants" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover-elevate" data-testid="link-pants">
                      <div className="text-sm font-medium leading-none">Pants</div>
                    </Link>
                    <Link href="/collections?category=Shoes" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover-elevate" data-testid="link-shoes">
                      <div className="text-sm font-medium leading-none">Shoes</div>
                    </Link>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <Link href="/about" className="text-sm font-medium hover:text-foreground/80 transition-colors" data-testid="link-about">
            About Us
          </Link>

          <Link href="/contact" className="text-sm font-medium hover:text-foreground/80 transition-colors" data-testid="link-contact">
            Contact Us
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" data-testid="button-search">
            <Search className="h-5 w-5" />
          </Button>
          
          <Button 
            size="icon" 
            variant="ghost" 
            className="relative" 
            onClick={onCartClick}
            data-testid="button-cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <Badge 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                data-testid="badge-cart-count"
              >
                {cartCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
