import React, { Component, ErrorInfo, ReactNode } from "react";
import styled from "styled-components";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  padding: 2rem;
  text-align: center;
  background: #f8f9fa;
  border-radius: 8px;
  margin: 1rem;
`;

const ErrorTitle = styled.h2`
  color: #dc3545;
  margin-bottom: 1rem;
  font-size: 1.5rem;
`;

const ErrorMessage = styled.p`
  color: #6c757d;
  margin-bottom: 1rem;
  max-width: 600px;
  line-height: 1.6;
`;

const ErrorDetails = styled.details`
  margin-top: 1rem;
  text-align: left;
  max-width: 600px;
  width: 100%;

  summary {
    cursor: pointer;
    color: #495057;
    font-weight: 500;
    margin-bottom: 0.5rem;
  }

  pre {
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 4px;
    overflow-x: auto;
    font-size: 0.875rem;
    color: #6c757d;
  }
`;

const RetryButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 1rem;

  &:hover {
    background: #0056b3;
  }

  &:focus {
    outline: 2px solid #007bff;
    outline-offset: 2px;
  }
`;

const DefaultErrorFallback: React.FC<{
  error: Error;
  errorInfo: ErrorInfo;
  retry: () => void;
}> = ({ error, errorInfo, retry }) => (
  <ErrorContainer>
    <ErrorTitle>Something went wrong</ErrorTitle>
    <ErrorMessage>
      We&apos;re sorry, but something unexpected happened. Please try refreshing
      the page or contact support if the problem persists.
    </ErrorMessage>

    <ErrorDetails>
      <summary>Error Details</summary>
      <pre>
        {error && error.toString()}
        {errorInfo && errorInfo.componentStack}
      </pre>
    </ErrorDetails>

    <RetryButton onClick={retry}>Try Again</RetryButton>
  </ErrorContainer>
);

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Error caught by boundary:", error);
      console.error("Error info:", errorInfo);
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to external service in production
    if (process.env.NODE_ENV === "production") {
      // You can integrate with error reporting services here
      // Example: Sentry, LogRocket, etc.
      console.error("Production error:", {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      });
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <DefaultErrorFallback
          error={this.state.error || new Error("Unknown error")}
          errorInfo={this.state.errorInfo || { componentStack: "" }}
          retry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
