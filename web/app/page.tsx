export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold tracking-tight text-primary">Dated</h1>
        <p className="text-xl text-muted-foreground max-w-md">
          Post, rate, rank, and review your dates. Share the best spots with the world.
        </p>
        <div className="flex gap-3 justify-center pt-4">
          <a
            href="/signup"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
          >
            Get Started
          </a>
          <a
            href="/explore"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Explore
          </a>
        </div>
      </div>
    </main>
  )
}
