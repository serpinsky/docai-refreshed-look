import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FolderPlus, Folder, Trash2, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Group } from "@/types/group";

interface GroupManagerProps {
  onSelectGroup: (groupId: string | null) => void;
  selectedGroupId: string | null;
}

export const GroupManager = ({ onSelectGroup, selectedGroupId }: GroupManagerProps) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [documentCounts, setDocumentCounts] = useState<Record<string, number>>({});
  const { toast } = useToast();

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    if (groups.length > 0) {
      loadDocumentCounts();
    }
  }, [groups]);

  const loadGroups = async () => {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .order('created_at', { ascending: false });

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

  const loadDocumentCounts = async () => {
    const counts: Record<string, number> = {};
    
    for (const group of groups) {
      const { count } = await supabase
        .from('document_groups')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', group.id);
      
      counts[group.id] = count || 0;
    }
    
    setDocumentCounts(counts);
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

    const { error } = await supabase
      .from('groups')
      .insert({
        name: newGroupName,
        description: newGroupDescription,
        user_id: user.id,
      });

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
    setIsCreateDialogOpen(false);
    loadGroups();
  };

  const deleteGroup = async (groupId: string) => {
    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', groupId);

    if (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить группу",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Успешно",
      description: "Группа удалена",
    });

    if (selectedGroupId === groupId) {
      onSelectGroup(null);
    }
    loadGroups();
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Группы документов</h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <FolderPlus className="h-4 w-4 mr-2" />
              Создать группу
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Создать новую группу</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Input
                  placeholder="Название группы"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                />
              </div>
              <div>
                <Textarea
                  placeholder="Описание (необязательно)"
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                />
              </div>
              <Button onClick={createGroup} className="w-full">
                Создать
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button
          variant={selectedGroupId === null ? "default" : "outline"}
          size="sm"
          onClick={() => onSelectGroup(null)}
        >
          <FileText className="h-4 w-4 mr-2" />
          Все документы
        </Button>
        {groups.map((group) => (
          <Card
            key={group.id}
            className={`px-3 py-2 flex items-center gap-2 cursor-pointer transition-colors ${
              selectedGroupId === group.id ? 'border-primary bg-primary/10' : ''
            }`}
            onClick={() => onSelectGroup(group.id)}
          >
            <Folder className="h-4 w-4" />
            <span className="text-sm font-medium">{group.name}</span>
            <span className="text-xs text-muted-foreground">
              ({documentCounts[group.id] || 0})
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 ml-2"
              onClick={(e) => {
                e.stopPropagation();
                deleteGroup(group.id);
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};
