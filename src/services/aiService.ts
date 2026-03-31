import { GoogleGenAI, Type } from "@google/genai";

const getApiKey = () => {
  try {
    // Vite will replace this string during build
    return process.env.GEMINI_API_KEY;
  } catch {
    return undefined;
  }
};

const ai = new GoogleGenAI({ apiKey: getApiKey() || "placeholder-key" });

export const aiService = {
  /**
   * Categorizes an expense description into one of 8 categories.
   */
  categorizeExpense: async (description: string) => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Categorize this expense description into exactly one of these 8 categories: Food, Travel, Accommodation, Entertainment, Utilities, Shopping, Health, Other. Return only the category name. Description: "${description}"`,
      });
      return response.text.trim();
    } catch (error) {
      console.error("AI Categorization Error:", error);
      return "Other";
    }
  },

  /**
   * Suggests participants based on previous expenses.
   */
  suggestParticipants: async (lastExpenses: any[], allMembers: any[]) => {
    try {
      const expenseData = lastExpenses.map(e => ({
        description: e.description,
        participants: e.participants || []
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Based on these recent expenses, identify the most frequent subset of participants. Return only a JSON array of user IDs.
        Recent Expenses: ${JSON.stringify(expenseData)}
        All Members: ${JSON.stringify(allMembers.map(m => ({ id: m.user_id, name: m.user?.name })))}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });

      return JSON.parse(response.text);
    } catch (error) {
      console.error("AI Participant Suggestion Error:", error);
      return [];
    }
  },

  /**
   * Extracts details from a receipt image.
   */
  extractReceiptDetails: async (base64Data: string, mimeType: string) => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: {
          parts: [
            { text: "Extract the merchant name, total amount, date, and line items from this receipt. Line items should include description and amount. Return as JSON." },
            { inlineData: { data: base64Data, mimeType } }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              merchant: { type: Type.STRING },
              total: { type: Type.NUMBER },
              date: { type: Type.STRING },
              items: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    description: { type: Type.STRING },
                    amount: { type: Type.NUMBER }
                  }
                }
              }
            }
          }
        }
      });

      return JSON.parse(response.text);
    } catch (error) {
      console.error("AI Receipt OCR Error:", error);
      return null;
    }
  },

  /**
   * Parses natural language input into structured expense data.
   */
  parseNaturalLanguageExpense: async (text: string, currentUser: any, members: any[]) => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Parse this natural language expense entry into structured JSON. 
        Current User: ${JSON.stringify({ id: currentUser.uid, name: currentUser.displayName })}
        Available Members: ${JSON.stringify(members.map(m => ({ id: m.user_id, name: m.user?.name })))}
        Input: "${text}"`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              amount: { type: Type.NUMBER },
              description: { type: Type.STRING },
              paid_by: { type: Type.STRING, description: "User ID of the person who paid" },
              participants: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Array of User IDs involved in the split"
              },
              split_type: { 
                type: Type.STRING, 
                enum: ["equal", "custom", "percent", "shares"] 
              }
            }
          }
        }
      });

      return JSON.parse(response.text);
    } catch (error) {
      console.error("AI Natural Language Parsing Error:", error);
      return null;
    }
  },

  /**
   * Generates a summary of spending for a group.
   */
  generateGroupSummary: async (expenses: any[], members: any[]) => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate a natural-language spending summary for this group. 
        Include: total spent, category breakdown, who paid the most, and a brief insight.
        Expenses: ${JSON.stringify(expenses.map(e => ({
          description: e.description,
          amount: e.amount,
          category: e.category,
          paid_by: members.find(m => m.user_id === e.paid_by)?.user?.name || "Unknown"
        })))}`,
      });

      return response.text;
    } catch (error) {
      console.error("AI Group Summary Error:", error);
      return "Could not generate summary at this time.";
    }
  },

  /**
   * Generates spending insights and anomaly detection.
   */
  generateSpendingInsights: async (expenses: any[]) => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze these expenses and provide 3 actionable insights or anomaly detections. 
        Example: "You spent 40% more on food this week".
        Expenses: ${JSON.stringify(expenses)}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });

      return JSON.parse(response.text);
    } catch (error) {
      console.error("AI Spending Insights Error:", error);
      return [];
    }
  }
};
