'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Skeleton } from '@/shared/components/ui/skeleton';

const cardRevealVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export default function DesignCategoryCard({ title, image, link, index = 0 }) {
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
      className="w-full max-w-[500px] rounded-xl overflow-hidden shadow-[0_4px_8px_rgba(0,0,0,0.1)] flex flex-col"
    >
      <Link
        href={link}
        className="no-underline flex flex-col flex-1 rounded-3xl overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,0.2)] bg-[#fdfdfd] hover:-translate-y-2 hover:shadow-[0_16px_48px_rgba(0,0,0,0.25)] transition-all duration-300 min-h-[400px] max-w-[600px]"
      >
        <div className="relative w-full" style={{ paddingTop: "60%" }}>
          {loadingImage && (
            <Skeleton className="absolute inset-0 w-full h-full" />
          )}
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 500px) 100vw, 500px"
            className={`object-cover transition-opacity duration-500 ${loadingImage ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => setLoadingImage(false)}
            priority={index === 0}
          />
        </div>

        <div className="flex flex-1 items-center justify-center p-4">
          <h4 className="text-center text-2xl font-light">{title}</h4>
        </div>
      </Link>
    </motion.div>
  );
}
