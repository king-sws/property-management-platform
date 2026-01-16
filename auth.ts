import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { compare } from "bcryptjs"
import { AccountStatus, UserRole } from "./lib/generated/prisma/enums"
import prisma from "./lib/prisma"
import NextAuth from "next-auth"

declare module "next-auth" {
  interface User {
    role?: UserRole
    status?: AccountStatus
    needsProfileSetup?: boolean
  }
  
  interface Session {
    user: {
      id: string
      email: string
      name?: string
      image?: string
      role: UserRole
      status: AccountStatus
      needsProfileSetup?: boolean
    }
  }
}


export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { 
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/sign-in",
    error: "/auth/error",
  },
  
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials")
        }

        const user = await prisma.user.findUnique({
          where: { 
            email: credentials.email as string,
          },
          include: {
            landlordProfile: true,
            tenantProfile: true,
            vendorProfile: true,
          }
        })

        if (!user || !user.password) {
          throw new Error("Invalid credentials")
        }

        if (user.status === "SUSPENDED" || user.status === "INACTIVE") {
          throw new Error("Account is suspended or inactive")
        }

        const isPasswordValid = await compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error("Invalid credentials")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image || user.avatar,
          role: user.role,
          status: user.status,
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
          include: {
            landlordProfile: true,
            tenantProfile: true,
            vendorProfile: true,
          }
        })

        if (!existingUser) {
          // Create user WITHOUT a role - they'll select it next
          await prisma.user.create({
            data: {
              email: user.email!,
              name: user.name,
              image: user.image,
              emailVerified: new Date(),
              role: UserRole.TENANT, // Temporary default
              status: AccountStatus.PENDING_VERIFICATION, // Mark as incomplete
            }
          })
        } else if (existingUser.deletedAt) {
          return false
        } else if (existingUser.status === "SUSPENDED" || existingUser.status === "INACTIVE") {
          return false
        }
      }
      return true
    },
    
async jwt({ token, user }) {
  if (user) {
    token.id = user.id
    token.role = user.role as UserRole
    token.status = user.status
  }

  if (token.id) {
    const dbUser = await prisma.user.findUnique({
      where: { id: token.id as string },
      include: {
        landlordProfile: true,
        tenantProfile: true,
        vendorProfile: true,
      }
    })

    if (!dbUser || dbUser.deletedAt) {
      return {}
    }

    // ✅ FIX: Check if profile exists for their role (ADMIN doesn't need a profile)
    const hasProfile = 
      dbUser.role === 'ADMIN' || // Admin doesn't need profile setup
      (dbUser.role === 'LANDLORD' && dbUser.landlordProfile) ||
      (dbUser.role === 'TENANT' && dbUser.tenantProfile) ||
      (dbUser.role === 'VENDOR' && dbUser.vendorProfile)

    token.needsProfileSetup = !hasProfile || dbUser.status === 'PENDING_VERIFICATION'
    token.email = dbUser.email
    token.name = dbUser.name
    token.picture = dbUser.image || dbUser.avatar
    token.role = dbUser.role
    token.status = dbUser.status
  }

  return token
},
    
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
        session.user.status = token.status as AccountStatus
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.image = token.picture as string
        session.user.needsProfileSetup = token.needsProfileSetup as boolean
      }
      return session
    }
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      // Log sign in activity
      await prisma.activityLog.create({
        data: {
          userId: user.id!,
          type: "USER_LOGIN",
          action: `User signed in via ${account?.provider || "credentials"}`,
          ipAddress: null, // Add from request if available
          metadata: { isNewUser, provider: account?.provider }
        }
      })
    },
    async signOut(params) {
      const token = 'token' in params ? params.token : null
      if (token?.id) {
        await prisma.activityLog.create({
          data: {
            userId: token.id as string,
            type: "USER_LOGOUT",
            action: "User signed out",
          }
        })
      }
    }
  },
  debug: process.env.NODE_ENV === "development",
})