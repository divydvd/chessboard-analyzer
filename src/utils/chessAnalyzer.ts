
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
  imageData: string | File
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
    
    // Check for API keys in environment variables
    const openAIKey = import.meta.env.VITE_OPENAI_API_KEY;
    const deepseekKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
    
    // Choose provider based on available keys
    if (deepseekKey) {
      return analyzeWithDeepseek(base64Content, deepseekKey);
    } else if (openAIKey) {
      return analyzeWithOpenAI(base64Content, openAIKey);
    } else {
      return {
        success: false,
        error: "No API configuration found. Please contact support."
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
  Extract ONLY the chess position from this image in FEN notation format.
  DO NOT suggest moves, analysis, or add any additional text.
  DO NOT add any game continuation or suggested moves.
  DO NOT analyze the position or describe it.
  ONLY return the raw FEN string representing the exact position shown.
  If the board orientation is ambiguous, assume White is playing from the bottom.
  Return ONLY the FEN string with no additional words or characters.
  `;
}

/**
 * Clean up PGN text by removing 'plaintext' prefix and ensuring proper formatting
 */
function cleanPGN(pgn: string): string {
  // Remove 'plaintext' prefix if present
  pgn = pgn.replace(/^plaintext\s*/i, '');
  pgn = pgn.replace(/^```(?:plaintext)?\s*([\s\S]*?)```$/m, '$1');
  
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
  // First, check if the input might be a direct FEN string
  const directFenPattern = /^([rnbqkpRNBQKP1-8]+\/){7}[rnbqkpRNBQKP1-8]+\s[wb]\s[KQkq-]+\s[a-h\-][1-8\-]/;
  if (directFenPattern.test(pgn.trim())) {
    return pgn.trim();
  }
  
  // Try to find a complete FEN string directly in the text
  const directFenMatch = pgn.match(/([rnbqkpRNBQKP1-8]+\/){7}[rnbqkpRNBQKP1-8]+\s[wb]\s[KQkq-]+\s[a-h\-][1-8\-]/);
  if (directFenMatch && directFenMatch[0]) {
    return directFenMatch[0];
  }
  
  // Look for FEN tag in the PGN
  const fenMatch = pgn.match(/\[FEN\s+"([^"]+)"\]/);
  if (fenMatch && fenMatch[1]) {
    return fenMatch[1];
  }

  // Look for FEN tag without quotes
  const fenMatchNoQuotes = pgn.match(/\[FEN\s+([^\]]+)\]/);
  if (fenMatchNoQuotes && fenMatchNoQuotes[1]) {
    return fenMatchNoQuotes[1].trim();
  }
  
  return null;
}

/**
 * Process image with DeepSeek Vision API
 */
async function analyzeWithDeepseek(base64Image: string, apiKey: string): Promise<AnalysisResult> {
  try {
    console.log("Analyzing with DeepSeek...");
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
          error: "You've exceeded your API quota. Please try again later or contact support."
        };
      }
      
      return {
        success: false,
        error: data.error?.message || "Failed to analyze image with DeepSeek"
      };
    }

    // Extract PGN from response and clean it
    const responseText = data.choices[0].message.content;
    console.log("DeepSeek raw response:", responseText);
    
    // First, try to extract a FEN directly
    const fen = extractFENFromPGN(responseText);
    console.log("Extracted FEN:", fen);
    
    if (fen) {
      // If we have a direct FEN, create a minimal PGN with it
      const pgn = `[SetUp "1"]\n[FEN "${fen}"]\n\n*`;
      console.log("Generated PGN from FEN:", pgn);
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
    console.log("Analyzing with OpenAI...");
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
          error: "You've exceeded your API quota. Please try again later or contact support."
        };
      }
      
      return {
        success: false,
        error: data.error?.message || "Failed to analyze image with OpenAI"
      };
    }

    // Extract response text
    const responseText = data.choices[0].message.content;
    console.log("OpenAI raw response:", responseText);
    
    // First, try to extract a FEN directly
    const fen = extractFENFromPGN(responseText);
    console.log("Extracted FEN:", fen);
    
    if (fen) {
      // If we have a direct FEN, create a minimal PGN with it
      const pgn = `[SetUp "1"]\n[FEN "${fen}"]\n\n*`;
      console.log("Generated PGN from FEN:", pgn);
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
 * Open the PGN on Lichess for analysis
 */
export function openPGNOnLichess(pgn: string): void {
  try {
    console.log("Opening PGN on Lichess:", pgn);
    
    // Try to extract a FEN from the PGN
    const fen = extractFENFromPGN(pgn);
    
    if (fen) {
      // Encode the FEN for URL (replace spaces with underscores)
      const encodedFEN = fen.replace(/\s+/g, '_');
      const lichessURL = `https://lichess.org/analysis/${encodedFEN}`;
      console.log("Opening Lichess URL:", lichessURL);
      window.open(lichessURL, '_blank');
      return;
    }
    
    // If no FEN found, create a form to submit the PGN to Lichess
    console.log("No FEN found in PGN, submitting PGN via form");
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://lichess.org/paste';
    form.target = '_blank';
    
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'pgn';
    input.value = pgn;
    
    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  } catch (error) {
    console.error("Error opening Lichess:", error);
    throw error;
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
