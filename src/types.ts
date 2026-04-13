export type Screen = 
  | 'splash' 
  | 'login' 
  | 'faceid' 
  | 'otp' 
  | 'dashboard' 
  | 'transfer' 
  | 'bills' 
  | 'chat' 
  | 'zakat' 
  | 'subscriptions' 
  | 'fx_wallet'
  | 'qr_scan'
  | 'analytics'
  | 'cards'
  | 'profile'
  | 'wallets'
  | 'jars'
  | 'social'
  | 'islamic_hub'
  | 'notifications'
  | 'transactions'
  | 'search'
  | 'voice_banking'
  | 'offers'
  | 'loans';

export interface SavingJar {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: 'travel' | 'gadget' | 'emergency' | 'other';
  color: string;
}

export interface SplitRequest {
  id: string;
  transactionId: string;
  amount: number;
  from: string;
  status: 'pending' | 'settled';
  timestamp: Date;
}

export interface NGO {
  id: string;
  name: string;
  logo: string;
  description: string;
  category: string;
}

export interface InvestmentFund {
  id: string;
  name: string;
  returnRate: string;
  risk: 'Low' | 'Medium' | 'High';
  minInvestment: number;
}

export interface GroupWallet {
  id: string;
  name: string;
  members: { name: string; accountNumber: string }[];
  balance: number;
  goal?: number;
  color: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'transaction' | 'split' | 'system' | 'security';
  timestamp: Date;
  isRead: boolean;
}

export interface DigitalWallet {
  id: string;
  name: string;
  logo: string;
  balance: number;
  accountNumber: string;
  color: string;
  isLinked: boolean;
}

export interface Transaction {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  type: 'debit' | 'credit';
  icon: string;
}

export interface Subscription {
  id: string;
  name: string;
  price: number;
  icon: string;
  usage?: 'Rarely Used' | 'Sometimes' | 'Often';
  category?: string;
  renewalDate: string;
  websiteUrl: string;
  status: 'active' | 'cancelled' | 'paused';
}

export interface CardData {
  id: string;
  type: string;
  number: string;
  balance: number;
  expiry: string;
  color: string;
  isFrozen?: boolean;
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export interface Loan {
  id: string;
  type: 'Personal' | 'Car' | 'Home' | 'Education';
  amount: number;
  duration: number; // months
  interestRate: number; // annual percentage
  monthlyEMI: number;
  totalPayable: number;
  status: 'Approved' | 'Under Review' | 'Paid';
  remainingBalance: number;
  startDate: string;
  nextDueDate: string;
  income: number;
  purpose?: string;
}
