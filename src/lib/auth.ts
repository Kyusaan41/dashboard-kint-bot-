import { NextAuthOptions, Profile, User } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";

interface DiscordProfile extends Profile {
    id: string;
    username: string;
    email: string;
    avatar: string | null;
}

export const authOptions: NextAuthOptions = {
    providers: [
        DiscordProvider({
            clientId: process.env.DISCORD_CLIENT_ID!,
            clientSecret: process.env.DISCORD_CLIENT_SECRET!,
            profile(profile: DiscordProfile): User {
                // --- CORRECTION : On nettoie les IDs pour enlever les espaces ---
                const adminIds = (process.env.NEXT_PUBLIC_ADMIN_IDS ?? '')
                    .split(',')
                    .map(id => id.trim()); // Ajout de .trim() pour enlever les espaces avant/après

                const userRole = adminIds.includes(profile.id) ? 'admin' : 'user';

                return {
                    id: profile.id,
                    name: profile.username,
                    email: profile.email,
                    image: profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : null,
                    role: userRole,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }: { session: Session; token: JWT }) {
            if (session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};