export interface LoginDto {
  identifier: string;
  password: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  phone: string | null;
  role: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface AdminRegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userName: string;
  phone: string;
}

// Type is a duplicate of User but can be used to define a different structure if needed in the future.
export interface AdminRegisterResponse {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  phone: string | null;
  role: string;
}

export interface Overview {
  totalProperties: number;
  totalWeekProperties: number;
  totalMonthProperties: number;
  totalPropertyManager: number;
  totalPropertyWithoutManager: number;
  totalUsers: number;
  totalWeekUsers: number;
  totalMonthUsers: number;
  totalRevenue: number;
  totalWeekRevenue: number;
  totalMonthRevenue: number;
  totalTurnover: number;
  totalWeekTurnover: number;
  totalMonthTurnover: number;
  totalTransactions: number;
  totalMonthTransactions: number;
  totalWeekTransactions: number;
  totalTransactionsToday: number;
  averageTransaction: number;
  percentage: {
    turnoverThisWeek: number;
    revenueThisWeek: number;
    avgTransactionThisWeek: number;
  };
  dailyData: {
    revenues: number[];
    turnovers: number[];
  };
}

export interface SendUpdateEmailDto {
  updates: string[];
}

export type SendEmailToAllUserDto = SendUpdateEmailDto;
