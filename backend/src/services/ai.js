import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function parseReceiptWithAI(base64Image, mimeType) {
  const response = await client.chat.completions.create({
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${base64Image}`,
            },
          },
          {
            type: 'text',
            text: `You are a receipt parser for a small business cost tracking app.
Analyze this receipt image and extract all purchased items.

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation, no backticks):
{
  "store_name": "store name or null",
  "purchase_date": "YYYY-MM-DD or null",
  "total_amount": number or null,
  "items": [
    {
      "item_name": "clean readable ingredient name",
      "quantity": number,
      "unit": "kg/g/ml/l/piece/pack/bottle/bag",
      "total_price": number,
      "unit_price": number
    }
  ]
}

Rules:
- item_name should be clean and searchable e.g. "All-purpose flour" not "FLOUR AP 1KG"
- If quantity is a weight like 500g, set quantity=500 and unit="g"
- unit_price = total_price / quantity
- If you cannot read a value clearly, use null`,
          },
        ],
      },
    ],
  });

  const text = response.choices[0].message.content.trim();
  const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  try {
    return JSON.parse(clean);
  } catch {
    throw new Error(`AI returned unparseable response: ${text.slice(0, 200)}`);
  }
}

export async function getMarginAdvice(products, ingredients) {
  const context = {
    products: products.map(p => ({
      name: p.name,
      selling_price: p.selling_price,
      material_cost: p.total_material_cost,
      margin_percent: p.margin_percent,
      is_below_threshold: p.is_below_threshold,
    })),
    top_expensive_ingredients: ingredients
      .sort((a, b) => b.current_unit_cost - a.current_unit_cost)
      .slice(0, 10)
      .map(i => ({
        name: i.name,
        unit_cost: i.current_unit_cost,
        unit: i.unit,
      })),
  };

  const response = await client.chat.completions.create({
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `You are a pricing advisor for indie creators and micro-business owners.

Here is their current business data:
${JSON.stringify(context, null, 2)}

Give 3-5 specific actionable pricing recommendations. Focus on:
1. Products with low or negative margins
2. Which ingredients are driving costs up
3. Suggested selling price adjustments
4. Any bulk buying opportunities

Be concise and practical. Reference actual product names and numbers from the data.
Format as bullet points.`,
      },
    ],
  });

  return response.choices[0].message.content;
}