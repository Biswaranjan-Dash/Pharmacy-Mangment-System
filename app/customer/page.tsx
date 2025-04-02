'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart } from 'lucide-react';

interface Order {
  _id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

interface Medicine {
  _id: string;
  name: string;
  price: number;
  description: string;
  requiresPrescription: boolean;
}

export default function CustomerDashboard() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [ordersRes, medicinesRes] = await Promise.all([
        fetch('/api/customer/orders'),
        fetch('/api/medicines'),
      ]);
      const [ordersData, medicinesData] = await Promise.all([
        ordersRes.json(),
        medicinesRes.json(),
      ]);
      setOrders(ordersData);
      setMedicines(medicinesData);
    };
    fetchData();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Customer Dashboard</h1>

      <Tabs defaultValue="shop" className="w-full">
        <TabsList>
          <TabsTrigger value="shop">Shop Medicines</TabsTrigger>
          <TabsTrigger value="orders">My Orders</TabsTrigger>
        </TabsList>
        
        <TabsContent value="shop">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {medicines.map((medicine) => (
              <Card key={medicine._id}>
                <CardHeader>
                  <CardTitle>{medicine.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {medicine.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <p className="font-bold">${medicine.price.toFixed(2)}</p>
                    <Button>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>
                  </div>
                  {medicine.requiresPrescription && (
                    <p className="text-sm text-red-500 mt-2">
                      Requires prescription
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="orders">
          <div className="grid gap-4">
            {orders.map((order) => (
              <Card key={order._id}>
                <CardHeader>
                  <CardTitle>Order #{order._id.slice(-6)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Date: {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Status: {order.status}
                      </p>
                    </div>
                    <div>
                      <p className="font-bold">
                        Total: ${order.totalAmount.toFixed(2)}
                      </p>
                      <Button variant="outline" size="sm" className="mt-2">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}