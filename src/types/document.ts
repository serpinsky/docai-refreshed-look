export type DocumentStatus = "recognized" | "error" | "uploaded" | "processing";

export interface DocumentMetrics {
  documentType?: string;
  counterparties?: string[];
  amountWithVAT?: number;
  amountWithoutVAT?: number;
  vatAmount?: number;
  currency?: string;
  contractNumber?: string;
  date?: string;
  [key: string]: any; // for additional flexible metrics
}

export interface Document {
  id: string;
  name: string;
  uploadDate: string;
  size: number;
  pages: number;
  status: DocumentStatus;
  confidence?: number;
  text?: string;
  metrics?: DocumentMetrics;
}
