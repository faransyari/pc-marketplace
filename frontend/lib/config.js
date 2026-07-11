export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'
export const MEDIA_URL = process.env.NEXT_PUBLIC_MEDIA_URL || 'http://127.0.0.1:8000'

export function resolveImage(src) {
  if (!src) return null
  if (src.startsWith('http') || src.startsWith('/images/')) return src
  if (src.startsWith('/')) return `${MEDIA_URL}${src}`
  return src
}
