'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-dark via-accent-purple to-accent-blue p-4">
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full border border-white/20 shadow-2xl">
                        <div className="text-center">
                            <div className="text-6xl mb-4">⚠️</div>
                            <h1 className="text-2xl font-bold text-white mb-4">
                                Something went wrong
                            </h1>
                            <p className="text-white/80 mb-6">
                                We're sorry, but something unexpected happened. Please try refreshing the page.
                            </p>
                            {this.state.error && process.env.NODE_ENV === 'development' && (
                                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6 text-left">
                                    <p className="text-red-200 text-sm font-mono">
                                        {this.state.error.message}
                                    </p>
                                </div>
                            )}
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-gradient-to-r from-accent-blue to-accent-purple text-white px-6 py-3 rounded-lg font-semibold hover:scale-105 transition-transform duration-200"
                            >
                                Refresh Page
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
