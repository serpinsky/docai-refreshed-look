import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Document } from "@/types/document";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, FileText, BarChart3 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CompareDocumentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documents: Document[];
}

export const CompareDocumentsModal = ({
  open,
  onOpenChange,
  documents,
}: CompareDocumentsModalProps) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [aiComparison, setAiComparison] = useState<string>("");

  const handleAIComparison = async () => {
    setAnalyzing(true);
    try {
      const comparisonText = documents
        .map((doc, idx) => `Документ ${idx + 1} "${doc.name}":\n${doc.text || "Текст не доступен"}`)
        .join("\n\n---\n\n");

      const { data, error } = await supabase.functions.invoke("analyze-document", {
        body: {
          text: comparisonText,
          documentName: "Сравнение документов",
          mode: "compare",
        },
      });

      if (error) throw error;

      setAiComparison(data.analysis || "Не удалось получить анализ");
    } catch (error) {
      console.error("Error comparing documents:", error);
      toast.error("Ошибка при сравнении документов");
    } finally {
      setAnalyzing(false);
    }
  };

  const renderMetricComparison = (key: string) => {
    const values = documents.map((doc) => doc.metrics?.[key]);
    const allSame = values.every((val) => val === values[0]);

    return (
      <div className="space-y-2 p-3 bg-muted/30 rounded-md">
        <div className="text-sm font-medium text-foreground flex items-center gap-2">
          {key}
          {allSame ? (
            <Badge variant="secondary" className="text-xs">Совпадает</Badge>
          ) : (
            <Badge variant="destructive" className="text-xs">Различается</Badge>
          )}
        </div>
        <div className="space-y-1">
          {documents.map((doc, idx) => (
            <div key={doc.id} className="text-xs">
              <span className="text-muted-foreground">Документ {idx + 1}:</span>{" "}
              <span className={allSame ? "text-foreground" : "text-primary font-medium"}>
                {doc.metrics?.[key]?.toString() || "—"}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const metricsKeys = [
    "documentType",
    "amountWithVAT",
    "amountWithoutVAT",
    "currency",
    "contractNumber",
    "date",
    "organizationName",
    "inn",
    "kpp",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Сравнение документов ({documents.length})</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="metrics" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="metrics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Метрики
            </TabsTrigger>
            <TabsTrigger value="text">
              <FileText className="h-4 w-4 mr-2" />
              Текст
            </TabsTrigger>
            <TabsTrigger value="ai">
              AI Анализ
            </TabsTrigger>
          </TabsList>

          <TabsContent value="metrics" className="space-y-4">
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-3">
                {metricsKeys.map((key) => (
                  <div key={key}>{renderMetricComparison(key)}</div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="text" className="space-y-4">
            <ScrollArea className="h-[500px]">
              <div className="space-y-4">
                {documents.map((doc, idx) => (
                  <div key={doc.id} className="space-y-2">
                    <div className="text-sm font-medium text-foreground">
                      Документ {idx + 1}: {doc.name}
                    </div>
                    <div className="p-4 bg-muted/30 rounded-md text-sm text-muted-foreground whitespace-pre-wrap">
                      {doc.text || "Текст не доступен"}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="ai" className="space-y-4">
            <div className="flex justify-end">
              <Button
                onClick={handleAIComparison}
                disabled={analyzing}
                size="sm"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Анализ...
                  </>
                ) : (
                  "Сравнить с помощью AI"
                )}
              </Button>
            </div>
            <ScrollArea className="h-[450px]">
              {aiComparison ? (
                <div className="p-4 bg-muted/30 rounded-md text-sm text-foreground whitespace-pre-wrap">
                  {aiComparison}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Нажмите кнопку для AI анализа различий
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
