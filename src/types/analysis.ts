// ============================================
// PÕHITÜÜBID
// ============================================

export interface Color {
    hex: string
    rgb: { r: number; g: number; b: number }
    hsl: { h: number; s: number; l: number }
    usage: 'background' | 'text' | 'border' | 'accent' | 'other'
    frequency: number
    elements: string[]
}

export interface FontStyle {
    family: string
    size: string
    weight: string | number
    lineHeight: string
    letterSpacing?: string
    usage: 'heading' | 'body' | 'ui' | 'accent'
}

export interface SpacingValue {
    value: number
    unit: 'px' | 'rem' | 'em'
    frequency: number
    context: 'margin' | 'padding' | 'gap'
}

export interface Breakpoint {
    name: string
    minWidth: number
    maxWidth?: number
}

export interface Section {
    tag: string
    className?: string
    depth: number
    children: number
}

export interface SEOIssue {
    type: 'error' | 'warning' | 'info'
    message: string
    element?: string
}

// ============================================
// KOMPOSIITTÜÜBID
// ============================================

export interface DesignSystem {
    colors: {
        primary: Color[]
        secondary: Color[]
        neutral: Color[]
        all: Color[]
    }
    typography: {
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
    }
    spacing: {
        scale: number[]
        baseUnit: number
        values: SpacingValue[]
    }
}

export interface LayoutInfo {
    containerWidth: number | null
    gridColumns: number | null
    breakpoints: Breakpoint[]
    sections: Section[]
    hasFlexbox: boolean
    hasGrid: boolean
}

export interface SEOInfo {
    score: number
    title: string | null
    description: string | null
    ogImage: string | null
    ogTags: Record<string, string>
    structuredData: any[]
    issues: SEOIssue[]
    headings: {
        h1: string[]
        h2: string[]
        h3: string[]
    }
    canonical: string | null
    robots: string | null
    altTags: {
        total: number
        missing: number
    }
}

export interface ClaudeInsights {
    summary: string
    designPatterns: string[]
    strengths: string[]
    suggestions: string[]
    styleDescription: string
    prdStructure?: {
        userStories: string[]
        functionalRequirements: string[]
        proposedStack: string[]
    }
    detailedPrd?: {
        technicalPrdOverview: string
        userStories: Array<{
            role: string
            goal: string
            benefit: string
            acceptanceCriteria: string[]
        }>
        functionalRequirements: Array<{
            id: string
            category: string
            description: string
            priority: 'Critical' | 'High' | 'Medium' | 'Low'
        }>
        dataModel: Array<{
            name: string
            description: string
            fields: Array<{ name: string, type: string, description?: string }>
        }>
        apiEndpoints: Array<{
            method: 'GET' | 'POST' | 'PUT' | 'DELETE'
            path: string
            summary: string
            request?: any
            response?: any
        }>
    }

}

// ============================================
// ANALÜÜSI TULEMUS
// ============================================

export interface AnalysisResult {
    id: string
    url: string
    analyzedAt: string
    status: 'pending' | 'processing' | 'completed' | 'failed'
    error?: string

    screenshot: {
        full: string | null
        thumbnail: string | null
    }

    designSystem: DesignSystem | null
    layout: LayoutInfo | null
    seo: SEOInfo | null
    insights: ClaudeInsights | null
    internalLinks: string[]

    exports: {
        cssVariables: string | null
        tailwindConfig: string | null
        figmaTokens: string | null
    }
    pagesAnalyzed?: Array<{
        url: string
        title: string
    }>
    techStack?: string[]
}

// ============================================
// API REQUEST/RESPONSE
// ============================================

export interface AnalysisRequest {
    url: string
    options?: {
        viewport?: { width: number; height: number }
        includeClaudeAnalysis?: boolean
        waitForSelector?: string
    }
}

export interface AnalysisResponse {
    id: string
    status: 'processing' | 'completed' | 'failed'
    message?: string
}

// ============================================
// SCRAPER
// ============================================

export interface ScrapedData {
    url: string
    html: string
    styles: ComputedStyleData[]
    screenshot: string | null
    metadata: {
        title: string | null
        description: string | null
        ogTags: Record<string, string>
        structuredData: any[]
        canonical: string | null
        robots: string | null
        altTags: {
            total: number
            missing: number
        }
    }
    fonts: {
        loaded: string[]
        external: string[]
        fontFaces: string[]
    }
    viewport: { width: number; height: number }
    links: string[]
    subpagesContent?: Array<{ url: string; text: string; title: string }>
    techStack?: string[]
    debug?: any
}

export interface ComputedStyleData {
    selector: string
    tag: string
    className: string
    styles: Record<string, string>
    rect: {
        x: number
        y: number
        width: number
        height: number
    }
}
