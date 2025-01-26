'use client';

import { useState, useEffect } from 'react';
import { format, addMinutes } from 'date-fns';
import { Service } from '@/types';
import { Booking } from '@/types/booking';
import { useAuth } from '@/context/AuthContext';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface BookingFormProps {
  selectedDate?: Date;
  selectedService?: Service;
  booking?: Booking;
  onSubmitAction: (booking: Partial<Booking>) => Promise<void>;
  onCancelAction: () => void;
}

export function BookingForm({
  selectedDate,
  selectedService,
  booking,
  onSubmitAction,
  onCancelAction
}: BookingFormProps) {
  const { user } = useAuth();
  const supabase = createClientComponentClient();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    service_id: selectedService?.id || booking?.service_id || '',
    customer_name: booking?.customer_name || '',
    customer_email: '',
    customer_phone: '',
    start_time: selectedDate 
      ? format(selectedDate, "yyyy-MM-dd'T'HH:mm")
      : booking?.start_time || '',
    notes: booking?.notes || ''
  });

  useEffect(() => {
    const fetchServices = async () => {
      if (!user?.id) return;

      try {
        const { data: services } = await supabase
          .from('services')
          .select('*')
          .eq('business_id', user.id)
          .eq('status', 'active')
          .eq('is_available', true);

        setServices(services || []);
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };

    fetchServices();
  }, [user?.id, supabase]);

  const handleSubmitAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.service_id || !formData.start_time) return;

    setIsLoading(true);
    try {
      const service = services.find(s => s.id === formData.service_id);
      if (!service) throw new Error('Service not found');

      const startTime = new Date(formData.start_time);
      const endTime = addMinutes(startTime, service.duration);

      const bookingData: Partial<Booking> = {
        service_id: formData.service_id,
        customer_name: formData.customer_name,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        notes: formData.notes,
        status: booking ? booking.status : 'pending'
      };

      await onSubmitAction(bookingData);
    } catch (error) {
      console.error('Error submitting booking:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmitAction} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Service
          </label>
          <select
            value={formData.service_id}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, service_id: e.target.value }))
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            required
          >
            <option value="">Select a service</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name} - {service.duration}min - R{service.price}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Customer Name
          </label>
          <Input
            type="text"
            value={formData.customer_name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, customer_name: e.target.value }))
            }
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Start Time
          </label>
          <Input
            type="datetime-local"
            value={formData.start_time}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, start_time: e.target.value }))
            }
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, notes: e.target.value }))
            }
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancelAction}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <LoadingSpinner className="h-4 w-4" />
            ) : booking ? (
              'Update Booking'
            ) : (
              'Create Booking'
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
