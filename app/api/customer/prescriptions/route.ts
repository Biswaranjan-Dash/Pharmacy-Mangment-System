import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Prescription from '@/models/Prescription';

export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session || session.user.role !== 'customer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const prescriptions = await Prescription.find({ patient: session.user.id })
      .populate('doctor', 'name')
      .populate('medicines.medicine', 'name')
      .sort({ createdAt: -1 });

    return NextResponse.json(prescriptions);
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}