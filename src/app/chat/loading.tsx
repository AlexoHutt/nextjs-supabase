import { Skeleton } from "@/components/ui/skeleton"

export default function ChatLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-40" />
      </header>
      <main className="flex-1 px-4 py-4">
        <div className="mx-auto flex max-w-2xl flex-col gap-3">
          {[40, 56, 32, 48, 36].map((w, i) => (
            <div
              key={i}
              className={`flex flex-col gap-1 ${i % 2 === 0 ? "items-start" : "items-end"}`}
            >
              <Skeleton className="h-3 w-28" />
              <Skeleton className={`h-10 w-${w} rounded-xl`} />
            </div>
          ))}
        </div>
      </main>
      <footer className="border-t border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-2xl items-end gap-2">
          <Skeleton className="h-9 flex-1 rounded-lg" />
          <Skeleton className="h-9 w-16 rounded-lg" />
        </div>
      </footer>
    </div>
  )
}
