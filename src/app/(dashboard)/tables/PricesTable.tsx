"use client";
import { useEffect, useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";

interface Row {
  id: string;
  price: number;
  milheiro: number;
  capturedAt: string;
  source: {
    name: string;
    program: string;
  };
}

export default function PricesTable() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/prices?limit=20")
      .then((r) => r.json())
      .then((data: Row[]) => setRows(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-zinc-100">
          <tr>
            <th className="text-left p-2">Fonte</th>
            <th className="text-left p-2">Programa</th>
            <th className="text-right p-2">Preço</th>
            <th className="text-right p-2">Milheiro</th>
            <th className="text-left p-2">Data</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td className="p-3" colSpan={5}>Carregando...</td></tr>
          ) : rows.length === 0 ? (
            <tr><td className="p-3" colSpan={5}>Sem dados. Dispare o scraping em /api/scrape.</td></tr>
          ) : (
            rows.map((r) => (
              <tr key={r.id} className="border-b border-zinc-200">
                <td className="p-2">{r.source.name}</td>
                <td className="p-2">{r.source.program}</td>
                <td className="p-2 text-right">{formatCurrency(r.price)}</td>
                <td className="p-2 text-right">{formatCurrency(r.milheiro)}</td>
                <td className="p-2">{formatDate(r.capturedAt)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
