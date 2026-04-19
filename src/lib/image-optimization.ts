/**
 * Utilitário para otimização de imagens usando Supabase Storage Transformation
 */

const SUPABASE_PROJECT_ID = 'fycskldchqqqohgvioal';
const SUPABASE_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co`;

interface OptimizeOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'origin';
  resize?: 'cover' | 'contain' | 'fill';
}

/**
 * Transforma uma URL de imagem do Supabase em uma URL otimizada.
 * Se a imagem não for do Supabase, retorna a URL original.
 */
export function getOptimizedImageUrl(url: string | undefined, options: OptimizeOptions = {}): string {
  if (!url) return '/ai-go-onrender.png';
  
  // Se não for uma URL do Supabase, retorna como está
  if (!url.includes(SUPABASE_URL)) return url;

  // Extrai o caminho relativo do bucket e do arquivo
  // Formato esperado: https://.../storage/v1/object/public/bucket/path/to/file.jpg
  try {
    const parts = url.split('/storage/v1/object/public/');
    if (parts.length < 2) return url;

    const path = parts[1];
    const { width, height, quality = 80, format = 'webp', resize = 'cover' } = options;

    const params = new URLSearchParams();
    if (width) params.append('width', width.toString());
    if (height) params.append('height', height.toString());
    params.append('quality', quality.toString());
    params.append('format', format);
    params.append('resize', resize);

    return `${SUPABASE_URL}/storage/v1/render/image/public/${path}?${params.toString()}`;
  } catch (e) {
    return url;
  }
}
