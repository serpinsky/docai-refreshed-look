import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Document } from "@/types/document";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: Document | null;
}

export const SearchModal = ({ open, onOpenChange, document }: SearchModalProps) => {
  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Поиск в документе: {document.name}</DialogTitle>
        </DialogHeader>
        
        <div className="flex gap-2">
          <Input 
            placeholder="Введите текст для поиска..." 
            className="flex-1"
          />
          <Button>
            <Search className="h-4 w-4 mr-2" />
            Найти
          </Button>
        </div>

        <div className="text-sm text-muted-foreground text-center py-8">
          Результаты поиска будут отображены здесь
        </div>
      </DialogContent>
    </Dialog>
  );
};
