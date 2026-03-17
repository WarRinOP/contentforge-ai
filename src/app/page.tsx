export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/8 border border-accent/20 text-accent text-xs font-medium mb-6">
          <svg
            className="w-3.5 h-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
            />
          </svg>
          Powered by Claude AI
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4 tracking-tight">
          Generate SEO-Optimized Content
        </h1>
        <p className="text-text-secondary text-base max-w-xl mx-auto">
          Enter a topic and let AI create comprehensive SEO briefs, structured
          outlines, meta tags, and full article drafts — in seconds.
        </p>
      </div>

      {/* Generator will be built in Phase 3 */}
      <div className="max-w-3xl mx-auto">
        <div className="bg-bg-surface border border-border-default rounded-xl p-8 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-accent"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
              />
            </svg>
          </div>
          <p className="text-text-secondary text-sm">
            Content generator coming in Phase 3.
            <br />
            <span className="text-text-muted text-xs">
              Foundation is ready — building the engine next.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
