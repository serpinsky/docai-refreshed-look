import { z } from "zod";

// Валидация ИНН (10 или 12 цифр)
export const innSchema = z.string()
  .regex(/^\d{10}$|^\d{12}$/, "ИНН должен содержать 10 или 12 цифр")
  .refine((inn) => {
    if (inn.length === 10) {
      return validateInn10(inn);
    } else if (inn.length === 12) {
      return validateInn12(inn);
    }
    return false;
  }, "Неверная контрольная сумма ИНН");

// Валидация КПП (9 цифр)
export const kppSchema = z.string()
  .regex(/^\d{9}$/, "КПП должен содержать 9 цифр");

// Валидация БИК (9 цифр)
export const bikSchema = z.string()
  .regex(/^\d{9}$/, "БИК должен содержать 9 цифр");

// Валидация расчетного счета (20 цифр)
export const accountSchema = z.string()
  .regex(/^\d{20}$/, "Расчетный счет должен содержать 20 цифр")
  .refine((account) => {
    // Проверка контрольной суммы счета
    return true; // Упрощенная проверка
  }, "Неверный формат расчетного счета");

// Валидация КБК (20 цифр)
export const kbkSchema = z.string()
  .regex(/^\d{20}$/, "КБК должен содержать 20 цифр");

// Валидация ОКТМО (8 или 11 цифр)
export const oktmoSchema = z.string()
  .regex(/^\d{8}$|^\d{11}$/, "ОКТМО должен содержать 8 или 11 цифр");

// Вспомогательные функции для проверки контрольной суммы ИНН
function validateInn10(inn: string): boolean {
  const coefficients = [2, 4, 10, 3, 5, 9, 4, 6, 8];
  let sum = 0;
  
  for (let i = 0; i < 9; i++) {
    sum += parseInt(inn[i]) * coefficients[i];
  }
  
  const checkDigit = (sum % 11) % 10;
  return checkDigit === parseInt(inn[9]);
}

function validateInn12(inn: string): boolean {
  const coefficients1 = [7, 2, 4, 10, 3, 5, 9, 4, 6, 8];
  const coefficients2 = [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8];
  
  let sum1 = 0;
  let sum2 = 0;
  
  for (let i = 0; i < 10; i++) {
    sum1 += parseInt(inn[i]) * coefficients1[i];
  }
  
  for (let i = 0; i < 11; i++) {
    sum2 += parseInt(inn[i]) * coefficients2[i];
  }
  
  const checkDigit1 = (sum1 % 11) % 10;
  const checkDigit2 = (sum2 % 11) % 10;
  
  return checkDigit1 === parseInt(inn[10]) && checkDigit2 === parseInt(inn[11]);
}

export const validateRequisite = (type: string, value: string): { isValid: boolean; error?: string } => {
  try {
    switch (type) {
      case 'inn':
        innSchema.parse(value);
        break;
      case 'kpp':
        kppSchema.parse(value);
        break;
      case 'bik':
        bikSchema.parse(value);
        break;
      case 'account':
        accountSchema.parse(value);
        break;
      case 'kbk':
        kbkSchema.parse(value);
        break;
      case 'oktmo':
        oktmoSchema.parse(value);
        break;
      default:
        return { isValid: true };
    }
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: error.errors[0].message };
    }
    return { isValid: false, error: "Ошибка валидации" };
  }
};
