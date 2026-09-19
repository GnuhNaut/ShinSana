import { Component, type ReactNode } from 'react'
import { weddingConfig } from '../config/wedding'

interface Props { children: ReactNode }
interface State { hasError: boolean }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State { return { hasError: true } }

  render() {
    if (this.state.hasError) {
      return (
        <main className="error-state">
          <p className="eyebrow">{weddingConfig.couple.monogram}</p>
          <h1>Lời mời đang cần một chút thời gian.</h1>
          <p>Vui lòng tải lại trang để tiếp tục.</p>
          <button className="button button--red" type="button" onClick={() => window.location.reload()}>Tải lại trang</button>
        </main>
      )
    }
    return this.props.children
  }
}
