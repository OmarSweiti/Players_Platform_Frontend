import { useAuth } from '@/features/auth';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.firstName}! Here&apos;s what&apos;s happening with your platform.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Stats Cards - Placeholder for future implementation */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Total Players</h3>
          <p className="mt-2 text-3xl font-bold">0</p>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Active Contracts</h3>
          <p className="mt-2 text-3xl font-bold">0</p>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Training Sessions</h3>
          <p className="mt-2 text-3xl font-bold">0</p>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Pending Reviews</h3>
          <p className="mt-2 text-3xl font-bold">0</p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <button className="flex items-center gap-3 rounded-lg border bg-background p-4 hover:bg-accent transition-colors">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div className="text-left">
              <p className="font-medium">Add Player</p>
              <p className="text-sm text-muted-foreground">Register a new player</p>
            </div>
          </button>

          <button className="flex items-center gap-3 rounded-lg border bg-background p-4 hover:bg-accent transition-colors">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="font-medium">Create Contract</p>
              <p className="text-sm text-muted-foreground">Draft new contract</p>
            </div>
          </button>

          <button className="flex items-center gap-3 rounded-lg border bg-background p-4 hover:bg-accent transition-colors">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="font-medium">Schedule Training</p>
              <p className="text-sm text-muted-foreground">Plan session</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
