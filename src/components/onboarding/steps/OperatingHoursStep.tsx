'use client';

import { useState } from 'react';
import { BusinessProfile, WorkingHours, DayHours } from '@/types';
import { ClockIcon } from '@heroicons/react/24/outline';

export interface OperatingHoursStepProps {
  initialData: BusinessProfile | null;
  onNextAction: (data: Partial<BusinessProfile>) => Promise<void>;
  onBackAction?: () => void;
}

const defaultWorkingHours: WorkingHours = {
  monday: { start: '09:00', end: '17:00', is_closed: false },
  tuesday: { start: '09:00', end: '17:00', is_closed: false },
  wednesday: { start: '09:00', end: '17:00', is_closed: false },
  thursday: { start: '09:00', end: '17:00', is_closed: false },
  friday: { start: '09:00', end: '17:00', is_closed: false },
  saturday: { start: '09:00', end: '17:00', is_closed: false },
  sunday: { start: '09:00', end: '17:00', is_closed: true },
};

export function OperatingHoursStep({
  initialData,
  onNextAction,
  onBackAction,
}: OperatingHoursStepProps) {
  const [workingHours, setWorkingHours] = useState<WorkingHours>(
    initialData?.working_hours || defaultWorkingHours
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onNextAction({ working_hours: workingHours });
  };

  const handleDayChange = (
    day: keyof WorkingHours,
    field: keyof DayHours,
    value: string | boolean
  ) => {
    setWorkingHours((prev: WorkingHours) => {
      // We know prev[day] exists because WorkingHours requires all days
      const dayHours = prev[day] as DayHours;
      const updatedDay: DayHours = {
        start: dayHours.start,
        end: dayHours.end,
        is_closed: dayHours.is_closed ?? false,
        [field]: value,
      };
      return {
        ...prev,
        [day]: updatedDay,
      };
    });
  };

  const days = [
    { key: 'monday' as const, label: 'Monday' },
    { key: 'tuesday' as const, label: 'Tuesday' },
    { key: 'wednesday' as const, label: 'Wednesday' },
    { key: 'thursday' as const, label: 'Thursday' },
    { key: 'friday' as const, label: 'Friday' },
    { key: 'saturday' as const, label: 'Saturday' },
    { key: 'sunday' as const, label: 'Sunday' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Operating Hours
        </h2>
        <p className="text-gray-600 mb-8">
          Set your business hours for each day of the week.
        </p>
      </div>

      {days.map(({ key, label }) => (
        <div key={key} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
          <div className="w-32">
            <label className="block text-sm font-medium text-gray-700 capitalize">
              {label}
            </label>
          </div>
          <div className="flex items-center space-x-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={!workingHours[key].is_closed}
                onChange={(e) => handleDayChange(key, 'is_closed', !e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="ml-2 text-sm text-gray-700">Open</span>
            </label>
            {!workingHours[key].is_closed && (
              <>
                <ClockIcon className="h-5 w-5 text-gray-400" />
                <input
                  type="time"
                  value={workingHours[key].start}
                  onChange={(e) => handleDayChange(key, 'start', e.target.value)}
                  className="block rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="time"
                  value={workingHours[key].end}
                  onChange={(e) => handleDayChange(key, 'end', e.target.value)}
                  className="block rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                />
              </>
            )}
          </div>
        </div>
      ))}

      <div className="flex justify-between">
        {onBackAction && (
          <button
            type="button"
            onClick={onBackAction}
            className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Back
          </button>
        )}
        <button
          type="submit"
          className="ml-auto inline-flex justify-center rounded-md border border-transparent bg-primary py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Next
        </button>
      </div>
    </form>
  );
}
