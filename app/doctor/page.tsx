"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define the Prescription interface
interface Prescription {
  _id: string;
  patient: {
    name: string;
  };
  createdAt: string;
  status: string;
}

export default function DoctorDashboard() {
  const { data: session } = useSession();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState<string | null>(null); // Add error state

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/doctor/prescriptions");
        if (!response.ok) {
          throw new Error("Failed to fetch prescriptions");
        }
        const data = await response.json();
        // Ensure data is an array and matches Prescription type
        if (Array.isArray(data)) {
          setPrescriptions(data);
        } else {
          throw new Error("Invalid data format from API");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, []);

  // Handle loading and error states
  if (loading) {
    return <div className="p-8">Loading prescriptions...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">{error}</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Doctor Dashboard</h1>
        <Button>New Prescription</Button>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">Active Prescriptions</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          <div className="grid gap-4">
            {prescriptions.length > 0 ? (
              prescriptions
                .filter((p) => p.status === "active")
                .map((prescription) => (
                  <Card key={prescription._id}>
                    <CardHeader>
                      <CardTitle>Patient: {prescription.patient.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Created: {new Date(prescription.createdAt).toLocaleDateString()}
                      </p>
                      <Button variant="outline" className="mt-4">
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))
            ) : (
              <p>No active prescriptions found.</p>
            )}
          </div>
        </TabsContent>
        <TabsContent value="completed">
          <div className="grid gap-4">
            {prescriptions.length > 0 ? (
              prescriptions
                .filter((p) => p.status === "completed")
                .map((prescription) => (
                  <Card key={prescription._id}>
                    <CardHeader>
                      <CardTitle>Patient: {prescription.patient.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Created: {new Date(prescription.createdAt).toLocaleDateString()}
                      </p>
                      <Button variant="outline" className="mt-4">
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))
            ) : (
              <p>No completed prescriptions found.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}