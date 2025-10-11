import React from "react";
import KPICard from "./KPICard";

export default function KPIGrid({ data }) {
  if (!data) return null;

  const kpiData = [
    {
      title: "Total Items",
      value: data.totalItems || 0,
      icon: "totalItems",
      color: "blue",
      description: "Total inventory items",
    },
    {
      title: "Low Stock Items",
      value: data.lowStock || 0,
      icon: "lowStock",
      color: "red",
      description: "Items below minimum threshold",
    },
    {
      title: "Items with Expiry",
      value: data.withExpiry || 0,
      icon: "withExpiry",
      color: "yellow",
      description: "Items with expiration dates",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {kpiData.map((kpi, index) => (
        <KPICard key={index} {...kpi} />
      ))}
    </div>
  );
}
