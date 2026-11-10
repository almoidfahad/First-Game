import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

/** The game must never show a white screen: any render failure becomes a recovery card. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Kept intentionally local: no telemetry leaves the device.
    console.error('Shadow City crashed:', error, info.componentStack)
  }

  reset = (): void => {
    this.setState({ error: null })
  }

  render(): ReactNode {
    if (!this.state.error) return this.props.children
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="panel w-full max-w-lg p-6 text-center">
          <p className="eyebrow">Systems failure</p>
          <h1 className="display-title mt-2 text-3xl text-slate-100">The lights went out</h1>
          <p className="mt-3 text-sm text-slate-400">
            Something in the interface failed to render. Your autosave is stored locally and is not affected.
          </p>
          <p className="mt-3 overflow-x-auto rounded bg-black/40 p-2 text-left font-mono text-[0.7rem] text-rose-300">
            {this.state.error.message}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <button type="button" className="btn btn-primary" onClick={this.reset}>
              Try again
            </button>
            <button type="button" className="btn" onClick={() => window.location.reload()}>
              Reload game
            </button>
          </div>
        </div>
      </div>
    )
  }
}
