import { DatePicker } from '@mui/x-date-pickers';
import { useState } from 'react';

export default function DateRangePicker() {
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());

  return (
    <div className="flex gap-4">
      <DatePicker
        label="Start Date"
        value={startDate}
        onChange={(date) => setStartDate(date)}
        className="bg-white rounded-lg"
      />
      <DatePicker
        label="End Date"
        value={endDate}
        onChange={(date) => setEndDate(date)}
        className="bg-white rounded-lg"
      />
    </div>
  );
}