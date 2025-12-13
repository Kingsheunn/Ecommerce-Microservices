"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import useCartStore from "@/stores/cartStore";
import { paymentService } from "@/services/payment";
import { orderService } from "@/services/orders";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { cart, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);

  const [shippingAddress, setShippingAddress] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value,
    });
  };

  const handleCheckout = async () => {
    if (!user) {
      toast.error("Please sign in to continue");
      router.push("/sign-in");
      return;
    }

    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    // Validate address
    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.zipCode) {
      toast.error("Please fill in all shipping address fields");
      return;
    }

    try {
      setLoading(true);

      // Get Clerk session token
      const token = await user.primaryEmailAddress?.id;
      if (!token) {
        throw new Error("Could not get authentication token");
      }

      // Prepare items for checkout
      const items = cart.map((item) => ({
        productId: item.id.toString(),
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: typeof item.images === 'object' && item.images !== null && 'default' in item.images
          ? (item.images as Record<string, string>).default
          : '',
      }));

      // Create Stripe checkout session
      const session = await paymentService.createCheckoutSession(
        {
          items,
          successUrl: `${window.location.origin}/return?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/checkout`,
        },
        token
      );

      // Redirect to Stripe checkout
      window.location.href = session.url;
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to process checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <main className="min-h-screen pt-24">
        <div className="container mx-auto px-4">
          <p className="text-center">Loading...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen pt-24">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold mb-4">Sign In Required</h1>
            <p className="text-muted-foreground mb-6">
              Please sign in to continue with your purchase
            </p>
            <Button onClick={() => router.push("/sign-in")}>
              Sign In
            </Button>
          </div>
        </div>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main className="min-h-screen pt-24">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
            <p className="text-muted-foreground mb-6">
              Add some products to your cart before checking out
            </p>
            <Button onClick={() => router.push("/")}>
              Continue Shopping
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24">
      <div className="container mx-auto px-4 max-w-4xl py-8">
        <h1 className="font-serif text-4xl font-medium mb-8">Checkout</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Shipping Address Form */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Shipping Address</h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  name="street"
                  value={shippingAddress.street}
                  onChange={handleInputChange}
                  placeholder="123 Main St"
                  required
                />
              </div>

              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  value={shippingAddress.city}
                  onChange={handleInputChange}
                  placeholder="New York"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    name="state"
                    value={shippingAddress.state}
                    onChange={handleInputChange}
                    placeholder="NY"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="zipCode">Zip Code</Label>
                  <Input
                    id="zipCode"
                    name="zipCode"
                    value={shippingAddress.zipCode}
                    onChange={handleInputChange}
                    placeholder="10001"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  name="country"
                  value={shippingAddress.country}
                  onChange={handleInputChange}
                  placeholder="United States"
                  required
                />
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>

            <div className="border rounded-lg p-6 space-y-4">
              {cart.map((item) => (
                <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex justify-between">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity} × ${item.price.toFixed(2)}
                    </p>
                  </div>
                  <p className="font-medium">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? "Processing..." : "Proceed to Payment"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
