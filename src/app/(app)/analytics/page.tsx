"use client";

export default function AnalyticsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-[#1b1b1b]">Analytics</h1>
        <p className="text-[#414753]">Monitor agent performance and usage metrics.</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Total Tasks", value: "1,482", icon: "task_alt", change: "+12%", color: "text-[#006c05]" },
          { label: "Active Agents", value: "24", icon: "group", change: "+18%", color: "text-[#006c05]" },
          { label: "Avg. Completion", value: "4.2m", icon: "timer", change: "-8%", color: "text-[#006c05]" },
          { label: "Success Rate", value: "97.3%", icon: "verified", change: "+2.1%", color: "text-[#006c05]" },
        ].map((metric) => (
          <div key={metric.label} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="material-symbols-outlined text-[#717785]">{metric.icon}</span>
              <span className={`text-xs font-bold ${metric.color}`}>{metric.change}</span>
            </div>
            <p className="text-sm text-[#414753] font-medium">{metric.label}</p>
            <p className="text-3xl font-extrabold text-[#1b1b1b] tracking-tight">{metric.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-[#1b1b1b] mb-6">Tasks Over Time</h3>
          <div className="h-64 bg-[#f9f9f9] rounded-lg flex items-center justify-center border border-gray-100">
            <div className="text-center">
              <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">show_chart</span>
              <p className="text-sm text-[#717785]">Chart visualization</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-[#1b1b1b] mb-6">Agent Utilization</h3>
          <div className="h-64 bg-[#f9f9f9] rounded-lg flex items-center justify-center border border-gray-100">
            <div className="text-center">
              <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">donut_large</span>
              <p className="text-sm text-[#717785]">Chart visualization</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Agents Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-[#1b1b1b]">Top Performing Agents</h3>
        </div>
        <table className="w-full text-left">
          <thead className="bg-[#f9f9f9] text-[10px] font-bold uppercase tracking-wider text-[#717785]">
            <tr>
              <th className="px-6 py-4">Agent</th>
              <th className="px-6 py-4">Tasks Completed</th>
              <th className="px-6 py-4">Success Rate</th>
              <th className="px-6 py-4">Avg. Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {[
              { name: "Research Strategist", tasks: 342, rate: "99.1%", time: "3.8m" },
              { name: "Content Strategist", tasks: 289, rate: "97.6%", time: "5.2m" },
              { name: "Data Analyst", tasks: 256, rate: "98.4%", time: "4.1m" },
              { name: "Full-Stack Developer", tasks: 198, rate: "95.9%", time: "6.7m" },
            ].map((row) => (
              <tr key={row.name} className="hover:bg-[#f9f9f9] transition-colors">
                <td className="px-6 py-4 font-medium text-sm">{row.name}</td>
                <td className="px-6 py-4 text-sm text-[#414753]">{row.tasks}</td>
                <td className="px-6 py-4">
                  <span className="text-xs font-bold text-[#006c05] bg-green-50 px-2 py-1 rounded-full">
                    {row.rate}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-[#414753]">{row.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
