// src/types/next-auth.d.ts

import 'next-auth';

declare module 'next-auth' {
    /**
     * Surcharge le type de la session pour inclure tes propriétés personnalisées
     */
    interface Session {
        user: {
            id: string;
            role: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
        };
    }

    /**
     * Surcharge le type de l'utilisateur de base
     */
    interface User {
        id: string;
        role: string;
    }
}

declare module 'next-auth/jwt' {
    /**
     * Surcharge le type du JWT pour inclure ton rôle et id
     */
    interface JWT {
        id: string;
        role: string;
    }
}