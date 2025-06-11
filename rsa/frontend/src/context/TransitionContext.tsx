import React, { createContext } from 'react';

// Create a context for the transition function
export const TransitionContext = createContext({
  startPageTransition: (callback: () => void) => callback(),
  isPending: false
});

export default TransitionContext;
