import { useLayoutEffect, useEffect } from 'react';

// Hook pour éviter les erreurs d'hydratation avec du contenu dynamique
export const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;