import React from "react";
import { PackageCheck, AlertTriangle, CalendarClock, Gauge, Layers3 } from "lucide-react";

const iconMap = {
  totalItems: PackageCheck,
  lowStock: AlertTriangle,
  withExpiry: CalendarClock,
  gauge: Gauge,
  layers: Layers3,
};

export default function KPICard({ 
  title, 
  value, 
  icon, 
  color = "blue", 
  description,
  trend,
  trendValue 
}) {
  const IconComponent = iconMap[icon] || PackageCheck;
  
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    red: "bg-red-50 border-red-200 text-red-700",
    yellow: "bg-yellow-50 border-yellow-200 text-yellow-700",
    green: "bg-green-50 border-green-200 text-green-700",
    purple: "bg-purple-50 border-purple-200 text-purple-700",
  };

  return (
    <div className={`p-6 border rounded-2xl ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-white/50">
            <IconComponent className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        {trend && (
          <div className={`text-sm font-medium ${
            trend === 'up' ? 'text-green-600' : 
            trend === 'down' ? 'text-red-600' : 
            'text-gray-600'
          }`}>
            {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'} {trendValue}
          </div>
        )}
      </div>
      <div className="text-3xl font-bold mb-2">{value}</div>
      {description && (
        <p className="text-sm opacity-75">{description}</p>
      )}
    </div>
  );
}
