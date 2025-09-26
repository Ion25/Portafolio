import Image from 'next/image'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import { ProjectCard } from '../components/ProjectCard'
import { projectsConfig } from '../lib/projects'
import { 
  SiFlask, 
  SiFastapi, 
  SiNodedotjs, 
  SiSpringboot,
  SiDocker,
  SiAmazonaws,
  SiGithubactions,
  SiLinux,
  SiPostgresql,
  SiMongodb,
  SiMysql
} from 'react-icons/si'

export default function Home() {
  // Mapear la configuración de proyectos al formato esperado por ProjectCard
  const projects = projectsConfig.map(project => ({
    projectId: project.id,
    title: project.name,
    description: project.description,
    technologies: project.technologies,
    githubUrl: project.githubUrl,
    demoUrl: project.demoUrl,
    media: project.images.map(img => ({
      type: 'image' as const,
      url: img.url,
      title: img.title,
      thumbnail: img.thumbnail
    }))
  }));

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section id="inicio" className="bg-gradient-to-b from-gray-50 to-gray-100 hero-pattern py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-6">Jhon Anthony Apaza Condori</h1>
              <h2 className="text-2xl text-gray-600 mb-8">Backend Developer</h2>
              <p className="text-lg text-gray-700 mb-8">
                Estudiante de último semestre de Ciencias de la Computación con experiencia en backend,
                sistemas distribuidos e Inteligencia Artificial.
              </p>
              <div className="flex justify-center gap-4">
                <Link href="https://github.com/Ion25" 
                      className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
                    target="_blank">
                GitHub
              </Link>
              <Link href="mailto:jhantapzc@gmail.com"
                    className="bg-secondary text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition">
                Contacto
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Proyectos Destacados */}
      <section id="proyectos" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Proyectos Destacados</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <ProjectCard key={index} {...project} />
            ))}
          </div>
        </div>
      </section>

      {/* Habilidades */}
      <section id="habilidades" className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Habilidades Técnicas</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-4">Backend</h3>
              <ul className="space-y-4">
                <li className="flex items-center space-x-2">
                  <SiFlask className="text-2xl text-gray-700" />
                  <span>Flask</span>
                </li>
                <li className="flex items-center space-x-2">
                  <SiFastapi className="text-2xl text-gray-700" />
                  <span>FastAPI</span>
                </li>
                <li className="flex items-center space-x-2">
                  <SiNodedotjs className="text-2xl text-green-600" />
                  <span>Node.js</span>
                </li>
                <li className="flex items-center space-x-2">
                  <SiSpringboot className="text-2xl text-green-500" />
                  <span>Spring Boot</span>
                </li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-4">DevOps & Cloud</h3>
              <ul className="space-y-4">
                <li className="flex items-center space-x-2">
                  <SiDocker className="text-2xl text-blue-500" />
                  <span>Docker</span>
                </li>
                <li className="flex items-center space-x-2">
                  <SiAmazonaws className="text-2xl text-orange-500" />
                  <span>AWS (EC2, Kafka)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <SiGithubactions className="text-2xl text-gray-800" />
                  <span>CI/CD</span>
                </li>
                <li className="flex items-center space-x-2">
                  <SiLinux className="text-2xl text-yellow-600" />
                  <span>Linux</span>
                </li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-4">Bases de Datos</h3>
              <ul className="space-y-4">
                <li className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <SiPostgresql className="text-2xl text-blue-400" />
                    <SiMysql className="text-2xl text-blue-600" />
                  </div>
                  <span>SQL</span>
                </li>
                <li className="flex items-center space-x-2">
                  <SiMongodb className="text-2xl text-green-500" />
                  <span>MongoDB</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>© 2025 Jhon Anthony Apaza Condori</p>
          <div className="mt-4">
            <Link href="mailto:jhantapzc@gmail.com" className="hover:text-blue-400">
              jhantapzc@gmail.com
            </Link>
          </div>
        </div>
      </footer>
      </main>
    </>
  )
}
