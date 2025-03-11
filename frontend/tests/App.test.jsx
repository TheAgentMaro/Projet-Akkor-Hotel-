import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../src/App';

describe('App Component', () => {
  it('renders without crashing and displays main layout elements', () => {
    render(<App />);
    const akkors = screen.getAllByText(/Akkor Hotel/i);
    expect(akkors.length).toBeGreaterThan(0);
  });
});
