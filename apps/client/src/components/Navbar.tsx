"use client";

import Link from "next/link";
import { ShoppingCart, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ShoppingCartIcon from "./ShoppingCartIcon";
import CartDrawer from "./CartDrawer";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
} from "@clerk/nextjs";
import ProfileButton from "./ProfileButton";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { useState, useEffect } from "react";
import useCartStore from "@/stores/cartStore";
import { productService, type Category } from "@/services/products";

const Navbar = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const { cart } = useCartStore();

  const cartCount = cart.reduce((sum: number, item: any) => sum + item.quantity, 0);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await productService.getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Button size="icon" variant="ghost" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>

          <Link href="/" className="flex items-center gap-2">
            <h1 className="font-serif text-xl font-semibold tracking-tight">
              KINGSHEUNN
            </h1>
            <span className="text-xs text-muted-foreground">LUXURY</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium hover:text-foreground/80 transition-colors"
          >
            Home
          </Link>

          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-sm font-medium">
                  Collections
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-4 w-[400px]">
                    <Link href="/collections">
                      <div className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover-elevate">
                        <div className="text-sm font-medium leading-none">
                          All Collections
                        </div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Browse our complete catalog
                        </p>
                      </div>
                    </Link>
                    {categories.map((category) => (
                      <Link key={category.id} href={`/collections?category=${encodeURIComponent(category.slug)}`}>
                        <div className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover-elevate">
                          <div className="text-sm font-medium leading-none">
                            {category.name}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <Link
            href="/orders"
            className="text-sm font-medium hover:text-foreground/80 transition-colors"
          >
            Orders
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" onClick={() => setShowSearch(!showSearch)}>
            <Search className="h-5 w-5" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            className="relative"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <Badge
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {cartCount}
              </Badge>
            )}
          </Button>

          <SignedOut>
            <div className="flex items-center gap-2">
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button size="sm">Sign Up</Button>
              </SignUpButton>
            </div>
          </SignedOut>

          <SignedIn>
            <ProfileButton />
          </SignedIn>
        </div>
        </div>
      </header>

      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} items={[]} />
    </>
  );
};

export default Navbar;
