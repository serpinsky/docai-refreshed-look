import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Document, DocumentMetrics } from "@/types/document";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { FileText, BarChart3, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
// @ts-ignore - DiffMatchPatch types
import DiffMatchPatch from "diff-match-patch";

interface VisualCompareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documents: [Document, Document];
}

interface DiffResult {
  type: "equal" | "insert" | "delete";
  text: string;
}

export const VisualCompareModal = ({
  open,
  onOpenChange,
  documents,
}: VisualCompareModalProps) => {
  const [textDiff, setTextDiff] = useState<DiffResult[]>([]);

  useEffect(() => {
    if (documents.length === 2) {
      const dmp = new DiffMatchPatch();
      const text1 = documents[0].text || "";
      const text2 = documents[1].text || "";
      
      const diffs = dmp.diff_main(text1, text2);
      dmp.diff_cleanupSemantic(diffs);
      
      const diffResults: DiffResult[] = diffs.map(([type, text]: [number, string]) => {
        if (type === -1) return { type: "delete", text };
        if (type === 1) return { type: "insert", text };
        return { type: "equal", text };
      });
      
      setTextDiff(diffResults);
    }
  }, [documents]);

  const renderDiffText = () => {
    return textDiff.map((diff, idx) => {
      if (diff.type === "equal") {
        return (
          <span key={idx} className="text-foreground">
            {diff.text}
          </span>
        );
      }
      if (diff.type === "delete") {
        return (
          <span
            key={idx}
            className="bg-destructive/20 text-destructive line-through px-1 rounded"
          >
            {diff.text}
          </span>
        );
      }
      if (diff.type === "insert") {
        return (
          <span
            key={idx}
            className="bg-green-500/20 text-green-600 dark:text-green-400 px-1 rounded"
          >
            {diff.text}
          </span>
        );
      }
    });
  };

  const compareMetricValue = (
    key: string,
    value1: any,
    value2: any
  ): "equal" | "different" | "missing" => {
    const v1 = value1?.[key];
    const v2 = value2?.[key];
    
    if (v1 === undefined && v2 === undefined) return "missing";
    if (v1 === undefined || v2 === undefined) return "different";
    
    if (Array.isArray(v1) && Array.isArray(v2)) {
      return JSON.stringify(v1.sort()) === JSON.stringify(v2.sort())
        ? "equal"
        : "different";
    }
    
    return v1 === v2 ? "equal" : "different";
  };

  const renderMetricComparison = (key: string) => {
    const m1 = documents[0].metrics;
    const m2 = documents[1].metrics;
    const status = compareMetricValue(key, m1, m2);
    
    const formatValue = (val: any) => {
      if (val === undefined || val === null) return "—";
      if (Array.isArray(val)) return val.join(", ");
      return val.toString();
    };

    return (
      <div className="space-y-2 p-4 bg-muted/30 rounded-lg border border-border">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-foreground">{key}</div>
          {status === "equal" ? (
            <Badge variant="secondary" className="text-xs">Совпадает</Badge>
          ) : status === "different" ? (
            <Badge variant="destructive" className="text-xs">Различается</Badge>
          ) : (
            <Badge variant="outline" className="text-xs">Отсутствует</Badge>
          )}
        </div>
        
        <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-center">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">{documents[0].name}</div>
            <div
              className={`text-sm p-2 rounded ${
                status === "different"
                  ? "bg-destructive/10 text-destructive font-medium"
                  : "bg-background"
              }`}
            >
              {formatValue(m1?.[key as keyof DocumentMetrics])}
            </div>
          </div>
          
          <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">{documents[1].name}</div>
            <div
              className={`text-sm p-2 rounded ${
                status === "different"
                  ? "bg-green-500/10 text-green-600 dark:text-green-400 font-medium"
                  : "bg-background"
              }`}
            >
              {formatValue(m2?.[key as keyof DocumentMetrics])}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const metricsKeys = [
    "documentType",
    "amountWithVAT",
    "amountWithoutVAT",
    "vatAmount",
    "currency",
    "contractNumber",
    "date",
    "organizationName",
    "legalForm",
    "inn",
    "kpp",
    "bankName",
  ];

  if (!documents || documents.length !== 2) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Визуальное сравнение документов
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg text-sm">
          <Badge variant="outline">{documents[0].name}</Badge>
          <ArrowRight className="h-4 w-4" />
          <Badge variant="outline">{documents[1].name}</Badge>
        </div>

        <Tabs defaultValue="metrics" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="metrics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Метрики
            </TabsTrigger>
            <TabsTrigger value="text">
              <FileText className="h-4 w-4 mr-2" />
              Текст
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
            <div className="flex gap-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-destructive/20 border border-destructive/40 rounded"></div>
                <span className="text-muted-foreground">Удалено</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500/20 border border-green-500/40 rounded"></div>
                <span className="text-muted-foreground">Добавлено</span>
              </div>
            </div>
            
            <ScrollArea className="h-[500px]">
              <div className="p-4 bg-muted/30 rounded-lg text-sm whitespace-pre-wrap leading-relaxed">
                {renderDiffText()}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Закрыть
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
