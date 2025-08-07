export interface User {
  _id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'S-admin';
  year: number;
  status: {
    isBanned: boolean;
    banReason: string;
    banUntil: Date | null;
  };
  otpCode?: string;
  otpExpire?: Date;
  otpVerified: boolean;
  createdAt: string;
  updatedAt: Date;
  __v: number;
}
