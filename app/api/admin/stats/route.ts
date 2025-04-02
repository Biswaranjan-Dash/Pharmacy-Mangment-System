import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Medicine from '@/models/Medicine';
import Order from '@/models/Order';
import Prescription from '@/models/Prescription';

export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const [totalUsers, totalMedicines, totalOrders, totalPrescriptions] = await Promise.all([
      User.countDocuments(),
      Medicine.countDocuments(),
      Order.countDocuments(),
      Prescription.countDocuments(),
    ]);

    return NextResponse.json({
      totalUsers,
      totalMedicines,
      totalOrders,
      totalPrescriptions,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}