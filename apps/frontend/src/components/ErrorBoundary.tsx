import { Component, ReactNode, ErrorInfo } from 'react';
import styled from 'styled-components';

// Styled components
const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  text-align: center;
`;

const ErrorContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  max-width: 500px;
  width: 100%;
`;

const ErrorIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const ErrorTitle = styled.h1`
  color: #dc3545;
  margin-bottom: 1rem;
  font-size: 1.5rem;
  font-weight: bold;
`;

const ErrorMessage = styled.p`
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.6;
`;

const ErrorDetails = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
  text-align: left;
`;

const ErrorDetailsTitle = styled.h3`
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 1rem;
  font-weight: bold;
`;

const ErrorDetailsText = styled.pre`
  color: #666;
  font-size: 0.875rem;
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
`;

const ErrorActions = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
`;

const ErrorButton = styled.button`
  background: #8B4513;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: #6b3410;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

// Types
interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  customMessage?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Update state with error info
    this.setState({ error, errorInfo });
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRefresh = (): void => {
    window.location.reload();
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  handleContactSupport = (): void => {
    window.location.href = 'mailto:support@sammasalta.com';
  };

  override render(): JSX.Element {
    if (this.state.hasError) {
      return (
        <ErrorContainer>
          <ErrorContent>
            <ErrorIcon>⚠️</ErrorIcon>
            <ErrorTitle>
              {this.props.customMessage || 'Something went wrong'}
            </ErrorTitle>
            <ErrorMessage>
              We&apos;re sorry, but something unexpected happened. Please try refreshing the page or contact support if the problem persists.
            </ErrorMessage>
            
            {this.props.showDetails && this.state.error && (
              <ErrorDetails>
                <ErrorDetailsTitle>Error Details:</ErrorDetailsTitle>
                <ErrorDetailsText>{this.state.error.message}</ErrorDetailsText>
                {this.state.errorInfo && (
                  <ErrorDetailsText>{this.state.errorInfo.componentStack}</ErrorDetailsText>
                )}
              </ErrorDetails>
            )}
            
            <ErrorActions>
              <ErrorButton onClick={this.handleRefresh}>
                🔄 Refresh Page
              </ErrorButton>
              <ErrorButton onClick={this.handleGoHome}>
                🏠 Go Home
              </ErrorButton>
              <ErrorButton onClick={this.handleContactSupport}>
                📧 Contact Support
              </ErrorButton>
            </ErrorActions>
          </ErrorContent>
        </ErrorContainer>
      );
    }

    return <>{this.props.children}</>;
  }
}

export default ErrorBoundary; 