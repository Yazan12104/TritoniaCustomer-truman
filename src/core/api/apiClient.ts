import axios from 'axios';
import { API_URL } from '../../config/env';
import { useGlobalErrorStore } from '../store/globalErrorStore';

export const apiClient = axios.create({
	baseURL: API_URL,
	headers: {
		'Content-Type': 'application/json',
		'Accept': 'application/json',
	},
});

// Token refresh queue — prevents multiple simultaneous refresh calls
let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (err: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
	failedQueue.forEach((prom) => {
		if (error) prom.reject(error);
		else prom.resolve(token!);
	});
	failedQueue = [];
};

// Request interceptor: inject Bearer token from auth store
apiClient.interceptors.request.use(
	(config) => {
		// Import lazily to avoid circular dependency
		const { useAuthStore } = require('../../features/auth/store/authStore');
		const token = useAuthStore.getState().accessToken;
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => Promise.reject(error)
);

// Response interceptor: handle 401 Unauthorized and 5xx server errors
apiClient.interceptors.response.use(
	(response) => {
		// If we get a successful response and server was down, clear the error
		const { isServerDown, clearServerDown } = useGlobalErrorStore.getState();
		if (isServerDown) {
			clearServerDown();
		}
		return response;
	},
	async (error) => {
		const originalRequest = error.config;
		const status = error.response?.status;

		if (status === 401 && !originalRequest._retry) {
			// If another refresh is already in flight, queue this request
			if (isRefreshing) {
				return new Promise<string>((resolve, reject) => {
					failedQueue.push({ resolve, reject });
				}).then((token) => {
					originalRequest.headers.Authorization = `Bearer ${token}`;
					return apiClient(originalRequest);
				}).catch((err) => Promise.reject(err));
			}

			originalRequest._retry = true;
			isRefreshing = true;

			try {
				const { useAuthStore } = require('../../features/auth/store/authStore');
				await useAuthStore.getState().renewToken();
				const newToken = useAuthStore.getState().accessToken;
				processQueue(null, newToken);
				originalRequest.headers.Authorization = `Bearer ${newToken}`;
				return apiClient(originalRequest);
			} catch (refreshError) {
				processQueue(refreshError, null);
				const { useAuthStore } = require('../../features/auth/store/authStore');
				useAuthStore.getState().logout();
				return Promise.reject(refreshError);
			} finally {
				isRefreshing = false;
			}
		} else if (status && status >= 500) {
			// Server error (5xx) - set global error state
			const { setServerDown } = useGlobalErrorStore.getState();
			setServerDown(error.response?.data?.message || 'Server error');
		}

		return Promise.reject(error);
	}
);
