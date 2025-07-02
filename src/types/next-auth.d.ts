import 'next-auth';
import { DefaultSession } from 'next-auth';

// On étend les types de base de NextAuth
declare module 'next-auth' {
    /**
     * Le type User. On rend le rôle OPTIONNEL avec le '?'.
     */
    interface User {
        id: string;
        role?: string; // <--- MODIFICATION ICI
    }

    /**
     * La session côté client. On rend aussi le rôle optionnel.
     */
    interface Session {
        user: {
            id: string;
            role?: string; // <--- MODIFICATION ICI
        } & DefaultSession['user'];
    }
}

declare module 'next-auth/jwt' {
    /**
     * Le token JWT. Le rôle devient optionnel ici aussi.
     */
    interface JWT {
        id: string;
        role?: string; // <--- MODIFICATION ICI
    }
}