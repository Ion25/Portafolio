import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const projectId = params.projectId;
    const imagesDir = path.join(process.cwd(), 'public', 'projects', projectId, 'images');
    
    // Lee todos los archivos en el directorio
    const files = await fs.readdir(imagesDir);
    
    // Filtra solo archivos de imagen y excluye thumbnails
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext) && !file.includes('-thumb');
    });

    // Crea la lista de imágenes con sus URLs
    const images = imageFiles.map(file => ({
      url: `/projects/${projectId}/images/${file}`,
      title: path.basename(file, path.extname(file))
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '),
      thumbnail: `/projects/${projectId}/images/${file}` // Usar la misma imagen como thumbnail por ahora
    }));

    return NextResponse.json({ images });
  } catch (error) {
    console.error('Error reading images directory:', error);
    return NextResponse.json({ images: [] });
  }
}
