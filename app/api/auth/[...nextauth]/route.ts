import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { compare } from "bcryptjs";
import { AuthOptions } from "next-auth";

// Define the auth options object with proper typing
export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        // Early return if missing credentials
        if (!credentials?.email || !credentials?.password || !credentials?.role) {
          throw new Error("Missing credentials");
        }

        try {
          await connectDB();
          
          // Find user with both email and role match
          const user = await User.findOne({ 
            email: credentials.email,
            role: credentials.role 
          });
          
          if (!user || !(await compare(credentials.password, user.password))) {
            throw new Error("Invalid credentials");
          }

          // Return user data with role explicitly typed
          return {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
            name: user.name,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt" as const },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id || user.sub;
        token.role = user.role;
        token.name = user.name;
      }
      // console.log("JWT Token After Assignment:", token);
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = (token.id || user.sub) as string; 
        session.user.role = token.role;
        session.user.name = token.name as string;
      }
      // console.log("Session Callback Output:", session);
      return session;
    },
  },
  pages: { signIn: "/login" },
};

// Create and export handler
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };