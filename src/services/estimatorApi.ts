/**
 * Price Estimator API service
 * Integrates with external estimator API to get job price estimates
 */

import { fileToBase64 } from '../utils/fileUtils';

const ESTIMATOR_BASE_URL = 'https://estimator-agent.fly.dev';
const APP_NAME = 'adk_agent';
const USER_ID = 'user';

interface EstimatorSessionResponse {
  id: string;
}

interface EstimatorMessagePart {
  text?: string;
  inlineData?: {
    displayName: string;
    data: string;
    mimeType: string;
  };
}

interface EstimatorResponse {
  content?: {
    parts?: Array<{ text?: string }>;
  };
}

/**
 * Create a new estimator session
 */
export async function createEstimatorSession(): Promise<string> {
  const response = await fetch(
    `${ESTIMATOR_BASE_URL}/apps/${APP_NAME}/users/${USER_ID}/sessions`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to create estimator session');
  }

  const data: EstimatorSessionResponse = await response.json();
  return data.id;
}

/**
 * Get estimated price from description and image
 * @returns Extracted price string (e.g., "$150")
 */
export async function getEstimatedPrice(
  sessionId: string,
  description: string,
  imageFile: File
): Promise<string> {
  // Convert image to base64
  const base64Image = await fileToBase64(imageFile);
  const mimeType = imageFile.type || 'image/png';

  // Build message parts
  const parts: EstimatorMessagePart[] = [
    { text: description },
    {
      inlineData: {
        displayName: imageFile.name,
        data: base64Image,
        mimeType: mimeType,
      },
    },
  ];

  // Call estimator API
  const response = await fetch(`${ESTIMATOR_BASE_URL}/run_sse`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      appName: APP_NAME,
      userId: USER_ID,
      sessionId: sessionId,
      newMessage: {
        role: 'user',
        parts: parts,
      },
      streaming: false,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to get price estimate');
  }

  // Parse SSE response - get all data lines
  const text = await response.text();
  const lines = text.split('\n').filter(line => line.startsWith('data: '));
  
  // Find the last message from Coordinator_Agent
  let finalPrice: string | null = null;
  for (let i = lines.length - 1; i >= 0; i--) {
    try {
      const jsonStr = lines[i].substring(6); // Remove "data: " prefix
      const parsed = JSON.parse(jsonStr);
      
      // Look for Coordinator_Agent message with text
      if (parsed.author === 'Coordinator_Agent' && parsed.content?.parts?.[0]?.text) {
        finalPrice = parsed.content.parts[0].text;
        break;
      }
    } catch (e) {
      // Skip invalid JSON lines
      continue;
    }
  }

  if (!finalPrice) {
    throw new Error('No estimate returned from API');
  }

  return finalPrice;
}

/**
 * Parse price string to extract numeric value
 * Examples: "$150" -> 150, "$1,250.50" -> 1250.50
 */
export function parsePriceString(priceText: string): number {
  // Remove currency symbols, commas, and spaces
  const cleaned = priceText.replace(/[$,\s]/g, '');
  const parsed = parseFloat(cleaned);
  
  if (isNaN(parsed)) {
    throw new Error('Invalid price format');
  }
  
  return parsed;
}
