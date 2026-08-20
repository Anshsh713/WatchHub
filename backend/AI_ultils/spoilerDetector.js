const axios = require("axios");

const initializeAI = async () => {
  console.log("✅ AI Spoiler Detection (Hybrid Mode) Ready");
};

const detectSpoilerAI = async (text) => {
  // 1. SAFETY NET: Keyword Trigger Words
  // These words are almost always related to plot reveals
  const riskWords = [
    "hit",
    "bullet",
    "dies",
    "death",
    "killed",
    "shot",
    "ending",
    "twist",
    "cameo",
    "reveal",
    "post-credit",
    "kills",
  ];
  const lowercaseText = text.toLowerCase();

  const containsRiskWord = riskWords.some((word) =>
    lowercaseText.includes(word),
  );

  try {
    const API_URL =
      "https://api-inference.huggingface.co/models/bhavyagiri/roberta-base-finetuned-imdb-spoilers";

    const response = await axios.post(
      API_URL,
      { inputs: text },
      {
        headers: { Authorization: `Bearer ${process.env.HUGGING_FACE_TOKEN}` },
      },
    );

    const result = response.data;

    // Check if the AI returned the expected format
    if (!result || !result[0]) return containsRiskWord;

    const spoilerScore =
      result[0].find((item) => item.label === "LABEL_1")?.score || 0;

    console.log(`--- AI Analysis ---`);
    console.log(`Review: "${text}"`);
    console.log(`Spoiler Confidence: ${(spoilerScore * 100).toFixed(2)}%`);
    console.log(`Contains Risk Words: ${containsRiskWord}`);

    // HYBRID LOGIC:
    // 1. If AI is very sure (> 0.4), it's a spoiler.
    // 2. If it contains a risk word (like 'bullet' or 'hit') AND AI is even slightly suspicious (> 0.15), flag it.
    if (spoilerScore > 0.4) return true;
    if (containsRiskWord && spoilerScore > 0.15) return true;

    return false;
  } catch (error) {
    console.error("AI API Error:", error.message);
    // If API fails, fall back to the keyword check only
    return containsRiskWord;
  }
};

module.exports = { detectSpoilerAI, initializeAI };
