import { Service } from '@/types';

interface ServiceDetailsProps {
  service: Service;
}

export function ServiceDetails({ service }: ServiceDetailsProps) {
  return (
    <div>
      <h2>{service.name}</h2>
      <p><strong>Description:</strong> {service.description}</p>
      <p><strong>Price:</strong> ${service.price}</p>
      <p><strong>Duration:</strong> {service.duration} minutes</p>
      {service.category && (
        <p><strong>Category:</strong> {service.category.name}</p>
      )}
      {service.business && (
        <>
          <h3>Business Details</h3>
          <p><strong>Name:</strong> {service.business.name}</p>
          {service.business.description && (
            <p><strong>Description:</strong> {service.business.description}</p>
          )}
          {service.business.address && (
            <p><strong>Address:</strong> {service.business.address}</p>
          )}
          {/* Add more business details as needed */}
        </>
      )}
    </div>
  );
} 