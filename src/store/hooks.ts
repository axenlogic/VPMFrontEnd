import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './index';

/**
 * Typed Redux Hooks
 * 
 * Use these hooks instead of the plain `useDispatch` and `useSelector`
 * for better TypeScript support and type safety.
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

