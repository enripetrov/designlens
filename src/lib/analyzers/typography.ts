
import { FontStyle, ComputedStyleData } from '@/types/analysis';

export function analyzeTypography(styles: ComputedStyleData[]): {
    headings: {
        h1: FontStyle | null
        h2: FontStyle | null
        h3: FontStyle | null
        h4: FontStyle | null
        h5: FontStyle | null
        h6: FontStyle | null
    }
    body: FontStyle | null
    code: FontStyle | null
    footer: FontStyle | null
    ui: FontStyle[]
    fontFamilies: string[]
    fontSources: string[]
    fontFaces: string[]
} {
    const families = new Set<string>();

    const getFontStyle = (tag: string): FontStyle | null => {
        const found = styles.find(s => s.tag === tag); // We prioritize the specifically captured granular tags
        if (!found) return null;

        const s = found.styles;
        let rawFamily = s.fontFamily.replace(/['"]/g, '');

        // Clean Next.js specific hashed font names (e.g. __Inter_Tight_a3c0d3 -> Inter Tight)
        const nextJsFontMatch = rawFamily.match(/^__([A-Z][a-zA-Z]+)_([A-Z][a-zA-Z]+)?/);
        if (nextJsFontMatch) {
            const fontName = nextJsFontMatch[2]
                ? `${nextJsFontMatch[1]} ${nextJsFontMatch[2]}`
                : nextJsFontMatch[1];

            // Reconstruct with the pretty name + ensure a fallback exists
            rawFamily = `${fontName}, ${rawFamily.includes(',') ? rawFamily.split(',').slice(1).join(',') : 'sans-serif'}`;
        }

        const family = rawFamily.trim();
        families.add(family);

        return {
            family,
            size: s.fontSize,
            weight: parseInt(s.fontWeight) || 400,
            lineHeight: s.lineHeight,
            usage: tag.match(/^h[1-6]$/) ? 'heading' : 'body'
        };
    };

    // Body Fallback
    const pStyle = getFontStyle('p');
    const bodyStyle = pStyle || getFontStyle('div') || null;

    // Headings
    const h1 = getFontStyle('h1');
    const h2 = getFontStyle('h2');
    const h3 = getFontStyle('h3');
    const h4 = getFontStyle('h4');
    const h5 = getFontStyle('h5');
    const h6 = getFontStyle('h6');
    const code = getFontStyle('code');
    const footer = getFontStyle('footer') || getFontStyle('.footer');

    // UI Fonts (Buttons, Inputs)
    const uiStyles: FontStyle[] = [];
    const uiTags = ['button', 'input', 'a', '.btn'];
    uiTags.forEach(tag => {
        const s = getFontStyle(tag);
        if (s) uiStyles.push({ ...s, usage: 'ui' });
    });

    return {
        headings: { h1, h2, h3, h4, h5, h6 },
        body: bodyStyle,
        code,
        footer,
        ui: uiStyles,
        fontFamilies: Array.from(families),
        fontSources: [],
        fontFaces: []
    };
}
