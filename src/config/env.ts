type EnvRecord = Record<string, string | undefined>;

const DEFAULTS = {
	API_URL: 'http://10.123.72.83:3000/api',
	BASE_URL: 'http://10.123.72.83:3000',
	USE_MOCK_API: 'false',
} as const;

const expoEnv: EnvRecord = ((globalThis as any).process?.env ?? {}) as EnvRecord;

const getRequiredString = (envKey: string, fallback: string) => {
	const value = expoEnv[envKey];
	if (typeof value === 'string' && value.trim().length > 0) return value.trim();
	return fallback;
};

const parseBoolean = (value: string | undefined) => {
	if (!value) return undefined;
	const normalized = value.trim().toLowerCase();
	if (['true', '1', 'yes', 'y', 'on'].includes(normalized)) return true;
	if (['false', '0', 'no', 'n', 'off'].includes(normalized)) return false;
	return undefined;
};

export const API_URL = getRequiredString('EXPO_PUBLIC_API_URL', DEFAULTS.API_URL);
export const BASE_URL = getRequiredString('EXPO_PUBLIC_BASE_URL', DEFAULTS.BASE_URL);
export const USE_MOCK_API =
	parseBoolean(expoEnv.EXPO_PUBLIC_USE_MOCK_API) ?? DEFAULTS.USE_MOCK_API === 'false';

const REQUIRED_KEYS = ['EXPO_PUBLIC_API_URL', 'EXPO_PUBLIC_BASE_URL'] as const;

export const ENV_IMPORTED_OK = REQUIRED_KEYS.every((key) => {
	const value = expoEnv[key];
	return typeof value === 'string' && value.trim().length > 0;
});

export const ENV_MISSING_KEYS = REQUIRED_KEYS.filter((key) => {
	const value = expoEnv[key];
	return !(typeof value === 'string' && value.trim().length > 0);
});
