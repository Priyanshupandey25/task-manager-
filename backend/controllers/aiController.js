exports.askAi = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ message: "Question is required." });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      const fallbackAnswer = [
        "Groq key is not configured yet, so this is a local assistant response.",
        "Quick help:",
        `- Your question: ${question.trim()}`,
        "- Add GROQ_API_KEY in backend/.env to enable real AI answers.",
        "- Restart backend after updating .env."
      ].join("\n");

      return res.status(200).json({
        answer: fallbackAnswer,
        model: "local-fallback"
      });
    }

    const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant inside a task manager app. Give clear and concise answers."
          },
          {
            role: "user",
            content: question.trim()
          }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const upstreamMessage = data?.error?.message || "Failed to get AI response.";
      return res.status(500).json({ message: upstreamMessage });
    }

    const answer = data?.choices?.[0]?.message?.content?.trim() || "No response returned by model.";

    return res.status(200).json({ answer, model });
  } catch (error) {
    return res.status(500).json({ message: "Could not process AI request." });
  }
};
