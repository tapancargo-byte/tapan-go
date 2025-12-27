// biome-ignore lint/suspicious/noExplicitAny: Shim type
export type SupabaseClient = any;
// biome-ignore lint/suspicious/noExplicitAny: Generic args
export function createClient(...args: any[]): SupabaseClient;
