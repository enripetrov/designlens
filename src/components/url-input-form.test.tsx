import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { UrlInputForm } from './url-input-form';

// Mock fetch
global.fetch = vi.fn();

describe('UrlInputForm', () => {
    it('renders correctly', () => {
        render(<UrlInputForm />);
        expect(screen.getByPlaceholderText('https://example.com')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Analyze Website/i })).toBeInTheDocument();
    });

    it('shows validation error for invalid URL', async () => {
        render(<UrlInputForm />);
        const input = screen.getByPlaceholderText('https://example.com');
        const button = screen.getByRole('button', { name: /Analyze Website/i });

        fireEvent.change(input, { target: { value: 'invalid-url' } });
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByText(/Please enter a valid URL/i)).toBeInTheDocument();
        });
    });

    it('submits valid URL and shows loading state', async () => {
        let resolveFetch: (value: any) => void;
        (fetch as any).mockImplementationOnce(() => new Promise((resolve) => {
            resolveFetch = resolve;
        }));

        render(<UrlInputForm />);
        const input = screen.getByPlaceholderText('https://example.com');
        const button = screen.getByRole('button', { name: /Analyze Website/i });

        fireEvent.change(input, { target: { value: 'https://valid.com' } });
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByText(/Analyzing.../i)).toBeInTheDocument();
            expect(button).toBeDisabled();
        });

        resolveFetch!({
            ok: true,
            json: async () => ({ success: true }),
        });

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith('/api/analyze', expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({ url: 'https://valid.com' }),
            }));
        });
    });

    it('handles API error', async () => {
        (fetch as any).mockResolvedValueOnce({
            ok: false,
        });

        render(<UrlInputForm />);
        const input = screen.getByPlaceholderText('https://example.com');
        const button = screen.getByRole('button', { name: /Analyze Website/i });

        fireEvent.change(input, { target: { value: 'https://valid.com' } });
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
        });
    });
});
