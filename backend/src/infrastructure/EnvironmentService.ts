import dotenv from 'dotenv';
import { z, ZodError } from 'zod';

const environmentVariablesValidator = z.object({
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string({ error: 'DATABASE_URL is required' }).min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string({ error: 'JWT_SECRET is required' }).min(1, 'JWT_SECRET is required'),
  MAILGUN_API_KEY: z
    .string({ error: 'MAILGUN_API_KEY is required' })
    .trim()
    .min(1, 'MAILGUN_API_KEY is required'),
  MAILGUN_DOMAIN: z
    .string({ error: 'MAILGUN_DOMAIN is required' })
    .trim()
    .min(1, 'MAILGUN_DOMAIN is required'),
  OPENROUTER_API_KEY: z
    .string({ error: 'OPENROUTER_API_KEY is required' })
    .min(1, 'OPENROUTER_API_KEY is required'),
  COOKIE_SECURE: z
    .string()
    .optional()
    .transform((value) => value === 'true'),
});

type EnvironmentVariables = z.infer<typeof environmentVariablesValidator>;

class EnvironmentService {
  private environmentVariables: EnvironmentVariables | null = null;

  // Loads and validates the environment variables. The server will not start if one is missing.
  load() {
    if (this.environmentVariables) {
      return;
    }

    dotenv.config();

    try {
      this.environmentVariables = environmentVariablesValidator.parse(process.env);
      console.log('Environment variables loaded');
    } catch (error) {
      if (error instanceof ZodError) {
        throw new Error('Error loading environment variables: ' + error.issues[0].message);
      }
      throw error;
    }
  }

  get(): EnvironmentVariables {
    if (!this.environmentVariables) {
      throw new Error('Environment variables not loaded, call .load() first');
    }
    return this.environmentVariables;
  }
}

export const environmentService = new EnvironmentService();
