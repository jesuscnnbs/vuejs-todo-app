import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Helper para crear un mock de VercelRequest
 */
export function createMockRequest(options: {
  method?: string
  body?: any
  headers?: Record<string, string>
  query?: Record<string, string | string[]>
}): VercelRequest {
  const { method = 'GET', body = {}, headers = {}, query = {} } = options

  return {
    method,
    body,
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
    query,
    url: '',
    cookies: {},
  } as unknown as VercelRequest
}

/**
 * Helper para crear un mock de VercelResponse
 */
export function createMockResponse(): {
  res: VercelResponse
  getStatus: () => number
  getJson: () => any
} {
  let statusCode = 200
  let jsonData: any = null

  const res = {
    status: (code: number) => {
      statusCode = code
      return res
    },
    json: (data: any) => {
      jsonData = data
      return res
    },
    send: (data: any) => {
      jsonData = data
      return res
    },
    setHeader: () => res,
    getHeader: () => undefined,
    removeHeader: () => res,
  } as unknown as VercelResponse

  return {
    res,
    getStatus: () => statusCode,
    getJson: () => jsonData,
  }
}

/**
 * Helper para generar emails únicos para tests
 */
export function generateTestEmail(): string {
  return `test-${Date.now()}-${Math.random().toString(36).substring(7)}@test.com`
}

/**
 * Helper para esperar un tiempo determinado
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
