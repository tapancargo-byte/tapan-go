'use client';

import { useEffect, useState } from 'react';
import DashboardPageLayout from '@/components/dashboard/layout';
import GearIcon from '@/components/icons/gear';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface InvoiceLog {
  id: string;
  status: string;
  message: string | null;
  started_at: string | null;
  finished_at: string | null;
  duration_ms: number | null;
}

export default function InvoiceLogsPage() {
  const [invoiceId, setInvoiceId] = useState('');
  const [logs, setLogs] = useState<InvoiceLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [regenLoading, setRegenLoading] = useState(false);
  const { toast } = useToast();

  const loadLogs = async () => {
    if (!invoiceId.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/invoices/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: invoiceId.trim(), limit: 50 }),
      });
      const json = await res.json();
      setLogs((json?.logs ?? []) as InvoiceLog[]);
    } catch (error) {
      console.error('Failed to load invoice logs', error);
      toast({
        title: 'Failed to load logs',
        description: 'Please check your connection and try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const regenerate = async () => {
    if (!invoiceId.trim()) return;
    setRegenLoading(true);
    try {
      const res = await fetch('/api/invoices/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: invoiceId.trim() }),
      });
      const json = await res.json();
      if (json?.success) {
        await loadLogs();
        toast({
          title: 'Invoice regeneration started',
          description: 'A new PDF generation attempt has been triggered.',
        });
      } else {
        toast({
          title: 'Failed to regenerate invoice',
          description: json?.error ?? 'Please check server logs.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to regenerate invoice', error);
      toast({
        title: 'Invoice regeneration failed',
        description: 'An error occurred while regenerating the invoice.',
        variant: 'destructive',
      });
    } finally {
      setRegenLoading(false);
    }
  };

  const formatDate = (value: string | null) =>
    value ? new Date(value).toLocaleString() : '-';

  return (
    <DashboardPageLayout
      header={{
        title: 'Invoice Generation Logs',
        description: 'Inspect invoice PDF generation attempts and retry if needed',
        icon: GearIcon,
      }}
    >
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Search Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Invoice ID</label>
                <Input
                  placeholder="Enter invoice database ID (UUID)"
                  value={invoiceId}
                  onChange={(e) => setInvoiceId(e.target.value)}
                  className="bg-input text-foreground"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={loadLogs} disabled={loading}>
                  {loading ? 'Loading...' : 'Load Logs'}
                </Button>
                <Button
                  className="bg-primary hover:bg-primary/90"
                  onClick={regenerate}
                  disabled={regenLoading || !invoiceId.trim()}
                >
                  {regenLoading ? 'Regenerating...' : 'Regenerate PDF'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Logs ({logs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Message</th>
                    <th className="px-4 py-2 text-left">Started</th>
                    <th className="px-4 py-2 text-left">Finished</th>
                    <th className="px-4 py-2 text-left">Duration (ms)</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-border">
                      <td className="px-4 py-2 font-mono text-xs">{log.status}</td>
                      <td className="px-4 py-2 text-xs">{log.message ?? '-'}</td>
                      <td className="px-4 py-2 text-xs">{formatDate(log.started_at)}</td>
                      <td className="px-4 py-2 text-xs">{formatDate(log.finished_at)}</td>
                      <td className="px-4 py-2 text-xs">{log.duration_ms ?? '-'}</td>
                    </tr>
                  ))}
                  {!logs.length && !loading && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-6 text-center text-sm text-muted-foreground"
                      >
                        No logs found for this invoice yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardPageLayout>
  );
}
