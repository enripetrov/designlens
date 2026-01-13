
import { ScrapedData, LayoutInfo, Section } from '@/types/analysis';

export function analyzeLayout(data: ScrapedData): LayoutInfo {
    const styles = data.styles;

    // 1. Structure Detection
    const sections: Section[] = [];

    // Identify Semantic Sections
    const semanticTags = ['header', 'footer', 'main', 'nav', 'section', 'article'];
    styles.filter(s => semanticTags.includes(s.tag)).forEach(s => {
        // Simple depth estimation based on position/size
        sections.push({
            tag: s.tag,
            className: s.className,
            depth: 0,
            children: 0
        });
    });

    // 2. Hero Section Heuristic
    // First element in 'main' or high up in body that is large?
    // For now, we look for h1 and assume its container is significant

    // 3. Grid/Flex Detection
    let hasFlexbox = false;
    let hasGrid = false;

    styles.forEach(s => {
        if (s.styles.display === 'flex') hasFlexbox = true;
        if (s.styles.display === 'grid') hasGrid = true;
    });

    // 4. Container Width Analysis
    // Look for common max-widths in typical container classes
    const containerWidths = styles
        .filter(s => s.styles.maxWidth && s.styles.maxWidth !== 'none')
        .map(s => parseInt(s.styles.maxWidth));

    // Most frequent max-width > 800px is likely the container
    const containerWidth = containerWidths.find(w => w > 800) || 1200; // Default fallback

    return {
        containerWidth,
        gridColumns: 12, // Default assumption, hard to sniff from computed styles reliably without recursive analysis
        breakpoints: [
            { name: 'sm', minWidth: 640 },
            { name: 'md', minWidth: 768 },
            { name: 'lg', minWidth: 1024 },
            { name: 'xl', minWidth: 1280 },
        ],
        sections,
        hasFlexbox,
        hasGrid
    };
}
