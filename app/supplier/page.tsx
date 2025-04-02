'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus } from 'lucide-react';

interface Medicine {
  _id: string;
  name: string;
  stock: number;
  price: number;
  category: string;
}

export default function SupplierDashboard() {
  const { data: session } = useSession();
  const [medicines, setMedicines] = useState<Medicine[]>([]);

  useEffect(() => {
    const fetchMedicines = async () => {
      const response = await fetch('/api/supplier/medicines');
      const data = await response.json();
      setMedicines(data);
    };
    fetchMedicines();
  }, []);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Supplier Dashboard</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Medicine
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {medicines.map((medicine) => (
              <TableRow key={medicine._id}>
                <TableCell>{medicine.name}</TableCell>
                <TableCell>{medicine.category}</TableCell>
                <TableCell>{medicine.stock}</TableCell>
                <TableCell>${medicine.price.toFixed(2)}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">Update Stock</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}