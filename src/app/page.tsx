import { UrlInputForm } from "@/components/url-input-form";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24 bg-zinc-50 dark:bg-black font-sans">
      <main className="w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex-col">
        <UrlInputForm />
      </main>
    </div>
  );
}
