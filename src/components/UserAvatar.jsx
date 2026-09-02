'use client';

import React, { useState } from 'react';
import { resolvePontoImage } from '@/utils/imageUtils';

export default function UserAvatar({
  src,
  name = '',
  className = '',
  bgClassName = 'bg-[#D4E8ED] text-[#4493AC]',
  textClassName = '',
  alt
}) {
  const [hasError, setHasError] = useState(false);

  const resolvedSrc = resolvePontoImage(src);
  const isImageValid = Boolean(
    resolvedSrc && typeof resolvedSrc === 'string' && resolvedSrc.trim() !== '' && !hasError
  );

  const initial = name?.trim()?.charAt(0)?.toUpperCase() || 'U';

  if (isImageValid) {
    return (
      <img
        src={resolvedSrc}
        alt={alt || name || 'Avatar'}
        onError={() => setHasError(true)}
        className={`rounded-full object-cover shrink-0 ${className}`}
      />
    );
  }

  return (
    <div 
      className={`rounded-full flex items-center justify-center font-bold select-none shrink-0 ${bgClassName} ${className}`}
      title={name}
    >
      <span className={textClassName}>{initial}</span>
    </div>
  );
}
