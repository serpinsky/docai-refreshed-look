import { DocumentMetrics } from "@/types/document";

export interface TemplateLibraryItem {
  id: string;
  name: string;
  description: string;
  category: "contract" | "invoice" | "act" | "payment" | "other";
  metrics: Partial<DocumentMetrics>;
  tags: string[];
}

export const templateLibrary: TemplateLibraryItem[] = [
  {
    id: "contract-supply",
    name: "Договор поставки",
    description: "Типовой договор поставки товаров между юридическими лицами",
    category: "contract",
    tags: ["договор", "поставка", "товары"],
    metrics: {
      documentType: "Договор поставки",
      currency: "₽",
      legalForm: "ООО",
    },
  },
  {
    id: "contract-service",
    name: "Договор оказания услуг",
    description: "Договор на оказание услуг",
    category: "contract",
    tags: ["договор", "услуги"],
    metrics: {
      documentType: "Договор оказания услуг",
      currency: "₽",
      legalForm: "ООО",
    },
  },
  {
    id: "invoice-vat",
    name: "Счет-фактура с НДС",
    description: "Счет-фактура с выделенным НДС 20%",
    category: "invoice",
    tags: ["счет", "НДС", "фактура"],
    metrics: {
      documentType: "Счет-фактура",
      currency: "₽",
      vatAmount: 0,
    },
  },
  {
    id: "invoice-no-vat",
    name: "Счет без НДС",
    description: "Счет на оплату без НДС",
    category: "invoice",
    tags: ["счет", "без НДС"],
    metrics: {
      documentType: "Счет на оплату",
      currency: "₽",
    },
  },
  {
    id: "act-completion",
    name: "Акт выполненных работ",
    description: "Акт о выполнении работ или оказании услуг",
    category: "act",
    tags: ["акт", "работы", "услуги"],
    metrics: {
      documentType: "Акт выполненных работ",
      currency: "₽",
    },
  },
  {
    id: "act-acceptance",
    name: "Акт приема-передачи",
    description: "Акт приема-передачи товаров или документов",
    category: "act",
    tags: ["акт", "прием", "передача"],
    metrics: {
      documentType: "Акт приема-передачи",
      currency: "₽",
    },
  },
  {
    id: "payment-order",
    name: "Платежное поручение",
    description: "Поручение на перевод денежных средств",
    category: "payment",
    tags: ["платеж", "банк", "перевод"],
    metrics: {
      documentType: "Платежное поручение",
      currency: "₽",
    },
  },
  {
    id: "receipt",
    name: "Кассовый чек",
    description: "Кассовый чек о произведенной оплате",
    category: "payment",
    tags: ["чек", "касса", "оплата"],
    metrics: {
      documentType: "Кассовый чек",
      currency: "₽",
    },
  },
  {
    id: "agreement",
    name: "Соглашение о сотрудничестве",
    description: "Общее соглашение о сотрудничестве между организациями",
    category: "contract",
    tags: ["соглашение", "сотрудничество"],
    metrics: {
      documentType: "Соглашение",
      currency: "₽",
      legalForm: "ООО",
    },
  },
  {
    id: "specification",
    name: "Спецификация к договору",
    description: "Приложение-спецификация с детализацией товаров/услуг",
    category: "other",
    tags: ["спецификация", "приложение"],
    metrics: {
      documentType: "Спецификация",
      currency: "₽",
    },
  },
];

export const getTemplatesByCategory = (category: string) => {
  return templateLibrary.filter((t) => t.category === category);
};

export const searchTemplates = (query: string) => {
  const lowerQuery = query.toLowerCase();
  return templateLibrary.filter(
    (t) =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
};
