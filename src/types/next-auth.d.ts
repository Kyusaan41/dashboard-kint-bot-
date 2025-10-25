import 'next-auth';
import { DefaultSession } from 'next-auth';

// On Ã©tend les types de base de NextAuth
declare module 'next-auth' {
    /**
     * Le type User. On rend le rÃ´le OPTIONNEL avec le '?'.
     */
    interface User {
        id: string;
        role?: string; // <--- MODIFICATION ICI
    }

    /**
     * La session cÃ´tÃ© client. On rend aussi le rÃ´le optionnel.
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
     * Le token JWT. Le rÃ´le devient optionnel ici aussi.
     */
    interface JWT {
        id: string;
        role?: string; // <--- MODIFICATION ICI
    }
}
