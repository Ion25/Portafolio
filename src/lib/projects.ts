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
  technologies: string[];
  images: ProjectImage[];
  demoUrl?: string;
  githubUrl?: string;
}

// Helper para generar rutas correctas para GitHub Pages
const getAssetPath = (path: string) => {
  const basePath = process.env.NODE_ENV === 'production' ? '/Portafolio' : '';
  return `${basePath}${path}`;
};

// Configuración manual de imágenes por proyecto
export const projectsConfig: Project[] = [
  {
    id: 'task-tracker',
    name: 'Task Tracker',
    description: 'Sistema completo de gestión de tareas con API REST y widget de clima en tiempo real. Desarrollado con FastAPI, SQLAlchemy, y JavaScript vanilla. Incluye CRUD completo, dashboard con estadísticas, documentación automática con Swagger UI y deploy containerizado.',
    technologies: ['FastAPI', 'Python', 'SQLAlchemy', 'Swagger', 'Uvicorn'],
    githubUrl: 'https://github.com/Ion25/taskTracker.git',
    demoUrl: 'https://tasktracker-06w8.onrender.com/app',
    images: [
      {
        url: getAssetPath('/projects/task-tracker/images/Captura desde 2025-09-22 00-27-03.png'),
        title: 'Dashboard Principal - Vista general de tareas',
        thumbnail: getAssetPath('/projects/task-tracker/images/Captura desde 2025-09-22 00-27-03.png')
      },
      {
        url: getAssetPath('/projects/task-tracker/images/Captura desde 2025-09-22 00-27-10.png'),
        title: 'Gestión de Tareas - CRUD completo',
        thumbnail: getAssetPath('/projects/task-tracker/images/Captura desde 2025-09-22 00-27-10.png')
      },
      {
        url: getAssetPath('/projects/task-tracker/images/Captura desde 2025-09-22 00-27-27.png'),
        title: 'API REST - Documentación Swagger',
        thumbnail: getAssetPath('/projects/task-tracker/images/Captura desde 2025-09-22 00-27-27.png')
      },
      {
        url: getAssetPath('/projects/task-tracker/images/Captura desde 2025-09-22 00-27-39.png'),
        title: 'Widget de Clima - Integración externa',
        thumbnail: getAssetPath('/projects/task-tracker/images/Captura desde 2025-09-22 00-27-39.png')
      },
      {
        url: getAssetPath('/projects/task-tracker/images/Captura desde 2025-09-22 00-27-55.png'),
        title: 'Estadísticas - Dashboard en tiempo real',
        thumbnail: getAssetPath('/projects/task-tracker/images/Captura desde 2025-09-22 00-27-55.png')
      }
    ]
  },
  {
    id: 'alea',
    name: 'Alea Project',
    description: 'Sistema de análisis y visualización de datos',
    technologies: ['Python', 'Data Analysis', 'Visualization', 'Statistics'],
    githubUrl: 'https://github.com/Ion25/ALEA/tree/Entregable1',
    images: [
      {
        url: getAssetPath('/projects/alea/images/Captura desde 2025-09-18 02-44-00.png'),
        title: 'Dashboard Principal',
        thumbnail: getAssetPath('/projects/alea/images/Captura desde 2025-09-18 02-44-00.png')
      },
      {
        url: getAssetPath('/projects/alea/images/Captura desde 2025-09-18 02-45-34-1.png'),
        title: 'Vista de Análisis',
        thumbnail: getAssetPath('/projects/alea/images/Captura desde 2025-09-18 02-45-34-1.png')
      },
      {
        url: getAssetPath('/projects/alea/images/Captura desde 2025-09-18 02-45-53.png'),
        title: 'Gráficos y Estadísticas',
        thumbnail: getAssetPath('/projects/alea/images/Captura desde 2025-09-18 02-45-53.png')
      },
      {
        url: getAssetPath('/projects/alea/images/Captura desde 2025-09-18 02-47-38.png'),
        title: 'Configuración',
        thumbnail: getAssetPath('/projects/alea/images/Captura desde 2025-09-18 02-47-38.png')
      },
      {
        url: getAssetPath('/projects/alea/images/Captura desde 2025-09-18 02-48-06.png'),
        title: 'Reportes',
        thumbnail: getAssetPath('/projects/alea/images/Captura desde 2025-09-18 02-48-06.png')
      },
      {
        url: getAssetPath('/projects/alea/images/bank-api-arch-thumb.png'),
        title: 'Arquitectura del Sistema',
        thumbnail: getAssetPath('/projects/alea/images/bank-api-arch-thumb.png')
      }
    ]
  },
  {
    id: 'bank-api',
    name: 'Bank API System',
    description: 'Sistema bancario con API REST completa',
    technologies: ['Java', 'Spring Boot', 'REST API', 'MySQL', 'JWT', 'Microservices'],
    githubUrl: 'https://github.com/Ion25/bancoRestAPI.git',
    images: [
      {
        url: getAssetPath('/projects/bank-api/images/353605126-9504e344-69f0-43dd-aeca-336c9873a126.png'),
        title: 'Dashboard Bancario',
        thumbnail: getAssetPath('/projects/bank-api/images/353605126-9504e344-69f0-43dd-aeca-336c9873a126.png')
      },
      {
        url: getAssetPath('/projects/bank-api/images/354639670-2e149134-f6e1-4a39-8668-90a5c059d408.png'),
        title: 'Gestión de Cuentas',
        thumbnail: getAssetPath('/projects/bank-api/images/354639670-2e149134-f6e1-4a39-8668-90a5c059d408.png')
      },
      {
        url: getAssetPath('/projects/bank-api/images/354646421-eb015835-6a4c-4d79-a8a2-7df65816d579.png'),
        title: 'Transacciones',
        thumbnail: getAssetPath('/projects/bank-api/images/354646421-eb015835-6a4c-4d79-a8a2-7df65816d579.png')
      },
      {
        url: getAssetPath('/projects/bank-api/images/GestionDeTarjetasCredito-2.0.png'),
        title: 'Gestión de Tarjetas de Crédito',
        thumbnail: getAssetPath('/projects/bank-api/images/GestionDeTarjetasCredito-2.0.png')
      },
      {
        url: getAssetPath('/projects/bank-api/images/PagoDeServicios-2.0.png'),
        title: 'Pago de Servicios',
        thumbnail: getAssetPath('/projects/bank-api/images/PagoDeServicios-2.0.png')
      },
      {
        url: getAssetPath('/projects/bank-api/images/ProcesoTransferenciaFondos.png'),
        title: 'Proceso de Transferencia de Fondos',
        thumbnail: getAssetPath('/projects/bank-api/images/ProcesoTransferenciaFondos.png')
      },
      {
        url: getAssetPath('/projects/bank-api/images/SolicitudDePrestamo-2.0.png'),
        title: 'Solicitud de Préstamo',
        thumbnail: getAssetPath('/projects/bank-api/images/SolicitudDePrestamo-2.0.png')
      },
      {
        url: getAssetPath('/projects/bank-api/images/procesoAperturaCuenta.png'),
        title: 'Proceso de Apertura de Cuenta',
        thumbnail: getAssetPath('/projects/bank-api/images/procesoAperturaCuenta.png')
      }
    ]
  },
  {
    id: 'cnn-forward',
    name: 'Vision Transformer (ViT) Implementation in C++',
    description: 'Implementación desde cero de un Vision Transformer (ViT) en C++ con libtorch, entrenado en MNIST y Fashion-MNIST, con soporte para inferencia en imágenes reales y uso de los pesos .pt para probar con nuevas imágenes.',
    technologies: ['C++', 'libtorch', 'PyTorch', 'Machine Learning', 'Deep Learning', 'Vision Transformer', 'MNIST', 'Fashion-MNIST'],
    githubUrl: 'https://github.com/Ion25/vitc-.git',
    images: [
      {
        url: getAssetPath('/projects/cnn-forward/images/472669032-b99985a8-e1fb-4537-807c-b44711fb8b56.jpeg'),
        title: 'Arquitectura de la CNN',
        thumbnail: getAssetPath('/projects/cnn-forward/images/472669032-b99985a8-e1fb-4537-807c-b44711fb8b56.jpeg')
      },
      {
        url: getAssetPath('/projects/cnn-forward/images/472669037-6728e017-7465-4dae-bf0f-0a6f1a781f76.jpeg'),
        title: 'Forward Propagation',
        thumbnail: getAssetPath('/projects/cnn-forward/images/472669037-6728e017-7465-4dae-bf0f-0a6f1a781f76.jpeg')
      },
      {
        url: getAssetPath('/projects/cnn-forward/images/472669254-bc66933e-6761-41dd-aec4-653c6c96794f.jpeg'),
        title: 'Resultados y Métricas',
        thumbnail: getAssetPath('/projects/cnn-forward/images/472669254-bc66933e-6761-41dd-aec4-653c6c96794f.jpeg')
      }
    ]
  },
  {
    id: 'kafka-aws',
    name: 'Kafka AWS Integration',
    description: 'Sistema de streaming de datos con Apache Kafka en AWS',
    technologies: ['Apache Kafka', 'AWS', 'Docker', 'Java', 'Streaming', 'Microservices', 'EC2'],
    githubUrl: 'https://github.com/Ion25/kafka-aws-project.git',
    images: [
      {
        url: getAssetPath('/projects/kafka-aws/images/Captura desde 2025-07-17 14-51-39.png'),
        title: 'Configuración de Kafka',
        thumbnail: getAssetPath('/projects/kafka-aws/images/Captura desde 2025-07-17 14-51-39.png')
      },
      {
        url: getAssetPath('/projects/kafka-aws/images/Captura desde 2025-07-17 23-14-58.png'),
        title: 'Monitoreo de Topics',
        thumbnail: getAssetPath('/projects/kafka-aws/images/Captura desde 2025-07-17 23-14-58.png')
      },
      {
        url: getAssetPath('/projects/kafka-aws/images/Captura desde 2025-07-18 05-11-17.png'),
        title: 'Dashboard de Métricas',
        thumbnail: getAssetPath('/projects/kafka-aws/images/Captura desde 2025-07-18 05-11-17.png')
      },
      {
        url: getAssetPath('/projects/kafka-aws/images/Screenshot from 2025-07-04 08-00-50.png'),
        title: 'Configuración AWS',
        thumbnail: getAssetPath('/projects/kafka-aws/images/Screenshot from 2025-07-04 08-00-50.png')
      },
      {
        url: getAssetPath('/projects/kafka-aws/images/Screenshot from 2025-07-04 08-43-19.png'),
        title: 'Servicios en AWS',
        thumbnail: getAssetPath('/projects/kafka-aws/images/Screenshot from 2025-07-04 08-43-19.png')
      },
      {
        url: getAssetPath('/projects/kafka-aws/images/Screenshot from 2025-07-10 13-22-18.png'),
        title: 'Instancias EC2',
        thumbnail: getAssetPath('/projects/kafka-aws/images/Screenshot from 2025-07-10 13-22-18.png')
      },
      {
        url: getAssetPath('/projects/kafka-aws/images/Screenshot from 2025-07-10 15-42-10.png'),
        title: 'Logs del Sistema',
        thumbnail: getAssetPath('/projects/kafka-aws/images/Screenshot from 2025-07-10 15-42-10.png')
      }
    ]
  },
  {
    id: 'ejercicios-programacion',
    name: 'Ejercicios de Programación',
    description: 'Colección de ejercicios y desafíos de programación resueltos en diversas plataformas competitivas como BeeCrowd, OmegaUp, Codeforces y AceptaElReto. Incluye implementación de algoritmos de ordenamiento, estructuras de datos, programación dinámica, teoría de grafos y resolución de problemas computacionales usando diferentes lenguajes de programación.',
    technologies: ['Python', 'Java', 'C++', 'Algorithms', 'Data Structures', 'Problem Solving'],
    images: [
      {
        url: getAssetPath('/projects/ejercicios-programacion/images/Captura desde 2025-09-22 02-17-30.png'),
        title: 'BeeCrowd - Soluciones de problemas competitivos',
        thumbnail: getAssetPath('/projects/ejercicios-programacion/images/Captura desde 2025-09-22 02-17-30.png')
      },
      {
        url: getAssetPath('/projects/ejercicios-programacion/images/Captura desde 2025-09-22 02-17-51.png'),
        title: 'OmegaUp - Desafíos algorítmicos',
        thumbnail: getAssetPath('/projects/ejercicios-programacion/images/Captura desde 2025-09-22 02-17-51.png')
      },
      {
        url: getAssetPath('/projects/ejercicios-programacion/images/Captura desde 2025-09-22 02-18-25.png'),
        title: 'Codeforces - Participación en concursos',
        thumbnail: getAssetPath('/projects/ejercicios-programacion/images/Captura desde 2025-09-22 02-18-25.png')
      },
      {
        url: getAssetPath('/projects/ejercicios-programacion/images/Captura desde 2025-09-22 02-18-39.png'),
        title: 'AceptaElReto - Resolución de problemas',
        thumbnail: getAssetPath('/projects/ejercicios-programacion/images/Captura desde 2025-09-22 02-18-39.png')
      },
      {
        url: getAssetPath('/projects/ejercicios-programacion/images/Captura desde 2025-09-22 02-19-25.png'),
        title: 'Estructuras de Datos - Implementaciones propias',
        thumbnail: getAssetPath('/projects/ejercicios-programacion/images/Captura desde 2025-09-22 02-19-25.png')
      },
      {
        url: getAssetPath('/projects/ejercicios-programacion/images/Captura desde 2025-09-22 02-19-47.png'),
        title: 'Algoritmos de Ordenamiento - Análisis de complejidad',
        thumbnail: getAssetPath('/projects/ejercicios-programacion/images/Captura desde 2025-09-22 02-19-47.png')
      },
      {
        url: getAssetPath('/projects/ejercicios-programacion/images/Captura desde 2025-09-22 02-23-36.png'),
        title: 'Programación Dinámica - Optimización de soluciones',
        thumbnail: getAssetPath('/projects/ejercicios-programacion/images/Captura desde 2025-09-22 02-23-36.png')
      },
      {
        url: getAssetPath('/projects/ejercicios-programacion/images/Captura desde 2025-09-22 02-23-45.png'),
        title: 'Teoría de Grafos - Algoritmos de búsqueda',
        thumbnail: getAssetPath('/projects/ejercicios-programacion/images/Captura desde 2025-09-22 02-23-45.png')
      },
      {
        url: getAssetPath('/projects/ejercicios-programacion/images/Captura desde 2025-09-22 02-24-02.png'),
        title: 'Matemática Computacional - Problemas numéricos',
        thumbnail: getAssetPath('/projects/ejercicios-programacion/images/Captura desde 2025-09-22 02-24-02.png')
      },
      {
        url: getAssetPath('/projects/ejercicios-programacion/images/Captura desde 2025-09-22 03-24-55.png'),
        title: 'Concursos de Programación - Rankings y estadísticas',
        thumbnail: getAssetPath('/projects/ejercicios-programacion/images/Captura desde 2025-09-22 03-24-55.png')
      },
      {
        url: getAssetPath('/projects/ejercicios-programacion/images/Captura desde 2025-09-22 03-29-54.png'),
        title: 'Análisis de Rendimiento - Optimización de código',
        thumbnail: getAssetPath('/projects/ejercicios-programacion/images/Captura desde 2025-09-22 03-29-54.png')
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