import { useState, useEffect } from "react";
import { DocumentCard } from "./DocumentCard";
import { ShowTextModal } from "./modals/ShowTextModal";
import { SearchModal } from "./modals/SearchModal";
import { ChatModal } from "./modals/ChatModal";
import { CreateSimilarModal } from "./modals/CreateSimilarModal";
import { AddToGroupModal } from "./modals/AddToGroupModal";
import { GroupChatModal } from "./modals/GroupChatModal";
import { Document } from "@/types/document";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, FolderPlus, MessageSquare, Sparkles, FileDown, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DocumentListProps {
  documents: Document[];
  onDeleteDocument: (id: string) => void;
  selectedGroupId: string | null;
  groupName?: string;
  onRefresh?: () => void;
}

export const DocumentList = ({ 
  documents, 
  onDeleteDocument, 
  selectedGroupId, 
  groupName,
  onRefresh 
}: DocumentListProps) => {
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
    filterDocuments();
  }, [documents, searchQuery, selectedGroupId]);

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

  if (documents.length === 0) {
    return null;
  }

  return (
    <>
      <div className="max-w-5xl mx-auto mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">
            {selectedGroupId ? `Группа: ${groupName}` : "Загруженные документы"}
          </h2>
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
        </div>
        
        <div className="flex justify-center mb-6">
          <div className="relative w-full max-w-2xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder={selectedGroupId ? "Поиск в группе..." : "Поиск по документам..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {selectedDocumentIds.length > 0 && (
          <div className="mb-4 p-4 bg-muted/50 rounded-lg flex items-center justify-between">
            <span className="text-sm font-medium">
              Выбрано документов: {selectedDocumentIds.length}
            </span>
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
                variant="outline"
                size="sm"
                onClick={() => setSelectedDocumentIds([])}
              >
                Отменить выбор
              </Button>
            </div>
          </div>
        )}

        {filteredDocuments.length > 0 && (
          <div className="mb-4 flex items-center gap-2">
            <Checkbox
              checked={selectedDocumentIds.length === filteredDocuments.length}
              onCheckedChange={selectAll}
            />
            <span className="text-sm text-muted-foreground">
              Выбрать все
            </span>
          </div>
        )}

        <div className="space-y-4">
          {filteredDocuments.map((doc) => (
            <div key={doc.id} className="flex items-start gap-3">
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
          <div className="text-center py-12 text-muted-foreground">
            {selectedGroupId 
              ? "В этой группе пока нет документов"
              : searchQuery 
              ? "Документы не найдены" 
              : "Нет документов"}
          </div>
        )}
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
        groupName={groupName || ""}
        documentCount={filteredDocuments.length}
      />
    </>
  );
};
