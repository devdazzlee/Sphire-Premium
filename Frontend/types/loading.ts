// types/loading.ts

export interface LoadingContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  startLoading: () => void;
  stopLoading: () => void;
}

export interface LoadingProps {
  isVisible: boolean;
  onComplete: () => void;
  duration?: number;
}

export interface UsePageLoadingOptions {
  duration?: number;
  excludeRoutes?: string[];
  showOnInitialLoad?: boolean;
}

export interface NavigationLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  prefetch?: boolean;
  showLoading?: boolean;
}

export interface LoadingState {
  isInitialLoading: boolean;
  isRouteLoading: boolean;
  isComponentLoading: boolean;
}

export type LoadingAction = 
  | { type: 'START_INITIAL_LOADING' }
  | { type: 'STOP_INITIAL_LOADING' }
  | { type: 'START_ROUTE_LOADING' }
  | { type: 'STOP_ROUTE_LOADING' }
  | { type: 'START_COMPONENT_LOADING' }
  | { type: 'STOP_COMPONENT_LOADING' }
  | { type: 'RESET_ALL_LOADING' };