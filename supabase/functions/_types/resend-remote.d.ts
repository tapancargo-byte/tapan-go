export class Resend {
	constructor(apiKey: string);
	emails: {
		// biome-ignore lint/suspicious/noExplicitAny: Generic input/output
		send(input: any): Promise<any>;
	};
}
