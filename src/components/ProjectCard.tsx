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

  // Mapping de tooltips para tecnologías
  const technologyTooltips: Record<string, string> = {
    'FastAPI': 'Framework web moderno para APIs REST de alta performance',
    'Python': 'Lenguaje de programación principal del backend',
    'SQLAlchemy': 'ORM para gestión y mapeo de base de datos',
    'Swagger': 'Documentación automática de la API REST',
    'Uvicorn': 'Servidor ASGI de alta performance para producción',
    'Java': 'Lenguaje orientado a objetos para desarrollo empresarial',
    'C++': 'Lenguaje de programación de alto rendimiento',
    'Algorithms': 'Implementación de algoritmos computacionales',
    'Data Structures': 'Estructuras de datos fundamentales',
    'Problem Solving': 'Resolución sistemática de problemas',
    'Spring Boot': 'Framework de Java para microservicios',
    'REST API': 'Arquitectura para servicios web RESTful',
    'MySQL': 'Sistema de gestión de bases de datos relacionales',
    'JWT': 'Tokens de autenticación JSON Web Token',
    'Microservices': 'Arquitectura de servicios distribuidos',
    'TensorFlow': 'Framework de machine learning',
    'NumPy': 'Biblioteca para computación científica',
    'Machine Learning': 'Aprendizaje automático y modelado',
    'Deep Learning': 'Redes neuronales profundas',
    'CNN': 'Redes neuronales convolucionales',
    'Apache Kafka': 'Plataforma de streaming distribuido',
    'AWS': 'Servicios de computación en la nube',
    'Docker': 'Containerización y virtualización',
    'Streaming': 'Procesamiento de datos en tiempo real',
    'EC2': 'Instancias de computación elástica de AWS',
    'Data Analysis': 'Análisis y procesamiento de datos',
    'Visualization': 'Visualización de datos y gráficos',
    'Statistics': 'Análisis estadístico y modelado'
  };

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
      {/* Header with title and demo button */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">{title}</h3>
        {demoUrl && (
          <a
            href={demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors duration-200"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Ver Demo
          </a>
        )}
      </div>
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
            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm cursor-help relative group"
            title={technologyTooltips[tech] || `Tecnología: ${tech}`}
          >
            {tech}
            {/* Tooltip personalizado */}
            {technologyTooltips[tech] && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 pointer-events-none">
                {technologyTooltips[tech]}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
              </div>
            )}
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
