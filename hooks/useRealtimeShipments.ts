"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { ShipmentRecord } from "@/types/logistics";
import { toast } from "sonner";

export function useRealtimeShipments() {
  const [shipments, setShipments] = useState<ShipmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Initial fetch
    const fetchShipments = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from("shipments")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100);

        if (fetchError) throw fetchError;

        if (data) {
          setShipments(data);
        }
      } catch (err) {
        console.error("Error fetching shipments:", err);
        setError(err instanceof Error ? err : new Error("Failed to fetch shipments"));
        toast.error("Failed to load shipments");
      } finally {
        setLoading(false);
      }
    };

    fetchShipments();

    // Subscribe to real-time changes
    const channel = supabase
      .channel("shipments-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "shipments",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newShipment = payload.new as ShipmentRecord;
            setShipments((prev) => [newShipment, ...prev]);
            toast.success(`New shipment: ${newShipment.shipment_ref}`, {
              description: `${newShipment.origin} → ${newShipment.destination}`,
            });
          } else if (payload.eventType === "UPDATE") {
            const updatedShipment = payload.new as ShipmentRecord;
            setShipments((prev) =>
              prev.map((s) =>
                s.id === updatedShipment.id ? updatedShipment : s
              )
            );
            
            // Only show toast for status changes
            const oldShipment = payload.old as ShipmentRecord;
            if (oldShipment.status !== updatedShipment.status) {
              toast.info(`Shipment ${updatedShipment.shipment_ref} updated`, {
                description: `Status: ${updatedShipment.status}`,
              });
            }
          } else if (payload.eventType === "DELETE") {
            const deletedId = payload.old.id;
            setShipments((prev) => prev.filter((s) => s.id !== deletedId));
            toast.error(`Shipment deleted`);
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("✅ Subscribed to shipments real-time updates");
        } else if (status === "CHANNEL_ERROR") {
          console.error("❌ Real-time subscription error");
          setError(new Error("Real-time connection failed"));
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { shipments, loading, error, setShipments };
}
