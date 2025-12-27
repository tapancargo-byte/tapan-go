import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createOpenAI } from "https://esm.sh/@ai-sdk/openai";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { generateText } from "https://esm.sh/ai";

import "../_shared/deno-env.ts";

// biome-ignore lint/style/noNonNullAssertion: Env vars required
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
// biome-ignore lint/style/noNonNullAssertion: Env vars required
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
// biome-ignore lint/style/noNonNullAssertion: Env vars required
const openAiKey = Deno.env.get("OPENAI_API_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const openai = createOpenAI({ apiKey: openAiKey });

serve(async (_req: Request) => {
	try {
		// 1. Fetch key metrics for the day
		const { count: shipmentCount } = await supabase
			.from("shipments")
			.select("*", { count: "exact", head: true })
			.gte("created_at", new Date().toISOString().split("T")[0]);

		const { count: ticketsCount } = await supabase
			.from("tickets")
			.select("*", { count: "exact", head: true })
			.eq("status", "open");

		const { data: alerts } = await supabase
			.from("alerts")
			.select("message, severity")
			.eq("is_read", false)
			.limit(5);

		// 2. Generate Summary with AI
		const prompt = `
      You are an operations assistant for a logistics company.
      Summarize the current status based on these metrics:
      - New shipments today: ${shipmentCount || 0}
      - Open support tickets: ${ticketsCount || 0}
      - Recent alerts: ${JSON.stringify(alerts)}

      Provide a concise 2-sentence summary for the dashboard header.
    `;

		const { text } = await generateText({
			model: openai("gpt-4o-mini"),
			prompt: prompt,
		});

		return new Response(JSON.stringify({ summary: text }), {
			headers: { "Content-Type": "application/json" },
		});
		// biome-ignore lint/suspicious/noExplicitAny: Standard error handling
	} catch (error: any) {
		return new Response(
			JSON.stringify({ error: error.message || "Unknown error" }),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			},
		);
	}
});
