import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Download } from "lucide-react";
import { Document } from "@/types/document";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";

interface DocumentDataModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: Document | null;
}

export const DocumentDataModal = ({ open, onOpenChange, document }: DocumentDataModalProps) => {
  if (!document) return null;

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

  const DataItem = ({ label, value, onCopy }: { label: string; value: string; onCopy?: () => void }) => (
    <div className="flex items-start justify-between gap-2 p-3 bg-muted/30 rounded-md hover:bg-muted/50 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="text-xs text-muted-foreground mb-1">{label}</div>
        <div className="text-sm font-medium text-foreground break-words">{value}</div>
      </div>
      {onCopy && (
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
  );

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

  const m = document.metrics;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Структурированные данные документа</DialogTitle>
        </DialogHeader>

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
                      onCopy={() => copyToClipboard(m.organizationName!, "Название организации")}
                    />
                  )}
                  {m.legalForm && (
                    <DataItem
                      label="Организационно-правовая форма"
                      value={m.legalForm}
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
                      onCopy={() => copyToClipboard(m.bankName!, "Название банка")}
                    />
                  )}
                  {m.accountNumber && (
                    <DataItem
                      label="Расчетный счет"
                      value={m.accountNumber}
                      onCopy={() => copyToClipboard(m.accountNumber!, "Расчетный счет")}
                    />
                  )}
                  {m.bik && (
                    <DataItem
                      label="БИК"
                      value={m.bik}
                      onCopy={() => copyToClipboard(m.bik!, "БИК")}
                    />
                  )}
                  {m.kbk && (
                    <DataItem
                      label="КБК"
                      value={m.kbk}
                      onCopy={() => copyToClipboard(m.kbk!, "КБК")}
                    />
                  )}
                  {m.inn && (
                    <DataItem
                      label="ИНН"
                      value={m.inn}
                      onCopy={() => copyToClipboard(m.inn!, "ИНН")}
                    />
                  )}
                  {m.oktmo && (
                    <DataItem
                      label="ОКТМО"
                      value={m.oktmo}
                      onCopy={() => copyToClipboard(m.oktmo!, "ОКТМО")}
                    />
                  )}
                  {m.kpp && (
                    <DataItem
                      label="КПП"
                      value={m.kpp}
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
