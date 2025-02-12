type IconProps = {
  name: 'book' | 'bookings';
};

export default function Icon({ name }: IconProps) {
  let src = '';
  if (name === 'book') {
    src = "/icons/book-192x192.png";
  } else if (name === 'bookings') {
    src = "/icons/bookings-192x192.png";
  }
  return <img src={src} alt={name} />;
} 