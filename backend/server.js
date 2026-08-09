const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/api/money-story', async (req, res) => {
  try {
    const { totalSpend, topCategory, topCategorySpend, mostFrequentMerchant, count, month } = req.body;
    
    // Safety check - if missing key stats, return generic
    if (!totalSpend || !topCategory) {
      return res.json({ 
        story: "Your money journey is just beginning. Keep tracking to uncover your financial story next month!" 
      });
    }

    const prompt = `
      You are Hishab, a personal finance assistant in Bangladesh.
      Write a fun, highly engaging, one-sentence "Money Story" recap for the user's month (${month}).
      It should sound like Spotify Wrapped for money.
      
      Here are the user's stats for the month:
      - Total Spend: ৳${totalSpend}
      - Top Category: ${topCategory} (৳${topCategorySpend})
      - Most Frequent Vendor: ${mostFrequentMerchant} (${count} visits)
      
      Write exactly ONE sentence. Mix English and a tiny bit of natural conversational Banglish if it fits naturally, but keep it mostly English. 
      Make it insightful, maybe slightly playful, highlighting their biggest habit. Do not use quotes around the sentence.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const story = response.text.trim();
    
    res.json({ story });

  } catch (error) {
    console.error("Error generating money story:", error);
    res.status(500).json({ error: "Failed to generate story" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Hishab Backend running on port ${PORT}`);
});
