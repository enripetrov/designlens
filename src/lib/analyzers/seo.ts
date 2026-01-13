
import { ScrapedData, SEOInfo, SEOIssue } from '@/types/analysis';

export function analyzeSEO(data: ScrapedData): SEOInfo {
    const issues: SEOIssue[] = [];
    const meta = data.metadata;

    // 1. Title Analysis
    if (!meta.title) {
        issues.push({ type: 'error', message: 'Missing <title> tag' });
    } else if (meta.title.length < 10) {
        issues.push({ type: 'warning', message: 'Title tag is too short (< 10 chars)' });
    } else if (meta.title.length > 60) {
        issues.push({ type: 'warning', message: 'Title tag is likely truncated (> 60 chars)' });
    }

    // 2. Description Analysis
    if (!meta.description) {
        issues.push({ type: 'error', message: 'Missing meta description' });
    } else if (meta.description.length < 50) {
        issues.push({ type: 'warning', message: 'Meta description is too short' });
    } else if (meta.description.length > 160) {
        issues.push({ type: 'warning', message: 'Meta description is likely truncated (> 160 chars)' });
    }

    // 3. Open Graph
    const ogProps = ['og:title', 'og:description', 'og:image'];
    const missingOg = ogProps.filter(p => !meta.ogTags[p]);
    if (missingOg.length > 0) {
        issues.push({ type: 'info', message: `Missing Open Graph tags: ${missingOg.join(', ')}` });
    }

    // 4. Heading Structure
    const h1s = data.styles.filter(s => s.tag === 'h1');
    const h2s = data.styles.filter(s => s.tag === 'h2');
    const h3s = data.styles.filter(s => s.tag === 'h3');

    if (h1s.length === 0) {
        issues.push({ type: 'error', message: 'No H1 tag found' });
    } else if (h1s.length > 1) {
        issues.push({ type: 'warning', message: 'Multiple H1 tags found (should be unique)' });
    }

    // 5. Canonical & Robots
    if (!meta.canonical) {
        issues.push({ type: 'info', message: 'No canonical tag found' });
    }
    if (!meta.robots) {
        issues.push({ type: 'info', message: 'No robots meta tag found' });
    }

    // 6. Image Alt Tags
    if (meta.altTags && meta.altTags.missing > 0) {
        issues.push({ type: 'warning', message: `${meta.altTags.missing} images are missing alt attributes` });
    }

    // 7. Calculate Score
    let score = 100;
    issues.forEach(issue => {
        if (issue.type === 'error') score -= 20;
        if (issue.type === 'warning') score -= 10;
        if (issue.type === 'info') score -= 2;
    });

    return {
        score: Math.max(0, score),
        title: meta.title,
        description: meta.description,
        ogImage: meta.ogTags['og:image'] || null,
        ogTags: meta.ogTags,
        structuredData: meta.structuredData,
        issues,
        headings: {
            h1: h1s.map(h => 'H1').slice(0, 5),
            h2: h2s.map(h => 'H2').slice(0, 5),
            h3: h3s.map(h => 'H3').slice(0, 5),
        },
        canonical: meta.canonical,
        robots: meta.robots,
        altTags: meta.altTags || { total: 0, missing: 0 }
    };
}
