import { createContext } from 'react';

interface TransitionContextType {
  startPageTransition: (callback: () => void) => void;
  isPending: boolean;
}

export const TransitionContext = createContext<TransitionContextType>({
  startPageTransition: (callback: () => void) => callback(),
  isPending: false
});