import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send } from "lucide-react";
import { Document } from "@/types/document";

interface ChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: Document | null;
}

export const ChatModal = ({ open, onOpenChange, document }: ChatModalProps) => {
  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Чат с документом: {document.name}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 p-4 bg-muted/20 rounded-lg">
          <div className="text-sm text-muted-foreground text-center py-8">
            Задайте вопрос о содержании документа
          </div>
        </ScrollArea>

        <div className="flex gap-2 pt-4 border-t">
          <Input 
            placeholder="Введите ваш вопрос..." 
            className="flex-1"
          />
          <Button>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
