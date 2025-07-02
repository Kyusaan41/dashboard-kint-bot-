import NextAuth, { NextAuthOptions, SessionStrategy } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "identify email guilds",
        },
      },
      // 👇 Correction ici : on personnalise le profil utilisateur reçu de Discord
      profile(profile) {
        return {
          id: profile.id,
          name: `${profile.username}#${profile.discriminator}`,
          username: profile.username,
          discriminator: profile.discriminator,
          email: profile.email,
          avatar: profile.avatar, // hash brut
          image: profile.avatar
            ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.${profile.avatar.startsWith('a_') ? 'gif' : 'png'}`
            : `https://cdn.discordapp.com/embed/avatars/${parseInt(profile.discriminator) % 5}.png`,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.avatar = user.avatar;
        token.discriminator = user.discriminator;
      }
      return token;
    },

    async session({ session, token }: { session: any; token: any }) {
      console.log('Session callback:', session, token);
      if (token) {
        session.user.id = token.id;
        session.user.name = token.username;
        session.user.avatar = token.avatar;
        session.user.discriminator = token.discriminator;
      }
      return session;
    },

    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      return "/dashboard";
    },
  },

  session: {
    strategy: "jwt" as SessionStrategy,
  },

  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
