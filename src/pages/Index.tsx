import { useState } from "react";
import { Upload, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { DocumentList } from "@/components/DocumentList";
import { Document } from "@/types/document";
import { UserMenu } from "@/components/UserMenu";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "1",
      name: "doc_2_page_1.jpg",
      uploadDate: "2025-10-24T03:48:58",
      size: 288450,
      pages: 1,
      status: "recognized",
      confidence: 93,
      text: `Заказ № 1
к договору № КТТК2025188 от 18.08.2025 г.
2025г.
г. Москва
«__»
Акционерное общество «Компания ТрансТелеКом» (АО «Компания ТрансТелеКом»),
№ 0350/2025 от 01.08.2025 г., с одной стороны, и Общество с ограниченной ответственностью
«Инко-Т» (ООО «Инко-Т»), именуемое в дальнейшем «Поставщик», в лице Генерального
директора Горбачева Максима Николаевича, действующего на основании Устава, с другой
стороны, далее совместно именуемые «Стороны», а по отдельности – «Сторона», заключили
настоящий Заказ (далее – «Заказ») о нижеследующем:
1. Поставщик обязуется поставить, а Покупатель принять и оплатить Товар,
и
Заказе:
Кол-во,`,
      metrics: {
        documentType: "Договор поставки",
        counterparties: ["АО «Компания ТрансТелеКом»", "ООО «Инко-Т»"],
        amountWithVAT: 1500000,
        amountWithoutVAT: 1250000,
        vatAmount: 250000,
        currency: "₽",
        contractNumber: "КТТК2025188",
        date: "18.08.2025"
      }
    },
    {
      id: "2",
      name: "doc_2_page_1.jpg",
      uploadDate: "2025-10-24T03:46:50",
      size: 288450,
      pages: 1,
      status: "error"
    },
    {
      id: "3",
      name: "doc_2_page_1.jpg",
      uploadDate: "2025-10-23T22:40:55",
      size: 288450,
      pages: 1,
      status: "uploaded"
    },
    {
      id: "4",
      name: "doc_2_page_1.jpg",
      uploadDate: "2025-10-23T22:01:06",
      size: 288450,
      pages: 1,
      status: "processing",
      confidence: 93.09
    }
  ]);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await processFiles(files);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      await processFiles(files);
    }
  };

  const processFiles = async (files: File[]) => {
    setIsProcessing(true);
    setProgress(0);

    try {
      // Симуляция обработки
      for (let i = 0; i <= 50; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setProgress(i);
      }

      const file = files[0];
      
      // Симуляция OCR текста (в реальном приложении это будет настоящее распознавание)
      const mockText = `Заказ № ${Math.floor(Math.random() * 1000)}
к договору № ДОГ${Math.floor(Math.random() * 10000)} от ${new Date().toLocaleDateString('ru-RU')}
АО «Компания Пример», именуемое в дальнейшем «Покупатель», с одной стороны, 
и ООО «Контрагент», именуемое в дальнейшем «Поставщик», с другой стороны.
Сумма договора: ${Math.floor(Math.random() * 5000000)} рублей с НДС.`;

      // Создаем документ со статусом processing
      const newDoc: Document = {
        id: Date.now().toString(),
        name: file.name,
        uploadDate: new Date().toISOString(),
        size: file.size,
        pages: 1,
        status: "processing",
        confidence: 93,
        text: mockText
      };
      
      setDocuments(prev => [newDoc, ...prev]);
      setProgress(60);

      // Вызываем AI анализ
      console.log("Starting AI analysis for document:", newDoc.name);
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke(
        'analyze-document',
        {
          body: { text: mockText, documentName: file.name }
        }
      );

      setProgress(90);

      if (analysisError) {
        console.error("Analysis error:", analysisError);
        toast({
          title: "Ошибка анализа",
          description: "Не удалось проанализировать документ",
          variant: "destructive",
        });
        
        // Обновляем документ со статусом recognized без метрик
        setDocuments(prev => prev.map(doc => 
          doc.id === newDoc.id 
            ? { ...doc, status: "recognized" as const }
            : doc
        ));
      } else {
        console.log("Analysis completed:", analysisData);
        
        // Обновляем документ с метриками
        setDocuments(prev => prev.map(doc => 
          doc.id === newDoc.id 
            ? { ...doc, status: "recognized" as const, metrics: analysisData.metrics }
            : doc
        ));

        toast({
          title: "Документ проанализирован!",
          description: `Тип: ${analysisData.metrics?.documentType || 'Не определён'}`,
        });
      }

      setProgress(100);
    } catch (error) {
      console.error("Processing error:", error);
      toast({
        title: "Ошибка обработки",
        description: "Не удалось обработать документ",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    toast({
      title: "Документ удалён",
      description: "Документ успешно удалён из списка",
    });
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleUpdateMetrics = (documentId: string, metrics: any) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === documentId 
        ? { ...doc, metrics }
        : doc
    ));
    toast({
      title: "Обновлено",
      description: "Данные документа обновлены",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
                <FileText className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  DocAI MVP
                </h1>
                <p className="text-xs text-muted-foreground">Загрузка и обработка документов</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Sparkles className="h-4 w-4 mr-2" />
                Постобработка
              </Button>
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Upload Area */}
        <Card 
          className={`
            max-w-5xl mx-auto p-8 md:p-12 mb-12 transition-all duration-300
            ${isDragging ? 'border-primary border-2 scale-[1.02] shadow-glow' : 'border-dashed border-2'}
            ${isProcessing ? 'opacity-60 pointer-events-none' : ''}
            hover:border-primary/50 hover:shadow-lg
            bg-gradient-card
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center text-center">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 animate-scale-in">
              <Upload className="h-10 w-10 text-primary" />
            </div>
            
            <h3 className="text-2xl font-semibold mb-2">
              {isProcessing ? "Обработка документов..." : "Перетащите файлы сюда"}
            </h3>
            
            <p className="text-muted-foreground mb-2">
              или нажмите для выбора файлов
            </p>
            
            <p className="text-sm text-muted-foreground mb-6">
              Поддерживаемые форматы: PDF, JPG, PNG (макс. 50МБ)
            </p>

            {isProcessing && (
              <div className="w-full max-w-md mb-6">
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-muted-foreground mt-2">{progress}% завершено</p>
              </div>
            )}

            {!isProcessing && (
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => document.getElementById('file-input')?.click()}
              >
                Загрузить файл
              </Button>
            )}

            <input
              id="file-input"
              type="file"
              multiple
              accept="image/*,.pdf"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
        </Card>

        {/* Documents List */}
        <DocumentList 
          key={refreshKey}
          documents={documents}
          onDeleteDocument={handleDeleteDocument}
          onRefresh={handleRefresh}
          onUpdateMetrics={handleUpdateMetrics}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-24 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>DocAI MVP - Система обработки документов с использованием PaddleOCR</p>
          <p className="mt-2">Powered by FastAPI, Python 3.13 & PostgreSQL</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
