
import { AnalysisResult } from '@/types/analysis';

// Global cache for MVP
// In production/serverless, this should be replaced with Redis or a database

const globalAny: any = global;
globalAny.analysisStore = globalAny.analysisStore || new Map<string, AnalysisResult>();

export const analysisStore = globalAny.analysisStore as Map<string, AnalysisResult>;

export function saveAnalysis(result: AnalysisResult) {
    console.log(`[Store] Saving analysis ${result.id}. Total items: ${analysisStore.size + 1}`);
    analysisStore.set(result.id, result);
}

export function getAnalysis(id: string): AnalysisResult | undefined {
    const item = analysisStore.get(id);
    console.log(`[Store] Retrieving analysis ${id}. Found: ${!!item}. Total items: ${analysisStore.size}`);
    return item;
}
