import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import ErrorBoundary from '../ErrorBoundary'

const ThrowingChild = ({ shouldThrow }: { shouldThrow: boolean }) => {
    if (shouldThrow) throw new Error('Test error')
    return <p>Safe content</p>
}

describe('ErrorBoundary', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('renders children when no error is thrown', () => {
        render(
            <ErrorBoundary>
                <p>Hello</p>
            </ErrorBoundary>
        )
        expect(screen.getByText('Hello')).toBeInTheDocument()
    })

    it('renders the fallback UI when a child throws', () => {
        vi.spyOn(console, 'error').mockImplementation(() => {})
        render(
            <ErrorBoundary>
                <ThrowingChild shouldThrow={true} />
            </ErrorBoundary>
        )
        expect(screen.getByText('Something went wrong.')).toBeInTheDocument()
        expect(screen.getByText('Try refreshing the page.')).toBeInTheDocument()
    })

    it('does not render the child content when fallback is shown', () => {
        vi.spyOn(console, 'error').mockImplementation(() => {})
        render(
            <ErrorBoundary>
                <ThrowingChild shouldThrow={true} />
            </ErrorBoundary>
        )
        expect(screen.queryByText('Safe content')).not.toBeInTheDocument()
    })
})
