export type EnvironmentTypes = 'dev' | 'production';

const envInput = import.meta.env.VITE_ENV;

let env: EnvironmentTypes = 'dev';
if (envInput === 'production') env = 'production';

export const Environment = {
  get: () => env,
  isDevelopment: () => env === 'dev',
  isProduction: () => env === 'production',
};
