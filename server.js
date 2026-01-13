import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();
const app = express();

app.use(cors({
    origin: "http://127.0.0.1:5500",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
}));

//app.options("*", cors());

app.use(express.json());

app.post("/detect-delulu", async (req, res) => {
    const { goal } = req.body;

    const prompt = `
You are a brutually honest "Delulu Detector AI"
. 
Analyze the goal below and respond in this format:

Delulu Score: X/100
Why Unrealistic:
- ...
Realistic Plan:
- ...

Goal:
"${goal}"
    `;
    try{
        const response = await fetch(
             "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key="+
            process.env.GEMINI_API_KEY,
        {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [{text: prompt}]}]
            })
        }
        );
        const data = await response.json();
        console.log("GEMINI RAW RESPONSE:", data);
        const text = 
        data?.candidates?.[0]?.content?.parts?.[0]?.text??
        "Gemini returned no text. Check API key/quota.";
        
        res.json({ result: text });
    } catch(err){
        console.error(err);
        res.status(500).json({ error: 'Gemini API failed' });
    }
});

app.listen(3000, () => 
    console.log('Server running on port 3000'));

