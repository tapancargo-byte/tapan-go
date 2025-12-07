"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useLocation, useLocationScopeChange } from "@/lib/location-context";
import type { Location, LocationScope } from "@/types/auth";

/**
 * Hook to build location-filtered Supabase queries
 * Automatically refetches when location scope changes
 */
export function useLocationQuery<T>(
  tableName: string,
  options?: {
    select?: string;
    orderBy?: { column: string; ascending?: boolean };
    limit?: number;
    additionalFilters?: Record<string, any>;
    enabled?: boolean;
  }
) {
  const { locationScope, getLocationFilter } = useLocation();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (options?.enabled === false) return;
    
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from(tableName)
        .select(options?.select || "*");

      // Apply location filter if not viewing all
      const locationFilter = getLocationFilter() as { location?: Location };
      if (locationFilter.location) {
        query = query.eq("location", locationFilter.location);
      }

      // Apply additional filters
      if (options?.additionalFilters) {
        for (const [key, value] of Object.entries(options.additionalFilters)) {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        }
      }

      // Apply ordering
      if (options?.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? false,
        });
      }

      // Apply limit
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data: result, error: queryError } = await query;

      if (queryError) {
        throw new Error(queryError.message);
      }

      setData((result as T[]) || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Query failed"));
    } finally {
      setLoading(false);
    }
  }, [tableName, locationScope, options?.select, options?.orderBy, options?.limit, options?.additionalFilters, options?.enabled, getLocationFilter]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refetch when location scope changes
  useLocationScopeChange(() => {
    fetchData();
  });

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    locationScope,
  };
}

/**
 * Build a location filter for manual queries
 */
export function buildLocationFilter(scope: LocationScope): { location?: Location } | {} {
  if (scope === 'all') {
    return {};
  }
  return { location: scope };
}

/**
 * Add location to a new record based on current scope
 * If viewing 'all', uses the user's home location
 */
export function useLocationForNewRecord() {
  const { locationScope, userHomeLocation } = useLocation();
  
  return locationScope === 'all' ? userHomeLocation : locationScope;
}

/**
 * Hook to get counts by location for dashboard stats
 */
export function useLocationStats(tableName: string) {
  const [stats, setStats] = useState<{ imphal: number; newdelhi: number; total: number }>({
    imphal: 0,
    newdelhi: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        const [imphalResult, delhiResult] = await Promise.all([
          supabase.from(tableName).select("id", { count: "exact", head: true }).eq("location", "imphal"),
          supabase.from(tableName).select("id", { count: "exact", head: true }).eq("location", "newdelhi"),
        ]);

        setStats({
          imphal: imphalResult.count || 0,
          newdelhi: delhiResult.count || 0,
          total: (imphalResult.count || 0) + (delhiResult.count || 0),
        });
      } catch (err) {
        console.error(`Failed to fetch ${tableName} stats:`, err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [tableName]);

  return { stats, loading };
}
