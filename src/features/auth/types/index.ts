export type Role = 'ADMIN' | 'BRANCH_MANAGER' | 'GENERAL_SUPERVISOR' | 'SUPERVISOR' | 'MARKETER' | 'CUSTOMER';

export interface User {
	id: string;
	name: string;
	phone: string;
	role: Role;
	employee_id?: string;
	branch_id?: string;
	branch_name?: string;
}

export interface AuthResponse {
	user: User;
	accessToken: string;
	refreshToken: string;
}

export interface LoginCredentials {
	phone: string;
	password?: string;
}
