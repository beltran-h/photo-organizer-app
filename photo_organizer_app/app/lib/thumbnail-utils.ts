
/**
 * Utility functions for thumbnail generation and image processing
 */

export interface ThumbnailOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'image/jpeg' | 'image/png' | 'image/webp'
}

/**
 * Generate a thumbnail from a File object
 */
export function generateThumbnail(
  file: File,
  options: ThumbnailOptions = {}
): Promise<string> {
  const {
    maxWidth = 200,
    maxHeight = 200,
    quality = 0.8,
    format = 'image/jpeg'
  } = options

  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      reject(new Error('Could not get canvas context'))
      return
    }

    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
      }

      // Set canvas dimensions
      canvas.width = width
      canvas.height = height

      // Draw image on canvas
      ctx.drawImage(img, 0, 0, width, height)

      // Convert to data URL
      try {
        const dataUrl = canvas.toDataURL(format, quality)
        resolve(dataUrl)
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }

    // Create object URL and load image
    const objectUrl = URL.createObjectURL(file)
    img.src = objectUrl

    // Clean up object URL after image loads
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
      }

      // Set canvas dimensions
      canvas.width = width
      canvas.height = height

      // Draw image on canvas
      ctx.drawImage(img, 0, 0, width, height)

      // Convert to data URL
      try {
        const dataUrl = canvas.toDataURL(format, quality)
        resolve(dataUrl)
      } catch (error) {
        reject(error)
      }
    }
  })
}

/**
 * Generate a thumbnail from an image URL
 */
export function generateThumbnailFromUrl(
  imageUrl: string,
  options: ThumbnailOptions = {}
): Promise<string> {
  const {
    maxWidth = 200,
    maxHeight = 200,
    quality = 0.8,
    format = 'image/jpeg'
  } = options

  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      reject(new Error('Could not get canvas context'))
      return
    }

    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
      }

      // Set canvas dimensions
      canvas.width = width
      canvas.height = height

      // Draw image on canvas
      ctx.drawImage(img, 0, 0, width, height)

      // Convert to data URL
      try {
        const dataUrl = canvas.toDataURL(format, quality)
        resolve(dataUrl)
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }

    // Set CORS if needed
    img.crossOrigin = 'anonymous'
    img.src = imageUrl
  })
}

/**
 * Create a test image for diagnostic purposes
 */
export function createTestImage(
  width: number = 200,
  height: number = 150,
  text: string = 'Test Image'
): string {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Could not get canvas context')
  }

  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#667eea')
  gradient.addColorStop(1, '#764ba2')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  // Add text
  ctx.fillStyle = 'white'
  ctx.font = '16px Arial'
  ctx.textAlign = 'center'
  ctx.fillText(text, width / 2, height / 2)
  ctx.font = '12px Arial'
  ctx.fillText(new Date().toLocaleTimeString(), width / 2, height / 2 + 20)

  return canvas.toDataURL('image/png')
}

/**
 * Validate if a string is a valid data URL
 */
export function isValidDataUrl(dataUrl: string): boolean {
  try {
    return dataUrl.startsWith('data:image/') && dataUrl.includes('base64,')
  } catch {
    return false
  }
}

/**
 * Get image dimensions from a data URL
 */
export function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    img.onload = () => {
      resolve({ width: img.width, height: img.height })
    }
    
    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }
    
    img.src = dataUrl
  })
}

/**
 * Convert file size to human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
