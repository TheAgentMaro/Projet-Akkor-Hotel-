import { expect } from 'vitest';
import '@testing-library/jest-dom';
import { server } from './mswServer';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
