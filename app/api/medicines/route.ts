import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Medicine from "@/models/Medicine";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";


export async function GET() {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Fetch medicines with stock > 0
    const medicines = await Medicine.find({ stock: { $gt: 0 } })
      .select('_id name description price stock category requiresPrescription')
      .lean();
      
    return NextResponse.json(medicines);
  } catch (error) {
    console.error('Error fetching medicines:', error);
    return NextResponse.json({ error: 'Failed to fetch medicines' }, { status: 500 });
  }
}