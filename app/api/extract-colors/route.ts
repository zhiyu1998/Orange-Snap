import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
    try {
        // Get OpenAI configuration from environment variables
        const apiKey = process.env.OPENAI_API_KEY;
        const baseUrl = process.env.OPENAI_BASE_URL;
        const model = process.env.AI_MODEL || 'gemini-2.0-flash';
        const extractionType = request.headers.get('x-extraction-type') || 'solid'; // 'solid' or 'gradient'

        if (!apiKey) {
            return NextResponse.json(
                { error: 'OpenAI API key is not configured on the server' },
                { status: 500 }
            );
        }

        // Initialize OpenAI client with environment variables
        const openai = new OpenAI({
            apiKey: apiKey,
            baseURL: baseUrl || undefined,
        });

        // Get the form data (multipart/form-data)
        const formData = await request.formData();
        const imageFile = formData.get('image') as File;

        if (!imageFile) {
            return NextResponse.json(
                { error: 'Image file is required' },
                { status: 400 }
            );
        }

        // Convert the file to a base64 data URL
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64Image = buffer.toString('base64');
        const dataUrl = `data:${imageFile.type};base64,${base64Image}`;

        // Define system prompt based on extraction type
        let systemPrompt = '';
        if (extractionType === 'gradient') {
            systemPrompt = '分析图片颜色，提取4组可用于渐变的颜色对（起始色和结束色）。返回内容是一个JSON数组，每个元素包含start和end两个属性，表示渐变的起始和结束颜色。例如：[{"start":"#123456","end":"#789abc"},...]。严格使用JSON格式返回，不要包含任何其他文本。';
        } else {
            systemPrompt = '采样一下图片的颜色，返回内容只需返回采样到的8个主要颜色，严格使用JSON进行返回，不能返回除了JSON外的其他内容。';
        }

        // Call OpenAI API to extract colors
        const response = await openai.chat.completions.create({
            model: model,
            messages: [
                {
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: 'user',
                    content: [
                        {
                            type: 'image_url',
                            image_url: {
                                url: dataUrl
                            }
                        }
                    ]
                }
            ],
            max_tokens: 300,
        });

        // Extract JSON response from OpenAI
        const content = response.choices[0]?.message?.content || '';

        // Clean and parse the JSON response
        let jsonMatch;
        let colorData;

        try {
            // Try to parse the entire content as JSON first
            colorData = JSON.parse(content);
        } catch (e) {
            // If that fails, try to extract JSON using regex
            if (extractionType === 'gradient') {
                jsonMatch = content.match(/\[\s*\{\s*"start"\s*:\s*"[^"]+"\s*,\s*"end"\s*:\s*"[^"]+"\s*\}(?:\s*,\s*\{\s*"start"\s*:\s*"[^"]+"\s*,\s*"end"\s*:\s*"[^"]+"\s*\})*\s*\]/);
            } else {
                jsonMatch = content.match(/\[\s*"[^"]*"(?:\s*,\s*"[^"]*")*\s*\]/);
            }

            if (!jsonMatch) {
                return NextResponse.json(
                    { error: 'Failed to extract color data from AI response', raw: content },
                    { status: 500 }
                );
            }

            colorData = JSON.parse(jsonMatch[0]);
        }

        return NextResponse.json({
            colors: colorData,
            type: extractionType
        });
    } catch (error: any) {
        console.error('Error extracting colors:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to extract colors' },
            { status: 500 }
        );
    }
} 