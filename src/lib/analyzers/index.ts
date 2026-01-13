
import { ScrapedData, AnalysisResult, DesignSystem } from '@/types/analysis';
import { analyzeColors } from './colors';
import { analyzeTypography } from './typography';
import { analyzeSEO } from './seo';
import { analyzeLayout } from './layout';
import { generateInsights } from './ai';

export async function runAnalysis(scraped: ScrapedData): Promise<Partial<AnalysisResult>> {
    const colors = analyzeColors(scraped.styles);
    const typography = analyzeTypography(scraped.styles);
    const seo = analyzeSEO(scraped);
    const layout = analyzeLayout(scraped);

    // Add external font sources from scraper
    typography.fontSources = scraped.fonts.external;
    typography.fontFaces = scraped.fonts.fontFaces || [];

    const designSystem: DesignSystem = {
        colors,
        typography,
        spacing: {
            scale: [],
            baseUnit: 4,
            values: []
        }
    };

    const insights = await generateInsights(scraped, designSystem, layout);

    return {
        url: scraped.url,
        analyzedAt: new Date().toISOString(),
        screenshot: {
            full: scraped.screenshot,
            thumbnail: null
        },
        designSystem,
        layout,
        seo,
        insights,
        internalLinks: scraped.links || [],
        exports: {
            cssVariables: null,
            tailwindConfig: null,
            figmaTokens: null
        },
        pagesAnalyzed: scraped.subpagesContent?.map(p => ({
            url: p.url,
            title: p.title
        })) || [],
        techStack: scraped.techStack || []
    };
}
