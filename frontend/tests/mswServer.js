import { setupServer } from 'msw/node';
import { rest } from 'msw';

export const server = setupServer();
export { rest };
