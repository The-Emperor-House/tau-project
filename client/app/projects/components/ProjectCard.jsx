'use client';

import Link from 'next/link';
import Image from 'next/image';
import { memo, useMemo, useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { cn } from '@/shared/lib/cn';
import useIsTouch from '@/shared/hooks/useIsTouch';

/* ================================
 * Motion Variants
 * ================================ */
const cardLiftVariants = {
  rest:  { y: 0 },
  hover: { y: -3 },
};

const titleVariants = {
  hidden: { opacity: 0, y: 8 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

const descVariants = {
  hidden: { opacity: 0, y: 8 },
  show:   { opacity: 1, y: 0, transition: { delay: 0.06, type: 'spring', stiffness: 280, damping: 24 } },
};

/* ================================
 * Presentational pieces
 * ================================ */
const CardVignette = memo(function CardVignette() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_45%_at_50%_50%,rgba(0,0,0,0.45),rgba(0,0,0,0.15)_60%,rgba(0,0,0,0)_85%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.25),rgba(0,0,0,0)_30%,rgba(0,0,0,0)_70%,rgba(0,0,0,0.3))]" />
    </>
  );
});

/** เส้นใต้แบบ animate: 
 * - ตอนเข้าหน้า: ค่อยๆ ขยายจากซ้าย (whileInView)
 * - ตอน hover การ์ด: เพิ่มความหนา (variants จาก parent)
 */
const AnimatedUnderline = memo(function AnimatedUnderline() {
  // ใช้ inView ที่ตัวเส้นเองได้เลย
  const ref = useRef(null);
  const inView = useInView(ref, { margin: '-10%', amount: 0.5, once: true });

  return (
    <motion.div
      ref={ref}
      // รับ state hover จาก parent ผ่าน variants
      variants={{
        rest:  { scaleY: 1,   opacity: 0.9 },
        hover: { scaleY: 1.6, opacity: 1   },
      }}
      // เข้าหน้าแล้วค่อยๆ ขยายความยาว (scaleX)
      initial={{ scaleX: 0, opacity: 0.7 }}
      animate={inView ? { scaleX: 1, opacity: 0.9 } : undefined}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="mx-auto my-3 h-[2px] w-[clamp(120px,6vw,180px)] origin-left bg-gradient-to-r from-white/0 via-white/80 to-white/0"
      style={{ transformOrigin: 'left' }}
    />
  );
});

/* ================================
 * Main Component
 * ================================ */
function ProjectCardBase({
  title,
  description,
  imageSrc,
  href,
  className,
  priority = false,
}) {
  const isTouch = useIsTouch();

  // บน touch: ให้เห็นเอฟเฟกต์ตั้งแต่ต้น
  const cardInitial = useMemo(() => (isTouch ? 'hover' : 'rest'), [isTouch]);
  const textInitial = useMemo(() => (isTouch ? 'show' : 'hidden'), [isTouch]);

  return (
    <motion.article
      initial={cardInitial}
      animate="rest"
      whileHover="hover"
      variants={cardLiftVariants}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn(
        'group relative aspect-[3/4] w-full overflow-hidden rounded-2xl',
        'bg-neutral-950/70 ring-1 ring-white/10',
        'shadow-[0_18px_50px_-18px_rgba(0,0,0,0.45)]',
        className
      )}
    >
      {/* shimmer border */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl before:absolute before:inset-[-1px] before:rounded-[inherit] before:bg-[conic-gradient(from_180deg_at_50%_50%,rgba(255,255,255,0.25)_0deg,rgba(255,255,255,0.03)_120deg,rgba(255,255,255,0.25)_240deg,rgba(255,255,255,0.03)_360deg)] before:opacity-0 before:transition-opacity before:duration-500 group-hover:before:opacity-100" />

      <Link href={href} aria-label={title} className="absolute inset-0 block focus:outline-none">
        {/* image */}
        <div className="absolute inset-0">
          <Image
            src={imageSrc}
            alt={title}
            fill
            priority={priority}
            sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, (max-width:1536px) 33vw, 25vw"
            className={cn('object-cover transition-transform duration-700', 'group-hover:scale-[1.02]')}
          />
        </div>

        <CardVignette />

        {/* centered copy */}
        <div className="absolute inset-0 z-10 flex items-center justify-center p-5 sm:p-6">
          <motion.div
            initial={textInitial}
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            className="mx-auto max-w-[85%] text-center"
          >
            <motion.h3
              variants={titleVariants}
              className={cn(
                'font-extrabold uppercase text-white',
                'tracking-[0.18em] sm:tracking-[0.22em] md:tracking-[0.26em]',
                'text-lg sm:text-xl md:text-2xl',
                'drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]'
              )}
            >
              {title}
            </motion.h3>

            {/* เส้นใต้—ฟัง hover จาก article + inView ของตัวเอง */}
            <AnimatedUnderline />

            <motion.p
              variants={descVariants}
              className="text-sm font-light text-white/90 sm:text-base drop-shadow-[0_3px_8px_rgba(0,0,0,0.5)]"
            >
              {description}
            </motion.p>
          </motion.div>
        </div>

        {/* a11y focus ring */}
        <span className="absolute inset-0 rounded-2xl ring-2 ring-transparent transition focus-visible:ring-white/60" />
      </Link>

      {/* inner border on hover */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0))] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    </motion.article>
  );
}

const ProjectCard = memo(ProjectCardBase);
export default ProjectCard;
