'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export default function RoleGranter({ guildId }: { guildId?: string }) {
  const { data: session, status } = useSession();
  const [granted, setGranted] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id && !granted) {
      const grantRole = async () => {
        try {
          const url = guildId 
            ? `/api/auth/grant-role?guildId=${guildId}` 
            : '/api/auth/grant-role';
          
          const response = await fetch(url, {
            method: 'POST',
          });

          if (response.ok) {
            console.log('[RoleGranter] Role granted successfully');
            setGranted(true);
          } else {
            const error = await response.text();
            console.warn('[RoleGranter] Failed to grant role:', error);
          }
        } catch (error) {
          console.error('[RoleGranter] Error granting role:', error);
        }
      };

      grantRole();
    }
  }, [session, status, guildId, granted]);

  if (status === 'loading') {
    return (
      <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
        Vérification du rôle...
      </div>
    );
  }

  if (status === 'authenticated' && granted) {
    return (
      <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
        Rôle attribué avec succès !
      </div>
    );
  }

  return null;
}
