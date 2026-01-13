
import { NextResponse } from 'next/server';
import { getAnalysis } from '@/lib/store';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const id = (await params).id;
    const result = getAnalysis(id);

    if (!result) {
        return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
    }

    return NextResponse.json(result);
}
