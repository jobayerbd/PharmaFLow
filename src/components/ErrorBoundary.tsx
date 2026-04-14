import * as React from 'react';
import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    (this as any).state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    (this as any).setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if ((this as any).state.hasError) {
      let errorMessage = "An unexpected error occurred. Please try again.";
      let isFirestoreError = false;

      try {
        if ((this as any).state.error?.message) {
          const parsed = JSON.parse((this as any).state.error.message);
          if (parsed.error && parsed.operationType) {
            isFirestoreError = true;
            errorMessage = `Database Error: ${parsed.error} during ${parsed.operationType} on ${parsed.path || 'unknown path'}`;
          }
        }
      } catch {
        errorMessage = (this as any).state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <Card className="max-w-md w-full border-red-100 shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900">Something went wrong</CardTitle>
              <CardDescription className="mt-2 text-gray-600">
                {isFirestoreError ? "We encountered a problem with the database." : "The application crashed unexpectedly."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 p-3 rounded-md border border-red-100">
                <p className="text-sm text-red-800 font-mono break-words">
                  {errorMessage}
                </p>
              </div>
              <Button 
                onClick={this.handleReset}
                className="w-full flex items-center justify-center gap-2"
              >
                <RefreshCcw className="w-4 h-4" />
                Reload Application
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
