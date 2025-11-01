import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Group } from "@/types/group";
import { FolderPlus } from "lucide-react";

interface AddToGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDocumentIds: string[];
  onSuccess: () => void;
}

export const AddToGroupModal = ({
  open,
  onOpenChange,
  selectedDocumentIds,
  onSuccess,
}: AddToGroupModalProps) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadGroups();
    }
  }, [open]);

  const loadGroups = async () => {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .order('name');

    if (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить группы",
        variant: "destructive",
      });
      return;
    }

    setGroups(data || []);
  };

  const handleAddToGroups = async () => {
    if (selectedGroupIds.length === 0) {
      toast({
        title: "Ошибка",
        description: "Выберите хотя бы одну группу",
        variant: "destructive",
      });
      return;
    }

    const insertData = selectedGroupIds.flatMap((groupId) =>
      selectedDocumentIds.map((documentId) => ({
        group_id: groupId,
        document_id: documentId,
      }))
    );

    const { error } = await supabase
      .from('document_groups')
      .insert(insertData);

    if (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось добавить документы в группы",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Успешно",
      description: `Добавлено ${selectedDocumentIds.length} документов в ${selectedGroupIds.length} групп`,
    });

    setSelectedGroupIds([]);
    onSuccess();
    onOpenChange(false);
  };

  const toggleGroup = (groupId: string) => {
    setSelectedGroupIds((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="h-5 w-5" />
            Добавить в группы
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            Выбрано документов: {selectedDocumentIds.length}
          </p>

          {groups.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Нет доступных групп. Создайте группу сначала.
            </p>
          ) : (
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-3">
                {groups.map((group) => (
                  <div
                    key={group.id}
                    className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                    onClick={() => toggleGroup(group.id)}
                  >
                    <Checkbox
                      checked={selectedGroupIds.includes(group.id)}
                      onCheckedChange={() => toggleGroup(group.id)}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{group.name}</p>
                      {group.description && (
                        <p className="text-sm text-muted-foreground">
                          {group.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Отмена
          </Button>
          <Button
            className="flex-1"
            onClick={handleAddToGroups}
            disabled={selectedGroupIds.length === 0}
          >
            Добавить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
