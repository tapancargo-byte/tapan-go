export function serve(
  handler: (req: Request) => Response | Promise<Response>,
  options?: { port?: number; hostname?: string }
): void;
