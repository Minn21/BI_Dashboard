import React, { useState, useEffect, useMemo } from 'react';
import { Chart } from 'react-google-charts';
import { api, Booking } from './api';

export const BookingsOverview: React.FC = () => {
  // State for bookings data, loading, error, and filters
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: 'All',
    roomType: 'All',
    dateFrom: '',
    dateTo: '',
  });

  // Pagination state
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Sorting state
  const [sortBy, setSortBy] = useState<{
    column: keyof Booking | null;
    direction: 'asc' | 'desc';
  }>({
    column: null,
    direction: 'asc',
  });

  // Improved fetch bookings function with retry mechanism
  const fetchBookings = async (retries = 2) => {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        console.log('Cannot fetch bookings in server environment');
        return;
      }
      
      // Check authentication first
      if (!api.isAuthenticated()) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      const data = await api.getBookings();
      
      if (!data || !Array.isArray(data)) {
        throw new Error('Invalid data format received from API');
      }
      
      setBookings(data);
      setLoading(false);
      // Clear any previous errors on success
      setError(null);
    } catch (err: any) {
      console.error('Booking fetch error:', err);
      
      // Check for specific error types
      if (err.message?.includes('Authentication')) {
        setError('Session expired. Please refresh the page and log in again.');
        setLoading(false);
        return;
      }
      
      if (retries > 0) {
        // Retry with exponential backoff
        const delay = (3 - retries) * 1000;
        console.log(`Retrying in ${delay/1000} seconds...`);
        setTimeout(() => fetchBookings(retries - 1), delay);
      } else {
        setError(`Failed to fetch bookings: ${err.message || 'Unknown error'}. Please try again later.`);
        setLoading(false);
      }
    }
  };

  // Fetch bookings data on mount
  useEffect(() => {
    fetchBookings();
    
    // Cleanup function
    return () => {
      // Cancel any pending operations if component unmounts
    };
  }, []);

  // Compute unique filter options
  const uniqueStatuses = useMemo(() => ['All', ...new Set(bookings.map(b => b.status))], [bookings]);
  const uniqueRoomTypes = useMemo(() => ['All', ...new Set(bookings.map(b => b.room_type))], [bookings]);

  // Filter bookings based on user input
  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      const statusMatch = filters.status === 'All' || booking.status === filters.status;
      const roomTypeMatch = filters.roomType === 'All' || booking.room_type === filters.roomType;
      const dateFrom = filters.dateFrom ? new Date(filters.dateFrom) : null;
      const dateTo = filters.dateTo ? new Date(filters.dateTo) : null;
      const checkInDate = new Date(booking.check_in_date);
      const dateMatch = (!dateFrom || checkInDate >= dateFrom) && (!dateTo || checkInDate <= dateTo);
      return statusMatch && roomTypeMatch && dateMatch;
    });
  }, [bookings, filters]);

  // Sort bookings
  const sortedBookings = useMemo(() => {
    if (!sortBy.column) return filteredBookings;

    return [...filteredBookings].sort((a, b) => {
      const valueA = a[sortBy.column as keyof Booking];
      const valueB = b[sortBy.column as keyof Booking];

      if (valueA < valueB) {
        return sortBy.direction === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return sortBy.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredBookings, sortBy]);

  // Get paginated bookings
  const paginatedBookings = useMemo(() => {
    const startIndex = pageIndex * pageSize;
    return sortedBookings.slice(startIndex, startIndex + pageSize);
  }, [sortedBookings, pageIndex, pageSize]);

  // Handle sort toggle
  const handleSort = (column: keyof Booking) => {
    setSortBy(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Pagination helpers
  const pageCount = Math.ceil(filteredBookings.length / pageSize);
  const canPreviousPage = pageIndex > 0;
  const canNextPage = pageIndex < pageCount - 1;

  // Pagination handlers
  const gotoPage = (page: number) => {
    setPageIndex(Math.max(0, Math.min(page, pageCount - 1)));
  };

  const previousPage = () => {
    if (canPreviousPage) {
      setPageIndex(pageIndex - 1);
    }
  };

  const nextPage = () => {
    if (canNextPage) {
      setPageIndex(pageIndex + 1);
    }
  };

  // Handle retry
  const handleRetry = () => {
    setLoading(true);
    setError(null);
    fetchBookings();
  };

  // Prepare data for Gantt chart
  const ganttData = useMemo(() => {
    if (!filteredBookings.length) return [
      [
        { type: 'string', label: 'Task ID' },
        { type: 'string', label: 'Task Name' },
        { type: 'string', label: 'Resource' },
        { type: 'date', label: 'Start Date' },
        { type: 'date', label: 'End Date' },
        { type: 'number', label: 'Duration' },
        { type: 'number', label: 'Percent Complete' },
        { type: 'string', label: 'Dependencies' },
      ],
      ['No Data', 'No Data', 'None', new Date(), new Date(), null, 0, null]
    ];
    
    const data = filteredBookings.map(booking => [
      booking.booking_id,
      booking.booking_id,
      booking.room_number,
      new Date(booking.check_in_date),
      new Date(booking.check_out_date),
      null,
      null,
      null,
    ]);
    return [
      [
        { type: 'string', label: 'Task ID' },
        { type: 'string', label: 'Task Name' },
        { type: 'string', label: 'Resource' },
        { type: 'date', label: 'Start Date' },
        { type: 'date', label: 'End Date' },
        { type: 'number', label: 'Duration' },
        { type: 'number', label: 'Percent Complete' },
        { type: 'string', label: 'Dependencies' },
      ],
      ...data,
    ];
  }, [filteredBookings]);

  // Define table columns
  const columns = [
    { header: 'Booking ID', accessor: 'booking_id' as keyof Booking },
    { header: 'Check-in', accessor: 'check_in_date' as keyof Booking },
    { header: 'Check-out', accessor: 'check_out_date' as keyof Booking },
    { header: 'Room Type', accessor: 'room_type' as keyof Booking },
    { header: 'Room Number', accessor: 'room_number' as keyof Booking },
    { header: 'Total Price', accessor: 'total_price' as keyof Booking },
    { header: 'Status', accessor: 'status' as keyof Booking },
  ];

  // Handle loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="flex flex-col items-center space-y-2">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          <div className="text-gray-100">Loading bookings data...</div>
        </div>
      </div>
    );
  }

  // Handle error state with retry button
  if (error) {
    return (
      <div className="flex flex-col items-center p-6 bg-gray-800/40 rounded-lg border border-red-500/30">
        <div className="text-red-400 mb-4 text-center">{error}</div>
        <button 
          onClick={handleRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Retry Loading
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium text-gray-300">Status</label>
          <select
            value={filters.status}
            onChange={e => setFilters({ ...filters, status: e.target.value })}
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {uniqueStatuses.map(status => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium text-gray-300">Room Type</label>
          <select
            value={filters.roomType}
            onChange={e => setFilters({ ...filters, roomType: e.target.value })}
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {uniqueRoomTypes.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium text-gray-300">Check-in From</label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={e => setFilters({ ...filters, dateFrom: e.target.value })}
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium text-gray-300">Check-in To</label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={e => setFilters({ ...filters, dateTo: e.target.value })}
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Refresh button */}
      <div className="flex justify-end">
        <button
          onClick={handleRetry}
          className="px-3 py-1 bg-blue-600/70 hover:bg-blue-600 text-white text-sm rounded flex items-center gap-2 transition-colors"
        >
          <span>↻</span> Refresh Data
        </button>
      </div>

      {/* Table */}
      {filteredBookings.length === 0 ? (
        <div className="text-gray-400">No bookings found.</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  {columns.map(column => (
                    <th
                      key={column.accessor.toString()}
                      onClick={() => handleSort(column.accessor)}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                    >
                      {column.header}
                      <span>
                        {sortBy.column === column.accessor
                          ? sortBy.direction === 'desc'
                            ? ' 🔽'
                            : ' 🔼'
                          : ''}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-gray-900 divide-y divide-gray-700">
                {paginatedBookings.map(booking => (
                  <tr key={booking.booking_id}>
                    {columns.map(column => (
                      <td
                        key={`${booking.booking_id}-${column.accessor}`}
                        className="px-6 py-4 whitespace-nowrap text-gray-100"
                      >
                        {booking[column.accessor]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between text-gray-300">
            <div className="flex gap-2">
              <button
                onClick={() => gotoPage(0)}
                disabled={!canPreviousPage}
                className="px-2 py-1 rounded bg-gray-700 disabled:opacity-50"
              >
                {'<<'}
              </button>
              <button
                onClick={previousPage}
                disabled={!canPreviousPage}
                className="px-2 py-1 rounded bg-gray-700 disabled:opacity-50"
              >
                {'<'}
              </button>
              <button
                onClick={nextPage}
                disabled={!canNextPage}
                className="px-2 py-1 rounded bg-gray-700 disabled:opacity-50"
              >
                {'>'}
              </button>
              <button
                onClick={() => gotoPage(pageCount - 1)}
                disabled={!canNextPage}
                className="px-2 py-1 rounded bg-gray-700 disabled:opacity-50"
              >
                {'>>'}
              </button>
              <span>
                Page{' '}
                <strong>
                  {pageIndex + 1} of {pageCount || 1}
                </strong>
              </span>
            </div>
            <select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value));
                setPageIndex(0); // Reset to first page when changing page size
              }}
              className="rounded-md bg-gray-700 border-gray-600 text-gray-100"
            >
              {[10, 20, 30].map(size => (
                <option key={size} value={size}>
                  Show {size}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      {/* Gantt Chart */}
      <div>
        <h3 className="text-lg font-medium text-gray-100 mb-4">Booking Timelines</h3>
        <Chart
          width={'100%'}
          height={'400px'}
          chartType="Gantt"
          loader={<div className="text-gray-100">Loading Chart</div>}
          data={ganttData}
          options={{
            gantt: {
              trackHeight: 30,
            },
          }}
        />
      </div>
    </div>
  );
};