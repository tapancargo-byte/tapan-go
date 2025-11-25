"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardPageLayout from "@/components/dashboard/layout";
import ProcessorIcon from "@/components/icons/proccesor";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { rateSchema, type RateFormValues } from "@/lib/validations";

interface UIRate {
  id: string;
  origin: string;
  destination: string;
  ratePerKg: number;
  baseFee: number;
  minWeight: number;
  serviceType: RateFormValues["serviceType"];
  createdAt: string;
}

export default function RatesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [rates, setRates] = useState<UIRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [roleLoaded, setRoleLoaded] = useState(false);
  const [editingRate, setEditingRate] = useState<UIRate | null>(null);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const [quoteOrigin, setQuoteOrigin] = useState("");
  const [quoteDestination, setQuoteDestination] = useState("");
  const [quoteWeight, setQuoteWeight] = useState<string>("");
  const [quoteServiceType, setQuoteServiceType] = useState<string>("standard");
  const [quoteResult, setQuoteResult] = useState<{
    total: number;
    baseFee: number;
    ratePerKg: number;
    billableWeight: number;
  } | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  const form = useForm<RateFormValues>({
    resolver: zodResolver(rateSchema),
    defaultValues: {
      origin: "",
      destination: "",
      ratePerKg: 0,
      baseFee: 0,
      minWeight: 0,
      serviceType: "standard",
    },
  });

  useEffect(() => {
    let cancelled = false;

    async function loadRates() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("rates")
          .select(
            "id, origin, destination, rate_per_kg, base_fee, min_weight, service_type, created_at"
          )
          .order("created_at", { ascending: false });

        if (error) {
          console.warn("Supabase rates error", error.message);
          throw error;
        }

        if (cancelled) return;

        const normalized: UIRate[] = ((data as any[]) ?? []).map((row) => ({
          id: row.id as string,
          origin: (row.origin as string | null) ?? "",
          destination: (row.destination as string | null) ?? "",
          ratePerKg: Number(row.rate_per_kg ?? 0),
          baseFee: Number(row.base_fee ?? 0),
          minWeight: Number((row.min_weight as number | null) ?? 0),
          serviceType:
            ((row.service_type as RateFormValues["serviceType"] | null) ??
              "standard"),
          createdAt: (row.created_at as string | null) ?? "",
        }));

        setRates(normalized);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to load rates from Supabase", err);
        setRates([]);
        setLoading(false);
      }
    }

    loadRates();

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
        console.warn("Failed to load user role for rates page", err);
        setUserRole(null);
        setRoleLoaded(true);
      }
    }

    loadUserRole();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredRates = useMemo(
    () =>
      rates.filter((rate) => {
        const term = searchTerm.toLowerCase();
        return (
          rate.origin.toLowerCase().includes(term) ||
          rate.destination.toLowerCase().includes(term) ||
          rate.serviceType.toLowerCase().includes(term)
        );
      }),
    [rates, searchTerm]
  );

  const canEdit = userRole === "manager" || userRole === "admin";

  const handleQuote = () => {
    setQuoteError(null);
    setQuoteResult(null);

    const origin = quoteOrigin.trim();
    const destination = quoteDestination.trim();
    const weight = Number(quoteWeight);

    if (!origin || !destination || !quoteWeight.trim()) {
      setQuoteError("Enter origin, destination, and weight to get a quote.");
      return;
    }

    if (!Number.isFinite(weight) || weight <= 0) {
      setQuoteError("Enter a valid weight greater than 0.");
      return;
    }

    const laneMatch =
      rates.find(
        (r) =>
          r.origin.toLowerCase() === origin.toLowerCase() &&
          r.destination.toLowerCase() === destination.toLowerCase() &&
          r.serviceType === quoteServiceType
      ) ||
      rates.find(
        (r) =>
          r.origin.toLowerCase() === origin.toLowerCase() &&
          r.destination.toLowerCase() === destination.toLowerCase() &&
          r.serviceType === "standard"
      );

    if (!laneMatch) {
      setQuoteError("No matching rate found for this lane and service type.");
      return;
    }

    const billableWeight = Math.max(weight, laneMatch.minWeight ?? 0);
    const total = laneMatch.baseFee + laneMatch.ratePerKg * billableWeight;

    setQuoteResult({
      total,
      baseFee: laneMatch.baseFee,
      ratePerKg: laneMatch.ratePerKg,
      billableWeight,
    });
  };

  const handleSubmitRate = async (values: RateFormValues) => {
    if (!canEdit) {
      toast({
        title: "Insufficient permissions",
        description: "Only manager or admin users can modify rates.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const payload = {
        origin: values.origin.trim(),
        destination: values.destination.trim(),
        rate_per_kg: values.ratePerKg,
        base_fee: values.baseFee,
        min_weight: values.minWeight ?? 0,
        service_type: values.serviceType ?? "standard",
      };

      if (editingRate) {
        const { data, error } = await supabase
          .from("rates")
          .update(payload)
          .eq("id", editingRate.id)
          .select(
            "id, origin, destination, rate_per_kg, base_fee, min_weight, service_type, created_at"
          )
          .maybeSingle();

        if (error || !data) {
          throw error || new Error("Failed to update rate");
        }

        const updated: UIRate = {
          id: data.id as string,
          origin: (data.origin as string | null) ?? "",
          destination: (data.destination as string | null) ?? "",
          ratePerKg: Number(data.rate_per_kg ?? 0),
          baseFee: Number(data.base_fee ?? 0),
          minWeight: Number((data.min_weight as number | null) ?? 0),
          serviceType:
            ((data.service_type as RateFormValues["serviceType"] | null) ??
              "standard"),
          createdAt: (data.created_at as string | null) ?? "",
        };

        setRates((prev) =>
          prev.map((rate) => (rate.id === updated.id ? updated : rate))
        );

        toast({
          title: "Rate updated",
          description: `Lane ${updated.origin} → ${updated.destination} has been updated.`,
        });
      } else {
        const { data, error } = await supabase
          .from("rates")
          .insert(payload)
          .select(
            "id, origin, destination, rate_per_kg, base_fee, min_weight, service_type, created_at"
          )
          .single();

        if (error || !data) {
          throw error || new Error("Failed to create rate");
        }

        const newRate: UIRate = {
          id: data.id as string,
          origin: (data.origin as string | null) ?? "",
          destination: (data.destination as string | null) ?? "",
          ratePerKg: Number(data.rate_per_kg ?? 0),
          baseFee: Number(data.base_fee ?? 0),
          minWeight: Number((data.min_weight as number | null) ?? 0),
          serviceType:
            ((data.service_type as RateFormValues["serviceType"] | null) ??
              "standard"),
          createdAt: (data.created_at as string | null) ?? "",
        };

        setRates((prev) => [newRate, ...prev]);

        toast({
          title: "Rate created",
          description: `Lane ${newRate.origin} → ${newRate.destination} has been added.`,
        });
      }

      setIsDialogOpen(false);
      setEditingRate(null);
      form.reset({
        origin: "",
        destination: "",
        ratePerKg: 0,
        baseFee: 0,
        minWeight: 0,
        serviceType: "standard",
      });
    } catch (err: any) {
      console.error("Failed to save rate", err);
      toast({
        title: "Could not save rate",
        description: err?.message || "Something went wrong while saving the rate.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteRate = async (rate: UIRate) => {
    if (!canEdit) {
      toast({
        title: "Insufficient permissions",
        description: "Only manager or admin users can modify rates.",
        variant: "destructive",
      });
      return;
    }

    const confirmDelete = window.confirm(
      `Delete rate ${rate.origin} → ${rate.destination}? This action cannot be undone.`
    );
    if (!confirmDelete) return;

    setActionLoading((prev) => ({ ...prev, [rate.id]: true }));
    try {
      const { error } = await supabase.from("rates").delete().eq("id", rate.id);
      if (error) {
        throw error;
      }

      setRates((prev) => prev.filter((r) => r.id !== rate.id));

      toast({
        title: "Rate deleted",
        description: `Lane ${rate.origin} → ${rate.destination} has been removed.`,
      });
    } catch (err: any) {
      console.error("Failed to delete rate", err);
      toast({
        title: "Could not delete rate",
        description:
          err?.message || "Something went wrong while deleting the rate.",
        variant: "destructive",
      });
    } finally {
      setActionLoading((prev) => {
        const next = { ...prev };
        delete next[rate.id];
        return next;
      });
    }
  };

  return (
    <DashboardPageLayout
      header={{
        title: "Rates",
        description: "Manage lane pricing used for invoice auto-pricing",
        icon: ProcessorIcon,
      }}
    >
      <div className="flex flex-col gap-6">
        {/* Search and New Rate */}
        <div className="flex gap-4 flex-col sm:flex-row items-end">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Search</label>
            <Input
              placeholder="Search by origin or destination..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-input text-foreground"
            />
          </div>
          {roleLoaded && !canEdit && (
            <p className="text-[11px] text-muted-foreground max-w-xs">
              You have read-only access. Contact an admin to modify rates.
            </p>
          )}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <Button
              type="button"
              className="bg-primary hover:bg-primary/90"
              disabled={!canEdit}
              onClick={() => {
                if (!canEdit) return;
                setEditingRate(null);
                form.reset({
                  origin: "",
                  destination: "",
                  ratePerKg: 0,
                  baseFee: 0,
                  minWeight: 0,
                  serviceType: "standard",
                });
                setIsDialogOpen(true);
              }}
            >
              New Rate
            </Button>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingRate ? "Edit rate" : "New rate"}</DialogTitle>
                <DialogDescription>
                  {editingRate
                    ? "Update a pricing lane used when invoicing shipments."
                    : "Define a pricing lane used when invoicing shipments."}
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form
                  className="space-y-4 mt-2"
                  onSubmit={form.handleSubmit(handleSubmitRate)}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="origin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Origin</FormLabel>
                          <FormControl>
                            <Input placeholder="Imphal" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="destination"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Destination</FormLabel>
                          <FormControl>
                            <Input placeholder="New Delhi" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="ratePerKg"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rate per kg (₹)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="e.g. 25"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="baseFee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Base fee (₹)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="e.g. 150"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="minWeight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum billable weight (kg)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="e.g. 5"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="serviceType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service type</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select service" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="standard">Standard</SelectItem>
                                <SelectItem value="express">Express</SelectItem>
                                <SelectItem value="air">Air</SelectItem>
                                <SelectItem value="surface">Surface</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <DialogFooter className="pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setIsDialogOpen(false)}
                      className="uppercase"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-primary hover:bg-primary/90"
                      disabled={isCreating || !canEdit}
                    >
                      {isCreating
                        ? editingRate
                          ? "Saving..."
                          : "Creating..."
                        : editingRate
                        ? "Save changes"
                        : "Create rate"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Quote Calculator */}
        <Card className="border-pop p-4 space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-sm font-semibold">Quick quote</h2>
              <p className="text-xs text-muted-foreground">
                Estimate charges for a shipment using your current rates.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-2">
            <div className="space-y-1">
              <label className="text-xs font-medium">Origin</label>
              <Input
                placeholder="Imphal"
                value={quoteOrigin}
                onChange={(e) => setQuoteOrigin(e.target.value)}
                className="bg-input text-foreground h-8"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium">Destination</label>
              <Input
                placeholder="New Delhi"
                value={quoteDestination}
                onChange={(e) => setQuoteDestination(e.target.value)}
                className="bg-input text-foreground h-8"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium">Weight (kg)</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 12.5"
                value={quoteWeight}
                onChange={(e) => setQuoteWeight(e.target.value)}
                className="bg-input text-foreground h-8"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium">Service type</label>
              <Select
                value={quoteServiceType}
                onValueChange={setQuoteServiceType}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="express">Express</SelectItem>
                  <SelectItem value="air">Air</SelectItem>
                  <SelectItem value="surface">Surface</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 mt-2 flex-wrap">
            <div className="text-xs text-destructive min-h-[1.25rem]">
              {quoteError && <span>{quoteError}</span>}
            </div>
            <Button
              type="button"
              size="sm"
              className="bg-primary hover:bg-primary/90"
              onClick={handleQuote}
            >
              Get quote
            </Button>
          </div>

          {quoteResult && (
            <div className="mt-2 text-xs grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="flex flex-col">
                <span className="text-muted-foreground">Billable weight</span>
                <span className="font-medium">
                  {quoteResult.billableWeight.toLocaleString("en-IN")} kg
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground">Rate / kg</span>
                <span className="font-medium">
                  ₹{quoteResult.ratePerKg.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground">Base fee</span>
                <span className="font-medium">
                  ₹{quoteResult.baseFee.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground">Estimated total</span>
                <span className="font-semibold text-primary">
                  ₹{quoteResult.total.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          )}
        </Card>

        {/* Rates Table */}
        <Card className="overflow-hidden border-pop">
          <table className="w-full text-sm">
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
                filteredRates.map((rate) => (
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
                          onClick={() => {
                            setEditingRate(rate);
                            form.reset({
                              origin: rate.origin,
                              destination: rate.destination,
                              ratePerKg: rate.ratePerKg,
                              baseFee: rate.baseFee,
                              minWeight: rate.minWeight,
                              serviceType: rate.serviceType as RateFormValues["serviceType"],
                            });
                            setIsDialogOpen(true);
                          }}
                          disabled={!canEdit}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive border-destructive/40 hover:bg-red-50 dark:hover:bg-red-950/40"
                          onClick={() => handleDeleteRate(rate)}
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
        </Card>

        {!loading && filteredRates.length === 0 && (
          <Card className="p-12 text-center border-pop">
            <p className="text-muted-foreground">
              No rates defined yet. Create your first lane to enable auto-pricing.
            </p>
          </Card>
        )}
      </div>
    </DashboardPageLayout>
  );
}
