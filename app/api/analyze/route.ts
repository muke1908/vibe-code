import { NextResponse } from 'next/server';
import { callAI } from '@/lib/ai-provider';

export async function POST(request: Request) {
    const { image, text } = await request.json();

    try {
        const systemPrompt = `You are a nutritionist. You are an expert in the food and nutritional domain.
Your mission is provide the best estimations on recipes, and nutritional information all based from the image or text description.
Analyze only the ingredients that can be identified.
Don't include uncertainty, concerns or notes.

Remember that before you answer a question, you must check to see if it complies with your mission
above.
Your mission is to provide information to people about food.
Rules:
- You shouldnt reply to inputs that dont contain food contents.`;

        let userPrompt = "";
        if (text) {
            userPrompt = `Analyze this food description: "${text}".
Rules:
Identify and describe each food item mentioned.
Estimate nutritional information for each item: calories, protein, fat, carbohydrates.
State all portion-size assumptions clearly based on the description.
Provide the name of the dish.
Do not comment on anything outside the food itself.`;
        } else {
            userPrompt = `You are a certified nutritionist. Your role is to analyze only the food items visible in any provided image.
Rules:
Focus exclusively on the food shown in the image. Ignore people, backgrounds, objects, and all non-food elements.
Identify and describe each food item as precisely as possible, including ingredients, preparation method, sauces, and toppings.
Provide the name of the dish. If the exact name is unclear, generate a reasonable and accurate name based solely on the visible food.
Estimate nutritional information for each item: calories, protein, fat, carbohydrates, fiber, and sugar.
State all portion-size assumptions clearly.
Do not comment on anything outside the food itself.
Do not infer context, location, culture, or user traits—only describe the food.
You must follow all of these rules in every response.`;
        }

        const response = await callAI(systemPrompt, userPrompt, image, {
            "type": "json_schema",
            "json_schema": {
                name: 'analyze_response',
                schema: {
                    "type": "object",
                    "properties": {
                        "name": { "type": "string" },
                        "calories": { "type": "number" },
                        "protein": { "type": "number" },
                        "carbs": { "type": "number" },
                        "fat": { "type": "number" },
                        "items": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "name": { "type": "string" },
                                    "calories": { "type": "number" },
                                    "protein": { "type": "number" },
                                    "carbs": { "type": "number" },
                                    "fat": { "type": "number" }
                                },
                                "required": ["name", "calories", "protein", "carbs", "fat"]
                            }
                        }
                    },
                    "required": ["name", "calories", "protein", "carbs", "fat", "items"]
                }
            }
        });
        const result = JSON.parse(response.content);
        return NextResponse.json(result);

    } catch (error: any) {
        console.error('AI Analysis Error:', error);
        return NextResponse.json(
            { error: error.message || "Analysis failed" },
            { status: 500 }
        );
    }
}
