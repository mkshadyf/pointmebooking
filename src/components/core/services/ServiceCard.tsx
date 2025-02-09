import { Card } from '@/components/ui/Card';
import { Service } from '@/types';
import { MapPinIcon, PhoneIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';

interface ServiceCardProps {
  service: Service;
  showActions?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function ServiceCard({ service, showActions, onEdit, onDelete }: ServiceCardProps) {
  const businessAddress = service.business ? 
    [service.business.address, service.business.city, service.business.state]
      .filter(Boolean)
      .join(', ') : 
    'Address not available';

  return (
    <Card className="overflow-hidden">
      <div className="relative h-48 w-full">
        <Image
          src={service.image_url || '/images/service-placeholder.jpg'}
          alt={service.name}
          fill
          className="object-cover"
        />
        {service.business?.logo_url && (
          <div className="absolute top-2 left-2 h-10 w-10 rounded-full overflow-hidden border-2 border-white">
            <Image
              src={service.business.logo_url}
              alt={service.business.name || ''}
              fill
              className="object-cover"
            />
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{service.name}</h3>
            {service.business && (
              <p className="text-sm text-gray-600">{service.business.name}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-lg font-bold">${service.price}</p>
            <p className="text-sm text-gray-500">{service.duration} min</p>
          </div>
        </div>

        <p className="mt-2 text-sm text-gray-600">{service.description}</p>

        <div className="mt-4 space-y-2">
          {service.business && (
            <>
              <div className="flex items-center text-gray-600">
                <MapPinIcon className="h-4 w-4 mr-2" />
                <span className="text-sm">{businessAddress}</span>
              </div>
              {service.business.phone && (
                <div className="flex items-center text-gray-600">
                  <PhoneIcon className="h-4 w-4 mr-2" />
                  <span className="text-sm">{service.business.phone}</span>
                </div>
              )}
            </>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <Link 
            href={`/services/${service.id}`}
            className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            View Details
          </Link>
          
          {showActions && (
            <div className="flex gap-2">
              <button
                onClick={() => onEdit?.(service.id)}
                className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete?.(service.id)}
                className="rounded-md bg-red-100 px-3 py-2 text-sm font-medium text-red-900 hover:bg-red-200"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
