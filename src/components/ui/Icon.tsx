import Image from 'next/image';

type IconProps = {
  name: 'book' | 'bookings';
  width?: number;
  height?: number;
};

export default function Icon({ name, width = 192, height = 192 }: IconProps) {
  let src = '';
  if (name === 'book') {
    src = "/icons/book-192x192.png";
  } else if (name === 'bookings') {
    src = "/icons/bookings-192x192.png";
  }
  return <Image src={src} alt={name} width={width} height={height} />;
} 