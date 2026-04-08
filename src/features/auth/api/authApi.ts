import { apiClient } from '../../../core/api/apiClient';
import { USE_MOCK_API } from '../../../config/env';
import { AuthResponse, LoginCredentials } from '../types';

// Mapper to normalize backend response to frontend types
const mapAuthResponse = (apiData: any): AuthResponse => {
	// Support both nested `data` envelope and direct properties matching the User request
	const responseData = apiData.data || apiData;
	const userPayload = responseData.user || responseData;

	return {
		user: {
			id: userPayload.id || 'Unknown',
			name: userPayload.first_name ? `${userPayload.first_name} ${userPayload.last_name}` : (userPayload.name || 'مستخدم'),
			phone: userPayload.phone || '',
			role: userPayload.role || 'SUPERVISOR',
			branch_id: userPayload.branch_id,
			branch_name: userPayload.branch_name,
			employee_id: userPayload.employee_id,
		},
		accessToken: responseData.accessToken || responseData.token || '',
		refreshToken: responseData.refreshToken || responseData.token || '',
	};
};

export const authApi = {
	login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
		try {
			if (USE_MOCK_API) {
				return await new Promise((resolve, reject) => {
					setTimeout(() => {
						if (!credentials.phone) {
							reject(new Error("رقم الهاتف مطلوب"));
							return;
						}
						resolve({
							user: {
								id: '1',
								name: 'مدير النظام',
								phone: credentials.phone,
								role: 'ADMIN',
							},
							accessToken: 'mock-jwt-token-123',
							refreshToken: 'mock-refresh-token-123',
						});
					}, 1000);
				});
			} else {
				const payload = {
					phone: credentials.phone,
					password: credentials.password
				};
				const response = await apiClient.post('/auth/login', payload);

				if (__DEV__) {
					console.log("Login API Response:", JSON.stringify(response.data, null, 2));
				}

				if (response.data.success === false) throw new Error(response.data.error || response.data.message || 'Login failed');
				return mapAuthResponse(response.data);
			}
		} catch (error: any) {
			console.error("Login Error:", error);
			throw new Error(error.response?.data?.error || error.response?.data?.message || "بيانات الاعتماد غير صالحة");
		}
	},

	register: async (data: { first_name: string; last_name: string; phone: string; password: string }): Promise<AuthResponse> => {
		try {
			if (USE_MOCK_API) {
				return await new Promise((resolve) => {
					setTimeout(() => {
						resolve({
							user: {
								id: '2',
								name: `${data.first_name} ${data.last_name}`,
								phone: data.phone,
								role: 'CUSTOMER',
							},
							accessToken: 'mock-jwt-token-customer',
							refreshToken: 'mock-refresh-token-customer',
						});
					}, 1000);
				});
			} else {
				const response = await apiClient.post('/auth/register', data);

				if (__DEV__) {
					console.log("Register API Response:", JSON.stringify(response.data, null, 2));
				}

				if (response.data.success === false) throw new Error(response.data.error || response.data.message || 'Registration failed');
				
				// Backend returns: { id, phone, role, token }
				const responseData = response.data.body || response.data.data;
				return {
					user: {
						id: responseData.id || 'Unknown',
						name: `${data.first_name} ${data.last_name}`,
						phone: responseData.phone || data.phone,
						role: responseData.role || 'CUSTOMER',
					},
					accessToken: responseData.token || response.data.token || '',
					refreshToken: responseData.token || response.data.token || '',
				};
			}
		} catch (error: any) {
			console.error("Register Error:", error);
			throw new Error(error.response?.data?.error || error.response?.data?.message || "فشل إنشاء الحساب");
		}
	},

	logout: async (): Promise<void> => {
		try {
			if (USE_MOCK_API) {
				return await Promise.resolve();
			} else {
				await apiClient.post('/auth/logout');
			}
		} catch (error: any) {
			console.error("Logout Error:", error);
			throw new Error(error.response?.data?.message || 'فشل تسجيل الخروج');
		}
	}
};

// Change password for current user
export const changePassword = async ({ oldPassword, newPassword }: { oldPassword: string; newPassword: string }) => {
	try {
		const response = await apiClient.patch('/auth/password', { oldPassword, newPassword });
		if (response.data.success === false) throw new Error(response.data.error || response.data.message || 'فشل تغيير كلمة المرور');
		return response.data.body || response.data.data || {};
	} catch (error: any) {
		console.error('changePassword Error:', error);
		throw new Error(error.response?.data?.message || error.message || 'فشل تغيير كلمة المرور');
	}
};
