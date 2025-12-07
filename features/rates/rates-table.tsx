"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { UIRate } from "@/features/rates/types";

interface RatesTableProps {
  loading: boolean;
  rates: UIRate[];
  actionLoading: Record<string, boolean>;
  canEdit: boolean;
  onEditRate: (rate: UIRate) => void;
  onDeleteRate: (rate: UIRate) => void;
}

export function RatesTable({
  loading,
  rates,
  actionLoading,
  canEdit,
  onEditRate,
  onDeleteRate,
}: RatesTableProps) {
  return (
    <>
      <Card className="border-pop">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="bg-accent/50 border-b border-pop">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">Origin</th>
                <th className="px-6 py-3 text-left font-semibold">Destination</th>
                <th className="px-6 py-3 text-left font-semibold">Rate / kg</th>
                <th className="px-6 py-3 text-left font-semibold">Base fee</th>
                <th className="px-6 py-3 text-left font-semibold">Created</th>
                <th className="px-6 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!loading &&
                rates.map((rate) => (
                  <tr
                    key={rate.id}
                    className="border-b border-pop hover:bg-accent/30 transition-colors"
                  >
                    <td className="px-6 py-3 font-medium text-foreground">
                      {rate.origin}
                    </td>
                    <td className="px-6 py-3 text-foreground">
                      {rate.destination}
                    </td>
                    <td className="px-6 py-3">
                      ₹{rate.ratePerKg.toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-3">
                      ₹{rate.baseFee.toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-3 text-xs text-muted-foreground">
                      {rate.createdAt
                        ? new Date(rate.createdAt).toLocaleDateString("en-IN")
                        : "—"}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex justify-end gap-2 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditRate(rate)}
                          disabled={!canEdit}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive border-destructive/40 hover:bg-red-50 dark:hover:bg-red-950/40"
                          onClick={() => onDeleteRate(rate)}
                          disabled={!!actionLoading[rate.id] || !canEdit}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>

      {!loading && rates.length === 0 && (
        <Card className="p-12 text-center border-pop mt-4">
          <p className="text-muted-foreground">
            No rates defined yet. Create your first lane to enable auto-pricing.
          </p>
        </Card>
      )}
    </>
  );
}
