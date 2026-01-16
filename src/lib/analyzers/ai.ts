import { ClaudeInsights, DesignSystem, ScrapedData, LayoutInfo } from '@/types/analysis';
import Anthropic from '@anthropic-ai/sdk';

export async function generateInsights(data: ScrapedData, ds: DesignSystem, layout: LayoutInfo): Promise<ClaudeInsights> {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    // Fallback to mock if no key provided
    if (!apiKey) {
        console.warn('Missing ANTHROPIC_API_KEY, using mock data.');
        return generateMockInsights(data, ds, layout);
    }

    try {
        const anthropic = new Anthropic({
            apiKey: apiKey,
        });

        const prompt = `
You are an expert Senior Product Manager and System Architect.
Analyze the following website data and generate a comprehensive Product Requirements Document (PRD).

Website URL: ${data.url}
Title: ${data.metadata.title}
Description: ${data.metadata.description}

Key Subpages Found (Context for Scope):
${data.links.slice(0, 50).join('\n')}

All Crawled Subpage Content (Full Analysis):
${data.subpagesContent?.map((p, i) => `--- PAGE ${i + 1}/${data.subpagesContent?.length}: ${p.url} ---
TITLE: ${p.title}
CONTENT: ${p.text.slice(0, 5000)}...`).join('\n\n') || 'No subpage content available.'}

Visual Context:
- Primary Colors: ${ds.colors.primary.map(c => c.hex).join(', ')}
- Typography: ${ds.typography.headings.h1?.family} (Headings), ${ds.typography.body?.family} (Body)
- Layout: ${layout.gridColumns ? `${layout.gridColumns} col grid` : 'Fluid'}

Tech Stack Signals (Detected in Client):
${data.techStack?.join(', ') || 'None detected'}

Based on this, reverse-engineer the likely requirements and architecture.
Return strictly valid JSON matching this structure:
{
  "summary": "Brief strategic overview",
  "designPatterns": ["pattern1", "pattern2"],
  "strengths": ["strength1", "strength2"],
  "suggestions": ["suggestion1", "suggestion2"],
  "styleDescription": "Short style descriptor",
  "detailedPrd": {
    "technicalPrdOverview": "Detailed technical PRD overview describing the system architecture, core technologies, and high-level design choices.",
    "userStories": [
      { "role": "User", "goal": "action", "benefit": "outcome", "acceptanceCriteria": ["criterion1"] }
    ],
    "functionalRequirements": [
      { "id": "FR-01", "category": "Auth", "description": "requirement details", "priority": "Critical" }
    ],
    "dataModel": [
      { "name": "User", "description": "User entity", "fields": [{ "name": "id", "type": "UUID", "description": "PK" }] }
    ],
    "apiEndpoints": [
      { "method": "GET", "path": "/api/resource", "summary": "Fetch resources" }
    ]
  },
  "prdStructure": {
      "userStories": ["Simple story 1"],
      "functionalRequirements": ["Simple req 1"],
      "proposedStack": ["Tech 1", "Tech 2"]
  }
}
`;

        const msg = await anthropic.messages.create({
            model: "claude-sonnet-4-20250514",
            max_tokens: 4000,
            temperature: 0.2,
            system: "You are a pragmatic, experienced software architect. Output only JSON.",
            messages: [
                { role: "user", content: prompt }
            ]
        });

        const textContent = msg.content[0].type === 'text' ? msg.content[0].text : '';
        const jsonMatch = textContent.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]) as ClaudeInsights;
        }
        throw new Error("Failed to parse Claude JSON response");

    } catch (e: any) {
        console.error('AI Analysis Failed Detailed:', JSON.stringify(e, Object.getOwnPropertyNames(e), 2));
        return generateMockInsights(data, ds, layout);
    }
}

function generateMockInsights(data: ScrapedData, ds: DesignSystem, layout: LayoutInfo): ClaudeInsights {
    const primaryColor = ds.colors.primary[0]?.hex || '#000000';
    return {
        summary: `[MOCK] Strategic Analysis: The platform currently utilizes a ${layout.hasGrid ? 'structured grid' : 'flexible fluid'} layout system reinforced by a ${primaryColor} primary brand identity.`,
        designPatterns: ['Card-based information architecture', 'Semantic HTML structure'],
        strengths: ['High contrast ratios', 'Consistent typographic scale'],
        suggestions: ['Implement dark mode', 'Standardize border-radius'],
        styleDescription: `Corporate Professional`,
        detailedPrd: {
            technicalPrdOverview: "This is a MOCK Technical PRD Overview because the API key was missing or failed. Please add a valid ANTHROPIC_API_KEY to .env.local to generate real insights.",
            userStories: [],
            functionalRequirements: [],
            dataModel: [],
            apiEndpoints: []
        },
        prdStructure: {
            userStories: ["MOCK As a user, I want to see real AI insights."],
            functionalRequirements: ["System must have API key configured."],
            proposedStack: ["Next.js", "Tailwind"]
        }
    };
}
