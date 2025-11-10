import { useState } from "react";
import { Archive as ArchiveIcon, Search, Filter, FileText, Calendar, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserMenu } from "@/components/UserMenu";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Document } from "@/types/document";

const CATEGORIES = [
  "Все категории",
  "Договоры",
  "Счета",
  "Акты",
  "Накладные",
  "Платежные документы",
  "Юридические документы",
  "Кадровые документы",
  "Прочее"
];

const Archive = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Все категории");
  const [dateFilter, setDateFilter] = useState("all");

  // Моковые данные архива (в реальном приложении будут из БД)
  const archivedDocuments: Document[] = [
    {
      id: "arch-1",
      name: "Договор поставки №123-2024.pdf",
      uploadDate: "2024-12-15T10:30:00",
      size: 450000,
      pages: 3,
      status: "recognized",
      confidence: 95,
      metrics: {
        documentType: "Договор поставки",
        category: "Договоры",
        contractNumber: "123-2024",
        date: "15.12.2024",
        amountWithVAT: 2500000,
        currency: "₽"
      }
    },
    {
      id: "arch-2",
      name: "Счет на оплату №456.pdf",
      uploadDate: "2024-12-10T14:20:00",
      size: 320000,
      pages: 1,
      status: "recognized",
      confidence: 98,
      metrics: {
        documentType: "Счет на оплату",
        category: "Счета",
        contractNumber: "456",
        date: "10.12.2024",
        amountWithVAT: 850000,
        currency: "₽"
      }
    },
    {
      id: "arch-3",
      name: "Акт выполненных работ №789.pdf",
      uploadDate: "2024-11-28T09:15:00",
      size: 280000,
      pages: 2,
      status: "recognized",
      confidence: 92,
      metrics: {
        documentType: "Акт выполненных работ",
        category: "Акты",
        contractNumber: "789",
        date: "28.11.2024",
        amountWithVAT: 1200000,
        currency: "₽"
      }
    },
    {
      id: "arch-4",
      name: "Платежное поручение №1011.pdf",
      uploadDate: "2024-11-20T16:45:00",
      size: 150000,
      pages: 1,
      status: "recognized",
      confidence: 99,
      metrics: {
        documentType: "Платежное поручение",
        category: "Платежные документы",
        contractNumber: "1011",
        date: "20.11.2024",
        amountWithVAT: 850000,
        currency: "₽"
      }
    },
    {
      id: "arch-5",
      name: "Договор аренды №234-2024.pdf",
      uploadDate: "2024-10-15T11:00:00",
      size: 520000,
      pages: 5,
      status: "recognized",
      confidence: 94,
      metrics: {
        documentType: "Договор аренды",
        category: "Договоры",
        contractNumber: "234-2024",
        date: "15.10.2024",
        amountWithVAT: 3500000,
        currency: "₽"
      }
    }
  ];

  const filteredDocuments = archivedDocuments.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.metrics?.documentType?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "Все категории" || 
                           doc.metrics?.category === selectedCategory;
    
    let matchesDate = true;
    if (dateFilter !== "all" && doc.uploadDate) {
      const docDate = new Date(doc.uploadDate);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - docDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch(dateFilter) {
        case "week":
          matchesDate = daysDiff <= 7;
          break;
        case "month":
          matchesDate = daysDiff <= 30;
          break;
        case "quarter":
          matchesDate = daysDiff <= 90;
          break;
        case "year":
          matchesDate = daysDiff <= 365;
          break;
      }
    }

    return matchesSearch && matchesCategory && matchesDate;
  });

  const getCategoryColor = (category?: string) => {
    switch(category) {
      case "Договоры": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "Счета": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "Акты": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "Накладные": return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "Платежные документы": return "bg-cyan-500/10 text-cyan-500 border-cyan-500/20";
      case "Юридические документы": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "Кадровые документы": return "bg-pink-500/10 text-pink-500 border-pink-500/20";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatAmount = (amount?: number, currency?: string) => {
    if (!amount) return "—";
    return `${amount.toLocaleString('ru-RU')} ${currency || '₽'}`;
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate("/")}
              >
                <FileText className="h-5 w-5" />
              </Button>
              <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
                <ArchiveIcon className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Архив документов</h1>
                <p className="text-xs text-muted-foreground">
                  {filteredDocuments.length} документов
                </p>
              </div>
            </div>
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="p-6 mb-6 bg-gradient-card">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск по названию или типу документа..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="w-full lg:w-64">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Filter */}
            <div className="w-full lg:w-48">
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Весь период</SelectItem>
                  <SelectItem value="week">Неделя</SelectItem>
                  <SelectItem value="month">Месяц</SelectItem>
                  <SelectItem value="quarter">Квартал</SelectItem>
                  <SelectItem value="year">Год</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Documents Grid */}
        {filteredDocuments.length === 0 ? (
          <Card className="p-12 text-center bg-gradient-card">
            <ArchiveIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Документы не найдены</h3>
            <p className="text-muted-foreground">
              Попробуйте изменить параметры поиска
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map(doc => (
              <Card 
                key={doc.id} 
                className="p-6 hover:shadow-lg transition-all cursor-pointer bg-gradient-card border-border hover:border-primary/50"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <Badge variant="outline" className={getCategoryColor(doc.metrics?.category)}>
                      <Tag className="h-3 w-3 mr-1" />
                      {doc.metrics?.category || "Прочее"}
                    </Badge>
                  </div>
                  {doc.confidence && (
                    <Badge variant="secondary" className="text-xs">
                      {doc.confidence}%
                    </Badge>
                  )}
                </div>

                <h3 className="font-semibold mb-2 line-clamp-2 text-foreground">
                  {doc.name}
                </h3>

                <div className="space-y-2 text-sm text-muted-foreground">
                  {doc.metrics?.documentType && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">Тип:</span>
                      <span>{doc.metrics.documentType}</span>
                    </div>
                  )}
                  
                  {doc.metrics?.date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      <span>{doc.metrics.date}</span>
                    </div>
                  )}

                  {doc.metrics?.amountWithVAT && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">Сумма:</span>
                      <span className="text-primary font-semibold">
                        {formatAmount(doc.metrics.amountWithVAT, doc.metrics.currency)}
                      </span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-border">
                    <span className="text-xs">
                      Загружен: {formatDate(doc.uploadDate)}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Archive;
