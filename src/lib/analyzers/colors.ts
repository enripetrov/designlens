
import { Color, ComputedStyleData } from '@/types/analysis';

// Helper to convert named colors/rgb to hex/hsl would be good, 
// but for MVP we'll assume computed styles return RGB/RGBA mostly.
// We'll implemented a basic parser.

function rgbToHex(r: number, g: number, b: number): string {
    return "#" + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    }).join("");
}

function rgbToHsl(r: number, g: number, b: number) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function parseColor(colorStr: string): { r: number, g: number, b: number, a: number } | null {
    // Handle rgb(r, g, b) and rgba(r, g, b, a)
    const rgbMatch = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (rgbMatch) {
        return {
            r: parseInt(rgbMatch[1]),
            g: parseInt(rgbMatch[2]),
            b: parseInt(rgbMatch[3]),
            a: rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1
        };
    }
    return null;
}

export function analyzeColors(styles: ComputedStyleData[]): {
    primary: Color[],
    secondary: Color[],
    neutral: Color[],
    all: Color[]
} {
    const colorMap = new Map<string, {
        r: number, g: number, b: number,
        count: number,
        usages: Set<string>,
        elements: Set<string>
    }>();

    const processColor = (colorStr: string, usage: 'background' | 'text' | 'border', descriptor: string) => {
        if (!colorStr || colorStr === 'rgba(0, 0, 0, 0)' || colorStr === 'transparent') return;

        const parsed = parseColor(colorStr);
        if (!parsed || parsed.a === 0) return;

        const hex = rgbToHex(parsed.r, parsed.g, parsed.b);

        if (!colorMap.has(hex)) {
            colorMap.set(hex, {
                r: parsed.r, g: parsed.g, b: parsed.b,
                count: 0,
                usages: new Set(),
                elements: new Set()
            });
        }

        const entry = colorMap.get(hex)!;
        entry.count++;
        entry.usages.add(usage);
        if (entry.elements.size < 5) entry.elements.add(descriptor);
    };

    styles.forEach(item => {
        processColor(item.styles.color, 'text', item.tag + '.' + item.className);
        processColor(item.styles.backgroundColor, 'background', item.tag + '.' + item.className);
        processColor(item.styles.borderColor, 'border', item.tag + '.' + item.className);
    });

    const allColors: Color[] = Array.from(colorMap.entries()).map(([hex, data]) => {
        const hsl = rgbToHsl(data.r, data.g, data.b);
        // Determine primary usage
        let primaryUsage: Color['usage'] = 'other';
        if (data.usages.has('background')) primaryUsage = 'background';
        else if (data.usages.has('text')) primaryUsage = 'text';
        else if (data.usages.has('border')) primaryUsage = 'border';

        return {
            hex,
            rgb: { r: data.r, g: data.g, b: data.b },
            hsl,
            usage: primaryUsage,
            frequency: data.count,
            elements: Array.from(data.elements)
        };
    });

    // Sort by frequency
    allColors.sort((a, b) => b.frequency - a.frequency);

    // Categorize
    const neutral: Color[] = [];
    const color: Color[] = [];

    allColors.forEach(c => {
        // Simple heuristic: low saturation is neutral
        if (c.hsl.s < 15 || c.hsl.l > 95 || c.hsl.l < 5) {
            neutral.push(c);
        } else {
            color.push(c);
        }
    });

    // Further split color into primary (most frequent) and secondary
    const primary = color.slice(0, 3);
    const secondary = color.slice(3);

    return {
        primary,
        secondary,
        neutral,
        all: allColors
    };
}
