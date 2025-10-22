import { GoogleGenAI, Type, Chat } from "@google/genai";
import { Quiz, Difficulty, Question } from '../types';

const API_KEY = "AIzaSyBaPW9f5Xpy3fh8YODCMQKQbNW99jKNjFQ";

const quizSchema = {
    type: Type.OBJECT,
    properties: {
        quiz: {
            type: Type.ARRAY,
            description: "An array of quiz questions.",
            items: {
                type: Type.OBJECT,
                properties: {
                    question: {
                        type: Type.STRING,
                        description: "The question text."
                    },
                    options: {
                        type: Type.ARRAY,
                        description: "An array of 4 possible answers.",
                        items: {
                            type: Type.STRING
                        }
                    },
                    correctAnswer: {
                        type: Type.STRING,
                        description: "The correct answer, which must be one of the strings in the options array."
                    },
                    explanation: {
                        type: Type.STRING,
                        description: "A brief, one-sentence explanation for why the correct answer is correct."
                    }
                },
                required: ['question', 'options', 'correctAnswer', 'explanation']
            }
        }
    },
    required: ['quiz']
};


export const generateQuiz = async (context: string, questionCount: number, difficulty: Difficulty): Promise<Quiz | null> => {
    try {
        const ai = new GoogleGenAI({ apiKey: API_KEY });

        const prompt = `Based on the following context, please generate a quiz with ${questionCount} multiple-choice questions of ${difficulty} difficulty. Each question must have exactly 4 options and a brief explanation for the correct answer. The context is: \n\n---\n${context}\n---`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: quizSchema,
                temperature: 0.7,
            },
        });

        const jsonString = response.text.trim();
        const parsedJson = JSON.parse(jsonString);

        if (parsedJson.quiz && Array.isArray(parsedJson.quiz)) {
            return parsedJson.quiz as Quiz;
        }

        console.error("Generated response does not match expected quiz structure:", parsedJson);
        return null;

    } catch (error) {
        console.error("Error generating quiz:", error);
        return null;
    }
};

export const createStudyBuddyChat = (question: Question, userAnswer: string): Chat => {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    
    const systemInstruction = `You are a friendly, expert tutor. The user is asking for help with a quiz question they answered incorrectly. 
    
    Your goal is to help them understand the concept deeply, not just give them the answer. Be encouraging and use simple analogies if possible.
    
    Here is the context:
    - The Question: "${question.question}"
    - The User's (Incorrect) Answer: "${userAnswer}"
    - The Correct Answer: "${question.correctAnswer}"
    - The Explanation: "${question.explanation}"
    
    Start the conversation by gently explaining why their answer was incorrect and why the right one is correct, then ask an open-ended question to encourage them to engage and think about the topic.`;

    const chat: Chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: systemInstruction,
      },
    });

    return chat;
};