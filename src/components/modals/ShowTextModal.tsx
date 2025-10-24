import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, CheckCircle } from "lucide-react";
import { Document } from "@/types/document";

interface ShowTextModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: Document | null;
}

export const ShowTextModal = ({ open, onOpenChange, document }: ShowTextModalProps) => {
  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5" />
              <DialogTitle>{document.name}</DialogTitle>
              <Badge variant="secondary" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                Обработан
              </Badge>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex items-center gap-6 text-sm text-muted-foreground py-2 border-b">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <span>Страниц: {document.pages}</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span>Слов: 0</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-primary" />
            <span>Символов: 0</span>
          </div>
        </div>

        <div className="border rounded-lg p-2 bg-muted/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="font-medium">Страница 1</span>
              <Badge variant="outline">{document.confidence}%</Badge>
            </div>
          </div>
          
          <ScrollArea className="h-[50vh]">
            <pre className="text-sm whitespace-pre-wrap font-mono p-4">
              {document.text || "Текст не распознан"}
            </pre>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
