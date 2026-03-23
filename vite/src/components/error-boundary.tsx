import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  reset = () => {
    this.setState({ error: null });
  };

  componentDidMount() {
    if (import.meta.hot) {
      import.meta.hot.on("vite:beforeUpdate", this.handleHmrUpdate);
    }
  }

  componentWillUnmount() {
    if (import.meta.hot) {
      import.meta.hot.off("vite:beforeUpdate", this.handleHmrUpdate);
    }
  }

  private handleHmrUpdate = () => {
    if (this.state.error !== null) {
      this.reset();
    }
  };

  render() {
    if (this.state.error) {
      return this.props.fallback(this.state.error, this.reset);
    }
    return this.props.children;
  }
}
