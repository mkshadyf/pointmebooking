'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useAppStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Service, WorkingHours } from '@/types';
import { PageLoading } from '@/components/ui/Loading';
import { format, addDays, startOfDay, eachHourOfInterval } from 'date-fns';
import { CalendarDaysIcon, ClockIcon, MapPinIcon, PhoneIcon } from '@heroicons/react/24/outline';

export default function ServiceDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const { serviceCategories, businessCategories } = useAppStore();
  const router = useRouter();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const service = serviceCategories
          .flatMap((cat) => cat.services)
          .find((s) => s.id === params.id);

        if (!service) throw new Error('Service not found');

        setService(service);
      } catch (err) {
        console.error('Error fetching service:', err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchService();
    }
  }, [params.id, serviceCategories]);

  if (loading) return <PageLoading />;
  if (!service) return <div>Service not found</div>;

  // Find the business that offers this service
  const business = businessCategories
    .flatMap((cat) => cat.businesses)
    .find((b) => b.id === service.business_id);

  if (!business) return <div>Business not found</div>;

  // Generate available dates (next 7 days)
  const availableDates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  // Generate time slots for the selected date
  const generateTimeSlots = () => {
    const workingHours = business.working_hours;
    if (!workingHours) return [];

    const today = new Date();
    const selectedDay = format(selectedDate, 'EEEE').toLowerCase() as keyof WorkingHours;
    const dayHours = workingHours[selectedDay];

    if (!dayHours || typeof dayHours === 'string') return [];

    const startTime = dayHours.start;
    const endTime = dayHours.end;
    
    if (!startTime || !endTime) return [];

    const startHour = parseInt(startTime.split(':')[0]);
    const endHour = parseInt(endTime.split(':')[0]);
    
    const start = new Date(selectedDate);
    start.setHours(startHour, 0, 0);
    
    const end = new Date(selectedDate);
    end.setHours(endHour, 0, 0);

    // If selected date is today, filter out past times
    if (selectedDate.toDateString() === today.toDateString()) {
      const currentHour = today.getHours();
      start.setHours(Math.max(startHour, currentHour + 1), 0, 0);
      if (start >= end) return [];
    }

    return eachHourOfInterval({ start, end });
  };

  const timeSlots = generateTimeSlots();

  const handleBooking = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!selectedDate || !selectedTime) {
      toast.error('Please select a date and time');
      return;
    }

    setLoading(true);
    try {
      // In a real app, this would make an API call to create the booking
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Booking request sent successfully!');
      router.push('/dashboard/customer');
    } catch (error) {
      toast.error('Failed to create booking:' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-8">
            {/* Service Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <h1 className="text-3xl font-bold text-gray-900">{service.name}</h1>
                <p className="mt-4 text-lg text-gray-600">{service.description}</p>
                <div className="mt-6 space-y-4">
                  <div className="flex items-center">
                    <ClockIcon className="h-5 w-5 text-gray-400" />
                    <span className="ml-2 text-gray-600">Duration:</span>
                    <span className="ml-2 font-medium">{service.duration} minutes</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-primary">R{service.price}</span>
                    <span className="ml-2 text-gray-500">per session</span>
                  </div>
                </div>

                {/* Business Details */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    About {business.business_name}
                  </h2>
                  <p className="mt-4 text-gray-600">{business.description}</p>
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center">
                      <MapPinIcon className="h-5 w-5 text-gray-400" />
                      <span className="ml-2">{business.location}</span>
                    </div>
                    <div className="flex items-center">
                      <PhoneIcon className="h-5 w-5 text-gray-400" />
                      <span className="ml-2">{business.contact_number}</span>
                    </div>
                    <div className="flex items-center">
                      <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
                      <span className="ml-2">
                        {business.working_hours.start} - {business.working_hours.end}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Section */}
              <div className="lg:col-span-1 bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Book Your Session</h3>
                
                {/* Date Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Date
                  </label>
                  <div className="grid grid-cols-7 gap-2">
                    {availableDates.map((date) => (
                      <button
                        key={date.toISOString()}
                        onClick={() => setSelectedDate(date)}
                        className={`p-2 text-center rounded-lg ${
                          selectedDate?.toDateString() === date.toDateString()
                            ? 'bg-primary text-white'
                            : 'bg-white hover:bg-gray-100'
                        }`}
                      >
                        <div className="text-xs">{format(date, 'EEE')}</div>
                        <div className="font-semibold">{format(date, 'd')}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Time
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((time) => (
                      <button
                        key={time.toISOString()}
                        onClick={() => setSelectedTime(format(time, 'HH:mm'))}
                        className={`p-2 text-center rounded-lg ${
                          selectedTime === format(time, 'HH:mm')
                            ? 'bg-primary text-white'
                            : 'bg-white hover:bg-gray-100'
                        }`}
                      >
                        {format(time, 'h:mm a')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                {selectedDate && selectedTime && (
                  <div className="mb-6 p-4 bg-white rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Booking Summary</h4>
                    <div className="text-sm text-gray-600">
                      <p>Date: {format(selectedDate, 'MMMM d, yyyy')}</p>
                      <p>Time: {selectedTime}</p>
                      <p className="mt-2 font-medium text-primary">Total: R{service.price}</p>
                    </div>
                  </div>
                )}

                {/* Book Button */}
                <button
                  onClick={handleBooking}
                  disabled={loading || !selectedDate || !selectedTime}
                  className="w-full px-6 py-3 text-base font-medium rounded-lg shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading
                    ? 'Processing...'
                    : user
                    ? 'Confirm Booking'
                    : 'Sign in to Book'}
                </button>

                {!user && (
                  <p className="mt-2 text-sm text-gray-500 text-center">
                    Please sign in to book this service
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
