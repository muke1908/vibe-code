import { NextResponse } from 'next/server';
import { updateGoal, getData, saveData } from '@/lib/storage';

export async function GET() {
    const data = await getData();
    return NextResponse.json(data.settings);
}

export async function POST(request: Request) {
    const body = await request.json();
    const data = await getData();

    // Merge new settings with existing ones
    data.settings = {
        ...data.settings,
        ...body
    };

    await saveData(data);
    return NextResponse.json({ success: true, ...data.settings });
}
