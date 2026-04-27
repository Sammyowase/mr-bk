/* eslint-disable @typescript-eslint/no-explicit-any */
export interface TemplateData {
  [key: string]: any;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

