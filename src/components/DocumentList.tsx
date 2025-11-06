import { useState, useEffect } from "react";
import { DocumentPreview } from "./DocumentPreview";
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
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Search, FolderPlus, MessageSquare, Folder, Trash2, FileText, Plus, 
  Upload, Eye, Download, MoreVertical, X
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { 
  ResizablePanelGroup, 
  ResizablePanel, 
  ResizableHandle 
} from "@/components/ui/resizable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  const getStatusBadge = (status: Document['status']) => {
    const variants = {
      recognized: "default" as const,
      error: "destructive" as const,
      uploaded: "secondary" as const,
      processing: "outline" as const
    };
    return variants[status];
  };

  return (
    <>
      <div className="w-full mb-12">
        <div className="mb-4">
          <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent px-6">
            Управление документами
          </h2>
        </div>

        {/* Toolbar */}
        <div className="bg-card border-y border-border px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
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

            {!selectedGroupId && selectedDocumentIds.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAddToGroupModal(true)}
              >
                <FolderPlus className="h-4 w-4 mr-2" />
                Добавить в группу
              </Button>
            )}

            {selectedGroupId && selectedDocumentIds.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Удалить из группы
              </Button>
            )}

            {selectedGroupId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setGroupChatModal(true)}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Чат по группе
              </Button>
            )}

            {/* Document Actions - shown when a document is selected */}
            {selectedDocument && (
              <>
                <div className="h-6 w-px bg-border mx-2" />
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Экспорт
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleExport(selectedDocument, 'md')}>
                      Markdown (.md)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport(selectedDocument, 'docx')}>
                      Word (.docx)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport(selectedDocument, 'xlsx')}>
                      Excel (.xlsx)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleChat(selectedDocument)}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Чат
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShowText(selectedDocument)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Показать исходник
                </Button>

                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Поиск по документу..."
                    className="pl-9 h-9 text-sm"
                    onChange={(e) => handleSearch(selectedDocument)}
                  />
                </div>
              </>
            )}
          </div>

          {!selectedDocument && (
            <div className="flex items-center gap-2">
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder={selectedGroupId ? "Поиск в группе..." : "Поиск по всем документам..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* Groups Tabs */}
        <div className="bg-muted/30 border-b border-border px-6 py-2 flex items-center gap-1 overflow-x-auto">
          <Button
            variant={!selectedGroupId ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setSelectedGroupId(null)}
            className="shrink-0"
          >
            <FileText className="h-4 w-4 mr-2" />
            Все документы
            <Badge variant="secondary" className="ml-2">{documents.length}</Badge>
          </Button>
          {groups.map((group) => (
            <div key={group.id} className="flex items-center gap-1">
              <Button
                variant={selectedGroupId === group.id ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setSelectedGroupId(group.id)}
                className="shrink-0"
              >
                <Folder className="h-4 w-4 mr-2" />
                {group.name}
                <Badge variant="secondary" className="ml-2">{documentCounts[group.id] || 0}</Badge>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => deleteGroup(group.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>

        {/* Main Content Area */}
        <ResizablePanelGroup direction="horizontal" className="min-h-[600px]">
          {/* Left Panel - Document List */}
          <ResizablePanel defaultSize={40} minSize={30}>
            <div className="h-full flex flex-col bg-muted/10">
              {/* Select All Bar */}
              {filteredDocuments.length > 0 && (
                <div className="flex items-center gap-3 p-4 border-b border-border bg-card">
                  <Checkbox
                    checked={selectedDocumentIds.length === filteredDocuments.length && filteredDocuments.length > 0}
                    onCheckedChange={selectAll}
                  />
                  <span className="text-sm font-medium">
                    Выбрать все ({filteredDocuments.length})
                  </span>
                  {selectedDocumentIds.length > 0 && (
                    <Badge variant="default" className="ml-auto">
                      {selectedDocumentIds.length} выбрано
                    </Badge>
                  )}
                </div>
              )}

              {/* Document List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {filteredDocuments.map((doc) => (
                  <div 
                    key={doc.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                      selectedDocument?.id === doc.id 
                        ? 'bg-accent border-accent-foreground/20' 
                        : 'bg-card border-border hover:bg-accent/50'
                    }`}
                    onClick={() => setSelectedDocument(doc)}
                  >
                    <Checkbox
                      checked={selectedDocumentIds.includes(doc.id)}
                      onCheckedChange={() => toggleDocumentSelection(doc.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="h-4 w-4 text-primary shrink-0" />
                        <span className="font-medium text-sm truncate">{doc.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant={getStatusBadge(doc.status)} className="text-xs">
                          {doc.status}
                        </Badge>
                        <span>{doc.pages} стр.</span>
                        <span>{(doc.size / 1024).toFixed(1)} KB</span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleShowText(doc)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Показать текст
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSearch(doc)}>
                          <Search className="h-4 w-4 mr-2" />
                          Поиск
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleChat(doc)}>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Чат
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExport(doc, 'md')}>
                          <Download className="h-4 w-4 mr-2" />
                          Экспорт
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => selectedGroupId ? handleDeleteFromGroup(doc.id) : onDeleteDocument(doc.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Удалить
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}

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
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Panel - Document Preview */}
          <ResizablePanel defaultSize={60} minSize={40}>
            <div className="h-full p-6 bg-background overflow-hidden">
              <DocumentPreview document={selectedDocument} />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
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
