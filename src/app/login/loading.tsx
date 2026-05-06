export default function LoginLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col gap-4 w-full max-w-sm animate-pulse">
        <div className="h-6 w-24 rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="flex flex-col gap-1">
          <div className="h-4 w-12 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-9 rounded-md bg-zinc-200 dark:bg-zinc-700" />
        </div>
        <div className="flex flex-col gap-1">
          <div className="h-4 w-16 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-9 rounded-md bg-zinc-200 dark:bg-zinc-700" />
        </div>
        <div className="h-9 rounded-md bg-zinc-200 dark:bg-zinc-700" />
      </div>
    </div>
  );
}
