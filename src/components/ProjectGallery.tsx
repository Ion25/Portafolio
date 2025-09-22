'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

type ProjectGalleryProps = {
  projectId: string;
  onImageClick: (imageUrl: string, title: string) => void;
};

export function ProjectGallery({ projectId, onImageClick }: ProjectGalleryProps) {
  const [images, setImages] = useState<{url: string, title: string}[]>([]);

  useEffect(() => {
    // Obtener las imágenes de la configuración estática
    const fetchImages = async () => {
      try {
        // Importar la configuración estática
        const { getProjectImages } = await import('../lib/projects');
        const projectImages = getProjectImages(projectId);
        setImages(projectImages);
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    };

    fetchImages();
  }, [projectId]);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true
  };

  if (images.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="grid grid-cols-2 gap-2">
        {images.slice(0, 4).map((image, index) => (
          <button
            key={index}
            onClick={() => onImageClick(image.url, image.title)}
            className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden hover:opacity-90 transition"
          >
            <Image
              src={image.url}
              alt={image.title}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
