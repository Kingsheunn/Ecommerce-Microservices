import { auth } from "@clerk/nextjs/server";
import { OrderType } from "@repo/types";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const fetchOrders = async () => {
  const { getToken } = await auth();
  const token = await getToken();

  if (!token) {
    console.error("No authentication token found");
    return [];
  }

  const baseUrl = process.env.NEXT_PUBLIC_ORDER_SERVICE_URL;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_ORDER_SERVICE_URL is not defined");
  }

  const res = await fetch(`${baseUrl}/user-orders`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    console.error(`HTTP error! status: ${res.status}`);
    return [];
  }

  const data = await res.json();

  // Ensure data is an array
  if (!Array.isArray(data)) {
    console.error("API response is not an array:", data);
    return [];
  }

  return data as OrderType[];
};

const OrdersPage = async () => {
  const orders = await fetchOrders();

  return (
    <main className="min-h-screen pt-24">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl md:text-5xl font-medium mb-4">
            Your Orders
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Track and manage all your purchases
          </p>
        </div>

        {(!orders || !Array.isArray(orders) || orders.length === 0) ? (
          <div className="text-center py-16">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center">
                <ShoppingBag className="w-12 h-12 text-muted-foreground" />
              </div>
            </div>
            <h2 className="text-2xl font-semibold mb-4">You have no orders</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Looks like you haven't placed any orders yet. Start shopping to see your orders here!
            </p>
            <Button asChild>
              <Link href="/collections">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">
                Showing {orders.length} order{orders.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid gap-4">
              {orders.map((order) => (
                <Card key={order._id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        Order #{order._id.slice(-8)}
                      </CardTitle>
                      <Badge variant={order.status === 'success' ? 'default' : 'secondary'}>
                        {order.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                        <p className="text-lg font-semibold">${(order.amount / 100).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Order Date</p>
                        <p className="text-sm">
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString("en-US", {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })
                            : "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Products</p>
                        <p className="text-sm">
                          {order.products?.length || 0} item{order.products?.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Items</p>
                        <p className="text-sm">
                          {order.products?.map(product => product.name).join(", ") || "No items"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default OrdersPage;
