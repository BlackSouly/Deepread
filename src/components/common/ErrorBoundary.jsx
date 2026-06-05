import React from 'react'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-[var(--color-background-primary)] p-6">
          <div className="mx-auto max-w-3xl rounded-xl border border-[#F5C4B3] bg-white p-5 shadow-card">
            <h1 className="font-serif text-[20px] font-medium text-signal-orange">应用启动失败</h1>
            <p className="mt-2 text-[13px] leading-6 text-[var(--color-text-secondary)]">
              页面运行时遇到了错误。下面是浏览器实际抛出的信息，方便继续定位。
            </p>
            <pre className="mt-4 overflow-auto rounded-lg bg-[var(--color-background-tertiary)] p-4 text-[12px] leading-5 text-[var(--color-text-primary)]">
              {this.state.error.stack || this.state.error.message}
            </pre>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
