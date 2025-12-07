"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import type { UIWarehouse } from "@/features/warehouse/types";

export type WarehouseStatus = "operational" | "constrained" | "offline";

interface WarehouseGridProps {
  loading: boolean;
  warehouses: UIWarehouse[];
  primaryWarehousesCount: number;
  searchTerm: string;
  canEdit: boolean;
  updatingStatusId: string | null;
  onUpdateStatus: (warehouseId: string, nextStatus: WarehouseStatus) => void;
  onEditWarehouse: (warehouse: UIWarehouse) => void;
  onDeleteWarehouse: (warehouse: UIWarehouse) => void;
}

export function WarehouseGrid({
  loading,
  warehouses,
  primaryWarehousesCount,
  searchTerm,
  canEdit,
  updatingStatusId,
  onUpdateStatus,
  onEditWarehouse,
  onDeleteWarehouse,
}: WarehouseGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card
            key={`warehouse-skeleton-${index}`}
            className="shadow-sm hover:shadow-lg transition-shadow overflow-visible"
          >
            <CardHeader className="h-auto relative z-10 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-40" />
                </div>
                <div className="flex items-start gap-2 flex-shrink-0">
                  <div className="flex flex-col items-end gap-2">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-8 w-28" />
                  </div>
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-0 mt-1">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Capacity Used
                    </p>
                    <Skeleton className="h-2 w-full rounded-full" />
                    <Skeleton className="h-4 w-8 mt-2" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Items in Transit
                    </p>
                    <Skeleton className="h-6 w-12" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {Array.from({ length: 3 }).map((_, metricIndex) => (
                    <div
                      key={`warehouse-metric-skeleton-${index}-${metricIndex}`}
                      className="bg-muted rounded p-3 space-y-2"
                    >
                      <Skeleton className="h-3 w-12 mx-auto" />
                      <Skeleton className="h-5 w-10 mx-auto" />
                    </div>
                  ))}
                </div>
                <Skeleton className="h-3 w-32" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (warehouses.length === 0) {
    const title = searchTerm
      ? "No matching warehouses"
      : primaryWarehousesCount === 0
      ? "No Imphal or Delhi warehouses yet"
      : "No warehouses to display";

    const description = searchTerm
      ? "Try adjusting your search or clear it to see all hubs in Imphal and Delhi."
      : primaryWarehousesCount === 0
      ? "Add Imphal and Delhi hubs to start tracking capacity and staff here."
      : "There are no warehouses to display based on the current filters.";

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="col-span-1 md:col-span-2">
          <EmptyState
            variant="default"
            title={title}
            description={description}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      {warehouses.map((warehouse) => (
        <Card
          key={warehouse.id}
          className="shadow-sm hover:shadow-lg transition-shadow overflow-visible"
        >
          <CardHeader className="h-auto relative z-10 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="min-w-0">
                <CardTitle className="text-base sm:text-lg truncate">
                  {warehouse.name}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  {warehouse.location}
                </CardDescription>
              </div>
              <div className="flex items-start gap-2 flex-shrink-0">
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold ${
                      warehouse.status === "operational"
                        ? "bg-green-500/20 text-green-400"
                        : warehouse.status === "offline"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {warehouse.status.toUpperCase()}
                  </span>
                  <Select
                    value={warehouse.status}
                    onValueChange={(value) =>
                      onUpdateStatus(
                        warehouse.id,
                        value as WarehouseStatus
                      )
                    }
                    disabled={updatingStatusId === warehouse.id || !canEdit}
                  >
                    <SelectTrigger
                      size="sm"
                      className="mt-1 w-auto text-[11px] uppercase tracking-wide"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="operational">Operational</SelectItem>
                      <SelectItem value="constrained">Constrained</SelectItem>
                      <SelectItem value="offline">Offline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 p-0"
                      disabled={!canEdit}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open warehouse actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => onEditWarehouse(warehouse)}
                      disabled={!canEdit}
                    >
                      Edit warehouse
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => onDeleteWarehouse(warehouse)}
                      disabled={!canEdit}
                    >
                      Delete warehouse
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative z-0 mt-1">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Capacity Used
                  </p>
                  <div className="bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-full"
                      style={{ width: `${warehouse.capacityUsed}%` }}
                    ></div>
                  </div>
                  <p className="text-sm font-semibold mt-1">
                    {warehouse.capacityUsed}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Items in Transit
                  </p>
                  <p className="text-lg font-bold text-primary">
                    {warehouse.itemsInTransit}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-muted rounded p-3">
                  <p className="text-xs text-muted-foreground">Stored</p>
                  <p className="text-lg font-bold">{warehouse.itemsStored}</p>
                </div>
                <div className="bg-muted rounded p-3">
                  <p className="text-xs text-muted-foreground">Staff</p>
                  <p className="text-lg font-bold">{warehouse.staff}</p>
                </div>
                <div className="bg-muted rounded p-3">
                  <p className="text-xs text-muted-foreground">Docks</p>
                  <p className="text-lg font-bold">{warehouse.docks}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Last Updated:{" "}
                {warehouse.lastUpdated
                  ? new Date(warehouse.lastUpdated).toLocaleString("en-IN")
                  : "Not available"}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
