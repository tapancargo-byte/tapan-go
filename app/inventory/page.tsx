"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardPageLayout from "@/components/dashboard/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import ProcessorIcon from "@/components/icons/proccesor";
import { supabase } from "@/lib/supabaseClient";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UIInventoryItem {
  sku: string;
  description: string;
  location: string;
  currentStock: number;
  minStock: number;
  lastUpdated: string;
}

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
        icon: ProcessorIcon,
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Total SKUs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{inventoryData.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Low Stock Items</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-yellow-400">
                {inventoryData.filter(i => getStockStatus(i.currentStock, i.minStock) === 'low').length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Critical Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-400">
                {inventoryData.filter(i => getStockStatus(i.currentStock, i.minStock) === 'critical').length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Inventory Table */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Items ({filteredInventory.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
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
                  {filteredInventory.map((item) => {
                    const status = getStockStatus(item.currentStock, item.minStock);
                    return (
                      <tr key={item.sku} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-2 font-mono text-xs">{item.sku}</td>
                        <td className="py-3 px-2">{item.description}</td>
                        <td className="py-3 px-2 text-xs">{item.location}</td>
                        <td className="py-3 px-2 font-bold">{item.currentStock}</td>
                        <td className="py-3 px-2">{item.minStock}</td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(status)}`}>
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
      </div>
    </DashboardPageLayout>
  );
}
