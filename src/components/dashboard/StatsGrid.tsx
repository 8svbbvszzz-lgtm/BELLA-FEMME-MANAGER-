export default function StatsGrid() {
  const stats = [
    { name: 'إجمالي المبيعات', value: '0 د.ج', change: '+0%' },
    { name: 'الطلبات الجديدة', value: '0', change: '+0%' },
    { name: 'المنتجات', value: '0', change: '0' },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500">{stat.name}</p>
          <div className="flex items-baseline justify-between mt-2">
            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">{stat.change}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
