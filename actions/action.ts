/* eslint-disable @typescript-eslint/no-explicit-any */
// actions/actions.ts
"use server";

import { auth, signIn, signOut } from "@/auth";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { AuthError } from "next-auth";
import { AccountStatus, SubscriptionStatus, SubscriptionTier, UserRole, VendorCategory } from "@/lib/generated/prisma/enums";
import prisma from "@/lib/prisma";
import { createStripeCustomer, SUBSCRIPTION_PLANS, createSubscription } from "@/services/stripe";

// -------------------------
// Validation Schemas
// -------------------------
const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      "Password must contain at least one lowercase letter, one uppercase letter, and one number"),
  role: z.enum(["LANDLORD", "TENANT", "VENDOR"]).optional().default("TENANT"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      "Password must contain uppercase, lowercase, and number"),
});

// -------------------------
// Types
// -------------------------
type AuthResult = {
  success: boolean;
  userId?: string | null;
  error?: string;
  message?: string;
};

// Simple rate limiting (consider using Redis in production)
const attempts = new Map<string, { count: number; resetTime: number }>();

const rateLimit = (key: string, maxAttempts: number, windowMs: number): boolean => {
  const now = Date.now();
  const record = attempts.get(key);

  if (!record || now > record.resetTime) {
    attempts.set(key, { count: 1, resetTime: now + windowMs });
    return false;
  }

  if (record.count >= maxAttempts) {
    return true; // Rate limited
  }

  record.count++;
  return false;
};

// -------------------------
// Sign in with credentials
// -------------------------
export const SignInWithCredentials = async (
  email: string,
  password: string
): Promise<AuthResult> => {
  try {
    // Validate input
    const validated = signInSchema.parse({ email, password });

    // Rate limiting
    const rateLimited = rateLimit(`signin:${email}`, 5, 15 * 60 * 1000);
    if (rateLimited) {
      return {
        success: false,
        error: "Too many sign-in attempts. Please try again later.",
      };
    }

    // Check if user exists and is active
    const user = await prisma.user.findUnique({
      where: { email: validated.email },
      select: {
        id: true,
        status: true,
        deletedAt: true,
      },
    });

    if (!user || user.deletedAt) {
      return {
        success: false,
        error: "Invalid email or password",
      };
    }

    if (user.status === AccountStatus.SUSPENDED) {
      return {
        success: false,
        error: "Your account has been suspended. Please contact support.",
      };
    }

    if (user.status === AccountStatus.INACTIVE) {
      return {
        success: false,
        error: "Your account is inactive. Please contact support.",
      };
    }

    // Attempt sign in
    const result = await signIn("credentials", {
      email: validated.email,
      password: validated.password,
      redirect: false,
    });

    if (result?.error) {
      return {
        success: false,
        error: "Invalid email or password",
      };
    }

    // Log successful login
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        type: "USER_LOGIN",
        action: "User signed in successfully",
      },
    }).catch(console.error);
    

    return { 
      success: true,
      userId: user.id,
      message: "Successfully signed in!"
    };
    

  } catch (error) {
    console.error("Sign-in error:", error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid input",
      };
    }

    if (error instanceof AuthError) {
      return {
        success: false,
        error: "Authentication failed. Please check your credentials.",
      };
    }

    return { 
      success: false, 
      error: "An unexpected error occurred. Please try again." 
    };
  }
};

// -------------------------
// Sign up with credentials
// -------------------------
export const SignUpWithCredentials = async (
  name: string,
  email: string,
  password: string,
  role: "LANDLORD" | "TENANT" | "VENDOR" = "TENANT"
): Promise<AuthResult> => {
  try {
    const validated = signUpSchema.parse({ name, email, password, role });

    const rateLimited = rateLimit(`signup:${email}`, 3, 60 * 60 * 1000);
    if (rateLimited) {
      return {
        success: false,
        error: "Too many registration attempts. Please try again later.",
      };
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (existingUser) {
      return { 
        success: false, 
        error: "An account with this email already exists" 
      };
    }

    const hashedPassword = await bcrypt.hash(validated.password, 12);

    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: validated.email,
          name: validated.name,
          password: hashedPassword,
          role: validated.role as UserRole,
          status: AccountStatus.ACTIVE,
          emailVerified: new Date(),
        },
      });

      let stripeSetupSucceeded = false;

      if (validated.role === "LANDLORD") {
        // ✅ IMPROVED: Better Stripe setup with retry and fallback
        const defaultTier = "PROFESSIONAL";
        const trialDays = 14;
        const trialEndsAt = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000);
        
        let stripeCustomerId: string | undefined;
        let stripeSubscriptionId: string | undefined;
        
        try {
          console.log("🔄 Creating Stripe customer for new landlord:", newUser.email);
          
          const customerResult = await createStripeCustomer(
            newUser.email,
            newUser.name || "Landlord",
            {
              landlordId: "pending",
              userId: newUser.id,
            }
          );

          if (customerResult.success && customerResult.customer) {
            stripeCustomerId = customerResult.customer.id;
            console.log("✅ Stripe customer created:", stripeCustomerId);

            const priceId = SUBSCRIPTION_PLANS[defaultTier as keyof typeof SUBSCRIPTION_PLANS].priceId;
            
            console.log("🔄 Creating subscription with trial...");
            const subscriptionResult = await createSubscription(
              stripeCustomerId,
              priceId,
              trialDays
            );

            if (subscriptionResult.success && subscriptionResult.subscription) {
              stripeSubscriptionId = subscriptionResult.subscription.id;
              stripeSetupSucceeded = true;
              console.log("✅ Subscription created:", stripeSubscriptionId);
            } else {
              console.error("❌ Subscription creation failed:", subscriptionResult);
            }
          } else {
            console.error("❌ Customer creation failed:", customerResult);
          }
        } catch (stripeError) {
          console.error("❌ Stripe setup error during signup:", stripeError);
          // Continue anyway - they can set this up later via Settings
        }

        // ✅ Create landlord profile with or without Stripe
        const landlordData: any = {
          userId: newUser.id,
          subscriptionTier: defaultTier as SubscriptionTier,
          propertyLimit: SUBSCRIPTION_PLANS[defaultTier as keyof typeof SUBSCRIPTION_PLANS].propertyLimit,
          trialUsed: stripeSetupSucceeded, // Only mark as used if Stripe succeeded
        };

        if (stripeSetupSucceeded) {
          landlordData.subscriptionStatus = SubscriptionStatus.TRIAL;
          landlordData.trialEndsAt = trialEndsAt;
          landlordData.stripeCustomerId = stripeCustomerId;
          landlordData.stripeSubscriptionId = stripeSubscriptionId;
          landlordData.currentPeriodEnd = trialEndsAt;
        } else {
          // ✅ If Stripe failed, set status to require manual setup
          landlordData.subscriptionStatus = SubscriptionStatus.INACTIVE;
        }

        await tx.landlord.create({
          data: landlordData,
        });

        // Log appropriate message
        await tx.activityLog.create({
          data: {
            userId: newUser.id,
            type: "USER_LOGIN",
            action: stripeSetupSucceeded
              ? `New LANDLORD account with ${defaultTier} trial (${trialDays} days)`
              : `New LANDLORD account created - subscription setup pending`,
            metadata: { 
              email: newUser.email, 
              role: newUser.role,
              subscriptionTier: defaultTier,
              stripeSetupSucceeded,
              trialEndsAt: stripeSetupSucceeded ? trialEndsAt.toISOString() : null,
            },
          },
        });

        // Create appropriate notification
        if (stripeSetupSucceeded) {
          await tx.notification.create({
            data: {
              userId: newUser.id,
              type: "SYSTEM",
              channel: "IN_APP",
              title: "🎉 Welcome to Your Free Trial!",
              message: `Your ${trialDays}-day free trial of the ${defaultTier} plan has started. You have access to all premium features until ${trialEndsAt.toLocaleDateString()}. Add a payment method anytime to continue after the trial.`,
              actionUrl: "/dashboard/settings/subscription",
            },
          });
        } else {
          // ✅ Notify that manual setup is needed
          await tx.notification.create({
            data: {
              userId: newUser.id,
              type: "SYSTEM",
              channel: "IN_APP",
              title: "👋 Welcome! Complete Your Setup",
              message: `Your account has been created. Please complete your subscription setup in Settings to start your free 14-day trial.`,
              actionUrl: "/dashboard/settings/subscription",
            },
          });
        }

      } else if (validated.role === "TENANT") {
        await tx.tenant.create({
          data: {
            userId: newUser.id,
          },
        });

        await tx.activityLog.create({
          data: {
            userId: newUser.id,
            type: "USER_LOGIN",
            action: "New TENANT account created",
            metadata: { email: newUser.email, role: newUser.role },
          },
        });

      } else if (validated.role === "VENDOR") {
        await tx.vendor.create({
          data: {
            userId: newUser.id,
            businessName: validated.name,
            category: "OTHER",
            services: [],
          },
        });

        await tx.activityLog.create({
          data: {
            userId: newUser.id,
            type: "USER_LOGIN",
            action: "New VENDOR account created",
            metadata: { email: newUser.email, role: newUser.role },
          },
        });
      }

      return { user: newUser, stripeSetupSucceeded };
    });

    // Auto sign-in
    try {
      await signIn("credentials", {
        email: validated.email,
        password: validated.password,
        redirect: false,
      });

      return {
        success: true,
        userId: result.user.id,
        message: validated.role === "LANDLORD"
          ? (result.stripeSetupSucceeded 
              ? "🎉 Account created! Your 14-day free trial has started."
              : "✅ Account created! Please complete subscription setup in Settings.")
          : "Account created and signed in successfully!",
      };
    } catch (signInError) {
      console.error("Auto sign-in error:", signInError);
      return {
        success: true,
        userId: result.user.id,
        message: "Account created successfully! Please sign in.",
      };
    }

  } catch (error) {
    console.error("Sign-up error:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid input",
      };
    }

    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return {
        success: false,
        error: "An account with this email already exists",
      };
    }

    return { 
      success: false, 
      error: "Failed to create account. Please try again." 
    };
  }
};




// -------------------------
// Forgot Password
// -------------------------
export const ForgotPassword = async (email: string): Promise<AuthResult> => {
  try {
    const validated = forgotPasswordSchema.parse({ email });

    // Rate limiting
    const rateLimited = rateLimit(`forgot:${email}`, 3, 60 * 60 * 1000);
    if (rateLimited) {
      return {
        success: false,
        error: "Too many password reset attempts. Please try again later.",
      };
    }

    const user = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    // Always return success to prevent email enumeration
    if (!user || user.deletedAt) {
      return {
        success: true,
        message: "If an account exists, a password reset link has been sent.",
      };
    }

    // Generate reset token
    const resetToken = crypto.randomUUID();
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await prisma.verificationToken.create({
      data: {
        identifier: user.id,
        token: resetToken,
        expires,
      },
    });

    // TODO: Send password reset email
    // await sendPasswordResetEmail(user.email, resetToken)

    return {
      success: true,
      message: "If an account exists, a password reset link has been sent.",
    };
  } catch (error) {
    console.error("Forgot password error:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid email",
      };
    }

    return {
      success: false,
      error: "An error occurred. Please try again.",
    };
  }
};

// -------------------------
// Reset Password
// -------------------------
export const ResetPassword = async (
  token: string,
  newPassword: string
): Promise<AuthResult> => {
  try {
    const validated = resetPasswordSchema.parse({ token, password: newPassword });

    // Verify token
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        token: validated.token,
        expires: { gte: new Date() },
      },
    });

    if (!verificationToken) {
      return {
        success: false,
        error: "Invalid or expired reset token",
      };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(validated.password, 12);

    // Update password
    await prisma.user.update({
      where: { id: verificationToken.identifier },
      data: { password: hashedPassword },
    });

    // Delete used token
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: verificationToken.identifier,
          token: verificationToken.token,
        },
      },
    });

    // Log password change
    await prisma.activityLog.create({
      data: {
        userId: verificationToken.identifier,
        type: "USER_LOGIN",
        action: "Password reset completed",
      },
    }).catch(console.error);

    return {
      success: true,
      message: "Password reset successfully",
    };
  } catch (error) {
    console.error("Reset password error:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid input",
      };
    }

    return {
      success: false,
      error: "An error occurred during password reset",
    };
  }
};

// -------------------------
// Sign out
// -------------------------
export const SignOut = async (): Promise<void> => {
  try {
    await signOut({ redirectTo: "/" });
  } catch (error) {
    console.error("Sign-out error:", error);
    redirect("/");
  }
};

// -------------------------
// Server Actions for Direct Redirects
// -------------------------
export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const result = await SignInWithCredentials(email, password);
  
  if (result.success) {
    redirect("/dashboard");
  }
  
  throw new Error(result.error || "Authentication failed");
};

export const signUpAction = async (formData: FormData) => {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as "LANDLORD" | "TENANT" | "VENDOR" | undefined;

  const result = await SignUpWithCredentials(name, email, password, role);
  
  if (result.success) {
    redirect("/dashboard");
  }
  
  throw new Error(result.error || "Registration failed");
};

// -------------------------
// Utility Functions
// -------------------------
export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    return !!user;
  } catch {
    return false;
  }
};


export const completeProfile = async (data: {
  role: "LANDLORD" | "TENANT" | "VENDOR"
  phone?: string
  businessName?: string
  category?: string
  services?: string[]
  licenseNumber?: string
  isInsured?: boolean
}): Promise<AuthResult> => {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: session?.user?.id },
        data: {
          role: data.role as UserRole,
          phone: data.phone,
          status: AccountStatus.ACTIVE,
        },
      })

      if (data.role === "LANDLORD") {
        const defaultTier = "PROFESSIONAL";
        const trialDays = 14;
        const trialEndsAt = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000);

        let stripeCustomerId: string | undefined;
        let stripeSubscriptionId: string | undefined;
        let stripeSetupSucceeded = false;
        
        try {
          const user = await tx.user.findUnique({
            where: { id: session?.user?.id },
            select: { email: true, name: true },
          });

          if (user) {
            const customerResult = await createStripeCustomer(
              user.email,
              user.name || "Landlord",
              {
                landlordId: "pending",
                userId: session?.user?.id,
              }
            );

            if (customerResult.success && customerResult.customer) {
              stripeCustomerId = customerResult.customer.id;

              const priceId = SUBSCRIPTION_PLANS[defaultTier as keyof typeof SUBSCRIPTION_PLANS].priceId;
              const subscriptionResult = await createSubscription(
                stripeCustomerId,
                priceId,
                trialDays
              );

              if (subscriptionResult.success && subscriptionResult.subscription) {
                stripeSubscriptionId = subscriptionResult.subscription.id;
                stripeSetupSucceeded = true;
              }
            }
          }
        } catch (stripeError) {
          console.error("Stripe setup error:", stripeError);
        }

        const landlordData: any = {
          userId: session?.user?.id,
          subscriptionTier: defaultTier as SubscriptionTier,
          propertyLimit: SUBSCRIPTION_PLANS[defaultTier as keyof typeof SUBSCRIPTION_PLANS].propertyLimit,
          trialUsed: stripeSetupSucceeded,
        };

        if (stripeSetupSucceeded) {
          landlordData.subscriptionStatus = SubscriptionStatus.TRIAL;
          landlordData.trialEndsAt = trialEndsAt;
          landlordData.stripeCustomerId = stripeCustomerId;
          landlordData.stripeSubscriptionId = stripeSubscriptionId;
        } else {
          landlordData.subscriptionStatus = SubscriptionStatus.INACTIVE;
        }

        await tx.landlord.create({
          data: landlordData,
        })

        await tx.activityLog.create({
          data: {
            userId: session?.user?.id,
            type: "USER_LOGIN",
            action: stripeSetupSucceeded
              ? `Profile completed as LANDLORD with ${defaultTier} trial`
              : `Profile completed as LANDLORD - subscription setup pending`,
            metadata: {
              subscriptionTier: defaultTier,
              stripeSetupSucceeded,
            },
          },
        })

        if (stripeSetupSucceeded) {
          await tx.notification.create({
            data: {
              userId: session?.user?.id,
              type: "SYSTEM",
              channel: "IN_APP",
              title: "🎉 Welcome to Your Free Trial!",
              message: `Your ${trialDays}-day free trial has started! You have full access to all ${defaultTier} features.`,
              actionUrl: "/dashboard/settings/subscription",
            },
          })
        } else {
          await tx.notification.create({
            data: {
              userId: session?.user?.id,
              type: "SYSTEM",
              channel: "IN_APP",
              title: "👋 Complete Your Setup",
              message: `Please complete your subscription setup to start your free trial.`,
              actionUrl: "/dashboard/settings/subscription",
            },
          })
        }

        return { stripeSetupSucceeded };

      } else if (data.role === "TENANT") {
        await tx.tenant.create({
          data: { userId: session?.user?.id },
        })
        
        await tx.activityLog.create({
          data: {
            userId: session?.user?.id,
            type: "USER_LOGIN",
            action: "Profile completed as TENANT",
          },
        })

        return { stripeSetupSucceeded: true };

      } else if (data.role === "VENDOR") {
        if (!data.businessName || !data.category || !data.services?.length) {
          throw new Error("Missing required vendor information")
        }
        
        await tx.vendor.create({
          data: {
            userId: session?.user?.id,
            businessName: data.businessName,
            category: data.category as VendorCategory,
            services: data.services,
            licenseNumber: data.licenseNumber,
            isInsured: data.isInsured || false,
          },
        })

        await tx.activityLog.create({
          data: {
            userId: session?.user?.id,
            type: "USER_LOGIN",
            action: "Profile completed as VENDOR",
          },
        })

        return { stripeSetupSucceeded: true };
      }

      return { stripeSetupSucceeded: false };
    })

    return { 
      success: true, 
      message: data.role === "LANDLORD" 
        ? (result.stripeSetupSucceeded
            ? "🎉 Profile completed! Your 14-day free trial has started."
            : "✅ Profile completed! Please set up your subscription in Settings.")
        : "Profile completed successfully"
    }
  } catch (error) {
    console.error("Complete profile error:", error)
    return { success: false, error: "Failed to complete profile" }
  }
}