'use client';

import { Typography, Card, CardActionArea, CardContent, Box, Skeleton } from '@mui/material';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useState } from 'react';


const overlayVariants = {
  initial: { opacity: 0 },
  hover: { opacity: 1 },
};

const cardRevealVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export default function DesignCategoryCard({
  title,
  image,
  link,
  index = 0,
}) {
  const [loadingImage, setLoadingImage] = useState(true);

  return (
    <motion.div
      variants={cardRevealVariants}
      initial="hidden"
      animate="visible"
      transition={{
        delay: index * 0.15,
        duration: 0.6,
        ease: 'easeOut',
        type: 'spring',
        stiffness: 200,
        damping: 20,
      }}
      whileHover={{ scale: 1.03 }}
      style={{
        width: '100%',
        maxWidth: 500,
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Card
        sx={{
          borderRadius: '24px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 12px 32px rgba(0,0,0,0.2)',
          maxWidth: 600,
          minHeight: 400,
          backgroundColor: '#fdfdfd',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 16px 48px rgba(0,0,0,0.25)',
          },
          }}
      >
        <Link href={link} passHref style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          <CardActionArea sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Image Layer: ใช้ Box เพื่อกำหนดขนาดและตำแหน่งของรูปภาพ */}
            <Box sx={{ position: 'relative', width: '100%', paddingTop: '60%' }}> {/* ใช้ paddingTop เพื่อรักษาสัดส่วน 5:3 (Height = 60% of Width) */}
              {loadingImage && (
                <Skeleton
                  variant="rectangular"
                  sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                />
              )}
              <Image
                src={image}
                alt={title}
                fill
                sizes="(max-width: 500px) 100vw, 500px"
                style={{ objectFit: 'cover' }}
                className={`transition-opacity duration-500 ${loadingImage ? 'opacity-0' : 'opacity-100'}`}
                onLoad={() => setLoadingImage(false)}
                priority={index === 0}
              />

              {/* Overlay (เฉพาะ darken เมื่อ Hover) */}
              <motion.div
                variants={overlayVariants}
                initial="initial"
                whileHover="hover"
                whileTap="hover"
                transition={{ duration: 0.3, ease: 'easeOut' }}
                sx={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(0,0,0,0.0)', // เริ่มต้นโปร่งใส
                  zIndex: 2,
                }}
              />
            </Box>

            {/* CardContent: สำหรับข้อความ Title ที่อยู่ด้านล่างรูปภาพ */}
            <CardContent
              sx={{
                flexGrow: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography
                variant="h4"
                textAlign="center"
                sx={{ fontWeight: 'light' }}
              >
                {title}
              </Typography>
            </CardContent>
          </CardActionArea>
        </Link>
      </Card>
    </motion.div>
  );
}