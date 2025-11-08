import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Copy, Download, Edit, Save, X } from "lucide-react";
import { Document, DocumentMetrics } from "@/types/document";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { validateRequisite } from "@/lib/validation";
import { useState, useEffect } from "react";

interface DocumentDataModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: Document | null;
  onSave?: (documentId: string, metrics: DocumentMetrics) => void;
}

export const DocumentDataModal = ({ open, onOpenChange, document, onSave }: DocumentDataModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedMetrics, setEditedMetrics] = useState<DocumentMetrics | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (document?.metrics) {
      setEditedMetrics({ ...document.metrics });
    }
  }, [document]);

  if (!document) return null;

  const handleEdit = () => {
    setIsEditing(true);
    setValidationErrors({});
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedMetrics(document.metrics ? { ...document.metrics } : null);
    setValidationErrors({});
  };

  const validateField = (field: string, value: string) => {
    const requisiteTypes: Record<string, string> = {
      inn: 'inn',
      kpp: 'kpp',
      bik: 'bik',
      accountNumber: 'account',
      kbk: 'kbk',
      oktmo: 'oktmo',
    };

    const type = requisiteTypes[field];
    if (type && value.trim()) {
      const result = validateRequisite(type, value);
      if (!result.isValid) {
        setValidationErrors(prev => ({ ...prev, [field]: result.error || 'Ошибка валидации' }));
        return false;
      } else {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    }
    return true;
  };

  const handleSave = () => {
    if (!editedMetrics) return;

    // Валидация всех реквизитов
    const fieldsToValidate = ['inn', 'kpp', 'bik', 'accountNumber', 'kbk', 'oktmo'];
    let hasErrors = false;

    fieldsToValidate.forEach(field => {
      const value = editedMetrics[field as keyof DocumentMetrics];
      if (value && typeof value === 'string') {
        if (!validateField(field, value)) {
          hasErrors = true;
        }
      }
    });

    if (hasErrors) {
      toast.error("Исправьте ошибки валидации перед сохранением");
      return;
    }

    onSave?.(document.id, editedMetrics);
    setIsEditing(false);
    toast.success("Данные документа обновлены");
  };

  const updateMetricField = (field: keyof DocumentMetrics, value: any) => {
    if (!editedMetrics) return;
    setEditedMetrics({ ...editedMetrics, [field]: value });
    
    // Валидация при изменении
    if (typeof value === 'string' && typeof field === 'string') {
      validateField(field, value);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} скопировано в буфер обмена`);
  };

  const copyAllData = () => {
    const allData = formatDataAsText();
    navigator.clipboard.writeText(allData);
    toast.success("Все данные скопированы в буфер обмена");
  };

  const formatDataAsText = () => {
    const m = document.metrics;
    if (!m) return "";

    let text = `Структурированные данные документа: ${document.name}\n\n`;

    if (m.fullNames?.length) {
      text += `ФИО:\n${m.fullNames.map(n => `  - ${n}`).join('\n')}\n\n`;
    }
    if (m.addresses?.length) {
      text += `Адреса:\n${m.addresses.map(a => `  - ${a}`).join('\n')}\n\n`;
    }
    if (m.dates?.length) {
      text += `Даты:\n${m.dates.map(d => `  - ${d}`).join('\n')}\n\n`;
    }
    if (m.amounts?.length) {
      text += `Суммы:\n${m.amounts.map(a => `  - ${a}`).join('\n')}\n\n`;
    }
    if (m.organizationName || m.legalForm) {
      text += `Юридическая информация:\n`;
      if (m.organizationName) text += `  - Название организации: ${m.organizationName}\n`;
      if (m.legalForm) text += `  - Организационно-правовая форма: ${m.legalForm}\n`;
      text += '\n';
    }
    if (m.bankName || m.accountNumber || m.bik || m.kbk || m.inn || m.oktmo || m.kpp) {
      text += `Платежные данные и реквизиты:\n`;
      if (m.bankName) text += `  - Название банка: ${m.bankName}\n`;
      if (m.accountNumber) text += `  - Расчетный счет: ${m.accountNumber}\n`;
      if (m.bik) text += `  - БИК: ${m.bik}\n`;
      if (m.kbk) text += `  - КБК: ${m.kbk}\n`;
      if (m.inn) text += `  - ИНН: ${m.inn}\n`;
      if (m.oktmo) text += `  - ОКТМО: ${m.oktmo}\n`;
      if (m.kpp) text += `  - КПП: ${m.kpp}\n`;
    }

    return text;
  };

  const exportData = (format: 'md' | 'txt' | 'docx' | 'pdf') => {
    const data = formatDataAsText();
    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${document.name}_data.${format === 'docx' ? 'doc' : format}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Данные экспортированы в ${format.toUpperCase()}`);
  };

  const DataItem = ({ 
    label, 
    value, 
    onCopy, 
    field, 
    editable = false 
  }: { 
    label: string; 
    value: string; 
    onCopy?: () => void; 
    field?: keyof DocumentMetrics;
    editable?: boolean;
  }) => {
    const error = field ? validationErrors[field] : undefined;
    
    return (
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-2 p-3 bg-muted/30 rounded-md hover:bg-muted/50 transition-colors">
          <div className="flex-1 min-w-0">
            <div className="text-xs text-muted-foreground mb-1">{label}</div>
            {isEditing && editable && field ? (
              <Input
                value={value}
                onChange={(e) => updateMetricField(field, e.target.value)}
                className={`h-8 text-sm ${error ? 'border-destructive' : ''}`}
              />
            ) : (
              <div className="text-sm font-medium text-foreground break-words">{value}</div>
            )}
          </div>
          {onCopy && !isEditing && (
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 flex-shrink-0"
              onClick={onCopy}
            >
              <Copy className="h-3 w-3" />
            </Button>
          )}
        </div>
        {error && <p className="text-xs text-destructive px-3">{error}</p>}
      </div>
    );
  };

  const DataList = ({ label, items }: { label: string; items: string[] }) => (
    <div className="space-y-2">
      <div className="text-sm font-semibold text-foreground">{label}</div>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <DataItem
            key={idx}
            label={`${label} ${idx + 1}`}
            value={item}
            onCopy={() => copyToClipboard(item, `${label} ${idx + 1}`)}
          />
        ))}
      </div>
    </div>
  );

  const m = isEditing ? editedMetrics : document.metrics;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Структурированные данные документа</span>
            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
                className="gap-2"
              >
                <Edit className="h-4 w-4" />
                Редактировать
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Отмена
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSave}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  Сохранить
                </Button>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        {!isEditing && (
          <div className="flex items-center gap-2 border-b pb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={copyAllData}
              className="gap-2"
            >
              <Copy className="h-4 w-4" />
              Копировать все
            </Button>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportData('md')}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              MD
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportData('txt')}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              TXT
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportData('docx')}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Word
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportData('pdf')}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              PDF
            </Button>
          </div>
        </div>
        )}

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 pb-4">
            {/* Personal data */}
            {m?.fullNames && m.fullNames.length > 0 && (
              <Card className="p-4">
                <DataList label="ФИО" items={m.fullNames} />
              </Card>
            )}

            {m?.addresses && m.addresses.length > 0 && (
              <Card className="p-4">
                <DataList label="Адрес" items={m.addresses} />
              </Card>
            )}

            {m?.dates && m.dates.length > 0 && (
              <Card className="p-4">
                <DataList label="Дата" items={m.dates} />
              </Card>
            )}

            {m?.amounts && m.amounts.length > 0 && (
              <Card className="p-4">
                <DataList label="Сумма" items={m.amounts} />
              </Card>
            )}

            {/* Legal information */}
            {(m?.organizationName || m?.legalForm) && (
              <Card className="p-4">
                <div className="text-sm font-semibold text-foreground mb-3">Юридическая информация</div>
                <div className="space-y-2">
                  {m.organizationName && (
                    <DataItem
                      label="Название организации"
                      value={m.organizationName}
                      field="organizationName"
                      editable
                      onCopy={() => copyToClipboard(m.organizationName!, "Название организации")}
                    />
                  )}
                  {m.legalForm && (
                    <DataItem
                      label="Организационно-правовая форма"
                      value={m.legalForm}
                      field="legalForm"
                      editable
                      onCopy={() => copyToClipboard(m.legalForm!, "Организационно-правовая форма")}
                    />
                  )}
                </div>
              </Card>
            )}

            {/* Payment and requisites */}
            {(m?.bankName || m?.accountNumber || m?.bik || m?.kbk || m?.inn || m?.oktmo || m?.kpp) && (
              <Card className="p-4">
                <div className="text-sm font-semibold text-foreground mb-3">Платежные данные и реквизиты</div>
                <div className="space-y-2">
                  {m.bankName && (
                    <DataItem
                      label="Название банка"
                      value={m.bankName}
                      field="bankName"
                      editable
                      onCopy={() => copyToClipboard(m.bankName!, "Название банка")}
                    />
                  )}
                  {m.accountNumber && (
                    <DataItem
                      label="Расчетный счет"
                      value={m.accountNumber}
                      field="accountNumber"
                      editable
                      onCopy={() => copyToClipboard(m.accountNumber!, "Расчетный счет")}
                    />
                  )}
                  {m.bik && (
                    <DataItem
                      label="БИК"
                      value={m.bik}
                      field="bik"
                      editable
                      onCopy={() => copyToClipboard(m.bik!, "БИК")}
                    />
                  )}
                  {m.kbk && (
                    <DataItem
                      label="КБК"
                      value={m.kbk}
                      field="kbk"
                      editable
                      onCopy={() => copyToClipboard(m.kbk!, "КБК")}
                    />
                  )}
                  {m.inn && (
                    <DataItem
                      label="ИНН"
                      value={m.inn}
                      field="inn"
                      editable
                      onCopy={() => copyToClipboard(m.inn!, "ИНН")}
                    />
                  )}
                  {m.oktmo && (
                    <DataItem
                      label="ОКТМО"
                      value={m.oktmo}
                      field="oktmo"
                      editable
                      onCopy={() => copyToClipboard(m.oktmo!, "ОКТМО")}
                    />
                  )}
                  {m.kpp && (
                    <DataItem
                      label="КПП"
                      value={m.kpp}
                      field="kpp"
                      editable
                      onCopy={() => copyToClipboard(m.kpp!, "КПП")}
                    />
                  )}
                </div>
              </Card>
            )}

            {!m && (
              <div className="text-center py-12 text-muted-foreground">
                Структурированные данные недоступны
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
