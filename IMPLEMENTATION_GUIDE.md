# Implementation Guide: AWB Sequence & Biome Migration

## 1. Automatic AWB Generation
The project now uses a server-side sequence for AWB numbers (format: `TAPAN00001`).

### Components Involved:
- **Migration**: `supabase/migrations/20251225_awb_sequence.sql`
- **Frontend**: The `InvoiceDialog` no longer needs to generate AWB numbers on the client. It should omit the `invoiceRef` field during creation.

### How it Works:
1. A sequence `invoice_ref_seq` is created in the `public` schema.
2. A function `generate_invoice_ref()` formats the sequence value with the "TAPAN" prefix.
3. A trigger `set_invoice_ref_trigger` automatically populated `invoiceRef` on `INSERT` if it's null.

---

## 2. Biome Linting Standards
We have switched to Biome for faster and stricter linting.

### Rule Updates:
- `noExplicitAny`: Encourages specific types. Use `object` or specific interfaces instead of `any`.
- `noConsole`: Use `console.error` only for legitimate errors. Suppress with `// biome-ignore lint/nursery/noConsole: <reason>` for debug logs if absolutely necessary.
- `noImgElement`: Always use `next/image` for performance optimization.

### Checking for Violations:
```bash
npx @biomejs/biome check --write .
```
Or run the analyzer:
```bash
node analyze_biome.js
```
