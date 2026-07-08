export const ALLOWED_FILE_TYPES = {
  document: [
    'text/plain',
    'text/markdown',
    'text/csv',
    'application/json',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  image: [
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/webp'
  ]
}

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export function validateFile(file: File): { valid: boolean; error?: string } {
  const allTypes = [...ALLOWED_FILE_TYPES.document, ...ALLOWED_FILE_TYPES.image]

  if (!allTypes.includes(file.type)) {
    return {
      valid: false,
      error: `不支持的文件格式: ${file.type || '未知'}。支持 TXT、MD、CSV、JSON、PDF、DOC、DOCX、PNG、JPG、GIF、WEBP`
    }
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `文件大小超过限制（最大 10MB），当前 ${formatFileSize(file.size)}`
    }
  }

  return { valid: true }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

export function isImageFile(type: string): boolean {
  return ALLOWED_FILE_TYPES.image.includes(type)
}

export async function readFileContent(file: File): Promise<string> {
  if (isImageFile(file.type)) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsText(file)
  })
}
