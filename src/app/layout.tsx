import { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Jhon Apaza - Backend Developer',
  description: 'Portafolio de Jhon Apaza, Desarrollador Backend con experiencia en sistemas distribuidos y APIs',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  )
}
