export type DocumentStatus = "recognized" | "error" | "uploaded" | "processing";

export interface Document {
  id: string;
  name: string;
  uploadDate: string;
  size: number;
  pages: number;
  status: DocumentStatus;
  confidence?: number;
  text?: string;
}
