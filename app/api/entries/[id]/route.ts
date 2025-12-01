import { NextResponse } from 'next/server';
import { deleteEntry } from '@/lib/storage';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    await deleteEntry(id);
    return NextResponse.json({ success: true });
}
