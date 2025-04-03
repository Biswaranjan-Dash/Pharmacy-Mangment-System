import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Prescription from "@/models/Prescription";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(request, { params }) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'doctor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = params;
    const data = await request.json();
    
    // Find the prescription
    const prescription = await Prescription.findById(id);
    
    if (!prescription) {
      return NextResponse.json({ error: 'Prescription not found' }, { status: 404 });
    }
    
    // Check if the prescription belongs to the logged-in doctor
    if (prescription.doctor.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Update the prescription
    const updatedPrescription = await Prescription.findByIdAndUpdate(
      id,
      { status: data.status },
      { new: true }
    )
      .populate('patient', 'name')
      .populate('medicines.medicine', 'name')
      .lean();
      
    return NextResponse.json(updatedPrescription);
  } catch (error) {
    console.error('Error updating prescription:', error);
    return NextResponse.json({ error: 'Failed to update prescription' }, { status: 500 });
  }
}