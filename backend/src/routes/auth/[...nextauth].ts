import NextAuth from "next-auth";
import Providers from "next-auth/providers";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "../../../prismaClient";

export default NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { jwt: true },
  jwt: { secret: process.env.NEXTAUTH_SECRET },
  providers: [
    Providers.Email({
      server: process.env.EMAIL_SERVER!,
      from: process.env.EMAIL_FROM!
    }),
    Providers.Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    }),
    Providers.GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!
    })
  ],
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      session.user.role = user.role;
      return session;
    }
  },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login?error="
  },
  events: {
    async signIn(message) {
      await prisma.user.update({
        where: { id: message.user.id },
        data: { lastLogin: new Date(), firstTime: false }
      });
    }
  }
});
