import { Component, ReactNode, ErrorInfo } from "react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: ErrorInfo): void {
        console.error("Uncaught error:", error, info);
    }

    render(): ReactNode {
        if (this.state.hasError) {
            return (
                <div style={{ textAlign: "center", padding: "2rem" }}>
                    <h2>Something went wrong.</h2>
                    <p>Try refreshing the page.</p>
                </div>
            );
        }
        return this.props.children;
    }
}
