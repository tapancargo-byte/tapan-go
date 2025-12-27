export function createOpenAI(config: {
	apiKey: string;
	// biome-ignore lint/suspicious/noExplicitAny: Generic factory
}): (model: string) => any;
