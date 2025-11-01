import { useState } from "react";
import { DocumentCard } from "./DocumentCard";
import { ShowTextModal } from "./modals/ShowTextModal";
import { SearchModal } from "./modals/SearchModal";
import { ChatModal } from "./modals/ChatModal";
import { CreateSimilarModal } from "./modals/CreateSimilarModal";
import { Document } from "@/types/document";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface DocumentListProps {
  documents: Document[];
  onDeleteDocument: (id: string) => void;
}

export const DocumentList = ({ documents, onDeleteDocument }: DocumentListProps) => {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showTextModal, setShowTextModal] = useState(false);
  const [searchModal, setSearchModal] = useState(false);
  const [chatModal, setChatModal] = useState(false);
  const [createSimilarModal, setCreateSimilarModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

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

  const handleExport = (doc: Document) => {
    toast({
      title: "Экспорт MD",
      description: `Документ ${doc.name} экспортирован в Markdown`,
    });
  };

  if (documents.length === 0) {
    return null;
  }

  return (
    <>
      <div className="max-w-5xl mx-auto mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">Загруженные документы</h2>
        </div>
        
        <div className="flex justify-center mb-6">
          <div className="relative w-full max-w-2xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Поиск по документам..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-4">
          {documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onShowText={handleShowText}
              onSearch={handleSearch}
              onChat={handleChat}
              onExport={handleExport}
              onDelete={onDeleteDocument}
            />
          ))}
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
    </>
  );
};
