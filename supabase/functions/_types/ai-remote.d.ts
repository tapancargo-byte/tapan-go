export interface GenerateTextResult {
	text: string;
	// biome-ignore lint/suspicious/noExplicitAny: Dynamic key
	[key: string]: any;
}

// biome-ignore lint/suspicious/noExplicitAny: Generic args
export function generateText(args: any): Promise<GenerateTextResult>;
