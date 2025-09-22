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
    // En un entorno real, aquí harías una llamada a tu API para obtener la lista de imágenes
    // Por ahora, simularemos que obtenemos las imágenes de la carpeta
    const fetchImages = async () => {
      try {
        // Esto es un ejemplo. En producción, necesitarías un endpoint que liste los archivos
        const response = await fetch(`/api/projects/${projectId}/images`);
        const data = await response.json();
        setImages(data.images);
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
