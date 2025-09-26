'use client';

import { useState, useEffect } from 'react';

export default function Navbar() {
  const [activeSection, setActiveSection] = useState('inicio');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Cambiar estilo del navbar al hacer scroll
      setIsScrolled(window.scrollY > 50);

      // Detectar la sección activa
      const sections = ['inicio', 'proyectos', 'habilidades'];
      const scrollPosition = window.scrollY + 150; // Offset para el menú fijo

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Ejecutar una vez al montar

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const navHeight = 80; // Altura del navbar
      const elementPosition = element.offsetTop - navHeight;
      
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

  const navItems = [
    { id: 'inicio', label: './' },
    { id: 'proyectos', label: 'Proyectos' },
    { id: 'habilidades', label: 'Habilidades' }
  ];

  return (
    <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo/Brand */}
          <div className="flex-shrink-0">
            <button
              onClick={() => scrollToSection('inicio')}
              className="text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors"
            >
              JAC
            </button>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`nav-link px-3 py-2 text-sm font-medium ${
                    activeSection === item.id ? 'active' : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <div className="relative">
              <button
                className="text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600"
                onClick={() => {
                  const menu = document.getElementById('mobile-menu');
                  menu?.classList.toggle('hidden');
                }}
              >
                <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                  <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div id="mobile-menu" className="hidden md:hidden pb-4">
          <div className="flex flex-col space-y-2">
            {navItems.map((item) => (
              <button
                key={`mobile-${item.id}`}
                onClick={() => {
                  scrollToSection(item.id);
                  document.getElementById('mobile-menu')?.classList.add('hidden');
                }}
                className={`nav-link text-left px-3 py-2 text-sm font-medium ${
                  activeSection === item.id ? 'active' : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}