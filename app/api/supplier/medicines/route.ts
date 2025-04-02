import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Medicine from '@/models/Medicine';

export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session || session.user.role !== 'supplier') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const medicines = await Medicine.find({ supplier: session.user.id });

    return NextResponse.json(medicines);
  } catch (error) {
    console.error('Error fetching supplier medicines:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    
    if (!session || session.user.role !== 'supplier') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    await connectDB();

    const medicine = new Medicine({
      ...data,
      supplier: session.user.id,
    });

    await medicine.save();

    return NextResponse.json(medicine);
  } catch (error) {
    console.error('Error creating medicine:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}