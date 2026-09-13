import { betterAuth } from "better-auth";
import { anonymous } from "better-auth/plugins";
import { Pool } from "@neondatabase/serverless";

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    anonymous(),
  ],
  secret: process.env.BETTER_AUTH_SECRET || "eu-ai-act-compliance-checker-super-secure-secret-key-32",
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3005",
});
