import { useState, useEffect } from "react";
import { DocumentCard } from "./DocumentCard";
import { ShowTextModal } from "./modals/ShowTextModal";
import { SearchModal } from "./modals/SearchModal";
import { ChatModal } from "./modals/ChatModal";
import { CreateSimilarModal } from "./modals/CreateSimilarModal";
import { AddToGroupModal } from "./modals/AddToGroupModal";
import { GroupChatModal } from "./modals/GroupChatModal";
import { Document } from "@/types/document";
import { Group } from "@/types/group";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, FolderPlus, MessageSquare, Folder, Trash2, FileText, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DocumentListProps {
  documents: Document[];
  onDeleteDocument: (id: string) => void;
  onRefresh?: () => void;
}

export const DocumentList = ({ 
  documents, 
  onDeleteDocument,
  onRefresh 
}: DocumentListProps) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [documentCounts, setDocumentCounts] = useState<Record<string, number>>({});
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showTextModal, setShowTextModal] = useState(false);
  const [searchModal, setSearchModal] = useState(false);
  const [chatModal, setChatModal] = useState(false);
  const [createSimilarModal, setCreateSimilarModal] = useState(false);
  const [addToGroupModal, setAddToGroupModal] = useState(false);
  const [groupChatModal, setGroupChatModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    if (groups.length > 0) {
      loadDocumentCounts();
    }
  }, [groups]);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchQuery, selectedGroupId]);

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
      setSelectedGroupId(null);
    }
    loadGroups();
  };

  const filterDocuments = async () => {
    let filtered = documents;

    if (selectedGroupId) {
      const { data: documentGroups } = await supabase
        .from('document_groups')
        .select('document_id')
        .eq('group_id', selectedGroupId);

      const groupDocumentIds = documentGroups?.map(dg => dg.document_id) || [];
      filtered = documents.filter(doc => groupDocumentIds.includes(doc.id));
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (doc) =>
          doc.name.toLowerCase().includes(query) ||
          doc.text?.toLowerCase().includes(query)
      );
    }

    setFilteredDocuments(filtered);
  };

  const toggleDocumentSelection = (docId: string) => {
    setSelectedDocumentIds((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  const selectAll = () => {
    if (selectedDocumentIds.length === filteredDocuments.length) {
      setSelectedDocumentIds([]);
    } else {
      setSelectedDocumentIds(filteredDocuments.map((doc) => doc.id));
    }
  };

  const handleShowText = (doc: Document) => {
    setSelectedDocument(doc);
    setShowTextModal(true);
  };

  const handleCreateSimilar = (doc: Document) => {
    setSelectedDocument(doc);
    setShowTextModal(false);
    setCreateSimilarModal(true);
  };

  const handleSearch = (doc: Document) => {
    setSelectedDocument(doc);
    setSearchModal(true);
  };

  const handleChat = (doc: Document) => {
    setSelectedDocument(doc);
    setChatModal(true);
  };

  const handleExport = (doc: Document, format: 'md' | 'docx' | 'xlsx') => {
    const formatNames = {
      md: 'Markdown',
      docx: 'Word',
      xlsx: 'Excel'
    };
    toast({
      title: `Экспорт ${formatNames[format]}`,
      description: `Документ ${doc.name} экспортирован в ${formatNames[format]}`,
    });
  };

  const handleDeleteFromGroup = async (docId: string) => {
    if (!selectedGroupId) return;

    const { error } = await supabase
      .from('document_groups')
      .delete()
      .eq('group_id', selectedGroupId)
      .eq('document_id', docId);

    if (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить документ из группы",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Успешно",
      description: "Документ удалён из группы",
    });

    onRefresh?.();
  };

  const handleBulkDelete = async () => {
    if (!selectedGroupId) return;

    const { error } = await supabase
      .from('document_groups')
      .delete()
      .eq('group_id', selectedGroupId)
      .in('document_id', selectedDocumentIds);

    if (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить документы из группы",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Успешно",
      description: `Удалено ${selectedDocumentIds.length} документов из группы`,
    });

    setSelectedDocumentIds([]);
    onRefresh?.();
  };

  const selectedGroup = groups.find(g => g.id === selectedGroupId);

  if (documents.length === 0) {
    return null;
  }

  return (
    <>
      <div className="max-w-6xl mx-auto mb-12">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Управление документами
            </h2>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="shadow-glow">
                  <Plus className="h-4 w-4 mr-2" />
                  Создать группу
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Создать новую группу</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
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
                  <Button onClick={createGroup} className="w-full">
                    Создать
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Tabs 
            value={selectedGroupId || "all"} 
            onValueChange={(value) => setSelectedGroupId(value === "all" ? null : value)}
            className="w-full"
          >
            <div className="relative">
              <TabsList className="w-full justify-start overflow-x-auto flex-nowrap bg-muted/50 p-1 rounded-lg">
                <TabsTrigger 
                  value="all" 
                  className="data-[state=active]:bg-card data-[state=active]:shadow-md transition-all"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Все документы
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({documents.length})
                  </span>
                </TabsTrigger>
                {groups.map((group) => (
                  <TabsTrigger 
                    key={group.id} 
                    value={group.id}
                    className="data-[state=active]:bg-card data-[state=active]:shadow-md transition-all group"
                  >
                    <Folder className="h-4 w-4 mr-2" />
                    {group.name}
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({documentCounts[group.id] || 0})
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteGroup(group.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value={selectedGroupId || "all"} className="mt-6 space-y-6">
              {selectedGroupId && (
                <div className="flex items-center justify-between p-4 bg-accent/30 rounded-lg border border-accent">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedGroup?.name}</h3>
                    {selectedGroup?.description && (
                      <p className="text-sm text-muted-foreground mt-1">{selectedGroup.description}</p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setGroupChatModal(true)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Чат по группе
                  </Button>
                </div>
              )}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder={selectedGroupId ? "Поиск в группе..." : "Поиск по всем документам..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-base bg-card shadow-sm"
                />
              </div>

              {selectedDocumentIds.length > 0 && (
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">{selectedDocumentIds.length}</span>
                    </div>
                    <span className="font-medium">
                      {selectedDocumentIds.length === 1 ? 'документ выбран' : `документов выбрано`}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {!selectedGroupId && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAddToGroupModal(true)}
                      >
                        <FolderPlus className="h-4 w-4 mr-2" />
                        Добавить в группу
                      </Button>
                    )}
                    {selectedGroupId && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBulkDelete}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Удалить из группы
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedDocumentIds([])}
                    >
                      Отменить
                    </Button>
                  </div>
                </div>
              )}

              {filteredDocuments.length > 0 && (
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <Checkbox
                    checked={selectedDocumentIds.length === filteredDocuments.length && filteredDocuments.length > 0}
                    onCheckedChange={selectAll}
                  />
                  <span className="text-sm font-medium">
                    Выбрать все ({filteredDocuments.length})
                  </span>
                </div>
              )}

              <div className="space-y-3">
                {filteredDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-start gap-3 group">
                    <Checkbox
                      checked={selectedDocumentIds.includes(doc.id)}
                      onCheckedChange={() => toggleDocumentSelection(doc.id)}
                      className="mt-6"
                    />
                    <div className="flex-1">
                      <DocumentCard
                        document={doc}
                        onShowText={handleShowText}
                        onSearch={handleSearch}
                        onChat={handleChat}
                        onExport={handleExport}
                        onDelete={selectedGroupId ? handleDeleteFromGroup : onDeleteDocument}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {filteredDocuments.length === 0 && (
                <div className="text-center py-16">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted/50 mb-4">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-medium text-muted-foreground">
                    {selectedGroupId 
                      ? "В этой группе пока нет документов"
                      : searchQuery 
                      ? "Документы не найдены" 
                      : "Нет документов"}
                  </p>
                  {selectedGroupId && !searchQuery && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Добавьте документы в группу, выбрав их на вкладке "Все документы"
                    </p>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <ShowTextModal 
        open={showTextModal} 
        onOpenChange={setShowTextModal}
        document={selectedDocument}
        onCreateSimilar={handleCreateSimilar}
      />
      
      <SearchModal 
        open={searchModal} 
        onOpenChange={setSearchModal}
        document={selectedDocument}
      />
      
      <ChatModal 
        open={chatModal} 
        onOpenChange={setChatModal}
        document={selectedDocument}
      />
      
      <CreateSimilarModal 
        open={createSimilarModal} 
        onOpenChange={setCreateSimilarModal}
        document={selectedDocument}
      />

      <AddToGroupModal
        open={addToGroupModal}
        onOpenChange={setAddToGroupModal}
        selectedDocumentIds={selectedDocumentIds}
        onSuccess={() => {
          setSelectedDocumentIds([]);
          onRefresh?.();
        }}
      />

      <GroupChatModal
        open={groupChatModal}
        onOpenChange={setGroupChatModal}
        groupName={selectedGroup?.name || ""}
        documentCount={filteredDocuments.length}
      />
    </>
  );
};
