import { Component, type ReactNode } from 'react'
import { Empty } from './Empty'

export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error) {
    console.error(error)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <Empty icon="xmark" title="Algo ha fallado">
        <p>{this.state.error.message}</p>
        <button className="btn btn-tinted" onClick={() => window.location.reload()}>
          Recargar
        </button>
      </Empty>
    )
  }
}
