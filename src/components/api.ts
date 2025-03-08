const API_BASE_URL = 'https://bi-dashboard-backend.vercel.app';

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface BookingArrivals {
  current_month_arrivals: number;
  current_year_arrivals: number;
  percentage_current_month: number;
}

export interface MemberVsGeneral {
  member_arrivals: number;
  general_arrivals: number;
}

export interface TodayStatus {
  today_arrivals: number;
  today_departures: number;
}

export interface OccupancyADR {
  occupancy_rate: number;
  adr: number;
}

export interface GuestBirthday {
  name: string;
  birthday: string;
}

export interface AgeGroups {
  child: number;
  adult: number;
  middle_age: number;
  elder: number;
}

export interface CanceledBookings {
  canceled_bookings: number;
  canceled_percentage: number;
}

export interface UnitBooking {
  unit_id: string;
  booking_count: number;
}

export interface TotalIncome {
  total_income_month: number;
  total_income_year: number;
}

export interface HistoricalData {
  month: number;
  year: number;
  booking_arrivals: BookingArrivals;
  member_vs_general_arrivals: MemberVsGeneral;
  today_arrivals_departures: TodayStatus;
  occupancy_and_adr: OccupancyADR;
  guest_birthdays: GuestBirthday[];
  age_group_segmentation: AgeGroups;
  canceled_bookings: CanceledBookings;
  most_frequent_units: UnitBooking[];
  total_income: TotalIncome;
}

export interface HotelData {
  current: {
    booking_arrivals: BookingArrivals;
    member_vs_general_arrivals: MemberVsGeneral;
    today_arrivals_departures: TodayStatus;
    occupancy_and_adr: OccupancyADR;
    guest_birthdays: GuestBirthday[];
    age_group_segmentation: AgeGroups;
    canceled_bookings: CanceledBookings;
    most_frequent_units: UnitBooking[];
    total_income: TotalIncome;
  };
  historical: HistoricalData[];
}

const fetchData = async <T>(endpoint: string): Promise<T> => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    const result: APIResponse<T> = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch data');
    }

    return result.data as T;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
};

export const api = {
  // Fetch current month data
  getBookingArrivals: () => fetchData<BookingArrivals>('/booking-arrivals'),
  getMemberVsGeneral: () => fetchData<MemberVsGeneral>('/member-vs-general'),
  getTodayStatus: () => fetchData<TodayStatus>('/today-status'),
  getOccupancyAndADR: () => fetchData<OccupancyADR>('/occupancy-and-adr'),
  getGuestBirthdays: () => fetchData<GuestBirthday[]>('/guest-birthdays'),
  getTodayBirthdays: () => fetchData<GuestBirthday[]>('/guest-birthdays/today'),
  getAgeGroups: () => fetchData<AgeGroups>('/age-groups'),
  getCanceledBookings: () => fetchData<CanceledBookings>('/canceled-bookings'),
  getFrequentUnits: () => fetchData<UnitBooking[]>('/frequent-units'),
  getTotalIncome: () => fetchData<TotalIncome>('/total-income'),
  getSummaryStats: () => fetchData<{ [key: string]: number }>('/stats/summary'),
  getMostBookedUnit: () => fetchData<UnitBooking>('/units/most-booked'),

  // Fetch historical data
  getHistoricalData: () => fetchData<HistoricalData[]>('/historical-data'),
};