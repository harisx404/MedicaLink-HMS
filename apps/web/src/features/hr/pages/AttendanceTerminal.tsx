import { useState, useEffect } from 'react';
import { useCheckInMutation } from '../api/hrApi';
import { AttendanceMethod } from '@medicalink/shared';

export const AttendanceTerminal = () => {
  const [time, setTime] = useState(new Date());
  const [checkIn, { isLoading, isSuccess, isError, error }] = useCheckInMutation();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCheckIn = async () => {
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            await checkIn({
              method: AttendanceMethod.APP,
              location: {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              }
            }).unwrap();
          },
          async () => {
            // Fallback without location if permission denied
            await checkIn({ method: AttendanceMethod.APP }).unwrap();
          }
        );
      } else {
        await checkIn({ method: AttendanceMethod.APP }).unwrap();
      }
    } catch (err) {
      console.error('Check in failed', err);
    }
  };

  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200 text-center w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Self-Service Terminal</h1>
        <p className="text-gray-500 mb-8">Mark your attendance for today</p>

        <div className="text-5xl font-mono text-gray-800 mb-2">
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
        <div className="text-lg text-gray-500 mb-8">
          {time.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>

        <button
          onClick={handleCheckIn}
          disabled={isLoading || isSuccess}
          className={`w-full py-4 text-lg font-bold text-white rounded shadow-sm ${
            isSuccess ? 'bg-green-500' : 'bg-blue-600 hover:bg-blue-700'
          } transition-colors duration-200 disabled:opacity-70`}
        >
          {isLoading ? 'Processing...' : isSuccess ? 'Checked In Successfully' : 'Check In'}
        </button>

        {isError && (
          <p className="mt-4 text-red-500 text-sm">
            {(error as any)?.data?.message || 'Failed to check in. You might have already checked in today.'}
          </p>
        )}
      </div>
    </div>
  );
};
