import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export const generateLessonContent = async (topic, level) => {
    if (!genAI) return "API Key not configured";

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Actua como un experto profesor de academia pre-universitaria. Genera el contenido educativo en formato HTML (solo el cuerpo, sin etiquetas html/body) para una lección sobre: ${topic}. Nivel: ${level}. Incluye explicaciones claras, ejemplos y tips para el examen de admisión.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
};

export const generateQuizQuestions = async (topic, level) => {
    if (!genAI) return null;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Genera un cuestionario de 3 preguntas de opción múltiple sobre ${topic} para nivel ${level}. 
  Responde ÚNICAMENTE con un JSON en este formato:
  [
    {
      "question": "texto de la pregunta",
      "options": ["opcion A", "opcion B", "opcion C", "opcion D"],
      "correctAnswer": 0
    }
  ]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    try {
        const text = response.text();
        // basic cleanup in case AI adds markdown code blocks
        const cleanedJson = text.replace(/```json|```/g, '').trim();
        return JSON.parse(cleanedJson);
    } catch (e) {
        console.error("Failed to parse AI response as JSON", e);
        return null;
    }
};
