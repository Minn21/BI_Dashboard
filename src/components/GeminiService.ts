'use client';

// Define types for chart data
export interface ChartData {
  name: string;
  value: number;
  additionalContext?: string;
}

// Define the response type from Gemini API
export interface GeminiAnalysisResponse {
  keyFinding: string;
  insight: string;
  recommendation: string;
  additionalInfo: string; // This could be benchmark for member data or trend for age data
}

export class GeminiService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl = 'https://generativelanguage.googleapis.com/v1') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  /**
   * Analyze chart data using Gemini API
   */
  async analyzeChartData(
    chartType: 'memberVsGeneral' | 'ageGroups' | 'canceledBookings' | 'occupancy',
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
          Provide the following:
          1. Key Finding: A clear statement about the member vs general guest ratio
          2. Insight: What this distribution suggests about the hotel's customer base
          3. Recommendation: A specific action the hotel could take based on this data
          4. Benchmark: How this compares to industry averages (around 55% members is average)
          Format the response as JSON with keyFinding, insight, recommendation, and additionalInfo fields.`;
          break;
        }
        case 'ageGroups': {
          const ageDistribution = data.map(item => 
            `${item.name}: ${((item.value / total) * 100).toFixed(1)}%`
          ).join(', ');
          prompt = `Analyze hotel guest age demographic data with this distribution: ${ageDistribution}. 
          Provide the following:
          1. Key Finding: Identify the largest demographic group and its percentage
          2. Insight: What this age distribution suggests about the hotel's appeal
          3. Recommendation: A specific action the hotel could take based on this data
          4. Trend Analysis: What the current age distribution suggests about the hotel's market
          Format the response as JSON with keyFinding, insight, recommendation, and additionalInfo fields.`;
          break;
        }
        case 'canceledBookings': {
          const canceledPercentage = ((data.find(item => item.name === 'Canceled')?.value || 0) / total) * 100;
          prompt = `Analyze hotel booking cancellation data where ${canceledPercentage.toFixed(1)}% of bookings are canceled. 
          Provide the following:
          1. Key Finding: A statement about the cancellation rate
          2. Insight: What this rate suggests about booking stability
          3. Recommendation: A specific action to reduce cancellations if needed
          4. Benchmark: How this compares to industry averages (around 10-15% is typical)
          Format the response as JSON with keyFinding, insight, recommendation, and additionalInfo fields.`;
          break;
        }
        case 'occupancy': {
          const occupancyPercentage = ((data.find(item => item.name === 'Occupied')?.value || 0) / total) * 100;
          prompt = `Analyze hotel occupancy data where ${occupancyPercentage.toFixed(1)}% of rooms are occupied. 
          Provide the following:
          1. Key Finding: A statement about the occupancy rate
          2. Insight: What this rate suggests about demand
          3. Recommendation: A specific action to optimize occupancy
          4. Benchmark: How this compares to industry averages (around 65-70% is typical)
          Format the response as JSON with keyFinding, insight, recommendation, and additionalInfo fields.`;
          break;
        }
      }

      // Uncomment below for actual API integration
      
      const response = await fetch(`${this.baseUrl}/models/gemini-pro:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API responded with status: ${response.status}`);
      }

      const responseData = await response.json();
      const analysisText = responseData.candidates[0].content.parts[0].text;
      let analysisJson: GeminiAnalysisResponse;

      try {
        analysisJson = JSON.parse(analysisText);
      } catch (error) {
        console.error("Failed to parse Gemini response as JSON", error);
        analysisJson = this.extractAnalysisFromText(analysisText, chartType);
      }

      return analysisJson;
      
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
   * Fallback method to extract structured data from text response if JSON parsing fails
   */
  private extractAnalysisFromText(text: string, chartType: 'memberVsGeneral' | 'ageGroups' | 'canceledBookings' | 'occupancy'): GeminiAnalysisResponse {
    const keyFindingMatch = text.match(/Key Finding:?\s*(.*?)(?:\n|$)/i);
    const insightMatch = text.match(/Insight:?\s*(.*?)(?:\n|$)/i);
    const recommendationMatch = text.match(/Recommendation:?\s*(.*?)(?:\n|$)/i);
    const additionalMatch = text.match(/(Benchmark|Trend Analysis):?\s*(.*?)(?:\n|$)/i);

    return {
      keyFinding: keyFindingMatch ? keyFindingMatch[1].trim() : "Unable to extract key finding.",
      insight: insightMatch ? insightMatch[1].trim() : "Unable to extract insight.",
      recommendation: recommendationMatch ? recommendationMatch[1].trim() : "Unable to extract recommendation.",
      additionalInfo: additionalMatch ? additionalMatch[2].trim() : "Unable to extract additional information."
    };
  }

  
}

// Create and export a singleton instance
export const geminiService = new GeminiService(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || '',
);