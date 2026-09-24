import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TokenCard } from './TokenCard';
import { BrowserRouter } from 'react-router-dom';

describe('TokenCard', () => {
  it('renders token information correctly', () => {
    const mockToken = {
      id: '123',
      date: '10 September 2026',
      timeSlot: '10:00 AM - 12:00 PM',
      centerName: 'Baramati Center',
      cropName: 'Soybean',
      expectedQuantityQuintals: 50,
      status: 'Booked' as const,
      digitalToken: 'TKN-123',
      farmerId: 'F-123',
      centerId: 'C-123'
    };

    render(
      <BrowserRouter>
        <TokenCard booking={mockToken} />
      </BrowserRouter>
    );

    expect(screen.getByText('TKN-123')).toBeInTheDocument();
    expect(screen.getByText('Soybean')).toBeInTheDocument();
    expect(screen.getByText('Baramati Center')).toBeInTheDocument();
  });
});
