import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-card border-t mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="font-serif text-xl font-semibold">KINGSHEUNN</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Premium Fashion Made Attainable. Experience timeless elegance without compromise.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-sm uppercase tracking-wide">Collections</h4>
            <nav className="flex flex-col space-y-2">
              <Link href="/collections?category=Tees+%26+Polo" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-tees">
                  Tees & Polo
              </Link>
              <Link href="/collections?category=Pants" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-pants">
                Pants
              </Link>
              <Link href="/collections?category=Shoes" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-shoes">
                Shoes
              </Link>
              <Link href="/collections?category=Accessories" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-accessories">
                Accessories
              </Link>
            </nav>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-sm uppercase tracking-wide">Customer Service</h4>
            <nav className="flex flex-col space-y-2">
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-about">
                  About Us
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-contact">
                  Contact Us
              </Link>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-shipping">
                Shipping Info
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-returns">
                Returns
              </a>
            </nav>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-sm uppercase tracking-wide">Newsletter</h4>
            <p className="text-sm text-muted-foreground">
              Subscribe to get special offers and updates.
            </p>
            <div className="flex gap-2">
              <Input 
                type="email" 
                placeholder="Your email" 
                className="flex-1"
                data-testid="input-newsletter"
              />
              <Button className="uppercase text-xs" data-testid="button-subscribe">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
        
        <Separator className="my-8" />
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} KINGSHEUNN LUXURY. All rights reserved.
          </p>
          <div className="flex gap-4">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-8 opacity-60" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b7/MasterCard_Logo.svg" alt="Mastercard" className="h-8 opacity-60" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg" alt="American Express" className="h-8 opacity-60" />
          </div>
        </div>
      </div>
    </footer>
  );
}
