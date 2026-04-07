import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import { apiClient } from '../../../core/api/apiClient';

interface AuthState {
	user: User | null;
	accessToken: string | null;
	refreshToken: string | null;
	isLoading: boolean;
	error: string | null;

	// Actions
	setAuth: (user: User, accessToken: string, refreshToken: string) => void;
	logout: () => void;
	setLoading: (isLoading: boolean) => void;
	setError: (error: string | null) => void;
	updateProfile: (firstName: string, lastName: string) => Promise<void>;
	changePassword: (oldPassword: string, newPassword: string) => Promise<any>;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set, get) => ({
			user: null,
			accessToken: null,
			refreshToken: null,
			isLoading: false,
			error: null,

			setAuth: (user, accessToken, refreshToken) =>
				set({ user, accessToken, refreshToken, error: null }),
			logout: () => set({ user: null, accessToken: null, refreshToken: null, error: null }),
			setLoading: (isLoading) => set({ isLoading }),
			setError: (error) => set({ error, isLoading: false }),

			updateProfile: async (firstName: string, lastName: string) => {
				set({ isLoading: true, error: null });
				try {
					const response = await apiClient.patch('/auth/profile', {
						first_name: firstName,
						last_name: lastName,
					});
					const result = response.data.body;
					const currentUser = get().user;
					if (currentUser) {
						set({
							user: { ...currentUser, name: result.name },
							isLoading: false,
						});
					}
				} catch (error: any) {
					const msg = error.response?.data?.message || error.message || 'فشل تحديث الملف الشخصي';
					set({ error: msg, isLoading: false });
					throw new Error(msg);
				}
			},
			changePassword: async (oldPassword: string, newPassword: string) => {
				set({ isLoading: true, error: null });
				try {
					const response = await apiClient.patch('/auth/password', { oldPassword, newPassword });
					// On success, clear local auth state to force re-login
					get().logout();
					set({ isLoading: false });
					return response.data;
				} catch (error: any) {
					const msg = error.response?.data?.message || error.message || 'فشل تغيير كلمة المرور';
					set({ error: msg, isLoading: false });
					throw new Error(msg);
				}
			},
		}),
		{
			name: 'auth-storage',
			storage: createJSONStorage(() => AsyncStorage),
			partialize: (state) => ({
				user: state.user,
				accessToken: state.accessToken,
				refreshToken: state.refreshToken,
			}),
		}
	)
);
