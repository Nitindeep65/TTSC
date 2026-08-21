function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-6 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>Text to SQL Engine</p>
        <p>© {new Date().getFullYear()} Text to SQL Engine. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer