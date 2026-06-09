'use client';

import { useState } from 'react';
import { Box, Card, CardActionArea, Skeleton } from '@mui/material';
import Image from 'next/image';

export default function DesignGridCard({ design, onClick }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <Card
      elevation={0}
      sx={{
        width: '100%',
        borderRadius: 0,
        boxShadow: 'none',
        overflow: 'hidden',
      }}
      onClick={() => onClick?.(design)}
    >
      <CardActionArea sx={{ p: 0 }}>
        {/* รูป 16:9 */}
        <Box sx={{ position: 'relative', width: '100%' }}>
          <Box sx={{ pt: { xs: '60%', md: '56.25%' } }} />
          {!loaded && (
            <Skeleton
              variant="rectangular"
              sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            />
          )}
          <Image
            src={design?.coverUrl}
            alt={design?.name || design?.title || 'design'}
            fill
            sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ objectFit: 'cover' }}
            onLoad={() => setLoaded(true)}
            className={`transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            priority={false}
          />
        </Box>
      </CardActionArea>
    </Card>
  );
}
