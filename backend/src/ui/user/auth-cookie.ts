import type { CookieOptions } from 'express';

export const AUTH_COOKIE_NAME = 'giftory_auth';
export const AUTH_COOKIE_PATH = '/api';
export const AUTH_COOKIE_MAX_AGE_MS = 5 * 24 * 60 * 60 * 1000;

export function getAuthCookieOptions(secure: boolean): CookieOptions {
  return { httpOnly: true, sameSite: 'lax', secure: secure, path: AUTH_COOKIE_PATH };
}
