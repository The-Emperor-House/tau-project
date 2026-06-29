'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';

export default function GalleryModal({ open, onClose, data }) {
  if (!data) return null;

  const images =
    data.images?.map((img) => ({
      original: img.imageUrl,
      thumbnail: img.thumbnailUrl || img.imageUrl,
    })) || [];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl w-full p-4 sm:rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-center pr-6">{data.name}</DialogTitle>
        </DialogHeader>

        {images.length > 0 ? (
          <ImageGallery
            items={images}
            showThumbnails
            showPlayButton={false}
            showFullscreenButton={false}
            showNav
            slideDuration={450}
            thumbnailPosition="bottom"
          />
        ) : (
          <p className="text-center text-muted-foreground py-8">
            ไม่มีภาพเพิ่มเติมสำหรับโครงการนี้
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
