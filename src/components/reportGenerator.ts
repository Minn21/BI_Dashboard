import { api } from './api';
import { geminiService } from './GeminiService';
import { ChartData } from './GeminiService';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';

// Configuration constants
const PAGE_MARGIN = 25;
const LINE_HEIGHT = 7;  // Increased line height
const SECTION_SPACING = 4;
const PAGE_HEIGHT = 297; // A4 height in mm
const PAGE_WIDTH = 210;
const CONTENT_WIDTH = PAGE_WIDTH - (PAGE_MARGIN * 2);
const CHART_BAR_HEIGHT = 12;
const CHART_COLORS = ['#4F46E5', '#10B981', '#EF4444', '#F59E0B', '#6366F1'];

export class ReportGenerator {
  private doc: jsPDF;
  private currentY: number;
  private pageNumber: number;

  constructor() {
    this.doc = new jsPDF();
    this.currentY = PAGE_MARGIN;
    this.pageNumber = 1;
  }

  private addHeader() {
    this.doc.setFontSize(22);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(45, 55, 72);
    this.doc.text('Hotel Management Report', PAGE_MARGIN, PAGE_MARGIN);
    
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(100, 116, 139);
    this.doc.text(`Generated on: ${new Date().toLocaleDateString()}`, PAGE_MARGIN, PAGE_MARGIN + 10);
    
    // Decorative line
    this.doc.setDrawColor(226, 232, 240);
    this.doc.setLineWidth(0.5);
    this.doc.line(PAGE_MARGIN, PAGE_MARGIN + 20, PAGE_WIDTH - PAGE_MARGIN, PAGE_MARGIN + 20);
    
    this.currentY = PAGE_MARGIN + 50;
  }

  private addSectionTitle(title: string) {
    if (this.currentY > PAGE_HEIGHT - 50) this.addNewPage();
    
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(30, 41, 59);
    this.doc.text(title, PAGE_MARGIN, this.currentY);
    
    // Accent line
    this.doc.setDrawColor(79, 70, 229);
    this.doc.setLineWidth(1);
    this.doc.line(PAGE_MARGIN, this.currentY + 4, PAGE_MARGIN + 40, this.currentY + 4);
    
    this.currentY += LINE_HEIGHT + 15;
  }

  private addTextBlock(text: string, fontSize: number = 12) {
    const splitText = this.doc.splitTextToSize(text, CONTENT_WIDTH);
    this.doc.setFontSize(fontSize);
    this.doc.setTextColor(30, 41, 59);
    
    splitText.forEach((line: string) => {
      if (this.currentY > PAGE_HEIGHT - PAGE_MARGIN) this.addNewPage();
      this.doc.text(line, PAGE_MARGIN, this.currentY);
      this.currentY += LINE_HEIGHT;
    });
    
    this.currentY += SECTION_SPACING;
  }

  private addChart(title: string, data: ChartData[]) {
    const chartPadding = 15;
    const chartContentHeight = data.length * (CHART_BAR_HEIGHT + 5);
    const totalChartHeight = chartContentHeight + chartPadding * 2;
    
    if (this.currentY + totalChartHeight > PAGE_HEIGHT - PAGE_MARGIN) this.addNewPage();

    // Chart container
    this.doc.setFillColor(249, 250, 251);
    this.doc.roundedRect(
      PAGE_MARGIN,
      this.currentY,
      CONTENT_WIDTH,
      totalChartHeight,
      5,
      5,
      'F'
    );
    
    // Chart title
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(30, 41, 59);
    this.doc.text(title, PAGE_MARGIN + 10, this.currentY + 15);

    // Calculate chart dimensions
    const chartX = PAGE_MARGIN + 15;
    const chartY = this.currentY + 25;
    const chartWidth = CONTENT_WIDTH - 30;
    const maxValue = Math.max(...data.map(item => item.value));

    // Draw bars
    data.forEach((item, index) => {
      const barWidth = (item.value / maxValue) * chartWidth;
      this.doc.setFillColor(CHART_COLORS[index % CHART_COLORS.length]);
      this.doc.rect(
        chartX,
        chartY + (index * (CHART_BAR_HEIGHT + 5)),
        barWidth,
        CHART_BAR_HEIGHT,
        'F'
      );
      
      // Labels
      this.doc.setFontSize(10);
      this.doc.setTextColor(30, 41, 59);
      this.doc.text(
        `${item.name}: ${item.value}%`,
        chartX + barWidth + 5,
        chartY + (index * (CHART_BAR_HEIGHT + 5)) + 8
      );
    });

    this.currentY += totalChartHeight + 20;
  }

  private addNewPage() {
    this.doc.addPage();
    this.pageNumber++;
    this.currentY = PAGE_MARGIN;
    this.addFooter();
  }

  private addFooter() {
    this.doc.setFontSize(10);
    this.doc.setTextColor(100, 116, 139);
    this.doc.text(
      `Page ${this.pageNumber}`,
      PAGE_WIDTH - PAGE_MARGIN - 15,
      PAGE_HEIGHT - 10
    );
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  }

  async generateComprehensiveReport() {
    try {
      // Fetch all dashboard data
      const [
        bookingArrivals,
        memberVsGeneral,
        todayStatus,
        occupancyADR,
        guestBirthdays,
        ageGroups,
        canceledBookings,
        frequentUnits,
        totalIncome
      ] = await Promise.all([
        api.getBookingArrivals(),
        api.getMemberVsGeneral(),
        api.getTodayStatus(),
        api.getOccupancyAndADR(),
        api.getGuestBirthdays(),
        api.getAgeGroups(),
        api.getCanceledBookings(),
        api.getFrequentUnits(),
        api.getTotalIncome()
      ]);

      // Prepare chart data
      const memberVsGeneralChartData: ChartData[] = [
        { name: 'Members', value: memberVsGeneral.member_arrivals },
        { name: 'General', value: memberVsGeneral.general_arrivals }
      ];

      const ageGroupsChartData: ChartData[] = [
        { name: 'Child', value: ageGroups.child },
        { name: 'Adult', value: ageGroups.adult },
        { name: 'Middle Age', value: ageGroups.middle_age },
        { name: 'Elder', value: ageGroups.elder }
      ];

      const canceledBookingsChartData: ChartData[] = [
        { name: 'Canceled', value: canceledBookings.canceled_bookings },
        { name: 'Not Canceled', value: 100 - canceledBookings.canceled_bookings }
      ];

      const occupancyChartData: ChartData[] = [
        { name: 'Occupied', value: occupancyADR.occupancy_rate },
        { name: 'Vacant', value: 100 - occupancyADR.occupancy_rate }
      ];

      const arrivalStatsChartData: ChartData[] = [
        { name: 'Monthly Arrivals', value: bookingArrivals.current_month_arrivals },
        { name: 'Yearly Arrivals', value: bookingArrivals.current_year_arrivals }
      ];

      // Get Gemini AI insights
      const [
        memberVsGeneralAnalysis,
        ageGroupsAnalysis,
        canceledBookingsAnalysis,
        occupancyAnalysis,
        arrivalStatsAnalysis
      ] = await Promise.all([
        geminiService.analyzeChartData('memberVsGeneral', memberVsGeneralChartData, 'Member vs General Guests'),
        geminiService.analyzeChartData('ageGroups', ageGroupsChartData, 'Guest Age Demographics'),
        geminiService.analyzeChartData('canceledBookings', canceledBookingsChartData, 'Booking Cancellations'),
        geminiService.analyzeChartData('occupancy', occupancyChartData, 'Room Occupancy'),
        geminiService.analyzeChartData('arrivalStats', arrivalStatsChartData, 'Arrival Statistics')
      ]);

      // Initialize PDF
      this.doc = new jsPDF();
      this.currentY = PAGE_MARGIN;
      this.pageNumber = 1;
      this.addHeader();

      // Summary Section
      this.addSectionTitle('Executive Summary');
      this.addTextBlock(`Total Monthly Income: ${this.formatCurrency(totalIncome.total_income_month)}`);
      this.addTextBlock(`Annual Revenue: ${this.formatCurrency(totalIncome.total_income_year)}`);
      this.addTextBlock(`Today's Arrivals: ${todayStatus.today_arrivals}`);
      this.addTextBlock(`Today's Departures: ${todayStatus.today_departures}`);
      
      // Add space between summary and charts
      this.currentY += 15;

      // Add charts
      [
        ['Member vs General Guests', memberVsGeneralChartData],
        ['Age Group Distribution', ageGroupsChartData],
        ['Booking Cancellations', canceledBookingsChartData],
        ['Room Occupancy', occupancyChartData],
        ['Arrival Statistics', arrivalStatsChartData]
      ].forEach(([title, data]) => {
        this.addChart(title as string, data as ChartData[]);
        this.currentY += 10; // Add spacing between charts
      });

      // AI Insights Section
      this.addSectionTitle('AI Insights & Recommendations');
      
      const insights = [
        { title: 'Member vs General Guests', analysis: memberVsGeneralAnalysis },
        { title: 'Age Group Demographics', analysis: ageGroupsAnalysis },
        { title: 'Booking Cancellations', analysis: canceledBookingsAnalysis },
        { title: 'Room Occupancy', analysis: occupancyAnalysis },
        { title: 'Arrival Statistics', analysis: arrivalStatsAnalysis }
      ];

      insights.forEach((insight) => {
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(79, 70, 229);
        this.addTextBlock(`${insight.title}`);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(30, 41, 59);
        this.addTextBlock(`${insight.analysis.keyFinding}`);
        this.addTextBlock(`${insight.analysis.insight}`);
        this.addTextBlock(`Recommendation: ${insight.analysis.recommendation}`);
        
        // Add separator line
        this.doc.setDrawColor(226, 232, 240);
        this.doc.line(PAGE_MARGIN, this.currentY, PAGE_WIDTH - PAGE_MARGIN, this.currentY);
        this.currentY += 15;
      });

      this.addFooter();
      const pdfBlob = this.doc.output('blob');
      saveAs(pdfBlob, 'hotel_report.pdf');
      return true;
    } catch (error) {
      console.error('Report generation failed:', error);
      throw new Error('Failed to generate report');
    }
  }
}

// Singleton export
export const reportGenerator = new ReportGenerator();