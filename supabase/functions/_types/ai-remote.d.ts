export interface GenerateTextResult {
  text: string;
  [key: string]: any;
}

export function generateText(args: any): Promise<GenerateTextResult>;
