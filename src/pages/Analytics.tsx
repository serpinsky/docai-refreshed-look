import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserMenu } from "@/components/UserMenu";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Download, 
  TrendingUp, 
  DollarSign, 
  Building2,
  Calendar,
  PieChart,
  BarChart3,
  ArrowLeft
} from "lucide-react";
import { Document } from "@/types/document";

const Analytics = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [documents] = useState<Document[]>([
    {
      id: "1",
      name: "Договор поставки №123",
      uploadDate: "2025-10-24T03:48:58",
      size: 288450,
      pages: 1,
      status: "recognized",
      confidence: 93,
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
      name: "Счёт на оплату №456",
      uploadDate: "2025-10-23T03:48:58",
      size: 188450,
      pages: 1,
      status: "recognized",
      confidence: 95,
      metrics: {
        documentType: "Счёт на оплату",
        counterparties: ["ООО «Рога и Копыта»"],
        amountWithVAT: 750000,
        amountWithoutVAT: 625000,
        vatAmount: 125000,
        currency: "₽",
        contractNumber: "СЧ-456",
        date: "15.09.2025"
      }
    },
    {
      id: "3",
      name: "Акт выполненных работ №789",
      uploadDate: "2025-10-22T03:48:58",
      size: 205000,
      pages: 2,
      status: "recognized",
      confidence: 91,
      metrics: {
        documentType: "Акт выполненных работ",
        counterparties: ["ООО «СтройКомплект»"],
        amountWithVAT: 2500000,
        amountWithoutVAT: 2083333,
        vatAmount: 416667,
        currency: "₽",
        contractNumber: "АКТ-789",
        date: "10.10.2025"
      }
    }
  ]);

  const docsWithMetrics = documents.filter(doc => doc.metrics);
  
  const totalAmountWithVAT = docsWithMetrics.reduce(
    (sum, doc) => sum + (doc.metrics?.amountWithVAT || 0), 
    0
  );
  
  const totalAmountWithoutVAT = docsWithMetrics.reduce(
    (sum, doc) => sum + (doc.metrics?.amountWithoutVAT || 0), 
    0
  );
  
  const totalVAT = docsWithMetrics.reduce(
    (sum, doc) => sum + (doc.metrics?.vatAmount || 0), 
    0
  );

  const documentTypeStats = docsWithMetrics.reduce((acc, doc) => {
    const type = doc.metrics?.documentType || "Не определён";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const counterpartyStats = docsWithMetrics.reduce((acc, doc) => {
    doc.metrics?.counterparties?.forEach(cp => {
      if (!acc[cp]) {
        acc[cp] = { count: 0, totalAmount: 0 };
      }
      acc[cp].count += 1;
      acc[cp].totalAmount += doc.metrics?.amountWithVAT || 0;
    });
    return acc;
  }, {} as Record<string, { count: number; totalAmount: number }>);

  const topCounterparties = Object.entries(counterpartyStats)
    .sort((a, b) => b[1].totalAmount - a[1].totalAmount)
    .slice(0, 5);

  const handleExport = (format: 'csv' | 'xlsx' | 'json') => {
    const formatNames = {
      csv: 'CSV',
      xlsx: 'Excel',
      json: 'JSON'
    };
    
    // В реальном приложении здесь будет экспорт данных
    toast({
      title: `Экспорт в ${formatNames[format]}`,
      description: `Аналитика экспортирована в формат ${formatNames[format]}`,
    });
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
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
                <BarChart3 className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Дашборд аналитики</h1>
                <p className="text-xs text-muted-foreground">Статистика и метрики документов</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => handleExport('xlsx')}>
                <Download className="h-4 w-4 mr-2" />
                Экспорт
              </Button>
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-gradient-card border-border">
            <div className="flex items-center justify-between mb-2">
              <FileText className="h-8 w-8 text-primary" />
              <Badge variant="secondary">{docsWithMetrics.length}</Badge>
            </div>
            <h3 className="text-sm text-muted-foreground mb-1">Проанализировано</h3>
            <p className="text-2xl font-bold">{docsWithMetrics.length} документов</p>
          </Card>

          <Card className="p-6 bg-gradient-card border-border">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-8 w-8 text-green-500" />
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <h3 className="text-sm text-muted-foreground mb-1">Общая сумма</h3>
            <p className="text-2xl font-bold">{totalAmountWithVAT.toLocaleString('ru-RU')} ₽</p>
            <p className="text-xs text-muted-foreground mt-1">С НДС</p>
          </Card>

          <Card className="p-6 bg-gradient-card border-border">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="text-sm text-muted-foreground mb-1">Сумма без НДС</h3>
            <p className="text-2xl font-bold">{totalAmountWithoutVAT.toLocaleString('ru-RU')} ₽</p>
            <p className="text-xs text-muted-foreground mt-1">НДС: {totalVAT.toLocaleString('ru-RU')} ₽</p>
          </Card>

          <Card className="p-6 bg-gradient-card border-border">
            <div className="flex items-center justify-between mb-2">
              <Building2 className="h-8 w-8 text-purple-500" />
              <Badge variant="secondary">{Object.keys(counterpartyStats).length}</Badge>
            </div>
            <h3 className="text-sm text-muted-foreground mb-1">Контрагентов</h3>
            <p className="text-2xl font-bold">{Object.keys(counterpartyStats).length}</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Document Types */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Типы документов</h3>
            </div>
            <div className="space-y-3">
              {Object.entries(documentTypeStats).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-sm">{type}</span>
                  </div>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Top Counterparties */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Топ контрагенты</h3>
            </div>
            <div className="space-y-3">
              {topCounterparties.map(([name, stats]) => (
                <div key={name} className="border-b border-border pb-3 last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium truncate max-w-[200px]">{name}</span>
                    <Badge variant="secondary">{stats.count} док.</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Сумма: {stats.totalAmount.toLocaleString('ru-RU')} ₽
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Recent Documents Table */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Последние документы</h3>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Документ</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Тип</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Контрагент</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Сумма с НДС</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Дата</th>
                </tr>
              </thead>
              <tbody>
                {docsWithMetrics.map(doc => (
                  <tr key={doc.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="py-3 px-2 text-sm">{doc.name}</td>
                    <td className="py-3 px-2 text-sm">{doc.metrics?.documentType}</td>
                    <td className="py-3 px-2 text-sm truncate max-w-[200px]">
                      {doc.metrics?.counterparties?.[0]}
                    </td>
                    <td className="py-3 px-2 text-sm text-right font-medium">
                      {doc.metrics?.amountWithVAT?.toLocaleString('ru-RU')} {doc.metrics?.currency}
                    </td>
                    <td className="py-3 px-2 text-sm text-muted-foreground">
                      {doc.metrics?.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Export Options */}
        <Card className="p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">Экспорт данных</h3>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => handleExport('csv')}>
              <Download className="h-4 w-4 mr-2" />
              Экспорт CSV
            </Button>
            <Button variant="outline" onClick={() => handleExport('xlsx')}>
              <Download className="h-4 w-4 mr-2" />
              Экспорт Excel
            </Button>
            <Button variant="outline" onClick={() => handleExport('json')}>
              <Download className="h-4 w-4 mr-2" />
              Экспорт JSON
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Analytics;
