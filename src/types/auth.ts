import { Address } from "./address";

export interface AuthLogin {
  email: string;
  password: string;
}

export interface AuthRegister extends AuthLogin {
  username: string;
  confirmPassword: string;
}



export interface User {
  _id: string;
  username: string;
  email: string;
  phone?: string;
  roles: string;
  permissions: Array<string>;
  avatar: string;
  isVerifiedEmail: boolean;
  isTwoFactorEnabled?: boolean;
  provider: string;
  addresses: Array<Address>;
  createdAt: string;
  updatedAt: string;
}

export interface TwoFactorLoginChallenge {
  requiresTwoFactor: true;
  challengeToken: string;
  email: string;
  expiresIn: string;
}

export type LoginResult = User | TwoFactorLoginChallenge;

export interface AuthState {
  loading: boolean;
  isAuthenticated: boolean;
  data: User | null;
}

export interface EmailAuth {
  email: string;
}

export interface PasswordReset extends EmailAuth {
  code: string;
  newPassword: string;
}
