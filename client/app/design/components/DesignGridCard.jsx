'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Skeleton } from '@/shared/components/ui/skeleton';

export default function DesignGridCard({ design, onClick }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className="w-full overflow-hidden cursor-pointer"
      onClick={() => onClick?.(design)}
    >
      <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
        {!loaded && (
          <Skeleton className="absolute inset-0 w-full h-full" />
        )}
        <Image
          src={design?.coverUrl}
          alt={design?.name || design?.title || 'design'}
          fill
          sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={`object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setLoaded(true)}
          priority={false}
        />
      </div>
    </div>
  );
}
