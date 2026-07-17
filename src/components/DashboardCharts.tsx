"use client";

import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

interface DashboardChartsProps {
  classificationData: Array<{ name: string; value: number; color: string }>;
  ratingData: Array<{ stars: string; total: number; suspicious: number; genuine: number }>;
}

export default function DashboardCharts({ classificationData, ratingData }: DashboardChartsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return placeholder of exact same dimensions to avoid layout shift and hydration error
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[350px]">
        <div className="bg-gray-50 border border-gray-100 rounded-md animate-pulse h-[350px]" />
        <div className="bg-gray-50 border border-gray-100 rounded-md animate-pulse h-[350px]" />
      </div>
    );
  }

  // Check if there is data
  const hasData = classificationData.some(d => d.value > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Classification Pie Chart */}
      <div className="bg-white p-5 border border-gray-200 rounded-lg shadow-xs flex flex-col">
        <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
          Risk Classification Distribution
        </h4>
        <div className="h-[300px] flex-1 flex items-center justify-center">
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={classificationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {classificationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", color: "#fff", border: "none", borderRadius: "6px" }}
                  itemStyle={{ color: "#fff" }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-xs text-gray-400">No review classification data available.</div>
          )}
        </div>
      </div>

      {/* Rating Anomalies Stacked Bar Chart */}
      <div className="bg-white p-5 border border-gray-200 rounded-lg shadow-xs flex flex-col">
        <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
          Star Rating Authenticity Spans
        </h4>
        <div className="h-[300px] flex-1">
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={ratingData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <XAxis dataKey="stars" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", color: "#fff", border: "none", borderRadius: "6px" }}
                />
                <Legend iconType="rect" wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                <Bar dataKey="genuine" name="Genuine reviews" stackId="a" fill="#0d9488" radius={[0, 0, 0, 0]} />
                <Bar dataKey="suspicious" name="Suspicious reviews" stackId="a" fill="#d97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-xs text-gray-400 h-full flex items-center justify-center">
              No rating distribution data available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
