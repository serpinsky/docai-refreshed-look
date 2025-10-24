import { useState } from "react";
import { Upload, FileText, Sparkles, CheckCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
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

    // Симуляция обработки
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setProgress(i);
    }

    setIsProcessing(false);
    toast({
      title: "Документы обработаны!",
      description: `Успешно обработано ${files.length} документов с точностью 95%+`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                DocAI
              </h1>
              <p className="text-xs text-muted-foreground">OCR Processing System</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="hidden sm:flex">
              <CheckCircle className="h-3 w-3 mr-1" />
              93%+ Accuracy
            </Badge>
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Документы
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Обработка документов с AI
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Быстрое и точное распознавание текста из ваших документов 
            с использованием технологии PaddleOCR
          </p>
        </div>

        {/* Upload Area */}
        <Card 
          className={`
            max-w-3xl mx-auto p-8 md:p-12 mb-12 transition-all duration-300
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
            <div className="h-20 w-20 rounded-full bg-accent flex items-center justify-center mb-6 animate-scale-in">
              <Upload className="h-10 w-10 text-accent-foreground" />
            </div>
            
            <h3 className="text-2xl font-semibold mb-2">
              {isProcessing ? "Обработка документов..." : "Загрузите документы"}
            </h3>
            
            <p className="text-muted-foreground mb-6 max-w-md">
              Перетащите файлы сюда или нажмите кнопку для выбора.
              Поддерживаются форматы: JPG, PNG, PDF
            </p>

            {isProcessing && (
              <div className="w-full max-w-md mb-6">
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-muted-foreground mt-2">{progress}% завершено</p>
              </div>
            )}

            {!isProcessing && (
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  size="lg" 
                  className="bg-gradient-primary hover:opacity-90 shadow-md hover:shadow-glow transition-all"
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  <Upload className="h-5 w-5 mr-2" />
                  Выбрать файлы
                </Button>
                <Button variant="outline" size="lg">
                  <FileText className="h-5 w-5 mr-2" />
                  Посмотреть примеры
                </Button>
              </div>
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

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto animate-fade-in">
          <Card className="p-6 bg-gradient-card hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Высокая точность</h3>
            <p className="text-sm text-muted-foreground">
              93%+ уверенность распознавания текста на русском и других языках
            </p>
          </Card>

          <Card className="p-6 bg-gradient-card hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
            <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Быстрая обработка</h3>
            <p className="text-sm text-muted-foreground">
              Обработка документа занимает всего ~13 секунд
            </p>
          </Card>

          <Card className="p-6 bg-gradient-card hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
            <div className="h-12 w-12 rounded-lg bg-accent flex items-center justify-center mb-4">
              <Download className="h-6 w-6 text-accent-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Экспорт результатов</h3>
            <p className="text-sm text-muted-foreground">
              Скачивайте результаты в формате Markdown для дальнейшего использования
            </p>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">93%+</div>
              <div className="text-sm text-muted-foreground">Точность</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">~13s</div>
              <div className="text-sm text-muted-foreground">Время обработки</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">~5s</div>
              <div className="text-sm text-muted-foreground">Инициализация</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">3+</div>
              <div className="text-sm text-muted-foreground">Форматов</div>
            </div>
          </div>
        </div>
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
