import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Document, DocumentMetrics } from "@/types/document";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { Save, FileText, Download, Trash2, Plus, Library, Search } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { templateLibrary, getTemplatesByCategory, searchTemplates } from "@/lib/templateLibrary";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Template {
  id: string;
  name: string;
  description: string;
  metrics: Partial<DocumentMetrics>;
  createdAt: string;
}

interface TemplatesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceDocument?: Document;
  onApplyTemplate?: (metrics: Partial<DocumentMetrics>) => void;
}

export const TemplatesModal = ({
  open,
  onOpenChange,
  sourceDocument,
  onApplyTemplate,
}: TemplatesModalProps) => {
  const [templates, setTemplates] = useState<Template[]>(() => {
    const saved = localStorage.getItem("documentTemplates");
    return saved ? JSON.parse(saved) : [];
  });
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
  });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [librarySearch, setLibrarySearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const saveTemplates = (updatedTemplates: Template[]) => {
    localStorage.setItem("documentTemplates", JSON.stringify(updatedTemplates));
    setTemplates(updatedTemplates);
  };

  const handleSaveAsTemplate = () => {
    if (!sourceDocument?.metrics) {
      toast.error("Нет данных для создания шаблона");
      return;
    }

    if (!newTemplate.name.trim()) {
      toast.error("Введите название шаблона");
      return;
    }

    const template: Template = {
      id: crypto.randomUUID(),
      name: newTemplate.name,
      description: newTemplate.description,
      metrics: sourceDocument.metrics,
      createdAt: new Date().toISOString(),
    };

    const updated = [...templates, template];
    saveTemplates(updated);
    setNewTemplate({ name: "", description: "" });
    toast.success("Шаблон сохранен");
  };

  const handleDeleteTemplate = (id: string) => {
    const updated = templates.filter((t) => t.id !== id);
    saveTemplates(updated);
    setDeleteConfirm(null);
    toast.success("Шаблон удален");
  };

  const handleApplyTemplate = (template: Template) => {
    if (onApplyTemplate) {
      onApplyTemplate(template.metrics);
      toast.success(`Шаблон "${template.name}" применен`);
      onOpenChange(false);
    }
  };

  const handleExportTemplate = (template: Template) => {
    const blob = new Blob([JSON.stringify(template, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `template-${template.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Шаблон экспортирован");
  };

  const handleImportTemplate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string) as Template;
        imported.id = crypto.randomUUID(); // New ID for imported template
        const updated = [...templates, imported];
        saveTemplates(updated);
        toast.success("Шаблон импортирован");
      } catch (error) {
        toast.error("Ошибка импорта шаблона");
      }
    };
    reader.readAsText(file);
  };

  const handleApplyLibraryTemplate = (libraryTemplate: typeof templateLibrary[0]) => {
    if (onApplyTemplate) {
      onApplyTemplate(libraryTemplate.metrics);
      toast.success(`Шаблон "${libraryTemplate.name}" применен`);
      onOpenChange(false);
    }
  };

  const handleSaveFromLibrary = (libraryTemplate: typeof templateLibrary[0]) => {
    const template: Template = {
      id: crypto.randomUUID(),
      name: libraryTemplate.name,
      description: libraryTemplate.description,
      metrics: libraryTemplate.metrics,
      createdAt: new Date().toISOString(),
    };

    const updated = [...templates, template];
    saveTemplates(updated);
    toast.success(`Шаблон "${template.name}" добавлен в мои шаблоны`);
  };

  const getFilteredLibraryTemplates = () => {
    let filtered = templateLibrary;
    
    if (selectedCategory !== "all") {
      filtered = getTemplatesByCategory(selectedCategory);
    }
    
    if (librarySearch.trim()) {
      filtered = searchTemplates(librarySearch);
    }
    
    return filtered;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Шаблоны документов</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="library" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="library">
                <Library className="h-4 w-4 mr-2" />
                Библиотека
              </TabsTrigger>
              <TabsTrigger value="list">
                <FileText className="h-4 w-4 mr-2" />
                Мои шаблоны
              </TabsTrigger>
              {sourceDocument && (
                <TabsTrigger value="create">
                  <Plus className="h-4 w-4 mr-2" />
                  Создать
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="library" className="space-y-4">
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск шаблонов..."
                    value={librarySearch}
                    onChange={(e) => setLibrarySearch(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Badge
                    variant={selectedCategory === "all" ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory("all")}
                  >
                    Все
                  </Badge>
                  <Badge
                    variant={selectedCategory === "contract" ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory("contract")}
                  >
                    Договоры
                  </Badge>
                  <Badge
                    variant={selectedCategory === "invoice" ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory("invoice")}
                  >
                    Счета
                  </Badge>
                  <Badge
                    variant={selectedCategory === "act" ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory("act")}
                  >
                    Акты
                  </Badge>
                  <Badge
                    variant={selectedCategory === "payment" ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory("payment")}
                  >
                    Платежи
                  </Badge>
                </div>
              </div>

              <ScrollArea className="h-[450px] pr-4">
                {getFilteredLibraryTemplates().length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Шаблоны не найдены
                  </div>
                ) : (
                  <div className="space-y-3">
                    {getFilteredLibraryTemplates().map((template) => (
                      <div
                        key={template.id}
                        className="p-4 border border-border rounded-lg space-y-3 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <div className="font-medium text-foreground">
                              {template.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {template.description}
                            </div>
                            <div className="flex gap-1 flex-wrap mt-2">
                              {template.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {onApplyTemplate && (
                            <Button
                              size="sm"
                              onClick={() => handleApplyLibraryTemplate(template)}
                            >
                              Применить
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSaveFromLibrary(template)}
                          >
                            <Save className="h-4 w-4 mr-2" />
                            Сохранить в мои
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="list" className="space-y-4">
              <div className="flex justify-end">
                <label htmlFor="import-template">
                  <Button variant="outline" size="sm" asChild>
                    <span>
                      <Download className="h-4 w-4 mr-2" />
                      Импорт
                    </span>
                  </Button>
                </label>
                <input
                  id="import-template"
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImportTemplate}
                />
              </div>

              <ScrollArea className="h-[500px] pr-4">
                {templates.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Нет сохраненных шаблонов
                  </div>
                ) : (
                  <div className="space-y-3">
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        className="p-4 border border-border rounded-lg space-y-3 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <div className="font-medium text-foreground">
                              {template.name}
                            </div>
                            {template.description && (
                              <div className="text-sm text-muted-foreground">
                                {template.description}
                              </div>
                            )}
                            <div className="text-xs text-muted-foreground">
                              Создан: {new Date(template.createdAt).toLocaleDateString("ru-RU")}
                            </div>
                          </div>
                          <Badge variant="secondary" className="ml-2">
                            {Object.keys(template.metrics).length} полей
                          </Badge>
                        </div>

                        <div className="flex gap-2">
                          {onApplyTemplate && (
                            <Button
                              size="sm"
                              onClick={() => handleApplyTemplate(template)}
                            >
                              Применить
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleExportTemplate(template)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Экспорт
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDeleteConfirm(template.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            {sourceDocument && (
              <TabsContent value="create" className="space-y-4">
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="template-name">Название шаблона *</Label>
                      <Input
                        id="template-name"
                        placeholder="Например: Договор поставки"
                        value={newTemplate.name}
                        onChange={(e) =>
                          setNewTemplate({ ...newTemplate, name: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="template-description">Описание</Label>
                      <Textarea
                        id="template-description"
                        placeholder="Краткое описание шаблона..."
                        value={newTemplate.description}
                        onChange={(e) =>
                          setNewTemplate({
                            ...newTemplate,
                            description: e.target.value,
                          })
                        }
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Данные из документа</Label>
                      <div className="p-4 bg-muted/30 rounded-md space-y-2 text-sm">
                        {sourceDocument.metrics ? (
                          Object.entries(sourceDocument.metrics).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-muted-foreground">{key}:</span>
                              <span className="text-foreground font-medium">
                                {Array.isArray(value)
                                  ? value.join(", ")
                                  : value?.toString() || "—"}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="text-muted-foreground">Нет данных</div>
                        )}
                      </div>
                    </div>

                    <Button onClick={handleSaveAsTemplate} className="w-full">
                      <Save className="h-4 w-4 mr-2" />
                      Сохранить шаблон
                    </Button>
                  </div>
                </ScrollArea>
              </TabsContent>
            )}
          </Tabs>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить шаблон?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Шаблон будет удален навсегда.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDeleteTemplate(deleteConfirm)}
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
