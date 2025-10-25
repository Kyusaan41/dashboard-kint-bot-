import { useEffect, useState } from 'react';

// Hook pour éviter les erreurs d'hydratation en s'assurant que le composant est monté côté client
export function useHasMounted() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return hasMounted;
}