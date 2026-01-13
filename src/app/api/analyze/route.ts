
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { scrapeUrl } from '@/lib/scraper';
import { runAnalysis } from '@/lib/analyzers';
import { saveAnalysis } from '@/lib/store';
import { AnalysisResult } from '@/types/analysis';

const requestSchema = z.object({
    url: z.string().url(),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { url } = requestSchema.parse(body);

        const id = crypto.randomUUID();

        // Perform Analysis (Synchronously for MVP reliability)
        console.log(`Starting analysis for ${url} (ID: ${id})`);

        // 1. Scrape
        const scrapedData = await scrapeUrl(url);

        // 2. Analyze
        const partialResult = await runAnalysis(scrapedData);

        // 3. Construct Result
        const result: AnalysisResult = {
            id,
            url,
            analyzedAt: new Date().toISOString(),
            status: 'completed',
            screenshot: {
                full: scrapedData.screenshot,
                thumbnail: null
            },
            designSystem: partialResult.designSystem!,
            layout: partialResult.layout!,
            seo: partialResult.seo!,
            insights: partialResult.insights!,
            internalLinks: partialResult.internalLinks || [],
            exports: partialResult.exports!
        };

        // 4. Save
        saveAnalysis(result);

        return NextResponse.json({
            success: true,
            message: "Analysis completed",
            data: {
                id,
                status: 'completed'
            }
        });

    } catch (error) {
        console.error("Analysis failed:", error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: "Invalid URL provided" }, { status: 400 });
        }
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
