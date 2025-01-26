import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Service } from '@/types';

interface ServiceCardProps {
  service: Service;
  showActions?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function ServiceCard({ service, showActions, onEdit, onDelete }: ServiceCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-48 w-full">
        <Image
          src={service.image_url || '/images/service-placeholder.jpg'}
          alt={service.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold">{service.name}</h3>
        <p className="mt-1 text-sm text-gray-600">{service.description}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg font-bold">${service.price}</span>
          <span className="text-sm text-gray-500">{service.duration} min</span>
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
