// Barrel shim — the store implementation has moved to src/store/
// All existing `import { useStore, StoreProvider } from '…/store'` imports
// continue to resolve here and are forwarded to the real modules.
export { useStore, StoreProvider } from './store/index';
