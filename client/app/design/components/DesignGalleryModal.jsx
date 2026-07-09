'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { X } from 'lucide-react';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';

export default function DesignGalleryModal({ open, onClose, design }) {
  if (!design) return null;

  const images =
    design.images?.map((img) => ({
      original: img.imageUrl,
      thumbnail: img.thumbnailUrl || img.imageUrl,
    })) || [];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl w-full p-4 sm:rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-center pr-6">{design.name}</DialogTitle>
        </DialogHeader>

        {images.length > 0 ? (
          <div className="[&_.image-gallery-slide-wrapper]:h-[420px] [&_.image-gallery-image]:h-full [&_.image-gallery-image]:object-contain [&_.image-gallery-slide]:h-full [&_.image-gallery-swipe]:h-full [&_.image-gallery-slides]:h-full [&_.image-gallery-thumbnail-image]:h-[70px] [&_.image-gallery-thumbnail-image]:object-cover [&_.image-gallery-thumbnail]:w-[100px]">
            <ImageGallery
              items={images}
              showThumbnails
              showPlayButton={false}
              showFullscreenButton={false}
              showNav
              slideDuration={450}
              thumbnailPosition="bottom"
            />
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            ไม่มีภาพเพิ่มเติมสำหรับ Design นี้
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
