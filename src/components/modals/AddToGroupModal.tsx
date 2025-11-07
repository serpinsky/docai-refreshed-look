import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Group } from "@/types/group";
import { FolderPlus, Plus } from "lucide-react";

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
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
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

  const createGroup = async () => {
    if (!newGroupName.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите название группы",
        variant: "destructive",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('groups')
      .insert({
        name: newGroupName,
        description: newGroupDescription,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось создать группу",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Успешно",
      description: "Группа создана",
    });

    setNewGroupName("");
    setNewGroupDescription("");
    setShowCreateForm(false);
    await loadGroups();
    
    // Автоматически выбираем созданную группу
    if (data) {
      setSelectedGroupIds([data.id]);
    }
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
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              Выбрано документов: {selectedDocumentIds.length}
            </p>
            {!showCreateForm && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateForm(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Создать группу
              </Button>
            )}
          </div>

          {showCreateForm ? (
            <div className="space-y-4 p-4 border rounded-lg">
              <Input
                placeholder="Название группы"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
              />
              <Textarea
                placeholder="Описание (необязательно)"
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewGroupName("");
                    setNewGroupDescription("");
                  }}
                >
                  Отмена
                </Button>
                <Button className="flex-1" onClick={createGroup}>
                  Создать
                </Button>
              </div>
            </div>
          ) : groups.length === 0 ? (
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
