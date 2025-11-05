import { Document } from "@/types/document";
import { FileText, Calendar, FileType, Hash } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface DocumentPreviewProps {
  document: Document | null;
}

export const DocumentPreview = ({ document }: DocumentPreviewProps) => {
  if (!document) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/30 rounded-lg border-2 border-dashed border-border">
        <div className="text-center space-y-3">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <FileText className="h-10 w-10 text-muted-foreground" />
          </div>
          <div>
            <p className="text-lg font-medium text-foreground">
              Выберите документ
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Содержимое документа отобразится здесь
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: Document['status']) => {
    const variants = {
      recognized: { variant: "default" as const, label: "Распознан" },
      error: { variant: "destructive" as const, label: "Ошибка" },
      uploaded: { variant: "secondary" as const, label: "Загружен" },
      processing: { variant: "outline" as const, label: "Обработка" }
    };
    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="h-full flex flex-col bg-card rounded-lg border border-border shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-border space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-semibold text-foreground truncate mb-2">
              {document.name}
            </h3>
            {getStatusBadge(document.status)}
          </div>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {new Date(document.uploadDate).toLocaleDateString('ru-RU')}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <FileType className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {(document.size / 1024).toFixed(1)} KB
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {document.pages} {document.pages === 1 ? 'страница' : 'страниц'}
            </span>
          </div>
          {document.confidence && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Точность:</span>
              <span className="font-medium text-foreground">
                {(document.confidence * 100).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6">
            {document.text ? (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <pre className="whitespace-pre-wrap font-sans text-sm text-foreground leading-relaxed bg-muted/30 p-4 rounded-md border border-border">
                  {document.text}
                </pre>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  Содержимое документа недоступно
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
