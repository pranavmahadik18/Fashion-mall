// Utility to resolve product images correctly across local and deployed environments

const DEFAULT_PLACEHOLDER = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=500&q=80';

export const getProductImageUrl = (imageUrl) => {
  if (!imageUrl) return DEFAULT_PLACEHOLDER;
  
  // If it's already an absolute URL or Base64 data URL
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('data:')) {
    return imageUrl;
  }
  
  // If it's a relative path on backend (e.g. /uploads/image.jpg)
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';
  const hostBase = apiBase.replace(/\/api\/?$/, '');
  const cleanPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
  return `${hostBase}${cleanPath}`;
};

export const handleImageError = (e) => {
  e.currentTarget.onerror = null;
  e.currentTarget.src = DEFAULT_PLACEHOLDER;
};
