import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, documentName } = await req.json();
    
    if (!text) {
      return new Response(
        JSON.stringify({ error: "Document text is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Analyzing document:", documentName);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Ты эксперт по анализу деловых документов. Проанализируй документ и извлеки ключевую информацию.
Верни ТОЛЬКО валидный JSON объект без дополнительного текста в следующем формате:
{
  "documentType": "тип документа (договор, счёт, акт и т.д.)",
  "counterparties": ["список контрагентов"],
  "amountWithVAT": числовое значение суммы с НДС или null,
  "amountWithoutVAT": числовое значение суммы без НДС или null,
  "vatAmount": числовое значение НДС или null,
  "currency": "валюта (₽, USD, EUR и т.д.)",
  "contractNumber": "номер договора или null",
  "date": "дата документа в формате DD.MM.YYYY или null",
  "fullNames": ["массив ФИО, найденных в документе"],
  "addresses": ["массив адресов"],
  "dates": ["массив всех дат в формате DD.MM.YYYY"],
  "amounts": ["массив всех сумм с указанием валюты"],
  "organizationName": "название организации или null",
  "legalForm": "организационно-правовая форма (ООО, АО, ИП и т.д.) или null",
  "bankName": "название банка или null",
  "accountNumber": "расчетный счет или null",
  "bik": "БИК банка или null",
  "kbk": "КБК или null",
  "inn": "ИНН или null",
  "oktmo": "ОКТМО или null",
  "kpp": "КПП или null"
}`
          },
          {
            role: "user",
            content: `Проанализируй следующий документ и извлеки информацию:\n\n${text}`
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content in AI response");
    }

    console.log("AI Response:", content);

    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = content.trim();
    if (jsonStr.startsWith("```json")) {
      jsonStr = jsonStr.slice(7);
    }
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.slice(3);
    }
    if (jsonStr.endsWith("```")) {
      jsonStr = jsonStr.slice(0, -3);
    }
    jsonStr = jsonStr.trim();

    const metrics = JSON.parse(jsonStr);

    console.log("Parsed metrics:", metrics);

    return new Response(
      JSON.stringify({ metrics }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-document function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : undefined
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
