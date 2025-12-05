import { TextEncoder } from 'util';

Object.defineProperty(global, 'TextEncoder', {
  value: TextEncoder,
});
