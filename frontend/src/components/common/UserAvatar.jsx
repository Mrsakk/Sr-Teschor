import React, { useState } from 'react';

export default function UserAvatar({
  user,
  size = 'md',
  className = '',
  ring = true,
}) {
  const [imageError, setImageError] = useState(false);

  const name = user?.name || 'User';
  const firstLetter = name.trim().charAt(0).toUpperCase() || 'U';

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-7 h-7 text-xs',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
    xl: 'w-14 h-14 text-lg',
    '2xl': 'w-20 h-20 text-2xl',
  };

  const ringClass = ring ? 'ring-2 ring-orange-300/80 shadow-xs' : '';
  const currentSize = sizeClasses[size] || sizeClasses.md;

  // If user has an avatar and it hasn't failed to load, show image
  if (user?.avatar && !imageError) {
    return (
      <img
        src={user.avatar}
        alt={name}
        onError={() => setImageError(true)}
        className={`${currentSize} rounded-xl object-cover flex-shrink-0 ${ringClass} ${className}`}
      />
    );
  }

  // Stylish SVG & Letter Avatar Fallback with vibrant gradient
  const roleGradients = {
    admin: 'from-purple-600 via-indigo-600 to-blue-600',
    business: 'from-emerald-600 via-teal-600 to-cyan-600',
    customer: 'from-orange-500 via-amber-500 to-yellow-500',
  };

  const gradient = roleGradients[user?.role] || roleGradients.customer;

  return (
    <div
      className={`${currentSize} rounded-xl bg-gradient-to-tr ${gradient} text-white font-extrabold flex items-center justify-center flex-shrink-0 select-none ${ringClass} ${className}`}
      title={name}
    >
      <span className="leading-none drop-shadow-xs">{firstLetter}</span>
    </div>
  );
}
