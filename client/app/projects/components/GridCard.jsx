'use client';

import { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import { Skeleton } from '@/shared/components/ui/skeleton';

const ACCENT = '#BFA68A';
const FALLBACK = '/images/default-data.jpg';

export default function GridCard({ data, onClick }) {
  const srcCandidate = useMemo(
    () =>
      data?.coverUrl ||
      data?.imageUrl ||
      data?.images?.[0]?.imageUrl ||
      data?.image ||
      FALLBACK,
    [data]
  );

  const [loaded, setLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState(srcCandidate);
  useEffect(() => setImgSrc(srcCandidate), [srcCandidate]);

  const area =
    data?.areaSize != null && data?.areaSize !== ''
      ? `พื้นที่ใช้สอย ${
          typeof data.areaSize === 'number'
            ? data.areaSize.toLocaleString('th-TH')
            : String(data.areaSize)
        } ตรม.`
      : data?.area || '';

  return (
    <div className="w-full overflow-hidden">
      <div
        className="relative w-full cursor-pointer"
        style={{ paddingTop: '75%' }}
        onClick={() => onClick?.(data)}
      >
        {!loaded && (
          <Skeleton className="absolute inset-0 w-full h-full" />
        )}
        <Image
          src={imgSrc}
          alt={data?.name || data?.title || 'project cover'}
          fill
          sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
          unoptimized
          onLoad={() => setLoaded(true)}
          onError={() => {
            if (imgSrc !== FALLBACK) setImgSrc(FALLBACK);
          }}
        />
      </div>

      <div className="bg-white px-6 md:px-7 py-6 md:py-7 text-center">
        <p className="text-[#111] text-[1.05rem] md:text-[1.15rem] leading-[1.7]">
          {data?.name || ''}
        </p>
        {data?.details && (
          <p className="text-[#111] text-[1.05rem] md:text-[1.15rem] leading-[1.7] whitespace-pre-line mt-1">
            {data.details}
          </p>
        )}
        {area && (
          <p className="mt-2 text-[#111] font-extrabold text-[1.25rem] md:text-[1.35rem] tracking-tight">
            {area}
          </p>
        )}
        <button
          onClick={() => onClick?.(data)}
          className="mt-5 md:mt-6 w-full py-3 md:py-3.5 rounded-full text-white font-semibold text-[1.05rem] md:text-[1.1rem] transition-colors"
          style={{ backgroundColor: ACCENT }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#a99076')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = ACCENT)}
          aria-label="View project"
        >
          View
        </button>
      </div>
    </div>
  );
}
