"use client";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { formatDate } from "@/lib/utils/formatters";

interface PricePoint {
  capturedAt: string;
  milheiro: number;
}

export function TrendsChart() {
  const [data, setData] = useState<PricePoint[]>([]);

  useEffect(() => {
    fetch("/api/prices?limit=30")
      .then((r) => r.json())
      .then((rows) => {
        const list = rows as Array<{ capturedAt: string; milheiro: number }>;
        const mapped = list.map((r) => ({
          capturedAt: r.capturedAt,
          milheiro: r.milheiro,
        })) as PricePoint[];
        setData(mapped.reverse());
      })
      .catch(() => {});
  }, []);

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="capturedAt" tickFormatter={(v) => formatDate(v)} />
          <YAxis />
          <Tooltip labelFormatter={(v) => formatDate(v)} />
          <Line type="monotone" dataKey="milheiro" stroke="#2563eb" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default TrendsChart;
