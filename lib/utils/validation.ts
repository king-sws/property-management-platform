
// lib/utils/validation.ts
import { z } from "zod";

export const emailSchema = z.string().email("Invalid email address");

export const phoneSchema = z
  .string()
  .regex(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/, {
    message: "Invalid phone number",
  });

export const zipCodeSchema = z
  .string()
  .regex(/^\d{5}(-\d{4})?$/, { message: "Invalid ZIP code" });

export const ssnSchema = z
  .string()
  .regex(/^\d{3}-?\d{2}-?\d{4}$/, { message: "Invalid SSN format" });

export const currencySchema = z
  .number()
  .positive("Amount must be positive")
  .finite("Amount must be a valid number");

export function validateEmail(email: string): boolean {
  return emailSchema.safeParse(email).success;
}

export function validatePhone(phone: string): boolean {
  return phoneSchema.safeParse(phone).success;
}
