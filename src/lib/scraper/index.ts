
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { ScrapedData, ComputedStyleData } from '@/types/analysis';

const LOCAL_CHROME_EXECUTABLE = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'; // Default Windows path

export async function scrapeUrl(url: string): Promise<ScrapedData> {
    let browser: any;
    try {
        const isLocal = process.env.NODE_ENV === 'development';

        // Configure chromium for serverless
        if (!isLocal) {
            chromium.setGraphicsMode = false;
        }

        browser = await puppeteer.launch({
            args: isLocal ? puppeteer.defaultArgs() : chromium.args,
            defaultViewport: (chromium as any).defaultViewport,
            executablePath: isLocal
                ? LOCAL_CHROME_EXECUTABLE
                : await chromium.executablePath(),
            headless: isLocal ? false : (chromium as any).headless, // Visible locally for debugging
            ignoreHTTPSErrors: true,
        } as any);

        const page = await browser.newPage();
        await page.setViewport({ width: 1440, height: 900 });

        // Mask webdriver to avoid simple bot detection
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', {
                get: () => false,
            });
        });

        // Set User Agent to avoid bot detection
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9',
        });

        // Navigate to page - use networkidle2 for SPAs
        try {
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });
        } catch (e) {
            console.log('Page load timeout, proceeding with partial load...');
        }

        // Forward console logs to node terminal for debugging
        page.on('console', (msg: any) => console.log('BROWSER LOG:', msg.text()));

        // Hide Cookie Banners & Popups
        await page.evaluate(() => {
            const selectors = [
                '#onetrust-banner-sdk', '.onetrust-banner', '#qc-cmp2-container',
                '.cookie-banner', '[id*="cookie"]', '[class*="cookie"]',
                '.consent-banner', '[class*="consent"]'
            ];
            selectors.forEach(sel => {
                const els = document.querySelectorAll(sel);
                els.forEach((el: any) => el.style.display = 'none');
            });
        });

        // Wait for hydration/rendering
        try {
            // Wait for footer OR reasonable number of links
            await page.waitForFunction(() => {
                return !!document.querySelector('footer') || document.querySelectorAll('a').length > 10;
            }, { timeout: 15000 });
        } catch (e) {
            console.log('Timeout waiting for footer/links, continuing...');
        }

        // Auto-scroll to trigger lazy loading
        await page.evaluate(async () => {
            await new Promise<void>((resolve) => {
                let totalHeight = 0;
                const distance = 100;
                const timer = setInterval(() => {
                    const scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;

                    if (totalHeight >= scrollHeight || totalHeight > 10000) { // Limit scroll
                        clearInterval(timer);
                        resolve();
                    }
                }, 100);
            });
        });

        // 1. Extract Links & Tech Stack (Critical Lightweight Data)
        const baseData = await page.evaluate(() => {
            // Tech Stack Detection
            const techStack: string[] = [];

            // Check Scripts
            document.querySelectorAll('script').forEach(s => {
                if (s.src.includes('/_next/')) techStack.push('Next.js');
                if (s.src.includes('static/js/main')) techStack.push('React');
                if (s.src.includes('wp-content')) techStack.push('WordPress');
            });

            // Check Meta
            const generator = document.querySelector('meta[name="generator"]')?.getAttribute('content');
            if (generator?.includes('WordPress')) techStack.push('WordPress');
            if (generator?.includes('Gatsby')) techStack.push('Gatsby');

            // Check Global Objects (window)
            const win = window as any;
            if (win.__NEXT_DATA__) techStack.push('Next.js');
            if (win.__NUXT__) techStack.push('Nuxt.js');

            // Internal Links - Enhanced Filtering
            const getHostname = (url: string) => {
                try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; }
            };

            const normalizeUrl = (url: string) => {
                try {
                    const parsed = new URL(url);
                    // Remove hash and trailing slash for deduplication
                    return parsed.origin + parsed.pathname.replace(/\/$/, '') + parsed.search;
                } catch { return url; }
            };

            const currentUrl = window.location.href;
            const currentHost = getHostname(currentUrl);

            // Extract and filter links
            const allLinks = Array.from(document.querySelectorAll('a'))
                .map(a => a.href)
                .filter(href => {
                    if (!href || !href.startsWith('http')) return false;

                    const linkHost = getHostname(href);
                    // Must be same domain or subdomain
                    if (linkHost !== currentHost && !linkHost.endsWith('.' + currentHost)) return false;

                    // Normalize and check if same as current page
                    const normalized = normalizeUrl(href);
                    const normalizedCurrent = normalizeUrl(currentUrl);
                    if (normalized === normalizedCurrent) return false;

                    // Filter out common non-content pages
                    const path = new URL(href).pathname.toLowerCase();
                    const excludePatterns = [
                        '/login', '/signin', '/signup', '/register', '/logout',
                        '/search', '/cart', '/checkout', '/payment',
                        '/admin', '/dashboard', '/account', '/profile',
                        '/wp-admin', '/wp-login'
                    ];
                    if (excludePatterns.some(pattern => path.includes(pattern))) return false;

                    // Filter out file downloads
                    if (path.match(/\.(pdf|zip|jpg|jpeg|png|gif|svg|doc|docx|xls|xlsx)$/i)) return false;

                    return true;
                })
                .map(href => normalizeUrl(href));

            // Deduplicate
            const uniqueLinks = Array.from(new Set(allLinks));

            // Prioritize important pages (move them to front)
            const priorityPatterns = ['/about', '/features', '/pricing', '/contact', '/services', '/products'];
            const priorityLinks = uniqueLinks.filter(link =>
                priorityPatterns.some(p => new URL(link).pathname.toLowerCase().includes(p))
            );
            const otherLinks = uniqueLinks.filter(link =>
                !priorityPatterns.some(p => new URL(link).pathname.toLowerCase().includes(p))
            );

            // Combine: priority first, then others, limit to 50
            const internalLinks = [...priorityLinks, ...otherLinks].slice(0, 50);

            return { links: internalLinks, techStack: Array.from(new Set(techStack)) };
        });

        console.log(`[Scraper] Found ${baseData.links.length} internal links:`, baseData.links); // Server logging

        // 2. Extract Styles & Metadata (Heavy)
        const styleData = await page.evaluate(() => {
            // Helper to get computed styles
            const getStyles = (element: Element): Record<string, string> => {
                const computed = window.getComputedStyle(element);
                return {
                    color: computed.color,
                    backgroundColor: computed.backgroundColor,
                    fontFamily: computed.fontFamily,
                    fontSize: computed.fontSize,
                    fontWeight: computed.fontWeight,
                    lineHeight: computed.lineHeight,
                    padding: computed.padding,
                    margin: computed.margin,
                    borderRadius: computed.borderRadius,
                    border: computed.border,
                    display: computed.display,
                    position: computed.position,
                };
            };

            // Select key elements (headings, buttons, links, etc.)
            const elements: ComputedStyleData[] = [];

            // Explicitly grab one sample of each key tag for typography mapping
            const granularSelectors = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'code', 'pre', 'nav', 'footer', 'main'];
            granularSelectors.forEach(tag => {
                const el = document.querySelector(tag);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    elements.push({
                        selector: tag, // key selector
                        tag: tag,
                        className: el.className,
                        styles: getStyles(el),
                        rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
                    });
                }
            });

            // General bulk extraction for colors and layout analysis
            const bulkSelectors = ['a', 'button', '.btn', 'input', 'section', 'div'];
            bulkSelectors.forEach(selector => {
                document.querySelectorAll(selector).forEach(el => {
                    if (elements.length > 500) return; // Limit result size
                    const rect = el.getBoundingClientRect();
                    if (rect.width === 0 || rect.height === 0) return; // Skip invisible

                    // Avoid dupes if already captured in granular
                    if (granularSelectors.includes(el.tagName.toLowerCase())) return;

                    elements.push({
                        selector,
                        tag: el.tagName.toLowerCase(),
                        className: el.className,
                        styles: getStyles(el),
                        rect: {
                            x: rect.x,
                            y: rect.y,
                            width: rect.width,
                            height: rect.height
                        }
                    });
                });
            });

            // Metadata
            const metadata = {
                title: document.title,
                description: document.querySelector('meta[name="description"]')?.getAttribute('content') || null,
                ogTags: {} as Record<string, string>,
                structuredData: [] as any[],
                canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || null,
                robots: document.querySelector('meta[name="robots"]')?.getAttribute('content') || null,
                altTags: {
                    total: document.querySelectorAll('img').length,
                    missing: document.querySelectorAll('img:not([alt])').length
                }
            };

            document.querySelectorAll('meta[property^="og:"]').forEach(tag => {
                const property = tag.getAttribute('property');
                const content = tag.getAttribute('content');
                if (property && content) {
                    metadata.ogTags[property] = content;
                }
            });

            document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
                try {
                    if (script.textContent) metadata.structuredData.push(JSON.parse(script.textContent));
                } catch (e) { }
            });

            // Fonts
            const externalFonts: string[] = [];
            const fontFaces: string[] = [];

            // 1. External Links
            document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
                const href = link.getAttribute('href');
                if (href && (href.includes('fonts.googleapis.com') || href.includes('use.typekit.net'))) {
                    externalFonts.push(href);
                }
            });

            // 2. Inline @font-face rules
            try {
                Array.from(document.styleSheets).forEach(sheet => {
                    try {
                        const rules = sheet.cssRules;
                        if (rules) {
                            Array.from(rules).forEach(rule => {
                                if (rule.type === CSSRule.FONT_FACE_RULE) {
                                    let cssText = rule.cssText;
                                    // Fix relative paths in font-face src
                                    if (cssText.includes('url(')) {
                                        // Naive URL rewrite for simple relative paths
                                        // A better approach would be to parse the src, but this covers common cases
                                        const baseUrl = window.location.href;
                                        cssText = cssText.replace(/url\(['"]?([^)'"]+)['"]?\)/g, (match, url) => {
                                            if (url.startsWith('http') || url.startsWith('data:')) return match;
                                            try {
                                                const absoluteUrl = new URL(url, baseUrl).href;
                                                return `url("${absoluteUrl}")`;
                                            } catch { return match; }
                                        });
                                    }
                                    fontFaces.push(cssText);
                                }
                            });
                        }
                    } catch (e) {
                        // CORS access to rules usually blocks reading cross-origin sheets
                    }
                });
            } catch (e) { }

            // Tech Stack Detection
            const techStack: string[] = [];
            const win = window as any;

            // Frameworks
            if (win.__NEXT_DATA__ || document.getElementById('__NEXT_DATA__')) techStack.push('Next.js');
            if (win.React || document.querySelector('[data-reactroot]') || document.querySelector('script[id="__NEXT_DATA__"]')) techStack.push('React');
            if (win.Vue || document.querySelector('[data-v-]')) techStack.push('Vue.js');
            if (win.angular || document.querySelector('app-root')) techStack.push('Angular');
            if (win.Svelte || document.querySelector('.svelte-')) techStack.push('Svelte');

            // Stylings
            if (document.querySelector('body')?.classList.contains('tailwind') || document.querySelector('[class*="text-"][class*="bg-"]')) techStack.push('Tailwind CSS');
            if (document.querySelector('link[href*="bootstrap"]')) techStack.push('Bootstrap');

            // Analytics & CMS
            if (document.querySelector('script[src*="google-analytics"]')) techStack.push('Google Analytics');
            if (document.querySelector('script[src*="gtm.js"]')) techStack.push('Google Tag Manager');
            const metaGen = document.querySelector('meta[name="generator"]')?.getAttribute('content');
            if (metaGen && metaGen.includes('WordPress')) techStack.push('WordPress');

            // Internal Links
            const getHostname = (url: string) => {
                try {
                    return new URL(url).hostname.replace(/^www\./, '');
                } catch { return ''; }
            };

            const currentHost = getHostname(window.location.href);

            const internalLinks = Array.from(document.querySelectorAll('a'))
                .map(a => a.href)
                .filter(href => {
                    if (!href || href === window.location.href) return false;
                    // Filter out non-http links (mailto, tel, javascript)
                    if (!href.startsWith('http')) return false;

                    const linkHost = getHostname(href);
                    // Match if same host or subdomain
                    return linkHost === currentHost || (linkHost && linkHost.endsWith('.' + currentHost));
                })
                .filter((v, i, a) => a.indexOf(v) === i) // Unique
                .slice(0, 50); // Limit to 50

            return {
                styles: elements,
                metadata,
                fonts: {
                    loaded: [], // Will need more complex logic to get loaded fonts via document.fonts API if needed
                    external: externalFonts,
                    fontFaces: fontFaces
                },
                viewport: { width: 1440, height: 900 },
                links: internalLinks,
                techStack
            };
        });

        // Subpage Crawling (Dynamic - Up to 12)
        const subpagesContent: Array<{ url: string; text: string; title: string }> = [];
        const failedCrawls: Array<{ url: string; error: string }> = [];
        const totalLinksFound = baseData.links.length;
        let linksAttempted = 0;
        let linksSucceeded = 0;

        if (baseData.links.length > 0) {
            // Crawl up to 12 subpages to cover most small/medium sites fully
            const linksToCrawl = baseData.links.slice(0, 12);
            linksAttempted = linksToCrawl.length;

            console.log(`[Scraper] Starting subpage crawl: ${linksAttempted} pages to analyze`);

            // Helper function to scrape a single subpage
            // We use the existing browser instance to save startup time
            const scrapeSubpage = async (link: string, index: number) => {
                let page: any;
                const startTime = Date.now();
                try {
                    console.log(`[Scraper] [${index + 1}/${linksAttempted}] Crawling: ${link}`);

                    page = await browser.newPage();

                    // Block images/fonts for speed on subpages
                    await page.setRequestInterception(true);
                    page.on('request', (req: any) => {
                        // Allow stylesheets for SPAs, but block heavy resources
                        if (['image', 'font', 'media'].includes(req.resourceType())) {
                            req.abort();
                        } else {
                            req.continue();
                        }
                    });

                    await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 20000 });

                    const result = await page.evaluate(() => ({
                        url: window.location.href,
                        title: document.title,
                        text: document.body.innerText.slice(0, 10000) // 10k chars max
                    }));

                    const duration = Date.now() - startTime;
                    console.log(`[Scraper] ✓ Success [${index + 1}/${linksAttempted}] ${link} (${duration}ms)`);

                    return result;
                } catch (e: any) {
                    const duration = Date.now() - startTime;
                    const errorMsg = e.message || 'Unknown error';
                    console.error(`[Scraper] ✗ Failed [${index + 1}/${linksAttempted}] ${link} (${duration}ms): ${errorMsg}`);

                    // Track failure with detailed error
                    failedCrawls.push({
                        url: link,
                        error: errorMsg.includes('timeout') ? 'Timeout (20s)' :
                            errorMsg.includes('net::') ? 'Network error' :
                                errorMsg.includes('ERR_') ? 'Connection failed' :
                                    errorMsg
                    });

                    return null;
                } finally {
                    if (page) {
                        try {
                            await page.close();
                        } catch (e) {
                            console.error(`[Scraper] Warning: Failed to close page for ${link}`);
                        }
                    }
                }
            };

            // Run in parallel with Promise.all
            const results = await Promise.all(
                linksToCrawl.map((link: string, index: number) => scrapeSubpage(link, index))
            );

            results.forEach((res: any) => {
                if (res) {
                    subpagesContent.push(res);
                    linksSucceeded++;
                }
            });

            console.log(`[Scraper] Crawl Summary: ${linksSucceeded}/${linksAttempted} succeeded, ${failedCrawls.length} failed`);
            if (failedCrawls.length > 0) {
                console.log(`[Scraper] Failed URLs:`, failedCrawls.map(f => `${f.url} (${f.error})`));
            }
        }

        // Screenshot
        await page.evaluate(() => window.scrollTo(0, 0)); // Scroll back to top for screenshot
        // Small delay to ensure any sticky headers/animations settle
        await new Promise(r => setTimeout(r, 500));

        const screenshotBuffer = await page.screenshot({ type: 'webp', quality: 80, fullPage: false }); // Start with viewport screenshot for speed
        const screenshot = `data:image/webp;base64,${screenshotBuffer.toString('base64')}`;

        return {
            url,
            html: await page.content(), // Careful with size
            styles: styleData.styles,
            screenshot,
            metadata: styleData.metadata,
            fonts: styleData.fonts,
            viewport: styleData.viewport,
            links: baseData.links,
            subpagesContent,
            crawlStats: {
                totalLinksFound,
                linksAttempted,
                linksSucceeded,
                linksFailed: failedCrawls.length,
                failedUrls: failedCrawls
            },
            techStack: baseData.techStack
        };

    } finally {
        if (browser) {
            await browser.close();
        }
    }
}
