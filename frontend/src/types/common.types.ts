/**
 * Common Type Definitions
 * Requirements: 3.1, 3.2, 3.3
 */

/**
 * Generic API response wrapper
 * @interface ApiResponse
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: ApiError;
  timestamp?: string;
}

/**
 * Paginated API response
 * @interface PaginatedResponse
 */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
  message?: string;
  error?: ApiError;
}

/**
 * Pagination metadata
 * @interface PaginationMeta
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * API error details
 * @interface ApiError
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  statusCode?: number;
  timestamp?: string;
}

/**
 * Validation error for form fields
 * @interface ValidationError
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

/**
 * Loading state for async operations
 * @interface LoadingState
 */
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  lastUpdated?: Date;
}

/**
 * Generic async state wrapper
 * @interface AsyncState
 */
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  isSuccess: boolean;
  isError: boolean;
}

/**
 * Sort configuration
 * @interface SortConfig
 */
export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * Filter configuration
 * @interface FilterConfig
 */
export interface FilterConfig {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in';
  value: any;
}

/**
 * Search parameters
 * @interface SearchParams
 */
export interface SearchParams {
  query?: string;
  filters?: FilterConfig[];
  sort?: SortConfig;
  page?: number;
  pageSize?: number;
}

/**
 * Date range filter
 * @interface DateRange
 */
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

/**
 * Option for select/dropdown components
 * @interface SelectOption
 */
export interface SelectOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
  icon?: string;
}

/**
 * Tab configuration
 * @interface TabConfig
 */
export interface TabConfig {
  id: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  badge?: number | string;
}

/**
 * Modal configuration
 * @interface ModalConfig
 */
export interface ModalConfig {
  isOpen: boolean;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

/**
 * Toast notification
 * @interface ToastNotification
 */
export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * File upload metadata
 * @interface FileMetadata
 */
export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  lastModified: Date;
  url?: string;
}

/**
 * User session information
 * @interface UserSession
 */
export interface UserSession {
  userId: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'healthcare_provider';
  token: string;
  refreshToken?: string;
  expiresAt: Date;
}

/**
 * Navigation item configuration
 * @interface NavItem
 */
export interface NavItem {
  path: string;
  label: string;
  icon?: string;
  badge?: number | string;
  children?: NavItem[];
  requiresAuth?: boolean;
  roles?: string[];
}

/**
 * Breadcrumb item
 * @interface BreadcrumbItem
 */
export interface BreadcrumbItem {
  label: string;
  path?: string;
  isActive?: boolean;
}

/**
 * Chart configuration
 * @interface ChartConfig
 */
export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'radar';
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  legend?: {
    display: boolean;
    position?: 'top' | 'bottom' | 'left' | 'right';
  };
  tooltip?: {
    enabled: boolean;
    mode?: 'index' | 'point' | 'nearest';
  };
}

/**
 * Color theme configuration
 * @interface ThemeColors
 */
export interface ThemeColors {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  light: string;
  dark: string;
}

/**
 * Responsive breakpoints
 * @type Breakpoint
 */
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/**
 * Component size variants
 * @type Size
 */
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Component variant types
 * @type Variant
 */
export type Variant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'outline' | 'ghost';

/**
 * HTTP methods
 * @type HttpMethod
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Request status
 * @type RequestStatus
 */
export type RequestStatus = 'idle' | 'pending' | 'success' | 'error';

/**
 * Generic ID type
 * @type ID
 */
export type ID = string | number;

/**
 * Nullable type helper
 * @type Nullable
 */
export type Nullable<T> = T | null;

/**
 * Optional type helper
 * @type Optional
 */
export type Optional<T> = T | undefined;

/**
 * Deep partial type helper
 * @type DeepPartial
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Omit multiple keys helper
 * @type OmitMultiple
 */
export type OmitMultiple<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

/**
 * Extract keys of specific type
 * @type KeysOfType
 */
export type KeysOfType<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];
