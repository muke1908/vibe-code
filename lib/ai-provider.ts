const AI_PROVIDER = process.env.AI_PROVIDER || 'lmstudio';

interface AIResponse {
    content: string;
}
export async function callAI(systemPrompt: string, userPrompt: string, imageData?: string, response_format?: object): Promise<AIResponse> {
    if (AI_PROVIDER === 'gemini') {
        throw new Error('Gemini not supported');
    } else if (AI_PROVIDER === 'openai') {
        throw new Error('OpenAI not supported');
    } else {
        return callLMStudio(systemPrompt, userPrompt, imageData, response_format);
    }
}


async function callLMStudio(systemPrompt: string, userPrompt: string, imageData?: string, response_format?: object): Promise<AIResponse> {
    const baseUrl = process.env.LMSTUDIO_BASE_URL || 'http://localhost:1234/v1';
    const model = process.env.LMSTUDIO_MODEL || 'local-model';

    // Include image data if provided (vision-capable models like llava can handle it)
    const messages: any[] = [];
    messages.push({ role: "system", content: systemPrompt });
    if (imageData) {
        // Use OpenAI-compatible vision format
        messages.push({
            role: "user",
            content: [
                { type: "text", text: userPrompt },
                { type: "image_url", image_url: { url: imageData } }
            ]
        });
    } else {
        messages.push({ role: "user", content: userPrompt });
    }

    try {
        const response = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: model,
                messages,
                max_tokens: 300,
                temperature: 0.7,
                response_format
            })
        });

        const data = await response.json();
        console.log('LM Studio Response:', JSON.stringify(data, null, 2));

        if (!response.ok || !data.choices) {
            console.error('LM Studio API Error Response:', JSON.stringify(data, null, 2));
            console.error('Request was:', JSON.stringify({ model, messages: messages.map(m => ({ ...m, content: typeof m.content === 'string' ? m.content.substring(0, 100) : '[complex]' })) }, null, 2));
            throw new Error(data.error?.message || data.message || 'Failed to get response from LM Studio');
        }

        return { content: data.choices[0].message.content };
    } catch (error: any) {
        console.error('LM Studio Error:', error);
        throw new Error(error.message || 'Failed to connect to LM Studio');
    }
}