// Configuración estática de proyectos e imágenes
export interface ProjectImage {
  url: string;
  title: string;
  thumbnail: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  images: ProjectImage[];
}

// Configuración manual de imágenes por proyecto
export const projectsConfig: Project[] = [
  {
    id: 'alea',
    name: 'Alea Project',
    description: 'Sistema de análisis y visualización de datos',
    images: [
      {
        url: '/projects/alea/images/Captura desde 2025-09-18 02-44-00.png',
        title: 'Dashboard Principal',
        thumbnail: '/projects/alea/images/Captura desde 2025-09-18 02-44-00.png'
      },
      {
        url: '/projects/alea/images/Captura desde 2025-09-18 02-45-34-1.png',
        title: 'Vista de Análisis',
        thumbnail: '/projects/alea/images/Captura desde 2025-09-18 02-45-34-1.png'
      },
      {
        url: '/projects/alea/images/Captura desde 2025-09-18 02-45-53.png',
        title: 'Gráficos y Estadísticas',
        thumbnail: '/projects/alea/images/Captura desde 2025-09-18 02-45-53.png'
      },
      {
        url: '/projects/alea/images/Captura desde 2025-09-18 02-47-38.png',
        title: 'Configuración',
        thumbnail: '/projects/alea/images/Captura desde 2025-09-18 02-47-38.png'
      },
      {
        url: '/projects/alea/images/Captura desde 2025-09-18 02-48-06.png',
        title: 'Reportes',
        thumbnail: '/projects/alea/images/Captura desde 2025-09-18 02-48-06.png'
      },
      {
        url: '/projects/alea/images/bank-api-arch-thumb.png',
        title: 'Arquitectura del Sistema',
        thumbnail: '/projects/alea/images/bank-api-arch-thumb.png'
      }
    ]
  },
  {
    id: 'bank-api',
    name: 'Bank API System',
    description: 'Sistema bancario con API REST completa',
    images: [
      {
        url: '/projects/bank-api/images/353605126-9504e344-69f0-43dd-aeca-336c9873a126.png',
        title: 'Dashboard Bancario',
        thumbnail: '/projects/bank-api/images/353605126-9504e344-69f0-43dd-aeca-336c9873a126.png'
      },
      {
        url: '/projects/bank-api/images/354639670-2e149134-f6e1-4a39-8668-90a5c059d408.png',
        title: 'Gestión de Cuentas',
        thumbnail: '/projects/bank-api/images/354639670-2e149134-f6e1-4a39-8668-90a5c059d408.png'
      },
      {
        url: '/projects/bank-api/images/354646421-eb015835-6a4c-4d79-a8a2-7df65816d579.png',
        title: 'Transacciones',
        thumbnail: '/projects/bank-api/images/354646421-eb015835-6a4c-4d79-a8a2-7df65816d579.png'
      },
      {
        url: '/projects/bank-api/images/GestionDeTarjetasCredito-2.0.png',
        title: 'Gestión de Tarjetas de Crédito',
        thumbnail: '/projects/bank-api/images/GestionDeTarjetasCredito-2.0.png'
      },
      {
        url: '/projects/bank-api/images/PagoDeServicios-2.0.png',
        title: 'Pago de Servicios',
        thumbnail: '/projects/bank-api/images/PagoDeServicios-2.0.png'
      },
      {
        url: '/projects/bank-api/images/ProcesoTransferenciaFondos.png',
        title: 'Proceso de Transferencia de Fondos',
        thumbnail: '/projects/bank-api/images/ProcesoTransferenciaFondos.png'
      },
      {
        url: '/projects/bank-api/images/SolicitudDePrestamo-2.0.png',
        title: 'Solicitud de Préstamo',
        thumbnail: '/projects/bank-api/images/SolicitudDePrestamo-2.0.png'
      },
      {
        url: '/projects/bank-api/images/procesoAperturaCuenta.png',
        title: 'Proceso de Apertura de Cuenta',
        thumbnail: '/projects/bank-api/images/procesoAperturaCuenta.png'
      }
    ]
  },
  {
    id: 'cnn-forward',
    name: 'CNN Forward Propagation',
    description: 'Implementación de red neuronal convolucional',
    images: [
      {
        url: '/projects/cnn-forward/images/472669032-b99985a8-e1fb-4537-807c-b44711fb8b56.jpeg',
        title: 'Arquitectura de la CNN',
        thumbnail: '/projects/cnn-forward/images/472669032-b99985a8-e1fb-4537-807c-b44711fb8b56.jpeg'
      },
      {
        url: '/projects/cnn-forward/images/472669037-6728e017-7465-4dae-bf0f-0a6f1a781f76.jpeg',
        title: 'Forward Propagation',
        thumbnail: '/projects/cnn-forward/images/472669037-6728e017-7465-4dae-bf0f-0a6f1a781f76.jpeg'
      },
      {
        url: '/projects/cnn-forward/images/472669254-bc66933e-6761-41dd-aec4-653c6c96794f.jpeg',
        title: 'Resultados y Métricas',
        thumbnail: '/projects/cnn-forward/images/472669254-bc66933e-6761-41dd-aec4-653c6c96794f.jpeg'
      }
    ]
  },
  {
    id: 'kafka-aws',
    name: 'Kafka AWS Integration',
    description: 'Sistema de streaming de datos con Apache Kafka en AWS',
    images: [
      {
        url: '/projects/kafka-aws/images/Captura desde 2025-07-17 14-51-39.png',
        title: 'Configuración de Kafka',
        thumbnail: '/projects/kafka-aws/images/Captura desde 2025-07-17 14-51-39.png'
      },
      {
        url: '/projects/kafka-aws/images/Captura desde 2025-07-17 23-14-58.png',
        title: 'Monitoreo de Topics',
        thumbnail: '/projects/kafka-aws/images/Captura desde 2025-07-17 23-14-58.png'
      },
      {
        url: '/projects/kafka-aws/images/Captura desde 2025-07-18 05-11-17.png',
        title: 'Dashboard de Métricas',
        thumbnail: '/projects/kafka-aws/images/Captura desde 2025-07-18 05-11-17.png'
      },
      {
        url: '/projects/kafka-aws/images/Screenshot from 2025-07-04 08-00-50.png',
        title: 'Configuración AWS',
        thumbnail: '/projects/kafka-aws/images/Screenshot from 2025-07-04 08-00-50.png'
      },
      {
        url: '/projects/kafka-aws/images/Screenshot from 2025-07-04 08-43-19.png',
        title: 'Servicios en AWS',
        thumbnail: '/projects/kafka-aws/images/Screenshot from 2025-07-04 08-43-19.png'
      },
      {
        url: '/projects/kafka-aws/images/Screenshot from 2025-07-10 13-22-18.png',
        title: 'Instancias EC2',
        thumbnail: '/projects/kafka-aws/images/Screenshot from 2025-07-10 13-22-18.png'
      },
      {
        url: '/projects/kafka-aws/images/Screenshot from 2025-07-10 15-42-10.png',
        title: 'Logs del Sistema',
        thumbnail: '/projects/kafka-aws/images/Screenshot from 2025-07-10 15-42-10.png'
      }
    ]
  }
];

// Función para obtener un proyecto por ID
export function getProjectById(id: string): Project | undefined {
  return projectsConfig.find(project => project.id === id);
}

// Función para obtener todas las imágenes de un proyecto
export function getProjectImages(projectId: string): ProjectImage[] {
  const project = getProjectById(projectId);
  return project ? project.images : [];
}