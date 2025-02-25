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
    chartType: 'memberVsGeneral' | 'ageGroups',
    data: ChartData[],
    title: string
  ): Promise<GeminiAnalysisResponse> {
    // Calculate the total for percentages
    const total = data.reduce((sum, item) => sum + item.value, 0);

    try {
      // Prepare the prompt based on chart type
      let prompt = '';
      
      if (chartType === 'memberVsGeneral') {
        const memberPercentage = ((data[0].value / total) * 100).toFixed(1);
        const generalPercentage = ((data[1].value / total) * 100).toFixed(1);
        
        prompt = `Analyze hotel guest data where ${memberPercentage}% are members and ${generalPercentage}% are general guests. 
        Provide the following:
        1. Key Finding: A clear statement about the member vs general guest ratio
        2. Insight: What this distribution suggests about the hotel's customer base
        3. Recommendation: A specific action the hotel could take based on this data
        4. Benchmark: How this compares to industry averages (around 55% members is average)
        Format the response as JSON with keyFinding, insight, recommendation, and additionalInfo fields.`;
      } else {
        // For age groups analysis
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
      }

      // Make the API request
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
      
      // Parse the response text as JSON
      // The actual text is in the response structure - this might need adjustment based on actual Gemini API response format
      const analysisText = responseData.candidates[0].content.parts[0].text;
      let analysisJson: GeminiAnalysisResponse;
      
      try {
        // Try to parse the JSON response
        analysisJson = JSON.parse(analysisText);
      } catch (error) {
        // If the response isn't valid JSON, extract information using regex or provide fallback
        console.error("Failed to parse Gemini response as JSON", error);
        analysisJson = this.extractAnalysisFromText(analysisText, chartType);
      }

      return analysisJson;
    } catch (error) {
      console.error("Error analyzing data with Gemini:", error);
      
      // Return fallback analysis if API fails
      return this.getFallbackAnalysis(chartType, data, total);
    }
  }

  /**
   * Fallback method to extract structured data from text response if JSON parsing fails
   */
  private extractAnalysisFromText(text: string, chartType: 'memberVsGeneral' | 'ageGroups'): GeminiAnalysisResponse {
    // Simple extraction using regex patterns
    const keyFindingMatch = text.match(/Key Finding:?\s*(.*?)(?:\n|$)/i);
    const insightMatch = text.match(/Insight:?\s*(.*?)(?:\n|$)/i);
    const recommendationMatch = text.match(/Recommendation:?\s*(.*?)(?:\n|$)/i);
    
    // The fourth field depends on chart type
    const additionalMatch = chartType === 'memberVsGeneral' 
      ? text.match(/Benchmark:?\s*(.*?)(?:\n|$)/i)
      : text.match(/Trend Analysis:?\s*(.*?)(?:\n|$)/i);

    return {
      keyFinding: keyFindingMatch ? keyFindingMatch[1].trim() : "Unable to extract key finding.",
      insight: insightMatch ? insightMatch[1].trim() : "Unable to extract insight.",
      recommendation: recommendationMatch ? recommendationMatch[1].trim() : "Unable to extract recommendation.",
      additionalInfo: additionalMatch ? additionalMatch[1].trim() : "Unable to extract additional information."
    };
  }

  /**
   * Provide fallback analysis if the API call fails
   */
  private getFallbackAnalysis(
    chartType: 'memberVsGeneral' | 'ageGroups', 
    data: ChartData[],
    total: number
  ): GeminiAnalysisResponse {
    if (chartType === 'memberVsGeneral') {
      const memberPercentage = ((data[0].value / total) * 100).toFixed(1);
      return {
        keyFinding: `Your property has ${memberPercentage}% member guests compared to ${(100 - parseFloat(memberPercentage)).toFixed(1)}% general guests.`,
        insight: parseFloat(memberPercentage) > 60 
          ? "Your high member percentage indicates strong loyalty and repeat business." 
          : "There's an opportunity to convert more general guests into members.",
        recommendation: parseFloat(memberPercentage) > 55
          ? "Focus on member retention strategies and upselling premium services to your loyal customer base."
          : "Implement a targeted marketing campaign to increase membership sign-ups during check-in.",
        additionalInfo: `The industry average for member bookings is approximately 55%. Your property is ${parseFloat(memberPercentage) > 55 ? 'above' : 'below'} this benchmark.`
      };
    } else {
      // Age groups analysis
      const sortedData = [...data].sort((a, b) => b.value - a.value);
      const youngestGroup = sortedData[0];
      const youngGroupPercentage = ((youngestGroup.value / total) * 100).toFixed(1);
      
      return {
        keyFinding: `Your largest guest demographic is the ${youngestGroup.name} group at ${youngGroupPercentage}% of total guests.`,
        insight: "Your property's age distribution suggests specific appeal to certain demographics.",
        recommendation: `Focus marketing efforts on the dominant ${youngestGroup.name} demographic to maximize occupancy.`,
        additionalInfo: `The current age distribution suggests opportunities for tailored services for the ${youngestGroup.name} demographic.`
      };
    }
  }
}

// Create and export a singleton instance
export const geminiService = new GeminiService(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || '',
);