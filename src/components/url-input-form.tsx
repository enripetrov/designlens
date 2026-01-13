"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Search, Loader2, ArrowRight, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const formSchema = z.object({
    url: z.string().url("Please enter a valid URL (e.g., https://example.com)"),
});

type FormValues = z.infer<typeof formSchema>;

interface UrlInputFormProps {
    compact?: boolean;
}

export function UrlInputForm({ compact = false }: UrlInputFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
    });

    async function onSubmit(data: FormValues) {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch("/api/analyze", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ url: data.url }),
            });

            if (!response.ok) {
                throw new Error("Failed to analyze URL");
            }

            const result = await response.json();
            console.log("Analysis started:", result);
            if (result.success && result.data.id) {
                router.push(`/analysis/${result.data.id}`);
            }
            // Handle success (e.g., redirect or show status)
        } catch (err) {
            setError("Something went wrong. Please try again.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className={cn("w-full mx-auto space-y-6", compact ? "max-w-full" : "max-w-md")}>
            {!compact && (
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-neutral-800 to-neutral-400 dark:from-neutral-100 dark:to-neutral-500">
                        DesignLens
                    </h2>
                    <p className="text-muted-foreground">
                        Enter a website URL to extract design tokens and structure.
                    </p>
                </div>
            )}

            <Card className={cn(
                "border-0 overflow-hidden relative",
                compact ? "shadow-sm ring-1 ring-black/5" : "shadow-lg ring-1 ring-black/5 dark:ring-white/10"
            )}>
                {!compact && (
                    /* Subtle gradient background for premium feel */
                    <div className="absolute inset-0 bg-gradient-to-br from-white via-neutral-50 to-neutral-100 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-800 opacity-50 z-0" />
                )}

                <CardContent className={cn("relative z-10", compact ? "p-3" : "p-4")}>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="relative group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-foreground">
                                <Search className="w-4 h-4" />
                            </div>
                            <Input
                                {...register("url")}
                                placeholder="https://example.com"
                                className={cn(
                                    "pl-10 bg-white/50 dark:bg-black/20 border-neutral-200 dark:border-neutral-800 focus-visible:ring-offset-0 focus-visible:ring-1 transition-all",
                                    compact ? "h-10 text-sm" : "h-12",
                                    errors.url ? "border-red-500 focus-visible:ring-red-500" : ""
                                )}
                                disabled={isLoading}
                            />
                        </div>
                        {errors.url && (
                            <p className="text-xs text-red-500 flex items-center gap-1.5 ml-1 animate-in slide-in-from-top-1 fade-in">
                                <AlertCircle className="w-3 h-3" /> {errors.url.message}
                            </p>
                        )}

                        <Button
                            type="submit"
                            className={cn(
                                "w-full font-medium shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99]",
                                compact ? "h-9 text-sm" : "h-11 text-base"
                            )}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {compact ? "Analyzing..." : "Analyzing..."}
                                </>
                            ) : (
                                <>
                                    {compact ? "Analyze" : "Analyze Website"}
                                    {!compact && <ArrowRight className="ml-2 h-4 w-4" />}
                                </>
                            )}
                        </Button>

                        {error && (
                            <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
