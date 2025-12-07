"use client";

import { useEffect, useRef, useState } from "react";
import DashboardPageLayout from "@/components/dashboard/layout";
import BracketsIcon from "@/components/icons/brackets";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function BarcodeScannerPage() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<"idle" | "success">("success");
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <DashboardPageLayout
      header={{
        title: "Barcode Scanner",
        description: "HT20 keyboard-wedge friendly scanner",
        icon: BracketsIcon,
      }}
    >
      <div className="max-w-3xl space-y-4">
        <Card className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline-success">Barcode scan successful</Badge>
            <span className="text-sm text-muted-foreground">
              Ready for HT20 scans. Focus stays in the input.
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Scan or type a barcode
            </label>
            <Input
              ref={inputRef}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setStatus("success");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setStatus("success");
                  const trimmed = value.trim();
                  if (trimmed) {
                    setLog((prev) => [trimmed, ...prev].slice(0, 50));
                    setValue("");
                  }
                }
              }}
              placeholder="Awaiting HT20 input..."
              className="text-base"
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="text-sm font-medium">Recent scans</p>
            {log.length === 0 ? (
              <p className="text-sm text-muted-foreground">No scans yet.</p>
            ) : (
              <ul className="text-sm space-y-1 max-h-48 overflow-y-auto">
                {log.map((entry, idx) => (
                  <li key={`${entry}-${idx}`} className="font-mono">
                    {entry}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>
    </DashboardPageLayout>
  );
}
