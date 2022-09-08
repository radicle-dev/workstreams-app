import { browser } from '$app/env';

export default function getEnvVar(key: string): string {
  const val = browser ? import.meta.env[key] : process.env[key];

  if (!val) throw new Error(`Undefined environment variable ${key}`);

  return val;
}
