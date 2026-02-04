import { render, screen, fireEvent } from '@testing-library/react'
import JsonPage from '../app/json/page'
import '@testing-library/jest-dom'

describe('JSON Formatter Page', () => {
    it('renders input and output areas', () => {
        render(<JsonPage />)

        expect(screen.getByText('Input')).toBeInTheDocument()
        expect(screen.getByText('Output')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Paste JSON here...')).toBeInTheDocument()
    });

    it('formats invalid json shows error', () => {
        render(<JsonPage />)

        const textarea = screen.getByPlaceholderText('Paste JSON here...')
        fireEvent.change(textarea, { target: { value: '{ invalid: json }' } }) // Change input

        // Find format button (Maximize icon) - We need to find by title since we added title attributes
        const formatBtn = screen.getByTitle('Format')
        fireEvent.click(formatBtn)

        expect(screen.getByText('Invalid JSON')).toBeInTheDocument()
    });
})
