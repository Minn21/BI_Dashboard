'use client';

// Define types for chart data
export interface ChartData {
  name: string;
  value: number;
  additionalContext?: string;
}

// Update to match actual Gemini API response structure
export interface GeminiAnalysisResponse {
  keyFinding: string;
  insight: string;
  recommendation: string;
  additionalInfo: string;
  // Add optional fields that might be in the response
  benchmark?: string;
  data_source?: string;
  further_analysis_required?: boolean;
  additional_questions_to_ask?: string[];
}

export class GeminiService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl = 'https://generativelanguage.googleapis.com/v1') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  /**
 * Ask a general question to the Gemini AI
 */
async askQuestion(prompt: string): Promise<string> {
  try {
    const response = await fetch(`${this.baseUrl}/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API responded with status: ${response.status}`);
    }

    const responseData = await response.json();
    const answer = responseData.candidates[0].content.parts[0].text;
    return answer;
  } catch (error) {
    console.error("Error asking question to Gemini:", error);
    return "Sorry, I couldn't process your question at the moment.";
  }
}

  /**
   * Analyze chart data using Gemini API
   */
  async analyzeChartData(
    chartType: 'memberVsGeneral' | 'ageGroups' | 'canceledBookings' | 'occupancy' | 'arrivalStats',
    data: ChartData[],
    title: string
  ): Promise<GeminiAnalysisResponse> {
    // Calculate the total for percentages
    const total = data.reduce((sum, item) => sum + item.value, 0);

    try {
      // Prepare the prompt based on chart type
      let prompt = '';

      switch (chartType) {
        case 'memberVsGeneral': {
          const memberPercentage = ((data[0].value / total) * 100).toFixed(1);
          const generalPercentage = ((data[1].value / total) * 100).toFixed(1);
          prompt = `Analyze hotel guest data where ${memberPercentage}% are members and ${generalPercentage}% are general guests. 
          Return only a JSON object with the following fields, with no markdown formatting, explanation, or code blocks:
          - keyFinding: A clear statement about the member vs general guest ratio
          - insight: What this distribution suggests about the hotel's customer base
          - recommendation: A specific action the hotel could take based on this data
          - additionalInfo: How this compares to industry averages (around 55% members is average)`;
          break;
        }

        // Add this case to the analyzeChartData method
        case 'ageGroups': {
          if (title.includes('Historical')) {
            prompt = `Analyze historical age group trends with ${data.length} months of data. 
    Return only a JSON object with:
    - keyFinding: Main trend observed
    - insight: What the trends suggest
    - recommendation: Long-term strategy
    - additionalInfo: Comparison to industry trends
    keep it short and only include the most important information`;
          } else {
            const ageDistribution = data.map(item =>
              `${item.name}: ${((item.value / total) * 100).toFixed(1)}%`
            ).join(', ');
            prompt = `Analyze hotel guest age demographic data with this distribution: ${ageDistribution}. 
    Return only a JSON object with:
    - keyFinding: Identify the largest demographic group and its percentage
    - insight: What this age distribution suggests about the hotel's appeal
    - recommendation: A specific action the hotel could take based on this data
    - additionalInfo: What the current age distribution suggests about the hotel's market`;
          }
          break;
        }

        case 'ageGroups': {
          const ageDistribution = data.map(item =>
            `${item.name}: ${((item.value / total) * 100).toFixed(1)}%`
          ).join(', ');
          prompt = `Analyze hotel guest age demographic data with this distribution: ${ageDistribution}. 
          Return only a JSON object with the following fields, with no markdown formatting, explanation, or code blocks:
          - keyFinding: Identify the largest demographic group and its percentage
          - insight: What this age distribution suggests about the hotel's appeal
          - recommendation: A specific action the hotel could take based on this data
          - additionalInfo: What the current age distribution suggests about the hotel's market`;
          break;
        }
        case 'canceledBookings': {
          const canceledPercentage = ((data.find(item => item.name === 'Canceled')?.value || 0) / total) * 100;
          prompt = `Analyze hotel booking cancellation data where ${canceledPercentage.toFixed(1)}% of bookings are canceled. 
          Return only a JSON object with the following fields, with no markdown formatting, explanation, or code blocks:
          - keyFinding: A statement about the cancellation rate
          - insight: What this rate suggests about booking stability
          - recommendation: A specific action to reduce cancellations if needed
          - additionalInfo: How this compares to industry averages (around 10-15% is typical)`;
          break;
        }
        case 'occupancy': {
          const occupancyPercentage = ((data.find(item => item.name === 'Occupied')?.value || 0) / total) * 100;
          prompt = `Analyze hotel occupancy data where ${occupancyPercentage.toFixed(1)}% of rooms are occupied. 
          Return only a JSON object with the following fields, with no markdown formatting, explanation, or code blocks:
          - keyFinding: A statement about the occupancy rate
          - insight: What this rate suggests about demand
          - recommendation: A specific action to optimize occupancy
          - additionalInfo: How this compares to industry averages (around 65-70% is typical)`;
          break;
        }
        case 'arrivalStats': {
          const monthly = data.find(item => item.name === 'Monthly Arrivals')?.value || 0;
          const yearly = data.find(item => item.name === 'Yearly Arrivals')?.value || 0;
          const percentage = ((monthly / yearly) * 100).toFixed(1);

          prompt = `Analyze hotel arrival statistics with ${monthly} monthly arrivals (${percentage}% of yearly total). 
          Return only a JSON object with:
          - keyFinding: Summary of monthly vs yearly performance
          - insight: What this suggests about booking trends
          - recommendation: Actions to optimize arrivals
          - additionalInfo: How this compares to seasonal averages (around 8-10% monthly is typical)
          remeber to keep it short to the point`;
          break;
        }
      }

      const response = await fetch(`${this.baseUrl}/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          // Add generation parameters to encourage more structured output
          generationConfig: {
            temperature: 0.2, // Lower temperature for more deterministic output
            topP: 0.8,
            topK: 40
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API responded with status: ${response.status}`);
      }

      const responseData = await response.json();
      const analysisText = responseData.candidates[0].content.parts[0].text;

      // Log the raw text response for debugging
      console.log("Raw Gemini response:", analysisText);

      // Extract and parse JSON from the text response
      const cleanedJson = this.extractJsonFromText(analysisText);

      // Normalize the response to ensure it has the expected structure
      return this.normalizeResponse(cleanedJson);

    } catch (error) {
      console.error("Error analyzing data with Gemini:", error);
      return {
        keyFinding: "Unable to analyze data.",
        insight: "An error occurred while processing the data.",
        recommendation: "Please try again later.",
        additionalInfo: "Error: " + (error instanceof Error ? error.message : 'Unknown error')
      };
    }
  }

  /**
   * Extract JSON from text that might contain markdown formatting
   */
  private extractJsonFromText(text: string): any {
    // Try several approaches to extract valid JSON from the text

    // First, try to directly parse the text as JSON (in case it's already valid JSON)
    try {
      return JSON.parse(text);
    } catch (error) {
      // If direct parsing fails, try other approaches
      console.log("Direct JSON parsing failed, trying to extract JSON from text");
    }

    // Check for JSON in a markdown code block
    const jsonCodeBlockRegex = /```(?:json)?\s*([\s\S]*?)```/;
    const codeBlockMatch = text.match(jsonCodeBlockRegex);

    if (codeBlockMatch && codeBlockMatch[1]) {
      try {
        return JSON.parse(codeBlockMatch[1].trim());
      } catch (error) {
        console.log("Failed to parse JSON from code block");
      }
    }

    // Look for a JSON object with curly braces
    const jsonObjectRegex = /(\{[\s\S]*\})/;
    const objectMatch = text.match(jsonObjectRegex);

    if (objectMatch && objectMatch[1]) {
      try {
        return JSON.parse(objectMatch[1].trim());
      } catch (error) {
        console.log("Failed to parse JSON object from text");
      }
    }

    // If all parsing attempts fail, extract content field by field
    return this.extractFieldsFromText(text);
  }

  /**
   * Extract fields from text when JSON parsing fails
   */
  private extractFieldsFromText(text: string): GeminiAnalysisResponse {
    const keyFindingMatch = text.match(/(?:"|')?keyFinding(?:"|')?\s*:\s*(?:"|')?(.*?)(?:"|')?(?:,|\n|$)/i) ||
      text.match(/Key Finding:?\s*(.*?)(?:\n|$)/i);

    const insightMatch = text.match(/(?:"|')?insight(?:"|')?\s*:\s*(?:"|')?(.*?)(?:"|')?(?:,|\n|$)/i) ||
      text.match(/Insight:?\s*(.*?)(?:\n|$)/i);

    const recommendationMatch = text.match(/(?:"|')?recommendation(?:"|')?\s*:\s*(?:"|')?(.*?)(?:"|')?(?:,|\n|$)/i) ||
      text.match(/Recommendation:?\s*(.*?)(?:\n|$)/i);

    const additionalInfoMatch = text.match(/(?:"|')?additionalInfo(?:"|')?\s*:\s*(?:"|')?(.*?)(?:"|')?(?:,|\n|$)/i) ||
      text.match(/(Benchmark|Trend Analysis|Additional Info):?\s*(.*?)(?:\n|$)/i);

    return {
      keyFinding: keyFindingMatch ? keyFindingMatch[1].trim() : "Unable to extract key finding.",
      insight: insightMatch ? insightMatch[1].trim() : "Unable to extract insight.",
      recommendation: recommendationMatch ? recommendationMatch[1].trim() : "Unable to extract recommendation.",
      additionalInfo: additionalInfoMatch ?
        (additionalInfoMatch[2] ? additionalInfoMatch[2].trim() : additionalInfoMatch[1].trim()) :
        "Unable to extract additional information."
    };
  }

  /**
   * Normalize the response to match our expected structure
   */
  private normalizeResponse(response: any): GeminiAnalysisResponse {
    // Create a baseline response with our required fields
    const normalizedResponse: GeminiAnalysisResponse = {
      keyFinding: typeof response.keyFinding === 'string' ? response.keyFinding : 'No key finding available',
      insight: typeof response.insight === 'string' ? response.insight : 'No insight available',
      recommendation: typeof response.recommendation === 'string' ? response.recommendation : 'No recommendation available',
      additionalInfo: 'No additional information available'
    };

    // Handle variations in the API response structure
    if (typeof response.additionalInfo === 'string') {
      normalizedResponse.additionalInfo = response.additionalInfo;
    } else if (typeof response.benchmark === 'string') {
      normalizedResponse.additionalInfo = response.benchmark;
      normalizedResponse.benchmark = response.benchmark;
    } else if (typeof response.data_source === 'string') {
      normalizedResponse.additionalInfo = `Data source: ${response.data_source}`;
      normalizedResponse.data_source = response.data_source;
    }

    // Store any additional fields but don't try to render them directly
    if (typeof response.further_analysis_required !== 'undefined') {
      normalizedResponse.further_analysis_required = response.further_analysis_required;
    }

    if (Array.isArray(response.additional_questions_to_ask)) {
      normalizedResponse.additional_questions_to_ask = response.additional_questions_to_ask;
    }

    return normalizedResponse;
  }
}

// Create and export a singleton instance
export const geminiService = new GeminiService(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || '',
);