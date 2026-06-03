import { Component } from "react";

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        console.error("Uncaught error:", error, info);
    }

    render() {
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
