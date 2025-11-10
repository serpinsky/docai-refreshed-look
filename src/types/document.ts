export type DocumentStatus = "recognized" | "error" | "uploaded" | "processing";

export interface DocumentMetrics {
  documentType?: string;
  category?: string;
  counterparties?: string[];
  amountWithVAT?: number;
  amountWithoutVAT?: number;
  vatAmount?: number;
  currency?: string;
  contractNumber?: string;
  date?: string;
  
  // Personal and address data
  fullNames?: string[];
  addresses?: string[];
  dates?: string[];
  amounts?: string[];
  
  // Legal information
  organizationName?: string;
  legalForm?: string;
  
  // Payment and requisites
  bankName?: string;
  accountNumber?: string;
  bik?: string;
  kbk?: string;
  inn?: string;
  oktmo?: string;
  kpp?: string;
  
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
