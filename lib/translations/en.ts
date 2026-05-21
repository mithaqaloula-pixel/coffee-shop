// English translations — placeholder for Phase 1.
// The UI currently runs in Arabic only; this file mirrors the shape of ar.ts
// so the language toggle can be wired up in a later phase.

import type { Translations } from "./ar";

export const en: Translations = {
  appName: "CampusWash",
  tagline: "Wash your car while you're in class",
  common: {
    loading: "Loading...",
    save: "Save",
    cancel: "Cancel",
    continue: "Continue",
    back: "Back",
    logout: "Log out",
    error: "Something went wrong, please try again",
  },
  landing: {
    description:
      "Wash your car while you're in class — order the service and we bring it to your parking spot.",
    loginAsStudent: "Log in as student",
    loginAsWorker: "Log in as worker",
  },
  login: {
    title: "Log in",
    phoneLabel: "Phone number",
    phonePlaceholder: "e.g. 96891234567",
    sendOtp: "Send verification code",
    otpLabel: "Verification code",
    otpPlaceholder: "Enter the 6-digit code",
    verify: "Verify & log in",
    resend: "Resend code",
    changePhone: "Change number",
    otpSent: "A verification code was sent to your phone",
    invalidPhone: "Invalid phone number",
    invalidOtp: "Invalid or expired verification code",
  },
  onboarding: {
    title: "Complete your profile",
    subtitle: "We need a few details to finish setting up your account",
    nameLabel: "Name",
    namePlaceholder: "Enter your full name",
    roleLabel: "Account type",
    roleStudent: "Student",
    roleWorker: "Worker",
    finish: "Finish sign up",
    nameRequired: "Name is required",
    roleRequired: "Choose an account type",
  },
  student: {
    welcome: "Welcome",
    placeholder:
      "Student page — soon you'll be able to order a car wash from here.",
  },
  worker: {
    welcome: "Welcome",
    placeholder: "Worker page — available orders will appear here soon.",
  },
  language: {
    toggle: "العربية",
  },
};
