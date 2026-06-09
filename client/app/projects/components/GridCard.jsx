'use client';

import { useMemo, useState, useEffect } from 'react';
import { Box, Card, Button, Typography, Skeleton } from '@mui/material';
import Image from 'next/image';

export default function GridCard({ data, onClick }) {
  const palette = {
    accent: '#BFA68A',
    panel: '#FFFFFF',
    text: '#111111',
  };

  const srcCandidate = useMemo(
    () =>
      data?.coverUrl ||
      data?.imageUrl ||
      data?.images?.[0]?.imageUrl ||
      data?.image ||
      '/images/default-data.jpg',
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
    <Card
      elevation={0}
      sx={{ width: '100%', borderRadius: 0, boxShadow: 'none', overflow: 'hidden', bgcolor: 'transparent' }}
    >
      <Box sx={{ position: 'relative', width: '100%', cursor: 'pointer' }} onClick={() => onClick?.(data)}>
        {/* 4:3 */}
        <Box sx={{ pt: '75%' }} />
        {!loaded && (
          <Skeleton variant="rectangular" sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
        )}
        <Image
          src={imgSrc}
          alt={data?.name || data?.title || 'project cover'}
          fill
          sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ objectFit: 'cover' }}
          unoptimized
          onLoad={() => setLoaded(true)}
          onError={() => {
            if (imgSrc !== '/images/default-data.jpg') setImgSrc('/images/default-data.jpg');
          }}
        />
      </Box>

      <Box sx={{ bgcolor: palette.panel, px: { xs: 3, md: 3.5 }, py: { xs: 3, md: 3.25 }, textAlign: 'center' }}>
        <Typography sx={{ color: palette.text, fontSize: { xs: '1.05rem', md: '1.15rem' }, lineHeight: 1.7 }}>
          {data?.name || ''}
        </Typography>

        {data?.details && (
          <Typography
            sx={{
              color: palette.text,
              fontSize: { xs: '1.05rem', md: '1.15rem' },
              lineHeight: 1.7,
              whiteSpace: 'pre-line',
              mt: 0.25,
            }}
          >
            {data.details}
          </Typography>
        )}

        {area && (
          <Typography
            sx={{
              mt: 1,
              color: palette.text,
              fontWeight: 800,
              fontSize: { xs: '1.25rem', md: '1.35rem' },
              letterSpacing: '.01em',
            }}
          >
            {area}
          </Typography>
        )}

        <Button
          onClick={() => onClick?.(data)}
          fullWidth
          sx={{
            mt: { xs: 2.2, md: 2.6 },
            py: { xs: 1.3, md: 1.4 },
            borderRadius: '999px',
            bgcolor: palette.accent,
            color: '#fff',
            textTransform: 'none',
            fontSize: { xs: '1.05rem', md: '1.1rem' },
            fontWeight: 600,
            '&:hover': { bgcolor: '#a99076', textDecoration: 'underline' },
          }}
          aria-label="View project"
        >
          View
        </Button>
      </Box>
    </Card>
  );
}
