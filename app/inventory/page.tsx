"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardPageLayout from "@/components/dashboard/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import BoxIcon from "@/components/icons/box";
import { supabase } from "@/lib/supabaseClient";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UIInventoryItem } from "@/features/inventory/types";
import { InventoryTable } from "@/features/inventory/inventory-table";

export default function InventoryManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [inventoryData, setInventoryData] = useState<UIInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [roleLoaded, setRoleLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadInventory() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("inventory_items")
          .select("sku, description, location, current_stock, min_stock, last_updated");

        if (error) {
          console.warn("Supabase inventory error", error.message);
          throw error;
        }

        const normalized: UIInventoryItem[] = ((data as any[]) ?? []).map((row) => ({
          sku: row.sku,
          description: row.description ?? "",
          location: row.location ?? "",
          currentStock: row.current_stock ?? 0,
          minStock: row.min_stock ?? 0,
          lastUpdated: row.last_updated ?? "",
        }));

        if (cancelled) return;

        setInventoryData(normalized);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to load inventory from Supabase", err);
        setInventoryData([]);
        setLoading(false);
      }
    }

    loadInventory();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadUserRole() {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user) {
          if (!cancelled) {
            setUserRole(null);
            setRoleLoaded(true);
          }
          return;
        }

        const { data, error: userError } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (cancelled) return;

        if (userError || !data) {
          setUserRole(null);
        } else {
          setUserRole((data.role as string | null) ?? null);
        }
        setRoleLoaded(true);
      } catch (err) {
        if (cancelled) return;
        console.warn("Failed to load user role for inventory page", err);
        setUserRole(null);
        setRoleLoaded(true);
      }
    }

    void loadUserRole();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredInventory = useMemo(
    () =>
      inventoryData.filter((item) => {
        const matchesSearch =
          item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesLocation = locationFilter === "all" || item.location === locationFilter;
        return matchesSearch && matchesLocation;
      }),
    [inventoryData, searchTerm, locationFilter]
  );

  const locations = useMemo(
    () => Array.from(new Set(inventoryData.map((i) => i.location))),
    [inventoryData]
  );

  const canEdit = userRole === "manager" || userRole === "admin";

  const getStockStatus = (current: number, min: number) => {
    if (current < min) return 'critical';
    if (current < min * 1.5) return 'low';
    return 'ok';
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'critical': return 'bg-red-500/20 text-red-400';
      case 'low': return 'bg-yellow-500/20 text-yellow-400';
      case 'ok': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <DashboardPageLayout
      header={{
        title: 'Inventory & Goods',
        description: 'Manage warehouse inventory and track goods location',
        icon: BoxIcon,
      }}
    >
      <div className="space-y-6">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Search by SKU or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select
            value={locationFilter}
            onValueChange={(value) => setLocationFilter(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {roleLoaded && !canEdit && (
          <p className="text-[11px] text-muted-foreground">
            You have read-only access. Contact an admin to adjust inventory counts.
          </p>
        )}

        {loading && (
          <p className="text-[11px] text-muted-foreground">
            Loading inventory...
          </p>
        )}

        {/* Inventory Summary */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-[10px] sm:text-sm">Total SKUs</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <p className="text-xl sm:text-3xl font-bold">{inventoryData.length}</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-[10px] sm:text-sm">Low Stock</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <p className="text-xl sm:text-3xl font-bold text-yellow-400">
                {inventoryData.filter(i => getStockStatus(i.currentStock, i.minStock) === 'low').length}
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-[10px] sm:text-sm">Critical</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <p className="text-xl sm:text-3xl font-bold text-red-400">
                {inventoryData.filter(i => getStockStatus(i.currentStock, i.minStock) === 'critical').length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Inventory Table */}
        <InventoryTable
          items={filteredInventory}
          getStockStatus={getStockStatus}
          getStatusColor={getStatusColor}
        />
      </div>
    </DashboardPageLayout>
  );
}
