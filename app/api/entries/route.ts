import { NextResponse } from 'next/server';
import { getEntries, addEntry } from '@/lib/storage';
import { Entry } from '@/lib/types';


export async function GET() {
    const entries = await getEntries();
    return NextResponse.json(entries);
}

export async function POST(request: Request) {
    const body = await request.json();
    const newEntry: Entry = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        ...body,
    };
    await addEntry(newEntry);
    return NextResponse.json(newEntry);
}
