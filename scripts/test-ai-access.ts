
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });



async function testConnection() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        console.error('❌ ANTHROPIC_API_KEY is missing from .env.local');
        process.exit(1);
    }

    console.log(`🔑 Found API Key: ${apiKey.substring(0, 8)}...`);
    console.log(`🤖 Testing Model: claude-sonnet-4-20250514`);

    const anthropic = new Anthropic({
        apiKey: apiKey,
    });

    try {
        const msg = await anthropic.messages.create({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1024,
            messages: [
                { role: "user", content: "Hello, are you functional?" }
            ]
        });

        console.log('✅ Success! Anthropic responded:');
        console.log(msg.content[0].type === 'text' ? msg.content[0].text : 'No text content');
    } catch (error: any) {
        console.error('❌ Analysis Verification Failed:');
        if (error.status === 404) {
            console.error('   -> Model not found. Check the model ID.');
        } else if (error.status === 401) {
            console.error('   -> Unauthorized. Check your API Key.');
        } else {
            console.error(error);
        }
        process.exit(1);
    }
}

testConnection();
