import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ResponsiveImage } from './ResponsiveImage';

interface BaseCardProps {
  id?: string;
  href?: string;
  title: string;
  description?: string;
  imageUrl: string | null;
  logoUrl?: string | null;
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  minimal?: boolean;
}

export function BaseCard({
  href,
  title,
  description,
  imageUrl,
  logoUrl,
  className,
  children,
  onClick,
  minimal = false,
}: BaseCardProps) {
  const Content = (
    <>
      <div className="relative h-48 w-full">
        <ResponsiveImage
          src={imageUrl}
          alt={title}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {!minimal && logoUrl && (
          <div className="absolute bottom-2 right-2 h-8 w-8 rounded-full overflow-hidden border-2 border-white">
            <ResponsiveImage
              src={logoUrl}
              alt={`${title} logo`}
              className="object-cover"
              showLoadingIndicator={false}
            />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {!minimal && description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
        {children}
      </div>
    </>
  );

  const cardClassName = cn(
    'group relative overflow-hidden rounded-lg bg-white shadow-md transition-all hover:shadow-xl',
    className
  );

  if (href) {
    return (
      <Link href={href} className={cardClassName} onClick={onClick}>
        {Content}
      </Link>
    );
  }

  return (
    <div className={cardClassName} onClick={onClick}>
      {Content}
    </div>
  );
} 