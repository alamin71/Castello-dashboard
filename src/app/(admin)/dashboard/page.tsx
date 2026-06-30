export default function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-white mb-6">Dashboard</h1>
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Orders", value: "1,284", change: "+12% this month" },
          { label: "Active Products", value: "148", change: "+3 this week" },
          { label: "Total Revenue", value: "284,920 kr.", change: "+8.2% this month" },
          { label: "Active Customers", value: "3,402", change: "+24 today" },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#1a1a1a] border border-white/6 rounded-2xl p-5">
            <p className="text-sm text-white/40 mb-1">{stat.label}</p>
            <p className="text-2xl font-semibold text-white mb-1">{stat.value}</p>
            <p className="text-xs text-emerald-400">{stat.change}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
