export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-brand text-2xl mb-1">Dashboard (Currently Dummy Data)</h1>
        <p className="text-text-secondary text-sm">
          Overview of Mirae store performance
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Orders" value="1,248" />
        <StatCard title="Total Revenue" value="₹12.4L" />
        <StatCard title="Active Products" value="86" />
        <StatCard title="Users" value="3,421" />
      </div>

      {/* Placeholder sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel title="Recent Orders">
          <p className="text-sm text-text-secondary">
            Orders data will appear here.
          </p>
        </Panel>

        <Panel title="Low Stock Products">
          <p className="text-sm text-text-secondary">
            Inventory alerts will appear here.
          </p>
        </Panel>
      </div>
    </div>
  );
}

/* ------------------ */
/* Components */
/* ------------------ */

function StatCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="bg-surface p-6 rounded-2xl border border-border">
      <p className="text-sm text-text-secondary mb-2">{title}</p>
      <p className="font-highlight text-2xl">{value}</p>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface p-6 rounded-2xl border border-border">
      <h2 className="font-brand text-lg mb-4">{title}</h2>
      {children}
    </div>
  );
}
