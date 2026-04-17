export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  timestamp?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    totalCount: number
    totalPages: number
  }
}

export interface ApiError {
  code: string
  message: string
  status: number
  details?: Record<string, unknown>
}
