"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UIInventoryItem } from "@/features/inventory/types";

interface InventoryTableProps {
  items: UIInventoryItem[];
  getStockStatus: (current: number, min: number) => string;
  getStatusColor: (status: string) => string;
}

export function InventoryTable({
  items,
  getStockStatus,
  getStatusColor,
}: InventoryTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Items ({items.length})</CardTitle>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[650px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-2 font-semibold">SKU</th>
                <th className="text-left py-2 px-2 font-semibold">Description</th>
                <th className="text-left py-2 px-2 font-semibold">Location</th>
                <th className="text-left py-2 px-2 font-semibold">Current</th>
                <th className="text-left py-2 px-2 font-semibold">Min Level</th>
                <th className="text-left py-2 px-2 font-semibold">Status</th>
                <th className="text-left py-2 px-2 font-semibold">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const status = getStockStatus(item.currentStock, item.minStock);
                return (
                  <tr
                    key={item.sku}
                    className="border-b border-border hover:bg-muted/50"
                  >
                    <td className="py-3 px-2 font-mono text-xs">{item.sku}</td>
                    <td className="py-3 px-2">{item.description}</td>
                    <td className="py-3 px-2 text-xs">{item.location}</td>
                    <td className="py-3 px-2 font-bold">{item.currentStock}</td>
                    <td className="py-3 px-2">{item.minStock}</td>
                    <td className="py-3 px-2">
                      <span
                        className={`px-2 py-1 text-xs font-semibold ${getStatusColor(
                          status
                        )}`}
                      >
                        {status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-xs text-muted-foreground">
                      {(() => {
                        if (!item.lastUpdated) return "Not available";
                        const d = new Date(item.lastUpdated);
                        if (Number.isNaN(d.getTime())) return item.lastUpdated;
                        return d.toLocaleString("en-IN");
                      })()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
