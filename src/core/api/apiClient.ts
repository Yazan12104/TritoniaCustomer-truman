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
	(error) => {
		const status = error.response?.status;

		if (status === 401) {
			const { useAuthStore } = require('../../features/auth/store/authStore');
			useAuthStore.getState().logout();
		} else if (status && status >= 500) {
			// Server error (5xx) - set global error state
			const { setServerDown } = useGlobalErrorStore.getState();
			setServerDown(error.response?.data?.message || 'Server error');
		}

		return Promise.reject(error);
	}
);
