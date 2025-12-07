"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import type { UIShipment } from "@/features/shipments/types";

interface ShipmentsTableProps {
  loading: boolean;
  shipments: UIShipment[];
  actionLoading: Record<string, boolean>;
  canEdit: boolean;
  getStatusColor: (status: string) => string;
  onRowClick: (shipment: UIShipment) => void;
  onEditShipment: (shipment: UIShipment) => void;
  onDeleteShipment: (shipment: UIShipment) => void;
  searchTerm: string;
  statusFilter: string;
}

export function ShipmentsTable({
  loading,
  shipments,
  actionLoading,
  canEdit,
  getStatusColor,
  onRowClick,
  onEditShipment,
  onDeleteShipment,
  searchTerm,
  statusFilter,
}: ShipmentsTableProps) {
  return (
    <Card>
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="text-base sm:text-lg">
          {loading
            ? "Loading shipments..."
            : `Active Shipments (${shipments.length})`}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 sm:px-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-2 font-semibold">Shipment ID</th>
                <th className="text-left py-2 px-2 font-semibold">Customer</th>
                <th className="text-left py-2 px-2 font-semibold">Origin</th>
                <th className="text-left py-2 px-2 font-semibold">Destination</th>
                <th className="text-left py-2 px-2 font-semibold">Weight</th>
                <th className="text-left py-2 px-2 font-semibold">Status</th>
                <th className="text-left py-2 px-2 font-semibold">Progress</th>
                <th className="text-right py-2 px-2 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <tr
                      key={`shipment-skeleton-${index}`}
                      className="border-b border-border"
                    >
                      <td className="py-3 px-2">
                        <Skeleton className="h-4 w-24" />
                      </td>
                      <td className="py-3 px-2">
                        <Skeleton className="h-4 w-32" />
                      </td>
                      <td className="py-3 px-2">
                        <Skeleton className="h-4 w-28" />
                      </td>
                      <td className="py-3 px-2">
                        <Skeleton className="h-4 w-28" />
                      </td>
                      <td className="py-3 px-2">
                        <Skeleton className="h-4 w-16" />
                      </td>
                      <td className="py-3 px-2">
                        <Skeleton className="h-5 w-20" />
                      </td>
                      <td className="py-3 px-2">
                        <Skeleton className="h-2 w-24" />
                      </td>
                      <td className="py-3 px-2 text-right">
                        <div className="flex justify-end gap-2">
                          <Skeleton className="h-8 w-16" />
                          <Skeleton className="h-8 w-16" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </>
              )}
              {!loading &&
                shipments.map((shipment) => (
                  <tr
                    key={shipment.shipmentId}
                    className="border-b border-border hover:bg-muted/50 cursor-pointer"
                    onClick={() => onRowClick(shipment)}
                  >
                    <td className="py-3 px-2 font-mono text-xs">
                      {shipment.shipmentId}
                    </td>
                    <td className="py-3 px-2">{shipment.customer}</td>
                    <td className="py-3 px-2 text-xs">{shipment.origin}</td>
                    <td className="py-3 px-2 text-xs">{shipment.destination}</td>
                    <td className="py-3 px-2">{shipment.weight}kg</td>
                    <td className="py-3 px-2">
                      <span
                        className={`px-2 py-1 text-xs font-semibold ${getStatusColor(
                          shipment.status
                        )}`}
                      >
                        {shipment.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <div className="w-24 bg-muted h-1.5">
                        <div
                          className="bg-primary h-full"
                          style={{ width: `${shipment.progress}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-right space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditShipment(shipment);
                        }}
                        disabled={!canEdit}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-destructive border-destructive/40 hover:bg-red-50 dark:hover:bg-red-950/40"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteShipment(shipment);
                        }}
                        disabled={!!actionLoading[shipment.dbId] || !canEdit}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {!loading && shipments.length === 0 && (
            <EmptyState
              variant="shipments"
              title={
                searchTerm || statusFilter !== "all"
                  ? "No matching shipments"
                  : "No shipments yet"
              }
              description={
                searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Create your first shipment to get started."
              }
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
