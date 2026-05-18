/**
 * API Response Utilities
 * Provides consistent patterns for handling API responses across the application
 */

/**
 * Standard API response structure from server
 */
export interface ApiResponse<T> {
  status: "success" | "fail" | "error";
  message: string;
  code: number;
  data: T;
}

/**
 * Pagination metadata structure
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Paginated response structure
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

/**
 * Standard error structure for Redux actions
 */
export interface ApiError {
  message: string;
  code?: number;
  field?: string;
}

/**
 * Common error messages mapping for localization
 */
export const ERROR_MESSAGES: Record<string, string> = {
  PRODUCT_NOT_FOUND: "Không tìm thấy sản phẩm",
  CATEGORY_NOT_FOUND: "Không tìm thấy danh mục",
  UNAUTHORIZED: "Bạn cần đăng nhập để thực hiện thao tác này",
  FORBIDDEN: "Bạn không có quyền thực hiện thao tác này",
  VALIDATION_ERROR: "Dữ liệu không hợp lệ",
  SERVER_ERROR: "Đã xảy ra lỗi, vui lòng thử lại sau",
  NETWORK_ERROR: "Lỗi kết nối mạng",
  TIMEOUT: "Yêu cầu quá thời gian chờ",
};

const BACKEND_MESSAGE_TRANSLATIONS: Record<string, string> = {
  "email already in use": "Email đã được sử dụng",
  "username already in use": "Tên người dùng đã được sử dụng",
  "invalid email or password": "Email hoặc mật khẩu không đúng",
  "please verify your email before logging in":
    "Vui lòng xác thực email trước khi đăng nhập",
  "user not found": "Không tìm thấy tài khoản",
  "email already verified": "Email đã được xác thực",
  "invalid verification code": "Mã xác thực không hợp lệ",
  "verification code has expired": "Mã xác thực đã hết hạn",
  "invalid or expired verification code": "Mã xác thực không hợp lệ hoặc đã hết hạn",
  "failed to send verification email. please try again.":
    "Không thể gửi email xác thực. Vui lòng thử lại",
  "failed to send password reset email. please try again.":
    "Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại",
  "please verify your email before enabling two-factor authentication":
    "Bạn cần xác minh email trước khi bật xác thực 2 yếu tố",
  "two-factor authentication is already enabled":
    "Xác thực 2 yếu tố đã được bật",
  "two-factor authentication is not enabled":
    "Xác thực 2 yếu tố chưa được bật",
  "failed to send two-factor authentication code. please try again.":
    "Không thể gửi mã xác thực 2 yếu tố. Vui lòng thử lại",
  "invalid or expired two-factor challenge":
    "Phiên xác thực 2 yếu tố không còn hiệu lực",
  "current password is incorrect": "Mật khẩu hiện tại không chính xác",
  "refresh token is required": "Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại",
  "invalid or expired refresh token":
    "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại",
  "invalid or revoked refresh token":
    "Phiên đăng nhập không còn hiệu lực, vui lòng đăng nhập lại",
  "refresh token has expired": "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại",
  "access token is required. please login.": "Bạn cần đăng nhập để tiếp tục",
  "access token has expired. please refresh your token.":
    "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại",
  "invalid access token. please login again.":
    "Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại",
  "authentication failed": "Xác thực thất bại, vui lòng đăng nhập lại",
  "authentication required": "Bạn cần đăng nhập để thực hiện thao tác này",
  unauthorized: "Bạn cần đăng nhập để thực hiện thao tác này",
};

const RESERVED_API_STATUSES = new Set(["success", "fail", "error"]);

const HTTP_STATUS_MESSAGES: Record<number, string> = {
  400: "Yêu cầu không hợp lệ",
  401: "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại",
  403: "Bạn không có quyền thực hiện thao tác này",
  404: "Không tìm thấy dữ liệu yêu cầu",
  408: "Yêu cầu quá thời gian chờ",
  409: "Dữ liệu đã thay đổi, vui lòng tải lại trang",
  422: "Dữ liệu không hợp lệ",
  429: "Bạn thao tác quá nhanh, vui lòng thử lại sau",
};

function getMessageByStatus(status?: number): string | undefined {
  if (!status) return undefined;
  if (HTTP_STATUS_MESSAGES[status]) {
    return HTTP_STATUS_MESSAGES[status];
  }
  if (status >= 500) {
    return ERROR_MESSAGES.SERVER_ERROR;
  }
  return undefined;
}

function getMessageByErrorCode(code?: string): string | undefined {
  if (!code) return undefined;
  return ERROR_MESSAGES[code.toUpperCase()];
}

function getMessageByBackendMessage(message?: string): string | undefined {
  if (!message) return undefined;

  return BACKEND_MESSAGE_TRANSLATIONS[message.trim().toLowerCase()];
}

/**
 * Sanitize unknown errors before showing to users.
 * Never exposes raw backend/internal error messages.
 */
export function getSafeErrorMessage(
  error: unknown,
  fallback: string = ERROR_MESSAGES.SERVER_ERROR,
): string {
  if (error === null || error === undefined) {
    return fallback;
  }

  const axiosLikeError = error as {
    code?: string | number;
    status?: number;
    request?: unknown;
    message?: string;
    field?: string;
    response?: {
      status?: number;
      data?: {
        code?: string | number;
        errorCode?: string;
        status?: string;
        message?: string;
      };
    };
  };

  const messageByBackendMessage = getMessageByBackendMessage(
    typeof axiosLikeError?.response?.data?.message === "string"
      ? axiosLikeError.response.data.message
      : undefined,
  );
  if (messageByBackendMessage) {
    return messageByBackendMessage;
  }

  const backendStatusText =
    typeof axiosLikeError?.response?.data?.status === "string"
      ? axiosLikeError.response.data.status
      : undefined;

  const backendCode =
    typeof axiosLikeError?.response?.data?.errorCode === "string"
      ? axiosLikeError.response.data.errorCode
      : typeof axiosLikeError?.response?.data?.code === "string"
        ? axiosLikeError.response.data.code
        : backendStatusText && !RESERVED_API_STATUSES.has(backendStatusText.toLowerCase())
          ? backendStatusText
        : undefined;
  const messageByCode = getMessageByErrorCode(backendCode);
  if (messageByCode) {
    return messageByCode;
  }

  const topLevelCode =
    typeof axiosLikeError?.code === "string" &&
    axiosLikeError.code !== "ERR_NETWORK" &&
    axiosLikeError.code !== "ECONNABORTED"
      ? axiosLikeError.code
      : undefined;
  const messageByTopLevelCode = getMessageByErrorCode(topLevelCode);
  if (messageByTopLevelCode) {
    return messageByTopLevelCode;
  }

  const topLevelStatus =
    typeof axiosLikeError?.status === "number"
      ? axiosLikeError.status
      : typeof axiosLikeError?.code === "number"
        ? axiosLikeError.code
        : undefined;
  const messageByTopLevelStatus = getMessageByStatus(topLevelStatus);
  if (messageByTopLevelStatus) {
    return messageByTopLevelStatus;
  }

  const messageByStatus = getMessageByStatus(axiosLikeError?.response?.status);
  if (messageByStatus) {
    return messageByStatus;
  }

  if (
    axiosLikeError?.code === "ECONNABORTED" ||
    axiosLikeError?.response?.status === 408
  ) {
    return ERROR_MESSAGES.TIMEOUT;
  }

  if (axiosLikeError?.request || axiosLikeError?.code === "ERR_NETWORK") {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }

  return fallback;
}

/**
 * Type guard to check if response has nested data structure
 */
function hasNestedData<T>(data: unknown): data is ApiResponse<T> {
  return (
    data !== null &&
    typeof data === "object" &&
    "data" in data &&
    "status" in data
  );
}

/**
 * Extract data from API response consistently
 * Handles both nested (response.data.data) and flat (response.data) structures
 */
export function extractApiData<T>(response: { data: ApiResponse<T> | T }): T {
  const data = response.data;
  
  if (hasNestedData<T>(data)) {
    return data.data;
  }
  
  return data as T;
}

/**
 * Extract paginated data from API response
 */
export function extractPaginatedData<T>(
  response: { data: ApiResponse<PaginatedResponse<T>> | PaginatedResponse<T> }
): PaginatedResponse<T> {
  const data = response.data;
  
  if (hasNestedData<PaginatedResponse<T>>(data)) {
    return data.data;
  }
  
  return data as PaginatedResponse<T>;
}

/**
 * Extract error message from API error response
 */
export function extractApiError(error: unknown): ApiError {
  const axiosError = error as {
    response?: { 
      data?: { 
        code?: number;
        field?: string;
        status?: string;
      };
      status?: number;
    };
  };

  return {
    message: getSafeErrorMessage(error),
    code: axiosError?.response?.data?.code || axiosError?.response?.status || 500,
    field: axiosError?.response?.data?.field,
  };
}

/**
 * Get localized error message
 */
export function getLocalizedError(code: string, fallback?: string): string {
  return ERROR_MESSAGES[code] || fallback || ERROR_MESSAGES.SERVER_ERROR;
}
