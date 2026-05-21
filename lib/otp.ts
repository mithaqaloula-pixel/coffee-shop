// OTP generation, storage, and "sending".
//
// Phase 1 uses an in-memory store keyed by phone number. This is intentionally
// simple and is NOT production-ready:
//   • It does not survive server restarts.
//   • It does not work across multiple serverless instances.
// Before going live, swap this for a shared store (Redis or a DB table) and
// replace `sendOtp` with a real SMS provider (e.g. Twilio, Unifonic).

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes

type OtpEntry = { code: string; expiresAt: number };

// Reuse the same Map across hot-reloads in development.
const globalForOtp = globalThis as unknown as {
  otpStore: Map<string, OtpEntry> | undefined;
};

const store = globalForOtp.otpStore ?? new Map<string, OtpEntry>();
if (process.env.NODE_ENV !== "production") globalForOtp.otpStore = store;

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/** Create, store, and "send" an OTP for the given phone number. */
export async function sendOtp(phone: string): Promise<void> {
  const code = generateCode();
  store.set(phone, { code, expiresAt: Date.now() + OTP_TTL_MS });

  // TODO(phase-2): integrate a real SMS provider here.
  console.log(`\n📱 [CampusWash OTP] phone=${phone} code=${code}\n`);
}

/** Verify an OTP; consumes it on success so it can't be reused. */
export function verifyOtp(phone: string, code: string): boolean {
  const entry = store.get(phone);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    store.delete(phone);
    return false;
  }
  if (entry.code !== code) return false;
  store.delete(phone);
  return true;
}
