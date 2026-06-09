'use client';

import { Dialog, IconButton, Box, Typography } from '@mui/material';
import ImageGallery from 'react-image-gallery';
import CloseIcon from '@mui/icons-material/Close';

import 'react-image-gallery/styles/css/image-gallery.css';

export default function GalleryModal({ open, onClose, data }) {
  if (!data) return null;

  const images = data.images?.map((img) => ({
    original: img.imageUrl,
    thumbnail: img.thumbnailUrl || img.imageUrl,
  })) || [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      sx={{ '& .MuiDialog-paper': { borderRadius: 3 } }}
    >
      <Box sx={{ position: 'relative', p: 2 }}>
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}
        >
          <CloseIcon />
        </IconButton>

        <Typography variant="h6" textAlign="center" mb={2}>
          {data.name}
        </Typography>

        {images.length > 0 ? (
          <ImageGallery
            items={images}
            showThumbnails={true}
            showPlayButton={false}
            showFullscreenButton={false}
            showNav={true}
            slideDuration={450}
            thumbnailPosition="bottom"
          />
        ) : (
          <Typography textAlign="center" color="text.secondary" sx={{ p: 4 }}>
            ไม่มีภาพเพิ่มเติมสำหรับโครงการนี้
          </Typography>
        )}
      </Box>
    </Dialog>
  );
}