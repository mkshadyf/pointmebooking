// Default Unsplash collections for different types of images
const UNSPLASH_COLLECTIONS = {
  services: [
    'https://images.unsplash.com/photo-1560869713-da86a9ec0580',
    'https://images.unsplash.com/photo-1610992015732-2449b0dd2b8f',
    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70',
    'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d',
  ],
  business: [
    'https://images.unsplash.com/photo-1497366216548-37526070297c',
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2',
    'https://images.unsplash.com/photo-1497366754035-f200968a6e72',
  ],
  profile: [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    'https://images.unsplash.com/photo-1527980965255-d3b416303d12',
  ],
};

type ImageType = keyof typeof UNSPLASH_COLLECTIONS;

export function getRandomImageUrl(type: ImageType = 'services', index?: number): string {
  const collection = UNSPLASH_COLLECTIONS[type];
  const imageUrl = index !== undefined 
    ? collection[index % collection.length]
    : collection[Math.floor(Math.random() * collection.length)];
    
  // Add Unsplash parameters for better quality and format
  return `${imageUrl}?q=80&w=2070&auto=format&fit=crop`;
}

export function getPlaceholderImage(width: number = 400, height: number = 300): string {
  return `https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=${width}&h=${height}&fit=crop`;
}

export function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function getImageUrl(url: string | null | undefined, type: ImageType = 'services'): string {
  if (isValidImageUrl(url)) {
    return url!;
  }
  return getRandomImageUrl(type);
} 