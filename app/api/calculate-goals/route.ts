import { NextResponse } from 'next/server';
import { callAI } from '@/lib/ai-provider';

export async function POST(request: Request) {
    const { age, gender, height, weight, activity } = await request.json();
    try {
        // Ask for plain numeric values without units
        const systemPrompt = "You are an expert nutritionist. Calculate the daily calorie and macro goals for a user based on their stats. Return ONLY a JSON object with this exact structure: { dailyGoal: number, proteinGoal: number, carbsGoal: number, fatGoal: number }. Do NOT include any units (e.g., 'g') or extra text. Ensure the macros add up to the total calories roughly (Protein=4 cal/g, Carbs=4 cal/g, Fat=9 cal/g).";
        const userPrompt = `Calculate goals for a ${age} year old ${gender}, ${height}cm tall, weighing ${weight}kg, with an activity level of "${activity}".`;

        const response = await callAI(systemPrompt, userPrompt, undefined, {
            "type": "json_schema",
            "json_schema": {
                name: 'goals_response',
                schema: {
                    "type": "object",
                    "properties": {
                        "dailyGoal": { "type": "number" },
                        "proteinGoal": { "type": "number" },
                        "carbsGoal": { "type": "number" },
                        "fatGoal": { "type": "number" }
                    },
                    "required": ["dailyGoal", "proteinGoal", "carbsGoal", "fatGoal"]
                }
            }
        });
        const result = JSON.parse(response.content);
        return NextResponse.json(result);

    } catch (error: any) {
        console.error('Goal Calculation Error:', error);
        return NextResponse.json(
            { error: error.message || "Calculation failed" },
            { status: 500 }
        );
    }
}
