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
  Extract only the FEN string from this chessboard. Do NOT suggest moves or add extra moves.
  Only output the valid FEN notation with no additional text or explanations.
  If the board orientation is ambiguous, assume White is playing from the bottom.
  Be precise about piece positions, especially for similar-looking pieces like knights and pawns.
  Don't analyze the position or suggest next moves.
  `;
}

/**
 * Clean up PGN text by removing 'plaintext' prefix and ensuring proper formatting
 */
function cleanPGN(pgn: string): string {
  // Remove 'plaintext' prefix if present
  pgn = pgn.replace(/^plaintext\s*/i, '');
  
  // Remove any suggested moves or analysis
  // Look for standard PGN move notation and remove it
  pgn = pgn.replace(/\d+\.\s*[KQRBNP]?[a-h]?[1-8]?x?[a-h][1-8][+#]?\s+[KQRBNP]?[a-h]?[1-8]?x?[a-h][1-8][+#]?/g, '');
  
  // Ensure proper line endings for PGN format
  return pgn.trim();
}

/**
 * Extract FEN from PGN notation if present
 * Export this function so it can be used in the components
 */
export function extractFENFromPGN(pgn: string): string | null {
  // First, try to find a complete FEN string directly in the text
  const directFenMatch = pgn.match(/([rnbqkpRNBQKP1-8]+\/){7}[rnbqkpRNBQKP1-8]+\s[wb]\s[KQkq-]+\s[a-h\-][1-8\-]/);
  if (directFenMatch && directFenMatch[0]) {
    return directFenMatch[0];
  }
  
  // Look for FEN tag in the PGN
  const fenMatch = pgn.match(/\[FEN\s+"([^"]+)"\]/);
  if (fenMatch && fenMatch[1]) {
    return fenMatch[1];
  }
  
  return null;
}

/**
 * Encode FEN for URL use
 */
function encodeFENForURL(fen: string): string {
  // Replace spaces with underscores for URL encoding
  return fen.replace(/\s+/g, '_');
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
      
      // Handle quota errors specially
      if (data.error?.message?.includes("quota") || data.error?.message?.includes("exceeded")) {
        return {
          success: false,
          error: "You've exceeded your DeepSeek API quota. Please check your billing details or try the OpenAI option."
        };
      }
      
      return {
        success: false,
        error: data.error?.message || "Failed to analyze image with DeepSeek"
      };
    }

    // Extract PGN from response and clean it
    const responseText = data.choices[0].message.content;
    
    // First, try to extract a FEN directly
    const fen = extractFENFromPGN(responseText);
    
    if (fen) {
      // If we have a direct FEN, create a minimal PGN with it
      const pgn = `[SetUp "1"]\n[FEN "${fen}"]\n\n*`;
      return {
        success: true,
        pgn
      };
    }
    
    // If no direct FEN, try to use the full response as PGN
    const pgn = cleanPGN(responseText);
    
    if (!pgn) {
      return {
        success: false,
        error: "Could not extract valid FEN or PGN from the response"
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
            content: "You are a chess position analyzer that identifies positions from images and returns only valid FEN notation."
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
      
      // Handle quota errors specially
      if (data.error?.message?.includes("quota") || data.error?.message?.includes("exceeded") || data.error?.type === "insufficient_quota") {
        return {
          success: false,
          error: "You've exceeded your OpenAI API quota. Please add billing information in your OpenAI account or try the DeepSeek option."
        };
      }
      
      return {
        success: false,
        error: data.error?.message || "Failed to analyze image with OpenAI"
      };
    }

    // Extract response text
    const responseText = data.choices[0].message.content;
    
    // First, try to extract a FEN directly
    const fen = extractFENFromPGN(responseText);
    
    if (fen) {
      // If we have a direct FEN, create a minimal PGN with it
      const pgn = `[SetUp "1"]\n[FEN "${fen}"]\n\n*`;
      return {
        success: true,
        pgn
      };
    }
    
    // If no direct FEN, try to use the full response as PGN
    const pgn = cleanPGN(responseText);
    
    if (!pgn) {
      return {
        success: false,
        error: "Could not extract valid FEN or PGN from the response"
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
  
  // First, look for a direct FEN string
  const fenMatch = response.match(/([rnbqkpRNBQKP1-8]+\/){7}[rnbqkpRNBQKP1-8]+\s[wb]\s[KQkq-]+\s[a-h\-][1-8\-]/);
  if (fenMatch) {
    // Convert FEN to minimal PGN
    return `[SetUp "1"]\n[FEN "${fenMatch[0]}"]\n\n*`;
  }
  
  // Then check if response contains [Event or [Site which typically start PGN
  if (response.includes("[Event") || response.includes("[Site")) {
    // Try to extract the complete PGN block
    const pgnMatch = response.match(/\[\s*Event.*?\s*(?:\d+\.\s*\S+\s+\S+\s*)+(?:\*|1-0|0-1|1\/2-1\/2)/s);
    if (pgnMatch) return pgnMatch[0].trim();
  }
  
  // Handle case where the API might have wrapped the PGN in code blocks
  if (response.includes("```")) {
    const codeBlockMatch = response.match(/```(?:pgn)?\s*([\s\S]*?)```/);
    if (codeBlockMatch && codeBlockMatch[1]) {
      return codeBlockMatch[1].trim();
    }
  }
  
  // If all else fails, just return the response as-is
  return response.trim();
}

/**
 * Open the PGN on Lichess for analysis
 * Always use the direct FEN URL approach
 */
export function openPGNOnLichess(pgn: string): void {
  // Clean the PGN before processing
  const cleanedPGN = cleanPGN(pgn);
  
  // Try to extract FEN from PGN
  const fen = extractFENFromPGN(cleanedPGN);
  
  if (fen) {
    // If FEN is available, use direct Lichess analysis URL
    const encodedFEN = encodeFENForURL(fen);
    const lichessURL = `https://lichess.org/analysis/${encodedFEN}`;
    
    // Open in new tab
    window.open(lichessURL, '_blank');
  } else {
    // When no FEN is available, show a toast error
    // This approach avoids using the /paste endpoint which causes 404 errors
    console.error("No FEN available in PGN");
    
    // Using imported toast directly would create circular dependencies
    // Instead, we'll throw an error that will be caught in the ResultsDisplay component
    throw new Error("Unable to open on Lichess: No FEN found in the PGN. Try copying the PGN manually.");
  }
}

/**
 * Validate an API key with a simple test request
 */
export async function validateApiKey(provider: AIProvider, apiKey: string): Promise<{valid: boolean, message: string}> {
  try {
    if (!apiKey || apiKey.trim() === '') {
      return { valid: false, message: "API key cannot be empty" };
    }
    
    if (provider === "deepseek") {
      // Test DeepSeek API with a minimal request
      const response = await fetch("https://api.deepseek.com/v1/models", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${apiKey}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        return { valid: true, message: "DeepSeek API key is valid" };
      } else {
        return { 
          valid: false, 
          message: data.error?.message || "Invalid DeepSeek API key" 
        };
      }
    } else if (provider === "openai") {
      // Test OpenAI API with a minimal request
      const response = await fetch("https://api.openai.com/v1/models", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${apiKey}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        return { valid: true, message: "OpenAI API key is valid" };
      } else {
        return { 
          valid: false, 
          message: data.error?.message || "Invalid OpenAI API key" 
        };
      }
    }
    
    return { valid: false, message: "Unsupported API provider" };
  } catch (error) {
    console.error("Error validating API key:", error);
    return { 
      valid: false, 
      message: error instanceof Error ? error.message : "Error validating API key" 
    };
  }
}

/**
 * Get stored API configuration
 */
export async function getApiConfig(): Promise<AnalyzerConfig | null> {
  try {
    // Check for environment variables first
    const envOpenAIKey = import.meta.env.VITE_OPENAI_API_KEY;
    const envDeepseekKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
    
    // If environment variables are set, use them
    if (envOpenAIKey) {
      return { provider: "openai", apiKey: envOpenAIKey };
    }
    
    if (envDeepseekKey) {
      return { provider: "deepseek", apiKey: envDeepseekKey };
    }
    
    // Otherwise fall back to stored keys
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
