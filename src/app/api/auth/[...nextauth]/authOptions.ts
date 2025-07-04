import { FrontendRoutes } from "../../../../config/apiRoutes";
import userLogIn from "../../../../lib/userLogIn";
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        const user = await userLogIn(credentials.email, credentials.password);

        if (user) {
          return {
            ...user,
            token: user.token || "",
          };
        } else {
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          ...user,
        };
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        ...token,
      };
      return session;
    },
  },
  pages: {
    signIn: FrontendRoutes.LOGIN,
  },
};
