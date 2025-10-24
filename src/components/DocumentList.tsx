import { useState } from "react";
import { DocumentCard } from "./DocumentCard";
import { ShowTextModal } from "./modals/ShowTextModal";
import { SearchModal } from "./modals/SearchModal";
import { ChatModal } from "./modals/ChatModal";
import { Document } from "@/types/document";
import { useToast } from "@/hooks/use-toast";

interface DocumentListProps {
  documents: Document[];
  onDeleteDocument: (id: string) => void;
}

export const DocumentList = ({ documents, onDeleteDocument }: DocumentListProps) => {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showTextModal, setShowTextModal] = useState(false);
  const [searchModal, setSearchModal] = useState(false);
  const [chatModal, setChatModal] = useState(false);
  const { toast } = useToast();

  const handleShowText = (doc: Document) => {
    setSelectedDocument(doc);
    setShowTextModal(true);
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
        <h2 className="text-3xl font-bold mb-6">Загруженные документы</h2>
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
    </>
  );
};
