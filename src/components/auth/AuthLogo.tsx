import Image from 'next/image';
import Link from 'next/link';

/**
 * AuthLogo component displays the PointMe logo on authentication pages
 * and links back to the home page
 */
export function AuthLogo() {
  return (
    <div className="mb-8 flex justify-center">
      <Link href="/" className="inline-block">
        <Image 
          src="/logo.svg" 
          alt="PointMe Logo" 
          width={200} 
          height={50} 
          priority
          className="transition-transform hover:scale-105"
        />
      </Link>
    </div>
  );
}