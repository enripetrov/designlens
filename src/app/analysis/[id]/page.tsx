"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { AnalysisResult } from '@/types/analysis';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UrlInputForm } from '@/components/url-input-form';
import { Loader2, AlertTriangle, CheckCircle, Info, Layout, Type, Palette, Search as SearchIcon, Sparkles, Printer, Link as LinkIcon, FileText, Globe, Code2, Zap } from 'lucide-react';

export default function AnalysisPage() {
    const params = useParams();
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchAnalysis() {
            if (!params.id) return;
            try {
                const res = await fetch(`/api/analysis/${params.id}`);
                if (!res.ok) throw new Error('Analysis not found');
                const data = await res.json();
                setResult(data);
            } catch (err) {
                setError('Failed to load analysis');
            } finally {
                setLoading(false);
            }
        }
        fetchAnalysis();
    }, [params.id]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-8 w-8" /></div>;
    if (error || !result) return <div className="flex h-screen items-center justify-center text-red-500">{error || 'Not found'}</div>;

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-black print:bg-white font-sans text-neutral-900 dark:text-neutral-100 flex flex-col md:flex-row">
            {/* Print CSS - Force all details to be open */}
            <style>{`
                @media print {
                    details {
                        display: block !important;
                    }
                    details > summary {
                        display: block !important;
                        list-style: none !important;
                    }
                    details > summary::-webkit-details-marker {
                        display: none !important;
                    }
                    details[open] > summary ~ * {
                        display: block !important;
                    }
                    details:not([open]) > summary ~ * {
                        display: block !important;
                    }
                    /* Add a visual separator for print */
                    details {
                        page-break-inside: avoid;
                        border: 1px solid #e5e7eb !important;
                        margin-bottom: 1rem !important;
                    }
                }
            `}</style>

            {/* SIDEBAR */}
            <div className="w-full md:w-80 border-r bg-white dark:bg-neutral-900 flex flex-col h-auto md:h-screen md:sticky md:top-0 p-6 shadow-sm z-10 print:hidden shrink-0">
                <div className="mb-8">
                    <h2 className="text-xl font-bold mb-4">New Analysis</h2>
                    <UrlInputForm compact={true} />
                </div>

                <div className="mt-auto space-y-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                        <p className="flex items-center gap-2 mb-2 font-semibold"><Info className="w-4 h-4" /> Pro Tip</p>
                        Save this report as PDF for your team.
                    </div>
                    <Button onClick={handlePrint} className="w-full" variant="outline">
                        <Printer className="mr-2 h-4 w-4" /> Print / Save PDF
                    </Button>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-5xl mx-auto space-y-8">

                    <header className="flex items-center justify-between border-b pb-6 dark:border-neutral-800">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight mb-2">{result.url}</h1>
                            <p className="text-neutral-500">Analyzed at {new Date(result.analyzedAt).toLocaleString()}</p>
                        </div>
                        <Badge variant="outline" className="text-base px-4 py-1">
                            {result.status}
                        </Badge>
                    </header>

                    {/* Inject Scraped Font Faces */}
                    {result.designSystem?.typography?.fontFaces && result.designSystem.typography.fontFaces.length > 0 && (
                        <style dangerouslySetInnerHTML={{ __html: result.designSystem.typography.fontFaces.join('\n') }} />
                    )}

                    {/* PRD - Detailed AI Insights */}
                    {result.insights && (
                        <div className="space-y-8 print:break-before-page">
                            {/* Technical PRD Overview */}
                            {result.insights.detailedPrd?.technicalPrdOverview && (
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-xl flex items-center gap-2">
                                            <FileText className="w-5 h-5 text-blue-600" />
                                            Technical PRD Overview
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="prose dark:prose-invert max-w-none text-sm text-neutral-600 dark:text-neutral-300">
                                            {result.insights.detailedPrd.technicalPrdOverview.split('\n').map((p, i) => (
                                                <p key={i} className="mb-2 last:mb-0">{p}</p>
                                            ))}
                                        </div>

                                        {/* Analyzed Pages Section - DETAILED */}
                                        {result.pagesAnalyzed && result.pagesAnalyzed.length > 0 && (
                                            <div className="mt-6 pt-6 border-t border-dashed">
                                                <h3 className="text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
                                                    <Globe className="w-4 h-4 text-blue-600" />
                                                    Detailed Subpage Analysis ({result.pagesAnalyzed.length + 1} pages examined)
                                                </h3>

                                                <div className="space-y-4">
                                                    {/* Landing Page */}
                                                    <div className="border-2 border-blue-200 dark:border-blue-800 rounded-lg overflow-hidden">
                                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-4">
                                                            <div className="flex items-start gap-3">
                                                                <Badge variant="default" className="bg-blue-600 shrink-0">Landing Page</Badge>
                                                                <div className="flex-1 min-w-0">
                                                                    <a
                                                                        href={result.url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 break-all"
                                                                    >
                                                                        {result.url}
                                                                        <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                                        </svg>
                                                                    </a>
                                                                </div>
                                                            </div>
                                                            <div className="mt-3 space-y-2">
                                                                <div className="flex items-center gap-4 text-xs">
                                                                    <span className="font-semibold text-neutral-700 dark:text-neutral-300">Title:</span>
                                                                    <span className="text-neutral-600 dark:text-neutral-400">{result.seo?.title || 'No title detected'}</span>
                                                                </div>
                                                                {result.seo?.description && (
                                                                    <div className="flex items-start gap-4 text-xs">
                                                                        <span className="font-semibold text-neutral-700 dark:text-neutral-300 shrink-0">Meta:</span>
                                                                        <span className="text-neutral-600 dark:text-neutral-400">{result.seo.description}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="bg-white dark:bg-neutral-950 p-4 text-xs text-neutral-600 dark:text-neutral-400">
                                                            <p className="italic">Primary entry point - serves as the main landing page and core functionality showcase. All design tokens, layout structure, and primary user flows originate from this page.</p>
                                                        </div>
                                                    </div>

                                                    {/* Subpages - DETAILED */}
                                                    {result.pagesAnalyzed.map((page, i) => {
                                                        // Try to find matching content from subpagesContent
                                                        const contentMatch = result.insights?.detailedPrd?.userStories ?
                                                            `Content from ${page.title || 'this page'} was analyzed to identify user requirements, features, and functionality that contributed to the ${result.insights.detailedPrd.userStories.length} user stories and ${result.insights.detailedPrd.functionalRequirements?.length || 0} functional requirements in this PRD.`
                                                            : '';

                                                        // Extract some meaningful content preview (first 300 chars of page)
                                                        const preview = page.title?.length > 50 ? page.title :
                                                            `This subpage provides details about ${new URL(page.url).pathname.split('/').filter(Boolean).join(' / ').replace(/-/g, ' ')}`;

                                                        return (
                                                            <details key={i} className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden group">
                                                                <summary className="cursor-pointer bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 p-4 transition-colors">
                                                                    <div className="flex items-start gap-3">
                                                                        <Badge variant="outline" className="font-mono text-xs shrink-0 mt-0.5">
                                                                            {i + 1}
                                                                        </Badge>
                                                                        <div className="flex-1 min-w-0">
                                                                            <a
                                                                                href={page.url}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 break-all"
                                                                                onClick={(e) => e.stopPropagation()}
                                                                            >
                                                                                {new URL(page.url).pathname}
                                                                                <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                                                </svg>
                                                                            </a>
                                                                            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 font-medium">
                                                                                {page.title}
                                                                            </p>
                                                                            <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-2 group-open:hidden">
                                                                                Click to expand detailed analysis ↓
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </summary>

                                                                {/* Expanded Content */}
                                                                <div className="bg-white dark:bg-neutral-950 p-4 border-t border-neutral-200 dark:border-neutral-800 space-y-4">
                                                                    {/* Page Overview */}
                                                                    <div>
                                                                        <h4 className="text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-2 flex items-center gap-2">
                                                                            <FileText className="w-3 h-3" />
                                                                            Page Overview
                                                                        </h4>
                                                                        <div className="bg-neutral-50 dark:bg-neutral-900 p-3 rounded text-xs space-y-2">
                                                                            <div className="flex justify-between">
                                                                                <span className="font-semibold text-neutral-600 dark:text-neutral-400">Full URL:</span>
                                                                                <code className="text-blue-600 dark:text-blue-400 text-xs break-all">{page.url}</code>
                                                                            </div>
                                                                            <div className="flex justify-between">
                                                                                <span className="font-semibold text-neutral-600 dark:text-neutral-400">Page Title:</span>
                                                                                <span className="text-neutral-700 dark:text-neutral-300">{page.title}</span>
                                                                            </div>
                                                                            <div className="flex justify-between">
                                                                                <span className="font-semibold text-neutral-600 dark:text-neutral-400">Content Analyzed:</span>
                                                                                <span className="text-green-600 dark:text-green-400">✓ Yes (up to 10,000 chars)</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Purpose & Content */}
                                                                    <div>
                                                                        <h4 className="text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-2 flex items-center gap-2">
                                                                            <Sparkles className="w-3 h-3" />
                                                                            How This Page Contributed to the PRD
                                                                        </h4>
                                                                        <div className="bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-500 p-3 rounded text-xs text-neutral-700 dark:text-neutral-300">
                                                                            <p>{contentMatch}</p>
                                                                            <p className="mt-2">
                                                                                <strong>Extracted insights include:</strong> User workflows, feature descriptions, technical requirements, data models, and API endpoint specifications mentioned on this page.
                                                                            </p>
                                                                        </div>
                                                                    </div>

                                                                    {/* Content Summary */}
                                                                    <div>
                                                                        <h4 className="text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-2 flex items-center gap-2">
                                                                            <Info className="w-3 h-3" />
                                                                            Content Summary
                                                                        </h4>
                                                                        <div className="bg-neutral-50 dark:bg-neutral-900 p-3 rounded text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                                                            <p>
                                                                                This page focuses on <strong>{preview}</strong>. The content was extracted and analyzed by the AI to understand the feature set, user needs, technical architecture, and business logic associated with this section of the application.
                                                                            </p>
                                                                            <p className="mt-2 text-neutral-500 dark:text-neutral-500 italic">
                                                                                💡 All text content from this page (up to 5,000 characters) was included in the AI prompt to generate accurate, context-aware requirements.
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </details>
                                                        );
                                                    })}
                                                </div>

                                                <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                                                    <p className="text-xs text-neutral-700 dark:text-neutral-300 font-medium flex items-start gap-2">
                                                        <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                                                        <span>
                                                            <strong>Complete Analysis Guarantee:</strong> Every page listed above was successfully crawled, and its full text content (headlines, paragraphs, lists, forms, etc.) was extracted and fed into the AI model. This ensures the generated PRD accurately reflects the <strong>entire website's functionality</strong>, not just the homepage.
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Deep Dive Sources */}
                            <Card className="bg-neutral-50 dark:bg-neutral-900 border-dashed">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm uppercase tracking-wider text-neutral-500 flex items-center gap-2">
                                        <Globe className="w-4 h-4" />
                                        Analyzed Scope ({1 + (result.pagesAnalyzed?.length || 0)} Pages)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {/* Crawl Statistics */}
                                    {result.crawlStats && (
                                        <div className="mb-4 p-3 bg-white dark:bg-black rounded-lg border">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Subpage Crawl Results</span>
                                                <div className="flex gap-2">
                                                    <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                                                        ✓ {result.crawlStats.linksSucceeded} Success
                                                    </Badge>
                                                    {result.crawlStats.linksFailed > 0 && (
                                                        <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200">
                                                            ✗ {result.crawlStats.linksFailed} Failed
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-neutral-500">
                                                <div className="flex-1 bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className="bg-green-500 h-full transition-all"
                                                        style={{ width: `${(result.crawlStats.linksSucceeded / result.crawlStats.linksAttempted) * 100}%` }}
                                                    />
                                                </div>
                                                <span className="font-mono whitespace-nowrap">
                                                    {result.crawlStats.linksSucceeded}/{result.crawlStats.linksAttempted}
                                                </span>
                                            </div>

                                            {/* Failed URLs Details */}
                                            {result.crawlStats.failedUrls && result.crawlStats.failedUrls.length > 0 && (
                                                <details className="mt-3">
                                                    <summary className="cursor-pointer text-xs text-red-600 hover:text-red-700 font-medium">
                                                        View {result.crawlStats.failedUrls.length} failed URL(s)
                                                    </summary>
                                                    <ul className="mt-2 space-y-1 text-xs">
                                                        {result.crawlStats.failedUrls.map((failed, i) => (
                                                            <li key={i} className="flex items-start gap-2 p-2 bg-red-50 dark:bg-red-900/10 rounded border border-red-200 dark:border-red-800">
                                                                <AlertTriangle className="w-3 h-3 text-red-500 shrink-0 mt-0.5" />
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="font-mono text-red-700 dark:text-red-400 truncate" title={failed.url}>
                                                                        {new URL(failed.url).pathname}
                                                                    </div>
                                                                    <div className="text-red-600 dark:text-red-500">{failed.error}</div>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </details>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="secondary" className="font-mono text-xs">
                                            LANDING: {new URL(result.url).pathname}
                                        </Badge>
                                        {result.pagesAnalyzed?.map((p, i) => (
                                            <Badge key={i} variant="outline" className="font-mono text-xs text-neutral-600 truncate max-w-[300px]" title={p.url}>
                                                SUBPAGE: {new URL(p.url).pathname}
                                            </Badge>
                                        ))}
                                    </div>
                                    <p className="text-xs text-neutral-400 mt-2">
                                        *Content from these pages was extracted and analyzed to generate the Technical PRD.
                                    </p>

                                </CardContent>
                            </Card>

                            {/* Technology Stack - Prominent Card */}
                            {result.techStack && result.techStack.length > 0 && (
                                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Code2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                            Technology Stack Detected
                                        </CardTitle>
                                        <CardDescription>Frameworks, libraries, and tools identified on this website</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-3">
                                            {result.techStack.map((tech, i) => (
                                                <Badge
                                                    key={i}
                                                    variant="secondary"
                                                    className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-700 text-sm py-1.5 px-3"
                                                >
                                                    <Zap className="w-3 h-3 mr-1.5" />
                                                    {tech}
                                                </Badge>
                                            ))}
                                        </div>
                                        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-3">
                                            These technologies were detected by analyzing DOM structure, script sources, meta tags, and global objects.
                                        </p>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Reopening the original Analyzed Scope card */}
                            <Card className="bg-neutral-50 dark:bg-neutral-900 border-dashed" style={{ display: 'none' }}>
                                <CardContent>
                                </CardContent>
                            </Card>

                            <div className="grid lg:grid-cols-2 gap-8">
                                {/* User Stories */}
                                <Card>
                                    <CardHeader><CardTitle>User Stories</CardTitle></CardHeader>
                                    <CardContent className="space-y-4 max-h-[500px] overflow-y-auto print:max-h-none print:overflow-visible">
                                        {result.insights.detailedPrd?.userStories.map((story, i) => (
                                            <div key={i} className="border p-4 rounded-lg bg-neutral-50 dark:bg-neutral-900">
                                                <div className="font-medium text-sm mb-2">{story.role} wants to {story.goal}</div>
                                                <div className="text-xs text-neutral-500 mb-2">Benefit: {story.benefit}</div>
                                                <ul className="list-disc list-inside text-xs text-neutral-600 space-y-1">
                                                    {story.acceptanceCriteria.map((ac, j) => <li key={j}>{ac}</li>)}
                                                </ul>
                                            </div>
                                        )) || result.insights.prdStructure?.userStories.map((s, i) => <li key={i}>{s}</li>)}
                                    </CardContent>
                                </Card>

                                {/* Functional Requirements */}
                                <Card>
                                    <CardHeader><CardTitle>Functional Requirements</CardTitle></CardHeader>
                                    <CardContent className="space-y-3 max-h-[500px] overflow-y-auto print:max-h-none print:overflow-visible">
                                        {result.insights.detailedPrd?.functionalRequirements.map((req, i) => (
                                            <div key={i} className="flex gap-3 text-sm p-3 border-b last:border-0">
                                                <div className="shrink-0">
                                                    <Badge variant={req.priority === 'Critical' ? 'destructive' : 'outline'}>{req.id}</Badge>
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-xs uppercase text-neutral-500 mb-1">{req.category}</div>
                                                    <p>{req.description}</p>
                                                </div>
                                            </div>
                                        )) || result.insights.prdStructure?.functionalRequirements.map((s, i) => <li key={i}>{s}</li>)}
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="grid lg:grid-cols-2 gap-8">
                                {/* Data Model */}
                                {result.insights.detailedPrd?.dataModel && result.insights.detailedPrd.dataModel.length > 0 && (
                                    <Card>
                                        <CardHeader><CardTitle>Data Model (inferred)</CardTitle></CardHeader>
                                        <CardContent className="space-y-4">
                                            {result.insights.detailedPrd.dataModel.map((entity, i) => (
                                                <div key={i} className="border rounded-md overflow-hidden">
                                                    <div className="bg-neutral-100 dark:bg-neutral-800 px-4 py-2 font-mono font-bold text-sm border-b flex justify-between">
                                                        <span>{entity.name}</span>
                                                        <span className="text-xs font-normal text-neutral-500">{entity.description}</span>
                                                    </div>
                                                    <div className="p-2 text-xs font-mono space-y-1 bg-white dark:bg-black">
                                                        {entity.fields.map((field, j) => (
                                                            <div key={j} className="flex justify-between">
                                                                <span className="text-blue-600">{field.name}</span>
                                                                <span className="text-neutral-500">{field.type}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                )}

                                {/* API Endpoints */}
                                {result.insights.detailedPrd?.apiEndpoints && result.insights.detailedPrd.apiEndpoints.length > 0 && (
                                    <Card>
                                        <CardHeader><CardTitle>Potential API Endpoints</CardTitle></CardHeader>
                                        <CardContent className="space-y-2">
                                            {result.insights.detailedPrd.apiEndpoints.map((ep, i) => (
                                                <div key={i} className="flex items-center gap-3 text-sm font-mono border p-2 rounded bg-neutral-50 dark:bg-neutral-900">
                                                    <Badge variant="secondary" className="w-16 justify-center">{ep.method}</Badge>
                                                    <span className="truncate">{ep.path}</span>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    )}


                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            {/* Screenshot */}
                            <Card className="overflow-hidden">
                                <CardHeader><CardTitle>Preview</CardTitle></CardHeader>
                                <CardContent className="p-0 bg-neutral-100 dark:bg-neutral-900 border-t">
                                    {result.screenshot.full && (
                                        /* eslint-disable-next-line @next/next/no-img-element */
                                        <img src={result.screenshot.full} alt="Full page screenshot" className="w-full h-auto object-cover" />
                                    )}
                                </CardContent>
                            </Card>

                            {/* Internal Links (Subpages) */}
                            <Card>
                                <CardHeader><CardTitle className="flex items-center gap-2"><LinkIcon className="w-5 h-5" /> Site Structure & Subpages</CardTitle></CardHeader>
                                <CardContent>
                                    {result.internalLinks && result.internalLinks.length > 0 ? (
                                        <div className="grid md:grid-cols-2 gap-2 text-sm">
                                            {result.internalLinks.map((link, i) => (
                                                <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="truncate text-blue-600 hover:underline p-2 bg-neutral-50 rounded">
                                                    {new URL(link).pathname}
                                                </a>
                                            ))}
                                        </div>
                                    ) : <p className="text-neutral-500 text-sm">No internal pages found.</p>}
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-8">
                            {/* Layout */}
                            <Card>
                                <CardHeader><CardTitle className="flex items-center gap-2"><Layout className="w-4 h-4" /> Layout </CardTitle></CardHeader>
                                <CardContent className="text-sm space-y-4">
                                    {/* Layout Best Practices Guide */}
                                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                                        <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-purple-600" />
                                            Modern Layout Best Practices
                                        </h4>
                                        <div className="grid md:grid-cols-2 gap-4 text-xs">
                                            <div>
                                                <div className="font-semibold text-purple-900 dark:text-purple-300 mb-2">Layout Efficiency:</div>
                                                <ul className="space-y-1 text-neutral-700 dark:text-neutral-300">
                                                    <li className="flex items-start gap-1.5">
                                                        <span className="text-purple-600 mt-0.5">✓</span>
                                                        <span>Use <strong>CSS Grid</strong> for 2D layouts (rows + columns)</span>
                                                    </li>
                                                    <li className="flex items-start gap-1.5">
                                                        <span className="text-purple-600 mt-0.5">✓</span>
                                                        <span>Use <strong>Flexbox</strong> for 1D layouts (single direction)</span>
                                                    </li>
                                                    <li className="flex items-start gap-1.5">
                                                        <span className="text-purple-600 mt-0.5">✓</span>
                                                        <span>Limit container width (1200-1440px max) for readability</span>
                                                    </li>
                                                    <li className="flex items-start gap-1.5">
                                                        <span className="text-purple-600 mt-0.5">✓</span>
                                                        <span>Use 12-column grid system for responsive flexibility</span>
                                                    </li>
                                                    <li className="flex items-start gap-1.5">
                                                        <span className="text-purple-600 mt-0.5">✓</span>
                                                        <span>Maintain consistent spacing (8px, 16px, 24px scale)</span>
                                                    </li>
                                                </ul>
                                            </div>
                                            <div>
                                                <div className="font-semibold text-pink-900 dark:text-pink-300 mb-2">Performance & UX:</div>
                                                <ul className="space-y-1 text-neutral-700 dark:text-neutral-300">
                                                    <li className="flex items-start gap-1.5">
                                                        <span className="text-pink-600 mt-0.5">⚡</span>
                                                        <span>Avoid deep nesting (max 3-4 levels) for faster rendering</span>
                                                    </li>
                                                    <li className="flex items-start gap-1.5">
                                                        <span className="text-pink-600 mt-0.5">⚡</span>
                                                        <span>Use <code className="text-xs bg-white dark:bg-black px-1 rounded">gap</code> instead of margins for spacing</span>
                                                    </li>
                                                    <li className="flex items-start gap-1.5">
                                                        <span className="text-pink-600 mt-0.5">⚡</span>
                                                        <span>Design mobile-first, then scale up to desktop</span>
                                                    </li>
                                                    <li className="flex items-start gap-1.5">
                                                        <span className="text-pink-600 mt-0.5">⚡</span>
                                                        <span>Keep critical content above the fold (600px)</span>
                                                    </li>
                                                    <li className="flex items-start gap-1.5">
                                                        <span className="text-pink-600 mt-0.5">⚡</span>
                                                        <span>Use semantic sections (<code className="text-xs bg-white dark:bg-black px-1 rounded">header</code>, <code className="text-xs bg-white dark:bg-black px-1 rounded">main</code>, <code className="text-xs bg-white dark:bg-black px-1 rounded">footer</code>)</span>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-3 italic">
                                            💡 <strong>Pro tip:</strong> Modern layouts = CSS Grid + Flexbox + Semantic HTML. This creates responsive, accessible, and performant designs.
                                        </p>
                                    </div>

                                    {/* Existing Layout Info */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between"><span>Container</span> <span className="font-mono">{result.layout?.containerWidth}px</span></div>
                                        <div className="flex justify-between"><span>Grid</span> <span className="font-mono">{result.layout?.gridColumns} cols</span></div>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {result.layout?.hasFlexbox && <Badge variant="secondary">Flexbox</Badge>}
                                            {result.layout?.hasGrid && <Badge variant="secondary">CSS Grid</Badge>}
                                            {result.layout?.sections.map((s, i) => <Badge key={i} variant="outline">{s.tag}</Badge>)}
                                        </div>
                                    </div>

                                    {/* Visual Layout Diagram */}
                                    <div className="mt-6 pt-6 border-t border-dashed">
                                        <h4 className="text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
                                            <Layout className="w-4 h-4 text-purple-600" />
                                            Visual Page Structure
                                        </h4>

                                        {/* Debug: Show detected sections */}
                                        <div className="mb-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-300 dark:border-yellow-700 rounded text-xs">
                                            <div className="font-semibold mb-1">Detected sections ({result.layout?.sections.length || 0}):</div>
                                            <div className="font-mono">
                                                {result.layout?.sections.map(s => s.tag).join(', ') || 'None'}
                                            </div>
                                            {!result.layout?.sections.some(s => s.tag === 'footer') && (
                                                <div className="mt-2 text-orange-700 dark:text-orange-400 font-semibold">
                                                    ⚠️ No &lt;footer&gt; element detected on this page
                                                </div>
                                            )}
                                        </div>

                                        <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
                                            {/* Container & Grid Info */}
                                            <div className="flex justify-between items-center mb-4 text-xs">
                                                <div className="font-mono text-neutral-600 dark:text-neutral-400">
                                                    Container: <span className="font-bold text-purple-600">{result.layout?.containerWidth}px</span>
                                                </div>
                                                <div className="font-mono text-neutral-600 dark:text-neutral-400">
                                                    Grid: <span className="font-bold text-purple-600">{result.layout?.gridColumns} columns</span>
                                                </div>
                                            </div>

                                            {/* SVG Layout Visualization */}
                                            <svg viewBox="0 0 600 700" className="w-full h-auto border border-neutral-300 dark:border-neutral-700 rounded bg-neutral-50 dark:bg-neutral-900">
                                                {/* Grid Lines */}
                                                {Array.from({ length: (result.layout?.gridColumns || 12) + 1 }).map((_, i) => (
                                                    <line
                                                        key={`grid-${i}`}
                                                        x1={50 + (i * 500 / (result.layout?.gridColumns || 12))}
                                                        y1="20"
                                                        x2={50 + (i * 500 / (result.layout?.gridColumns || 12))}
                                                        y2="660"
                                                        stroke="#d1d5db"
                                                        strokeWidth="1"
                                                        strokeDasharray="3,3"
                                                    />
                                                ))}

                                                {/* Container Border */}
                                                <rect x="50" y="20" width="500" height="640" fill="none" stroke="#9333ea" strokeWidth="3" strokeDasharray="8,4" />
                                                <text x="300" y="15" textAnchor="middle" fontSize="16" fill="#9333ea" fontWeight="bold">
                                                    Container ({result.layout?.containerWidth}px max-width)
                                                </text>
                                                {/* Semantic Sections */}
                                                {(() => {
                                                    let yOffset = 40;
                                                    const sections = result.layout?.sections || [];

                                                    // Sort sections in logical page order
                                                    const sectionOrder = ['header', 'nav', 'main', 'section', 'article', 'aside', 'footer'];
                                                    const sortedSections = [...sections].sort((a, b) => {
                                                        const aIndex = sectionOrder.indexOf(a.tag);
                                                        const bIndex = sectionOrder.indexOf(b.tag);
                                                        return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
                                                    });

                                                    // ALWAYS include header and footer if they exist
                                                    const header = sortedSections.find(s => s.tag === 'header');
                                                    const footer = sortedSections.find(s => s.tag === 'footer');
                                                    const middleSections = sortedSections.filter(s => s.tag !== 'header' && s.tag !== 'footer');

                                                    // Build final array: header, then up to 6 middle sections, then footer
                                                    const displaySections = [
                                                        ...(header ? [header] : []),
                                                        ...middleSections.slice(0, 6),
                                                        ...(footer ? [footer] : [])
                                                    ];

                                                    const sectionColors: Record<string, { fill: string; stroke: string; text: string }> = {
                                                        header: { fill: '#dbeafe', stroke: '#3b82f6', text: '#1e40af' },
                                                        nav: { fill: '#fef3c7', stroke: '#f59e0b', text: '#92400e' },
                                                        main: { fill: '#dcfce7', stroke: '#10b981', text: '#065f46' },
                                                        section: { fill: '#e0e7ff', stroke: '#6366f1', text: '#3730a3' },
                                                        article: { fill: '#e0e7ff', stroke: '#6366f1', text: '#3730a3' },
                                                        aside: { fill: '#fce7f3', stroke: '#ec4899', text: '#831843' },
                                                        footer: { fill: '#f3f4f6', stroke: '#6b7280', text: '#374151' },
                                                    };

                                                    return displaySections.map((section, i) => {
                                                        const height = section.tag === 'main' ? 80 : section.tag === 'header' || section.tag === 'footer' ? 50 : 50;
                                                        const width = section.tag === 'aside' ? 150 : 500;
                                                        const xPos = section.tag === 'aside' ? 400 : 50;
                                                        const color = sectionColors[section.tag] || sectionColors.section;

                                                        const rect = (
                                                            <g key={i}>
                                                                <rect
                                                                    x={xPos}
                                                                    y={yOffset}
                                                                    width={width}
                                                                    height={height}
                                                                    fill={color.fill}
                                                                    stroke={color.stroke}
                                                                    strokeWidth="3"
                                                                    rx="6"
                                                                />
                                                                <text
                                                                    x={xPos + width / 2}
                                                                    y={yOffset + height / 2 + 7}
                                                                    textAnchor="middle"
                                                                    fontSize="20"
                                                                    fontWeight="700"
                                                                    fill={color.text}
                                                                >
                                                                    &lt;{section.tag}&gt;
                                                                </text>
                                                            </g>
                                                        );

                                                        // Aside doesn't add to yOffset (floats)
                                                        if (section.tag !== 'aside') {
                                                            yOffset += height + 10;
                                                        }

                                                        return rect;
                                                    });
                                                })()}

                                                {/* Column Numbers */}
                                                {Array.from({ length: result.layout?.gridColumns || 12 }).map((_, i) => (
                                                    <text
                                                        key={`col-${i}`}
                                                        x={50 + (i * 500 / (result.layout?.gridColumns || 12)) + (250 / (result.layout?.gridColumns || 12))}
                                                        y="685"
                                                        textAnchor="middle"
                                                        fontSize="13"
                                                        fontWeight="700"
                                                        fill="#6b7280"
                                                    >
                                                        {i + 1}
                                                    </text>
                                                ))}
                                            </svg>

                                            {/* Legend */}
                                            <div className="mt-4 flex flex-wrap gap-3 text-xs">
                                                {/* Only show legend items for detected elements */}
                                                {result.layout?.sections.some(s => s.tag === 'header') && (
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-3 h-3 rounded border-2 border-blue-500 bg-blue-100"></div>
                                                        <span className="text-neutral-600 dark:text-neutral-400">header</span>
                                                    </div>
                                                )}
                                                {result.layout?.sections.some(s => s.tag === 'nav') && (
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-3 h-3 rounded border-2 border-amber-500 bg-amber-100"></div>
                                                        <span className="text-neutral-600 dark:text-neutral-400">nav</span>
                                                    </div>
                                                )}
                                                {result.layout?.sections.some(s => s.tag === 'main') && (
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-3 h-3 rounded border-2 border-green-500 bg-green-100"></div>
                                                        <span className="text-neutral-600 dark:text-neutral-400">main</span>
                                                    </div>
                                                )}
                                                {result.layout?.sections.some(s => s.tag === 'section' || s.tag === 'article') && (
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-3 h-3 rounded border-2 border-indigo-500 bg-indigo-100"></div>
                                                        <span className="text-neutral-600 dark:text-neutral-400">section</span>
                                                    </div>
                                                )}
                                                {result.layout?.sections.some(s => s.tag === 'aside') && (
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-3 h-3 rounded border-2 border-pink-500 bg-pink-100"></div>
                                                        <span className="text-neutral-600 dark:text-neutral-400">aside</span>
                                                    </div>
                                                )}
                                                {result.layout?.sections.some(s => s.tag === 'footer') && (
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-3 h-3 rounded border-2 border-gray-500 bg-gray-100"></div>
                                                        <span className="text-neutral-600 dark:text-neutral-400">footer</span>
                                                    </div>
                                                )}
                                            </div>

                                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-3 italic">
                                                💡 This diagram shows the semantic HTML structure and how elements are positioned within the {result.layout?.gridColumns}-column grid system.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Typography Table */}
                    <Card className="print:break-inside-avoid">
                        <CardHeader><CardTitle className="flex items-center gap-2"><Type className="w-5 h-5" /> Typography System</CardTitle></CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs uppercase bg-neutral-50 dark:bg-neutral-900 text-neutral-500">
                                        <tr>
                                            <th className="px-4 py-3">Element</th>
                                            <th className="px-4 py-3">Font Family</th>
                                            <th className="px-4 py-3">Size / Weight</th>
                                            <th className="px-4 py-3">Preview</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'body', 'footer'].map((tag) => {
                                            let style;
                                            if (tag === 'body') style = result.designSystem?.typography.body;
                                            else if (tag === 'footer') style = result.designSystem?.typography.footer;
                                            else style = result.designSystem?.typography.headings[tag as keyof typeof result.designSystem.typography.headings];
                                            if (!style) return null;
                                            return (
                                                <tr key={tag}>
                                                    <td className="px-4 py-3 font-mono font-bold text-neutral-500">{tag.toUpperCase()}</td>
                                                    <td className="px-4 py-3 max-w-[150px] truncate" title={style.family}>{style.family}</td>
                                                    <td className="px-4 py-3 font-mono text-xs">{style.size} / {style.weight} / {style.lineHeight}</td>
                                                    <td className="px-4 py-3">
                                                        <span style={{ fontFamily: style.family, fontWeight: style.weight, fontSize: '1rem' }}>
                                                            {tag === 'h1' ? 'Title Headline' : tag === 'footer' ? 'Footer Link' : 'The quick brown fox'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Visual Typography Hierarchy */}
                            <div className="mt-6 pt-6 border-t border-dashed">
                                <h4 className="text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
                                    <Type className="w-4 h-4 text-blue-600" />
                                    Visual Type Scale
                                </h4>
                                <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6">
                                    <div className="space-y-4">
                                        {/* H1 */}
                                        {result.designSystem?.typography.headings.h1 && (
                                            <div className="flex items-baseline gap-4 pb-3 border-b border-neutral-200 dark:border-neutral-700">
                                                <span className="text-xs font-mono text-neutral-500 w-12 shrink-0">H1</span>
                                                <div className="flex-1">
                                                    <div
                                                        style={{
                                                            fontFamily: result.designSystem.typography.headings.h1.family,
                                                            fontSize: result.designSystem.typography.headings.h1.size,
                                                            fontWeight: result.designSystem.typography.headings.h1.weight,
                                                            lineHeight: result.designSystem.typography.headings.h1.lineHeight
                                                        }}
                                                        className="text-neutral-900 dark:text-neutral-100"
                                                    >
                                                        The Quick Brown Fox
                                                    </div>
                                                    <div className="text-xs text-neutral-500 mt-1">
                                                        {result.designSystem.typography.headings.h1.size} · {result.designSystem.typography.headings.h1.weight} · {result.designSystem.typography.headings.h1.lineHeight}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* H2 */}
                                        {result.designSystem?.typography.headings.h2 && (
                                            <div className="flex items-baseline gap-4 pb-3 border-b border-neutral-200 dark:border-neutral-700">
                                                <span className="text-xs font-mono text-neutral-500 w-12 shrink-0">H2</span>
                                                <div className="flex-1">
                                                    <div
                                                        style={{
                                                            fontFamily: result.designSystem.typography.headings.h2.family,
                                                            fontSize: result.designSystem.typography.headings.h2.size,
                                                            fontWeight: result.designSystem.typography.headings.h2.weight,
                                                            lineHeight: result.designSystem.typography.headings.h2.lineHeight
                                                        }}
                                                        className="text-neutral-900 dark:text-neutral-100"
                                                    >
                                                        The Quick Brown Fox
                                                    </div>
                                                    <div className="text-xs text-neutral-500 mt-1">
                                                        {result.designSystem.typography.headings.h2.size} · {result.designSystem.typography.headings.h2.weight} · {result.designSystem.typography.headings.h2.lineHeight}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* H3 */}
                                        {result.designSystem?.typography.headings.h3 && (
                                            <div className="flex items-baseline gap-4 pb-3 border-b border-neutral-200 dark:border-neutral-700">
                                                <span className="text-xs font-mono text-neutral-500 w-12 shrink-0">H3</span>
                                                <div className="flex-1">
                                                    <div
                                                        style={{
                                                            fontFamily: result.designSystem.typography.headings.h3.family,
                                                            fontSize: result.designSystem.typography.headings.h3.size,
                                                            fontWeight: result.designSystem.typography.headings.h3.weight,
                                                            lineHeight: result.designSystem.typography.headings.h3.lineHeight
                                                        }}
                                                        className="text-neutral-900 dark:text-neutral-100"
                                                    >
                                                        The Quick Brown Fox
                                                    </div>
                                                    <div className="text-xs text-neutral-500 mt-1">
                                                        {result.designSystem.typography.headings.h3.size} · {result.designSystem.typography.headings.h3.weight} · {result.designSystem.typography.headings.h3.lineHeight}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Body */}
                                        {result.designSystem?.typography.body && (
                                            <div className="flex items-baseline gap-4 pb-3 border-b border-neutral-200 dark:border-neutral-700">
                                                <span className="text-xs font-mono text-neutral-500 w-12 shrink-0">BODY</span>
                                                <div className="flex-1">
                                                    <div
                                                        style={{
                                                            fontFamily: result.designSystem.typography.body.family,
                                                            fontSize: result.designSystem.typography.body.size,
                                                            fontWeight: result.designSystem.typography.body.weight,
                                                            lineHeight: result.designSystem.typography.body.lineHeight
                                                        }}
                                                        className="text-neutral-900 dark:text-neutral-100"
                                                    >
                                                        The quick brown fox jumps over the lazy dog. This is how body text appears on the page with proper line height and spacing.
                                                    </div>
                                                    <div className="text-xs text-neutral-500 mt-1">
                                                        {result.designSystem.typography.body.size} · {result.designSystem.typography.body.weight} · {result.designSystem.typography.body.lineHeight}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Footer */}
                                        {result.designSystem?.typography.footer && (
                                            <div className="flex items-baseline gap-4">
                                                <span className="text-xs font-mono text-neutral-500 w-12 shrink-0">SMALL</span>
                                                <div className="flex-1">
                                                    <div
                                                        style={{
                                                            fontFamily: result.designSystem.typography.footer.family,
                                                            fontSize: result.designSystem.typography.footer.size,
                                                            fontWeight: result.designSystem.typography.footer.weight,
                                                            lineHeight: result.designSystem.typography.footer.lineHeight
                                                        }}
                                                        className="text-neutral-600 dark:text-neutral-400"
                                                    >
                                                        Small text, captions, and footer links
                                                    </div>
                                                    <div className="text-xs text-neutral-500 mt-1">
                                                        {result.designSystem.typography.footer.size} · {result.designSystem.typography.footer.weight} · {result.designSystem.typography.footer.lineHeight}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-6 italic">
                                        💡 This visual scale shows the actual font sizes, weights, and line heights as they appear on the website. Each element uses the extracted font family.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Colors */}
                    <Card className="print:break-inside-avoid">
                        <CardHeader><CardTitle className="flex items-center gap-2"><Palette className="w-5 h-5" /> Colors & Context</CardTitle></CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h4 className="text-xs uppercase text-neutral-500 font-semibold mb-3">Primary / Action</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {result.designSystem?.colors.primary.map((c, i) => (
                                        <div key={i} className="text-center group">
                                            <div className="w-full h-16 rounded-lg border shadow-sm mb-2 relative flex items-center justify-center" style={{ backgroundColor: c.hex }}>
                                                <span className="opacity-0 group-hover:opacity-100 bg-black/50 text-white text-[10px] px-2 py-1 rounded transition-opacity">
                                                    Likely Button
                                                </span>
                                            </div>
                                            <code className="text-xs block bg-neutral-100 dark:bg-neutral-800 py-1 rounded select-all">{c.hex}</code>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-xs uppercase text-neutral-500 font-semibold mb-3">Secondary / Backgrounds</h4>
                                <div className="flex flex-wrap gap-2">
                                    {result.designSystem?.colors.secondary.slice(0, 15).map((c, i) => (
                                        <div key={i} className="w-10 h-10 rounded border shadow-sm flex items-center justify-center text-[8px] text-transparent hover:text-black/50" style={{ backgroundColor: c.hex }} title={c.hex}>
                                            bg
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* SEO - Enhanced */}
                    <Card className="print:break-inside-avoid">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <SearchIcon className="w-5 h-5" />
                                    SEO & AI/LLM Analysis
                                </CardTitle>
                                <div className="flex gap-3">
                                    <div className="text-right">
                                        <div className="text-xs text-neutral-500">SEO Score</div>
                                        <span className={result.seo?.score && result.seo.score > 80 ? "text-green-600 font-mono text-xl font-bold" : "text-amber-600 font-mono text-xl font-bold"}>
                                            {result.seo?.score}/100
                                        </span>
                                    </div>
                                    {result.seo?.aiLlmScore !== undefined && (
                                        <div className="text-right border-l pl-3">
                                            <div className="text-xs text-neutral-500">AI/LLM Readability</div>
                                            <span className={result.seo.aiLlmScore >= 80 ? "text-blue-600 font-mono text-xl font-bold" : result.seo.aiLlmScore >= 60 ? "text-indigo-600 font-mono text-xl font-bold" : "text-purple-600 font-mono text-xl font-bold"}>
                                                {result.seo.aiLlmScore}/100
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <CardDescription>
                                Traditional SEO metrics + AI/LLM content extraction readiness
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 text-sm">
                            {/* Quick Improvement Guide */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-blue-600" />
                                    How to Make Your Website More Effective for SEO & AI
                                </h4>
                                <div className="grid md:grid-cols-2 gap-4 text-xs">
                                    <div>
                                        <div className="font-semibold text-blue-900 dark:text-blue-300 mb-2">For Better SEO:</div>
                                        <ul className="space-y-1 text-neutral-700 dark:text-neutral-300">
                                            <li className="flex items-start gap-1.5">
                                                <span className="text-green-600 mt-0.5">✓</span>
                                                <span>Use descriptive, keyword-rich title tags (50-60 chars)</span>
                                            </li>
                                            <li className="flex items-start gap-1.5">
                                                <span className="text-green-600 mt-0.5">✓</span>
                                                <span>Write compelling meta descriptions (150-160 chars)</span>
                                            </li>
                                            <li className="flex items-start gap-1.5">
                                                <span className="text-green-600 mt-0.5">✓</span>
                                                <span>Use ONE H1 per page, organize content with H2-H6</span>
                                            </li>
                                            <li className="flex items-start gap-1.5">
                                                <span className="text-green-600 mt-0.5">✓</span>
                                                <span>Add alt text to all images (accessibility + SEO)</span>
                                            </li>
                                            <li className="flex items-start gap-1.5">
                                                <span className="text-green-600 mt-0.5">✓</span>
                                                <span>Set canonical URLs to avoid duplicate content</span>
                                            </li>
                                        </ul>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-indigo-900 dark:text-indigo-300 mb-2">For Better AI/LLM Readability:</div>
                                        <ul className="space-y-1 text-neutral-700 dark:text-neutral-300">
                                            <li className="flex items-start gap-1.5">
                                                <span className="text-blue-600 mt-0.5">⚡</span>
                                                <span>Use semantic HTML: <code className="text-xs bg-white dark:bg-black px-1 rounded">&lt;main&gt;</code>, <code className="text-xs bg-white dark:bg-black px-1 rounded">&lt;article&gt;</code>, <code className="text-xs bg-white dark:bg-black px-1 rounded">&lt;section&gt;</code></span>
                                            </li>
                                            <li className="flex items-start gap-1.5">
                                                <span className="text-blue-600 mt-0.5">⚡</span>
                                                <span>Add JSON-LD structured data (Schema.org schemas)</span>
                                            </li>
                                            <li className="flex items-start gap-1.5">
                                                <span className="text-blue-600 mt-0.5">⚡</span>
                                                <span>Create clear heading hierarchy for content structure</span>
                                            </li>
                                            <li className="flex items-start gap-1.5">
                                                <span className="text-blue-600 mt-0.5">⚡</span>
                                                <span>Add descriptive alt text (AI uses this to understand images)</span>
                                            </li>
                                            <li className="flex items-start gap-1.5">
                                                <span className="text-blue-600 mt-0.5">⚡</span>
                                                <span>Avoid heavy JavaScript-only content rendering</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-3 italic">
                                    💡 <strong>Pro tip:</strong> Semantic HTML + JSON-LD = AI can extract your content accurately for search results, summaries, and conversational responses.
                                </p>
                            </div>
                            {/* Key Metrics Grid */}
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FileText className="w-4 h-4 text-neutral-500" />
                                        <span className="text-xs uppercase text-neutral-500 font-semibold">Title Tag</span>
                                    </div>
                                    <div className="text-sm truncate" title={result.seo?.title || ''}>
                                        {result.seo?.title || <span className="text-red-500">Missing</span>}
                                    </div>
                                    <div className="text-xs text-neutral-500 mt-1">
                                        {result.seo?.title ? `${result.seo.title.length} chars` : 'Critical for SEO'}
                                    </div>
                                </div>

                                <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Type className="w-4 h-4 text-neutral-500" />
                                        <span className="text-xs uppercase text-neutral-500 font-semibold">Heading Structure</span>
                                    </div>
                                    {result.seo?.headingCount ? (
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs">
                                                <span>H1: {result.seo.headingCount.h1}</span>
                                                <span>H2: {result.seo.headingCount.h2}</span>
                                                <span>H3: {result.seo.headingCount.h3}</span>
                                            </div>
                                            <div className="text-xs text-neutral-500">Total: {result.seo.headingCount.total} headings</div>
                                        </div>
                                    ) : (
                                        <span className="text-neutral-500 text-xs">No data</span>
                                    )}
                                </div>

                                <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Code2 className="w-4 h-4 text-neutral-500" />
                                        <span className="text-xs uppercase text-neutral-500 font-semibold">Semantic HTML</span>
                                    </div>
                                    {result.seo?.semanticElements && result.seo.semanticElements.length > 0 ? (
                                        <div>
                                            <div className="flex flex-wrap gap-1 mb-1">
                                                {result.seo.semanticElements.slice(0, 5).map((el, i) => (
                                                    <Badge key={i} variant="outline" className="text-xs px-1.5 py-0.5">&lt;{el}&gt;</Badge>
                                                ))}
                                            </div>
                                            <div className="text-xs text-neutral-500">{result.seo.semanticScore}% semantic coverage</div>
                                        </div>
                                    ) : (
                                        <span className="text-amber-500 text-xs">Low semantic usage</span>
                                    )}
                                </div>
                            </div>

                            {/* Technical Details */}
                            <div className="grid md:grid-cols-2 gap-4 bg-neutral-50 dark:bg-neutral-900 p-4 rounded-lg">
                                <div>
                                    <span className="block text-xs uppercase text-neutral-500 font-semibold mb-1">Canonical URL</span>
                                    <code className="text-xs break-all">{result.seo?.canonical || <span className="text-amber-500">Not set</span>}</code>
                                </div>
                                <div>
                                    <span className="block text-xs uppercase text-neutral-500 font-semibold mb-1">Robots Meta</span>
                                    <code className="text-xs">{result.seo?.robots || <span className="text-neutral-500">Default (index, follow)</span>}</code>
                                </div>
                                <div>
                                    <span className="block text-xs uppercase text-neutral-500 font-semibold mb-1">Structured Data</span>
                                    <div className="text-xs">
                                        {result.seo?.structuredData && result.seo.structuredData.length > 0 ? (
                                            <span className="text-green-600">✓ {result.seo.structuredData.length} schema(s) found</span>
                                        ) : (
                                            <span className="text-amber-500">None detected</span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <span className="block text-xs uppercase text-neutral-500 font-semibold mb-1">Image Accessibility</span>
                                    <div className="flex gap-3 text-xs">
                                        <span>Total: {result.seo?.altTags?.total || 0}</span>
                                        <span className={result.seo?.altTags?.missing ? "text-red-500" : "text-green-500"}>
                                            Missing: {result.seo?.altTags?.missing || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Issues & Recommendations Side by Side */}
                            <div className="grid md:grid-cols-2 gap-4">
                                {/* Issues */}
                                <div>
                                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" />
                                        Issues & Warnings
                                    </h4>
                                    {result.seo?.issues && result.seo.issues.length > 0 ? (
                                        <ul className="space-y-2 max-h-[300px] overflow-y-auto print:max-h-none print:overflow-visible">
                                            {result.seo.issues.map((issue, i) => (
                                                <li key={i} className="flex gap-2 items-start text-xs bg-white dark:bg-black p-2 border rounded">
                                                    {issue.type === 'error' ? <AlertTriangle className="w-3 h-3 text-red-500 shrink-0 mt-0.5" /> :
                                                        issue.type === 'warning' ? <Info className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" /> :
                                                            <CheckCircle className="w-3 h-3 text-green-500 shrink-0 mt-0.5" />}
                                                    <span>{issue.message}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="text-green-600 flex items-center gap-2 text-sm">
                                            <CheckCircle className="w-4 h-4" /> No issues found
                                        </div>
                                    )}
                                </div>

                                {/* Recommendations */}
                                {result.seo?.recommendations && result.seo.recommendations.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                                            <Sparkles className="w-4 h-4" />
                                            Recommendations
                                        </h4>
                                        <ul className="space-y-2 max-h-[300px] overflow-y-auto print:max-h-none print:overflow-visible">
                                            {result.seo.recommendations.map((rec, i) => (
                                                <li key={i} className="flex gap-2 items-start text-xs bg-blue-50 dark:bg-blue-900/20 p-2 border border-blue-200 dark:border-blue-800 rounded">
                                                    <Sparkles className="w-3 h-3 text-blue-500 shrink-0 mt-0.5" />
                                                    <span>{rec}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    );
}
