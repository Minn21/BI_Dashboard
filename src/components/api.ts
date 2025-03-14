
const API_BASE_URL = 'https://bi-dashboard-backend.vercel.app';
const API_CACHE = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 60_000; // 1 minute cache

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface BookingArrivals {
  current_month_arrivals: number;
  current_year_arrivals: number;
  percentage_current_month: number;
  daily_arrivals?: Array<{ date: string; arrivals: number }>;
}

export interface MemberVsGeneral {
  member_arrivals: number;
  general_arrivals: number;
  member_breakdown?: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
  };
}

export interface TodayStatus {
  today_arrivals: number;
  today_departures: number;
  arrival_hours?: { [hour: string]: number };
  departure_hours?: { [hour: string]: number };
}

export interface OccupancyADR {
  occupancy_rate: number;
  adr: number;
  daily_occupancy?: Array<{ date: string; occupancy: number; adr: number }>;
}

export interface GuestBirthday {
  name: string;
  birthday: string;
  age_group?: string;
  country?: string;
  email?: string;
  phone?: string;
  loyalty_member?: boolean;
  loyalty_level?: string | null;
  vip?: boolean;
  special_requests?: string | null;
}

export interface AgeGroups {
  child: number;
  adult: number;
  middle_age: number;
  elder: number;
  child_age_groups?: {
    under_5: number;
    '5_to_12': number;
    '13_to_17': number;
  };
}

export interface CanceledBookings {
  canceled_bookings: number;
  canceled_percentage: number;
  cancellation_reasons?: Array<{
    reason: string;
    count: number;
  }>;
}

export interface UnitBooking {
  unit_id: string;
  booking_count: number;
  room_type?: string;
  average_stay?: number;
  average_rate?: number;
  total_revenue?: number;
  occupancy_percentage?: number;
}

export interface TotalIncome {
  total_income_month: number;
  total_income_year: number;
  revenue_sources?: {
    room: number;
    food_beverage: number;
    spa: number;
    events: number;
    other: number;
  };
  daily_revenue?: Array<{
    date: string;
    total: number;
    breakdown: {
      room: number;
      food: number;
      beverage: number;
      other: number;
    };
  }>;
}

export interface Booking {
  booking_id: string;
  guest_id: number;
  check_in_date: string;
  check_out_date: string;
  room_type: string;
  room_number: string;
  nights: number;
  adults: number;
  children: number;
  nightly_rate: number;
  total_price: number;
  booking_source: string;
  amenities: string[];
  payment_method: string;
  deposit_paid: boolean;
  booking_date: string;
  status: string;
}

export interface YoyComparison {
  occupancy: Array<{ year: number; value: number }>;
  revenue: Array<{ year: number; value: number }>;
  adr: Array<{ year: number; value: number }>;
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
  bookings?: Booking[];
}

export interface SummaryStats {
  total_current_guests: number;
  occupancy_rate: number;
  monthly_income: number;
  today_movement: TodayStatus;
}

export interface HotelData {
  current: HistoricalData;
  historical: HistoricalData[];
  yoy_comparison: YoyComparison;
}

// Updated auth service with cache management
export const auth = {
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },

  login: async (username: string, password: string): Promise<string> => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const result: APIResponse<{ token: string }> = await response.json();

      if (!result.success || !result.data?.token) {
        throw new Error(result.error || 'Login failed');
      }

      localStorage.setItem('token', result.data.token);
      return result.data.token;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  logout: (): void => {
    localStorage.removeItem('token');
    API_CACHE.clear();
  },
};

const fetchData = async <T>(endpoint: string): Promise<T> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401) {
      auth.logout();
      throw new Error('Authentication expired');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
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

const fetchWithCache = async <T>(endpoint: string): Promise<T> => {
  const cached = API_CACHE.get(endpoint);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data as T;
  }

  const data = await fetchData<T>(endpoint);
  API_CACHE.set(endpoint, { data, timestamp: Date.now() });
  return data;
};

export const api = {
  // Authentication
  login: auth.login,
  logout: auth.logout,
  isAuthenticated: auth.isAuthenticated,

  // Cached endpoints
  getBookingArrivals: () => fetchWithCache<BookingArrivals>('/booking-arrivals'),
  getMemberVsGeneral: () => fetchWithCache<MemberVsGeneral>('/member-vs-general'),
  getTodayStatus: () => fetchWithCache<TodayStatus>('/today-status'),
  getOccupancyAndADR: () => fetchWithCache<OccupancyADR>('/occupancy-and-adr'),
  getGuestBirthdays: () => fetchWithCache<GuestBirthday[]>('/guest-birthdays'),
  getTodayBirthdays: () => fetchWithCache<GuestBirthday[]>('/guest-birthdays/today'),
  getAgeGroups: () => fetchWithCache<AgeGroups>('/age-groups'),
  getCanceledBookings: () => fetchWithCache<CanceledBookings>('/canceled-bookings'),
  getFrequentUnits: () => fetchWithCache<UnitBooking[]>('/frequent-units'),
  getTotalIncome: () => fetchWithCache<TotalIncome>('/total-income'),
  getSummaryStats: () => fetchWithCache<SummaryStats>('/stats/summary'),
  getMostBookedUnit: () => fetchWithCache<UnitBooking>('/units/most-booked'),
  getBookings: () => fetchWithCache<Booking[]>('/bookings'),
  getHistoricalData: () => fetchWithCache<HistoricalData[]>('/historical-data'),
  getYearOverYearComparison: () => fetchWithCache<YoyComparison>('/yoy-comparison'),

  // Optimized essential data endpoint
  getEssentialData: async (): Promise<{
    summary: SummaryStats;
    occupancy: OccupancyADR;
    cancellations: CanceledBookings;
    revenue: TotalIncome;
    todayStatus: TodayStatus;
  }> => {
    try {
      const [summary, occupancy, cancellations, revenue, todayStatus] = await Promise.all([
        fetchWithCache<SummaryStats>('/stats/summary'),
        fetchWithCache<OccupancyADR>('/occupancy-and-adr'),
        fetchWithCache<CanceledBookings>('/canceled-bookings'),
        fetchWithCache<TotalIncome>('/total-income'),
        fetchWithCache<TodayStatus>('/today-status'),
      ]);

      return { summary, occupancy, cancellations, revenue, todayStatus };
    } catch (error) {
      console.error('Error fetching essential data:', error);
      throw error;
    }
  },
};