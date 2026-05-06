import React from 'react'
import { Button } from './Button'

interface ErrorBoundaryProps {
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            padding: '40px',
            height: '100%',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '40px', lineHeight: 1 }}>⚠️</div>
          <div>
            <h2
              style={{
                fontSize: '16px',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                marginBottom: '4px',
              }}
            >
              Algo deu errado
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>
              {this.state.error?.message || 'Erro inesperado'}
            </p>
          </div>
          <Button variant="primary" onClick={this.handleRetry}>
            Tentar novamente
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
