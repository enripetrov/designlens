
"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { AnalysisResult } from '@/types/analysis';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UrlInputForm } from '@/components/url-input-form';
import { Loader2, AlertTriangle, CheckCircle, Info, Layout, Type, Palette, Search as SearchIcon, Sparkles, Printer, Link as LinkIcon, FileText, Globe } from 'lucide-react';

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
        <div className="min-h-screen bg-neutral-50 dark:bg-black font-sans text-neutral-900 dark:text-neutral-100 flex flex-col md:flex-row">

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

                                    {result.techStack && result.techStack.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-dashed">
                                            <p className="text-xs font-semibold text-neutral-500 mb-2 uppercase tracking-wider">Detected Technology</p>
                                            <div className="flex flex-wrap gap-2">
                                                {result.techStack.map((tech, i) => (
                                                    <Badge key={i} variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
                                                        {tech}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <div className="grid lg:grid-cols-2 gap-8">
                                {/* User Stories */}
                                <Card>
                                    <CardHeader><CardTitle>User Stories</CardTitle></CardHeader>
                                    <CardContent className="space-y-4 max-h-[500px] overflow-y-auto">
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
                                    <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
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
                                <CardContent className="text-sm space-y-2">
                                    <div className="flex justify-between"><span>Container</span> <span className="font-mono">{result.layout?.containerWidth}px</span></div>
                                    <div className="flex justify-between"><span>Grid</span> <span className="font-mono">{result.layout?.gridColumns} cols</span></div>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {result.layout?.hasFlexbox && <Badge variant="secondary">Flexbox</Badge>}
                                        {result.layout?.hasGrid && <Badge variant="secondary">CSS Grid</Badge>}
                                        {result.layout?.sections.map((s, i) => <Badge key={i} variant="outline">{s.tag}</Badge>)}
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

                    {/* SEO */}
                    <Card className="print:break-inside-avoid">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center gap-2"><SearchIcon className="w-5 h-5" /> SEO Health</div>
                                <span className={result.seo?.score && result.seo.score > 80 ? "text-green-600 font-mono text-2xl" : "text-amber-600 font-mono text-2xl"}>{result.seo?.score}/100</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="grid grid-cols-2 gap-4 bg-neutral-50 dark:bg-neutral-900 p-4 rounded-lg">
                                <div>
                                    <span className="block text-xs uppercase text-neutral-500 font-semibold">Canonical</span>
                                    <code className="break-all">{result.seo?.canonical || 'Missing'}</code>
                                </div>
                                <div>
                                    <span className="block text-xs uppercase text-neutral-500 font-semibold">Robots</span>
                                    <code>{result.seo?.robots || 'Missing'}</code>
                                </div>
                                <div className="col-span-2">
                                    <span className="block text-xs uppercase text-neutral-500 font-semibold">Images</span>
                                    <div className="flex gap-4">
                                        <span>Total: {result.seo?.altTags?.total}</span>
                                        <span className={result.seo?.altTags?.missing ? "text-red-500" : "text-green-500"}>Missing Alt: {result.seo?.altTags?.missing}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2">Issues</h4>
                                {result.seo?.issues.length ? (
                                    <ul className="space-y-2">
                                        {result.seo.issues.map((issue, i) => (
                                            <li key={i} className="flex gap-2 items-start text-xs bg-white dark:bg-black p-2 border rounded">
                                                {issue.type === 'error' ? <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" /> :
                                                    issue.type === 'warning' ? <Info className="w-4 h-4 text-amber-500 shrink-0" /> :
                                                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />}
                                                <span>{issue.message}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : <div className="text-green-600 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Clean scan</div>}
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    );
}
