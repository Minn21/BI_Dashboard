'use client'; 
import DashboardLayout from '../components/Layout';
import MetricsCard from '../components/MetricsCard';
import ArrivalStats from '../components/ArrivalStats';
import MemberVsGeneralChart from '../components/MemberVsGeneralChart';
import OccupancyRate from '../components/OccupancyRate';
import BirthdayList from '../components/BirthdayList';
import KeyInsights from '../components/KeyInsight';
//import DateRangePicker from '@/components/DateRangePicker';
//import ThemeToggle from '@/components/ThemeToggle';
import FilterDropdown from '@/components/FilterDropdown';
import SearchBar from '@/components/SearchBar';


export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-8">
        <div className="flex gap-4">
        </div>
      </div>
      <div className="flex gap-4 mb-8">
        <FilterDropdown />
        <SearchBar />
      </div>
      <MetricsCard title="Today's Arrivals" value="24" percentage={5} trend="up" />
      <MetricsCard title="Today's Departures" value="18" percentage={2} trend="down" />
      <ArrivalStats />
      <MemberVsGeneralChart />
      <OccupancyRate />
      <MetricsCard title="Canceled Bookings" value="12" percentage={8} trend="down" />
      <BirthdayList />
      <KeyInsights />
    </DashboardLayout>
  );
}