'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
 
import { useAuth } from '@/lib/supabase/auth/context/AuthContext';
import { useStore } from '@/lib/supabase/store';
import { Booking } from '@/types';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';

interface BookingFormProps {
  selectedDate?: Date;
  booking?: Booking;
  onSubmitAction: (bookingData: Partial<Booking>) => Promise<void>;
  onCancelAction: () => void;
}

export function BookingForm({ selectedDate, booking, onSubmitAction, onCancelAction }: BookingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { services } = useStore();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Partial<Booking>>({
    defaultValues: booking || {
      start_time: selectedDate?.toISOString(),
    },
  });

  const onSubmit = async (data: Partial<Booking>) => {
    if (!user) {
      toast.error('Please sign in to book a service');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitAction(data);
      toast.success(booking ? 'Booking updated successfully!' : 'Booking created successfully!');
        reset();
      onCancelAction();
    } catch (error) {
      console.error('Error handling booking:', error);
      toast.error(booking ? 'Failed to update booking' : 'Failed to create booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-lg bg-white p-6 shadow-md">
      <div>
        <label htmlFor="service_id" className="block text-sm font-medium text-gray-700">
          Service
        </label>
        <Select
          id="service_id"
          {...register('service_id', { required: 'Please select a service' })}
          className="mt-1"
        >
          <option value="">Select a service</option>
          {services.map((service: { id: string | number; name: string }) => (
            <option key={service.id} value={service.id}>
              {service.name}
            </option>
          ))}
        </Select>
        {errors.service_id && (
          <p className="mt-1 text-sm text-red-600">{errors.service_id.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="start_time" className="block text-sm font-medium text-gray-700">
          Start Time
        </label>
        <Input
          type="datetime-local"
          id="start_time"
          {...register('start_time', { required: 'Please select a start time' })}
          className="mt-1"
        />
        {errors.start_time && (
          <p className="mt-1 text-sm text-red-600">{errors.start_time.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="end_time" className="block text-sm font-medium text-gray-700">
          End Time
        </label>
        <Input
          type="datetime-local"
          id="end_time"
          {...register('end_time', { required: 'Please select an end time' })}
          className="mt-1"
        />
        {errors.end_time && (
          <p className="mt-1 text-sm text-red-600">{errors.end_time.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea
          id="notes"
          {...register('notes')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancelAction}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary text-white hover:bg-primary/90"
        >
          {isSubmitting ? 'Saving...' : booking ? 'Update Booking' : 'Create Booking'}
        </Button>
      </div>
    </form>
  );
}
