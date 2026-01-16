
import { ScrapedData, SEOInfo, SEOIssue } from '@/types/analysis';

export function analyzeSEO(data: ScrapedData): SEOInfo {
    const issues: SEOIssue[] = [];
    const recommendations: string[] = [];
    const meta = data.metadata;

    // === BASIC SEO ANALYSIS ===

    // 1. Title Analysis
    let titleScore = 100;
    if (!meta.title) {
        issues.push({ type: 'error', message: 'Missing <title> tag - critical for SEO' });
        titleScore = 0;
    } else {
        const titleLen = meta.title.length;
        if (titleLen < 10) {
            issues.push({ type: 'warning', message: `Title too short (${titleLen} chars) - aim for 50-60 chars` });
            titleScore = 40;
        } else if (titleLen > 60) {
            issues.push({ type: 'warning', message: `Title may be truncated (${titleLen} chars) - Google shows ~60 chars` });
            titleScore = 70;
        } else {
            titleScore = 100;
        }
    }

    // 2. Description Analysis
    let descScore = 100;
    if (!meta.description) {
        issues.push({ type: 'error', message: 'Missing meta description - crucial for click-through rate' });
        descScore = 0;
    } else {
        const descLen = meta.description.length;
        if (descLen < 50) {
            issues.push({ type: 'warning', message: `Description too short (${descLen} chars) - aim for 150-160 chars` });
            descScore = 40;
        } else if (descLen > 160) {
            issues.push({ type: 'warning', message: `Description may be truncated (${descLen} chars) - Google shows ~160 chars` });
            descScore = 70;
        } else {
            descScore = 100;
        }
    }

    // 3. Open Graph & Social Media
    let socialScore = 100;
    const ogProps = ['og:title', 'og:description', 'og:image', 'og:type', 'og:url'];
    const missingOg = ogProps.filter(p => !meta.ogTags[p]);
    if (missingOg.length > 0) {
        issues.push({ type: 'info', message: `Missing Open Graph: ${missingOg.join(', ')} - important for social sharing` });
        socialScore = Math.max(0, 100 - (missingOg.length * 20));
    }

    // Twitter Cards
    const hasTwitterCard = meta.ogTags['twitter:card'] || false;
    if (!hasTwitterCard) {
        issues.push({ type: 'info', message: 'Missing Twitter Card tags - limits Twitter preview quality' });
        socialScore -= 10;
    }

    // 4. Heading Structure & Hierarchy
    const h1s = data.styles.filter(s => s.tag === 'h1');
    const h2s = data.styles.filter(s => s.tag === 'h2');
    const h3s = data.styles.filter(s => s.tag === 'h3');
    const h4s = data.styles.filter(s => s.tag === 'h4');
    const h5s = data.styles.filter(s => s.tag === 'h5');
    const h6s = data.styles.filter(s => s.tag === 'h6');

    let headingScore = 100;
    if (h1s.length === 0) {
        issues.push({ type: 'error', message: 'No H1 tag - every page needs exactly one H1' });
        headingScore = 0;
    } else if (h1s.length > 1) {
        issues.push({ type: 'warning', message: `${h1s.length} H1 tags found - should be unique (one per page)` });
        headingScore = 50;
    }

    if (h2s.length === 0 && h1s.length > 0) {
        issues.push({ type: 'info', message: 'No H2 tags - consider adding subheadings for better structure' });
        headingScore -= 20;
    }

    // === AI/LLM FRIENDLINESS ANALYSIS ===

    // 5. Semantic HTML Structure
    const semanticElements = data.styles.filter(s =>
        ['header', 'nav', 'main', 'article', 'section', 'aside', 'footer'].includes(s.tag)
    );
    let semanticScore = 0;
    const foundSemantic = new Set(semanticElements.map(s => s.tag));

    if (foundSemantic.has('main')) semanticScore += 30;
    if (foundSemantic.has('header')) semanticScore += 20;
    if (foundSemantic.has('nav')) semanticScore += 15;
    if (foundSemantic.has('footer')) semanticScore += 15;
    if (foundSemantic.has('article') || foundSemantic.has('section')) semanticScore += 20;

    if (semanticScore < 60) {
        issues.push({
            type: 'warning',
            message: `Low semantic HTML usage (${semanticScore}%) - AI/LLMs prefer semantic structure for content extraction`
        });
        recommendations.push('Use <main>, <article>, <section> for better AI/LLM content understanding');
    }

    // 6. Structured Data (JSON-LD) - Critical for AI
    let structuredDataScore = 0;
    if (meta.structuredData && meta.structuredData.length > 0) {
        structuredDataScore = 100;
        issues.push({
            type: 'info',
            message: `Found ${meta.structuredData.length} structured data schemas - excellent for AI/LLM understanding`
        });
    } else {
        issues.push({
            type: 'warning',
            message: 'No structured data (JSON-LD) - LLMs use this for precise content extraction'
        });
        recommendations.push('Add JSON-LD structured data (Schema.org) for better AI/LLM interpretation');
    }

    // 7. Content Readability for AI
    const totalHeadings = h1s.length + h2s.length + h3s.length + h4s.length + h5s.length + h6s.length;
    const contentOrganization = totalHeadings > 3 ? 100 : (totalHeadings / 3) * 100;

    if (totalHeadings < 3) {
        issues.push({
            type: 'info',
            message: `Only ${totalHeadings} headings found - AI/LLMs parse content better with clear heading hierarchy`
        });
        recommendations.push('Use more headings (H2, H3) to create clear content sections for AI parsing');
    }

    // === TECHNICAL SEO ===

    // 8. Canonical & Indexing
    let technicalScore = 100;
    if (!meta.canonical) {
        issues.push({ type: 'info', message: 'No canonical tag - prevents duplicate content issues' });
        recommendations.push('Add canonical tag to specify preferred URL version');
        technicalScore -= 20;
    }

    if (!meta.robots) {
        issues.push({ type: 'info', message: 'No robots meta tag - defaults to "index, follow"' });
    } else if (meta.robots.includes('noindex')) {
        issues.push({ type: 'warning', message: 'Page is set to "noindex" - will not appear in search results' });
    }

    // 9. Image Accessibility & AI Readability
    let imageScore = 100;
    if (meta.altTags && meta.altTags.total > 0) {
        const altCoverage = ((meta.altTags.total - meta.altTags.missing) / meta.altTags.total) * 100;
        imageScore = altCoverage;

        if (meta.altTags.missing > 0) {
            issues.push({
                type: 'warning',
                message: `${meta.altTags.missing}/${meta.altTags.total} images missing alt text - AI/LLMs cannot interpret these images`
            });
            recommendations.push('Add descriptive alt text to all images for accessibility and AI understanding');
        }
    }

    // === CALCULATE FINAL SCORES ===

    // Overall SEO Score (traditional)
    const overallScore = Math.round(
        (titleScore * 0.15) +
        (descScore * 0.15) +
        (headingScore * 0.20) +
        (socialScore * 0.10) +
        (technicalScore * 0.15) +
        (imageScore * 0.10) +
        (semanticScore * 0.15)
    );

    // AI/LLM Friendliness Score
    const aiScore = Math.round(
        (semanticScore * 0.30) +
        (structuredDataScore * 0.40) +
        (contentOrganization * 0.20) +
        (imageScore * 0.10)
    );

    // Add AI Score interpretation
    if (aiScore >= 80) {
        issues.push({ type: 'info', message: `✓ Excellent AI/LLM readability (${aiScore}/100) - content is well-structured for extraction` });
    } else if (aiScore >= 60) {
        issues.push({ type: 'info', message: `⚠ Good AI/LLM readability (${aiScore}/100) - some improvements possible` });
    } else {
        issues.push({ type: 'warning', message: `⚠ Low AI/LLM readability (${aiScore}/100) - AI models may struggle to extract content` });
    }

    return {
        score: Math.max(0, overallScore),
        aiLlmScore: aiScore,
        title: meta.title,
        description: meta.description,
        ogImage: meta.ogTags['og:image'] || null,
        ogTags: meta.ogTags,
        structuredData: meta.structuredData,
        issues,
        recommendations,
        headings: {
            h1: h1s.map(h => 'H1').slice(0, 5),
            h2: h2s.map(h => 'H2').slice(0, 10),
            h3: h3s.map(h => 'H3').slice(0, 10),
        },
        headingCount: {
            h1: h1s.length,
            h2: h2s.length,
            h3: h3s.length,
            h4: h4s.length,
            h5: h5s.length,
            h6: h6s.length,
            total: totalHeadings
        },
        semanticElements: Array.from(foundSemantic),
        semanticScore,
        canonical: meta.canonical,
        robots: meta.robots,
        altTags: meta.altTags || { total: 0, missing: 0 }
    };
}
