import { toast } from "@/components/ui/use-toast";

// Supported AI providers
export type AIProvider = "deepseek" | "openai";

export interface AnalysisResult {
  success: boolean;
  pgn?: string;
  error?: string;
}

export interface AnalyzerConfig {
  provider: AIProvider;
  apiKey: string;
}

/**
 * Analyzes a chess image and returns the PGN notation
 */
export async function analyzeChessImage(
  imageData: string | File, 
  config: AnalyzerConfig
): Promise<AnalysisResult> {
  try {
    // Convert File to base64 if needed
    let base64Image = "";
    if (imageData instanceof File) {
      base64Image = await fileToBase64(imageData);
    } else {
      // Assume it's already a base64 string
      base64Image = imageData;
    }
    
    // Remove data:image prefix if present
    const base64Content = base64Image.includes("base64,") 
      ? base64Image.split("base64,")[1] 
      : base64Image;
    
    // Process image based on provider
    if (config.provider === "deepseek") {
      return analyzeWithDeepseek(base64Content, config.apiKey);
    } else if (config.provider === "openai") {
      return analyzeWithOpenAI(base64Content, config.apiKey);
    } else {
      return {
        success: false,
        error: "Unsupported AI provider"
      };
    }
  } catch (error) {
    console.error("Error analyzing chess image:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}

/**
 * Convert a File to base64 string
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

/**
 * Create prompt for image-to-PGN conversion
 */
function createChessPrompt(): string {
  return `
  Analyze this chessboard image and provide the exact position in PGN (Portable Game Notation) format.
  Only output the valid PGN notation with no additional text or explanations.
  If the board orientation is ambiguous, assume White is playing from the bottom.
  Include FEN notation if you can determine it.
  Be precise about piece positions, especially for similar-looking pieces like knights and pawns.
  `;
}

/**
 * Process image with DeepSeek Vision API
 */
async function analyzeWithDeepseek(base64Image: string, apiKey: string): Promise<AnalysisResult> {
  try {
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-vision",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: createChessPrompt() },
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
            ]
          }
        ],
        temperature: 0.1,
        max_tokens: 1000
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("DeepSeek API error:", data);
      return {
        success: false,
        error: data.error?.message || "Failed to analyze image with DeepSeek"
      };
    }

    // Extract PGN from response
    const pgn = extractPGNFromResponse(data.choices[0].message.content);
    
    if (!pgn) {
      return {
        success: false,
        error: "Could not extract valid PGN from the response"
      };
    }

    return {
      success: true,
      pgn
    };
  } catch (error) {
    console.error("Error with DeepSeek analysis:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred with DeepSeek"
    };
  }
}

/**
 * Process image with OpenAI Vision API
 */
async function analyzeWithOpenAI(base64Image: string, apiKey: string): Promise<AnalysisResult> {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a chess position analyzer that identifies positions from images and returns only valid PGN notation."
          },
          {
            role: "user", 
            content: [
              { type: "text", text: createChessPrompt() },
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
            ]
          }
        ],
        max_tokens: 1000
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("OpenAI API error:", data);
      return {
        success: false,
        error: data.error?.message || "Failed to analyze image with OpenAI"
      };
    }

    // Extract PGN from response
    const pgn = extractPGNFromResponse(data.choices[0].message.content);
    
    if (!pgn) {
      return {
        success: false,
        error: "Could not extract valid PGN from the response"
      };
    }

    return {
      success: true,
      pgn
    };
  } catch (error) {
    console.error("Error with OpenAI analysis:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred with OpenAI"
    };
  }
}

/**
 * Extract PGN from API response
 */
function extractPGNFromResponse(response: string): string | null {
  // Try to extract PGN notation from text
  // Look for common PGN format patterns
  
  // First, check if response contains [Event or [Site which typically start PGN
  if (response.includes("[Event") || response.includes("[Site")) {
    // Try to extract the complete PGN block
    const pgnMatch = response.match(/\[\s*Event.*?\s*(?:\d+\.\s*\S+\s+\S+\s*)+(?:\*|1-0|0-1|1\/2-1\/2)/s);
    if (pgnMatch) return pgnMatch[0].trim();
  }
  
  // If we can't find standard PGN format, try looking for FEN notation
  const fenMatch = response.match(/([rnbqkpRNBQKP1-8]+\/){7}[rnbqkpRNBQKP1-8]+\s[wb]\s[KQkq-]+\s[a-h\-][1-8\-]/);
  if (fenMatch) {
    // Convert FEN to minimal PGN
    return `[SetUp "1"]\n[FEN "${fenMatch[0]}"]\n\n*`;
  }
  
  // If all else fails, just return the response as-is if it seems to contain chess notation
  if (response.match(/\d+\.\s*[KQRBNP]?[a-h]?[1-8]?x?[a-h][1-8]/)) {
    return response.trim();
  }
  
  // Handle case where the API might have wrapped the PGN in code blocks
  if (response.includes("```")) {
    const codeBlockMatch = response.match(/```(?:pgn)?\s*([\s\S]*?)```/);
    if (codeBlockMatch && codeBlockMatch[1]) {
      return codeBlockMatch[1].trim();
    }
  }
  
  return response.trim(); // Return the full response as a fallback
}

/**
 * Open the PGN on Lichess for analysis
 */
export function openPGNOnLichess(pgn: string): void {
  const lichessImportURL = "https://lichess.org/analysis/paste";
  
  // Create a hidden form to submit the PGN to Lichess
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = lichessImportURL;
  form.target = '_blank';
  
  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = 'pgn';
  input.value = pgn;
  
  form.appendChild(input);
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}

/**
 * Get stored API configuration
 */
export async function getApiConfig(): Promise<AnalyzerConfig | null> {
  try {
    // For browser extension
    if (typeof chrome !== 'undefined' && chrome.storage) {
      return new Promise((resolve) => {
        chrome.storage.local.get(['provider', 'apiKey'], (result) => {
          if (result.provider && result.apiKey) {
            resolve({
              provider: result.provider as AIProvider,
              apiKey: result.apiKey
            });
          } else {
            resolve(null);
          }
        });
      });
    } 
    // For web app
    else {
      const provider = localStorage.getItem('chessVision_provider') as AIProvider;
      const apiKey = localStorage.getItem('chessVision_apiKey');
      
      if (provider && apiKey) {
        return { provider, apiKey };
      }
      return null;
    }
  } catch (error) {
    console.error("Error getting API config:", error);
    return null;
  }
}

/**
 * Save API configuration
 */
export async function saveApiConfig(config: AnalyzerConfig): Promise<boolean> {
  try {
    // For browser extension
    if (typeof chrome !== 'undefined' && chrome.storage) {
      return new Promise((resolve) => {
        chrome.storage.local.set({
          provider: config.provider,
          apiKey: config.apiKey
        }, () => {
          resolve(true);
        });
      });
    } 
    // For web app
    else {
      localStorage.setItem('chessVision_provider', config.provider);
      localStorage.setItem('chessVision_apiKey', config.apiKey);
      return true;
    }
  } catch (error) {
    console.error("Error saving API config:", error);
    return false;
  }
}
