'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MediaGalleryViewer } from './MediaGalleryViewer';
import { ProjectGallery } from './ProjectGallery';

type ProjectCardProps = {
  title: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  demoUrl?: string;  // URL para el botón "Ver demo"
  projectId: string;  // Identificador único del proyecto (ej: 'alea', 'bank-api')
  media: {
    type: 'image' | 'pdf';
    url: string;
    title: string;
    thumbnail?: string;
  }[];
};

export function ProjectCard({ title, description, technologies, githubUrl, demoUrl, media, projectId }: ProjectCardProps) {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [initialSlide, setInitialSlide] = useState(0);
  const [dynamicMedia, setDynamicMedia] = useState(media);

  const openGallery = (index: number) => {
    setInitialSlide(index);
    setIsGalleryOpen(true);
  };

  useEffect(() => {
    // Cargar imágenes dinámicas cuando el componente se monta
    const loadDynamicImages = async () => {
      try {
        // Importar la configuración estática
        const { getProjectImages } = await import('../lib/projects');
        const images = getProjectImages(projectId);
        
        // Convertir las imágenes al formato esperado por el viewer
        const dynamicImages = images.map((img: any) => ({
          type: 'image' as const,
          url: img.url,
          title: img.title,
          thumbnail: img.thumbnail
        }));

        // Combinar con documentos existentes
        const documents = media.filter(item => item.type === 'pdf');
        setDynamicMedia([...dynamicImages, ...documents]);
      } catch (error) {
        console.error('Error loading dynamic images:', error);
        setDynamicMedia(media); // Fallback a media estático
      }
    };

    loadDynamicImages();
  }, [projectId, media]);

  const images = dynamicMedia.filter(item => item.type === 'image');
  const documents = dynamicMedia.filter(item => item.type === 'pdf');

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      
      {/* Media Gallery */}
      <ProjectGallery
        projectId={projectId}
        onImageClick={(url, title) => {
          setInitialSlide(0);
          setIsGalleryOpen(true);
        }}
      />
          
      {/* Documents Preview */}
      {documents.length > 0 && (
        <div className="space-y-2">
          {documents.map((item, index) => (
            <button
              key={index}
              onClick={() => openGallery(images.length + index)}
              className="w-full flex items-center p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <svg
                className="w-6 h-6 text-gray-400 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="text-sm text-gray-600">{item.title}</span>
            </button>
          ))}
        </div>
      )}

      {/* Technologies */}
      <div className="flex flex-wrap gap-2 mb-4">
        {technologies.map((tech, index) => (
          <span
            key={index}
            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
          >
            {tech}
          </span>
        ))}
      </div>

      {/* GitHub Link */}
      {githubUrl && (
        <Link
          href={githubUrl}
          className="text-primary hover:text-blue-600 inline-block mr-4"
          target="_blank"
        >
          Ver proyecto →
        </Link>
      )}

      {/* Demo Link */}
      {demoUrl && (
        <Link
          href={demoUrl}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg inline-block transition-colors"
          target="_blank"
        >
          Ver demo
        </Link>
      )}

      {/* Media Gallery Viewer Modal */}
      <MediaGalleryViewer
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        medias={dynamicMedia}
        initialSlide={initialSlide}
      />
    </div>
  );
}
