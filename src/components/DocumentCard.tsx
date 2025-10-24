import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Search, MessageSquare, Download, Trash2 } from "lucide-react";
import { Document, DocumentStatus } from "@/types/document";

interface DocumentCardProps {
  document: Document;
  onShowText: (doc: Document) => void;
  onSearch: (doc: Document) => void;
  onChat: (doc: Document) => void;
  onExport: (doc: Document) => void;
  onDelete: (id: string) => void;
}

const statusConfig: Record<DocumentStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  recognized: { label: "Распознано", variant: "secondary" },
  error: { label: "Ошибка", variant: "destructive" },
  uploaded: { label: "Загружен", variant: "outline" },
  processing: { label: "Обработан", variant: "default" }
};

export const DocumentCard = ({ 
  document, 
  onShowText, 
  onSearch, 
  onChat, 
  onExport,
  onDelete 
}: DocumentCardProps) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  };

  const formatSize = (bytes: number) => {
    return (bytes / 1024).toFixed(2) + " KB";
  };

  const status = statusConfig[document.status];

  return (
    <Card className="p-4 hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-5 w-5 text-primary flex-shrink-0" />
            <h3 className="font-semibold truncate">{document.name}</h3>
          </div>
          
          <p className="text-sm text-muted-foreground mb-3">
            Загружен: {formatDate(document.uploadDate)} | Размер: {formatSize(document.size)} | Страниц: {document.pages}
            {document.confidence && ` | Уверенность OCR: ${document.confidence}%`}
          </p>

          <div className="flex flex-wrap gap-2">
            <Button 
              size="sm" 
              variant="default"
              onClick={() => onShowText(document)}
              className="bg-success hover:bg-success/90"
            >
              <FileText className="h-3 w-3 mr-1" />
              Показать текст
            </Button>
            
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onSearch(document)}
            >
              <Search className="h-3 w-3 mr-1" />
              Искать в документе
            </Button>
            
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onChat(document)}
            >
              <MessageSquare className="h-3 w-3 mr-1" />
              Чат с документом
            </Button>
            
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onExport(document)}
            >
              <Download className="h-3 w-3 mr-1" />
              Экспорт MD
            </Button>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <Badge variant={status.variant}>{status.label}</Badge>
          <Button 
            size="icon" 
            variant="ghost"
            onClick={() => onDelete(document.id)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
