import React, { useState, useEffect, useRef, Component } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Wallet, 
  Send, 
  Plus, 
  QrCode, 
  Receipt, 
  Repeat, 
  Globe, 
  Bot, 
  Moon, 
  Home, 
  BarChart3, 
  CreditCard, 
  User as UserIcon, 
  Users,
  Fingerprint, 
  ScanFace, 
  ArrowRight, 
  Bell, 
  Search, 
  ChevronRight, 
  X, 
  MessageSquare, 
  Trash2, 
  Calculator,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  AlertCircle,
  Camera,
  Lock,
  Unlock,
  Settings,
  Eye,
  EyeOff,
  Shield,
  ShieldCheck,
  HelpCircle,
  LogOut,
  Mic,
  RefreshCw,
  MapPin,
  Navigation,
  Tag,
  Map as MapIcon,
  Store,
  TrendingUp,
  Download,
  Tv,
  Music,
  ShoppingBag,
  FileText,
  Cloud,
  Youtube,
  ExternalLink,
  Calendar,
  Mail,
  Phone,
  Heart,
  Clock,
  Compass,
  Book
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Screen, Transaction, Subscription, CardData, Message, DigitalWallet, SavingJar, SplitRequest, NGO, InvestmentFund, GroupWallet, Notification, Loan } from './types';

import { GoogleGenAI, Type } from "@google/genai";

// Firebase Imports
import { 
  onAuthStateChanged, 
  User as FirebaseUser,
  signInWithPopup,
  signInWithCustomToken,
  GoogleAuthProvider
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  orderBy, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  Timestamp,
  getDocFromServer,
  limit,
  increment,
  where,
  writeBatch
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from './firebase';

// --- Mock Data ---
const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: '1', title: 'McDonald\'s', category: 'Food & Dining', amount: -850, date: 'Today, 2:30 PM', type: 'debit', icon: 'Utensils' },
  { id: '2', title: 'Salary Deposit', category: 'Income', amount: 125000, date: 'Yesterday, 9:00 AM', type: 'credit', icon: 'Briefcase' },
  { id: '3', title: 'Netflix Subscription', category: 'Entertainment', amount: -1500, date: '2 days ago', type: 'debit', icon: 'Tv' },
  { id: '4', title: 'Uber Ride', category: 'Transport', amount: -450, date: '3 days ago', type: 'debit', icon: 'Car' },
  { id: '5', title: 'JazzCash Transfer', category: 'Transfer', amount: -2500, date: '4 days ago', type: 'debit', icon: 'Send' },
];

const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  { id: '1', name: 'Netflix Premium', price: 1500, icon: 'Tv', usage: 'Often', category: 'Entertainment', renewalDate: '2026-05-12', websiteUrl: 'https://netflix.com', status: 'active' },
  { id: '2', name: 'Spotify Family', price: 800, icon: 'Music', usage: 'Sometimes', category: 'Music', renewalDate: '2026-05-01', websiteUrl: 'https://spotify.com', status: 'active' },
  { id: '3', name: 'Amazon Prime', price: 1200, icon: 'ShoppingBag', usage: 'Rarely Used', category: 'Shopping', renewalDate: '2026-04-28', websiteUrl: 'https://amazon.com', status: 'active' },
  { id: '4', name: 'Microsoft 365', price: 1100, icon: 'FileText', usage: 'Often', category: 'Productivity', renewalDate: '2026-05-15', websiteUrl: 'https://microsoft.com', status: 'active' },
  { id: '5', name: 'iCloud+', price: 200, icon: 'Cloud', usage: 'Often', category: 'Cloud', renewalDate: '2026-05-20', websiteUrl: 'https://icloud.com', status: 'active' },
  { id: '6', name: 'YouTube Premium', price: 900, icon: 'Youtube', usage: 'Sometimes', category: 'Entertainment', renewalDate: '2026-05-05', websiteUrl: 'https://youtube.com', status: 'active' },
];

const INITIAL_CARDS: CardData[] = [
  { id: '1', type: 'DEBIT CARD', number: '**** **** **** 4821', balance: 125000, expiry: '09/27', color: 'bg-forest-green' },
  { id: '2', type: 'CREDIT CARD', number: '**** **** **** 9012', balance: 53500, expiry: '12/26', color: 'bg-orange-600' },
  { id: '3', type: 'VIRTUAL CARD', number: '**** **** **** 3344', balance: 9000, expiry: '05/28', color: 'bg-indigo-600' },
  { id: '4', type: 'DEBIT CARD', number: '**** **** **** 1122', balance: 75000, expiry: '11/29', color: 'bg-emerald-600' },
  { id: '5', type: 'CREDIT CARD', number: '**** **** **** 5566', balance: 25000, expiry: '01/27', color: 'bg-purple-600' },
  { id: '6', type: 'VIRTUAL CARD', number: '**** **** **** 7788', balance: 15000, expiry: '03/30', color: 'bg-rose-600' },
  { id: '7', type: 'VIRTUAL CARD', number: '**** **** **** 9900', balance: 5000, expiry: '06/28', color: 'bg-[#FF0000]' },
];

const CURRENCIES = [
  { code: 'PKR', name: 'Pakistani Rupee', flag: '🇵🇰', rate: 1, color: 'from-emerald-600 to-emerald-900' },
  { code: 'USD', name: 'US Dollar', flag: '🇺🇸', rate: 278.5, rateChange: '+0.2%', color: 'from-blue-600 to-blue-900' },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺', rate: 302.1, rateChange: '-0.1%', color: 'from-indigo-600 to-indigo-900' },
  { code: 'GBP', name: 'British Pound', flag: '🇬🇧', rate: 352.4, rateChange: '+0.5%', color: 'from-purple-600 to-purple-900' },
  { code: 'SAR', name: 'Saudi Riyal', flag: '🇸🇦', rate: 74.2, rateChange: '0.0%', color: 'from-green-600 to-green-900' },
  { code: 'AED', name: 'UAE Dirham', flag: '🇦🇪', rate: 75.8, rateChange: '+0.1%', color: 'from-cyan-600 to-cyan-900' },
];

const INITIAL_WALLETS: DigitalWallet[] = [
  { id: '1', name: 'JazzCash', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/0e/JazzCash_logo.png/220px-JazzCash_logo.png', balance: 12450, accountNumber: '0300****821', color: 'bg-[#FF0000]', isLinked: true },
  { id: '2', name: 'Stripe', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/512px-Stripe_Logo%2C_revised_2016.svg.png', balance: 0, accountNumber: 'stripe_account', color: 'bg-[#635BFF]', isLinked: false },
];

const INITIAL_JARS: SavingJar[] = [
  { id: '1', name: 'New iPhone 15 Pro', targetAmount: 450000, currentAmount: 120000, deadline: '2026-12-25', category: 'gadget', color: 'bg-indigo-600' },
  { id: '2', name: 'Hajj Trip 2027', targetAmount: 1500000, currentAmount: 450000, deadline: '2027-06-15', category: 'travel', color: 'bg-emerald-600' },
  { id: '3', name: 'Emergency Fund', targetAmount: 500000, currentAmount: 250000, deadline: '2026-06-01', category: 'emergency', color: 'bg-orange-600' },
];

const INITIAL_SPLITS: SplitRequest[] = [
  { id: '1', transactionId: '1', amount: 1250, from: 'Ahmed Khan', status: 'pending', timestamp: new Date() },
  { id: '2', transactionId: '2', amount: 3400, from: 'Sara Ali', status: 'settled', timestamp: new Date(Date.now() - 86400000) },
];

const NGOS: NGO[] = [
  { id: '1', name: 'Edhi Foundation', logo: 'https://edhi.org/wp-content/uploads/2021/04/edhi-logo.png', description: 'World\'s largest volunteer ambulance network.', category: 'Social Welfare' },
  { id: '2', name: 'Saylani Welfare', logo: 'https://www.saylaniwelfare.com/static/media/logo_saylaniwelfare.22bf2351.png', description: 'Food, health, and education for all.', category: 'Food & Health' },
  { id: '3', name: 'Indus Hospital', logo: 'https://indushospital.org.pk/wp-content/uploads/2020/07/TIH-Logo.png', description: 'Free quality healthcare for the underserved.', category: 'Healthcare' },
];

const INVESTMENT_FUNDS: InvestmentFund[] = [
  { id: '1', name: 'Zenith Shariah Growth Fund', returnRate: '18.5%', risk: 'High', minInvestment: 5000 },
  { id: '2', name: 'Zenith Islamic Income Fund', returnRate: '12.2%', risk: 'Low', minInvestment: 1000 },
  { id: '3', name: 'Zenith Halal Equity Fund', returnRate: '22.4%', risk: 'Medium', minInvestment: 10000 },
];

const INITIAL_GROUP_WALLETS: GroupWallet[] = [
  { id: '1', name: 'Roommates Rent', members: [{ name: 'Ahmed', accountNumber: '0312****456' }, { name: 'Sara', accountNumber: '0345****789' }, { name: 'You', accountNumber: '0321****123' }], balance: 45000, goal: 60000, color: 'bg-indigo-600' },
  { id: '2', name: 'Trip to Murree', members: [{ name: 'Zain', accountNumber: '0333****111' }, { name: 'Dania', accountNumber: '0300****222' }, { name: 'Bilal', accountNumber: '0311****333' }, { name: 'You', accountNumber: '0321****123' }], balance: 12000, goal: 25000, color: 'bg-emerald-600' },
];

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: '1', title: 'Split Request', message: 'Ahmed Khan requested Rs. 1,250 for "Dinner at Monal".', type: 'split', timestamp: new Date(), isRead: false },
  { id: '2', title: 'Salary Credited', message: 'Your salary of Rs. 150,000 has been credited to your account.', type: 'transaction', timestamp: new Date(Date.now() - 3600000), isRead: true },
  { id: '3', title: 'Security Alert', message: 'New login detected from a Chrome browser in Lahore.', type: 'security', timestamp: new Date(Date.now() - 86400000), isRead: true },
  { id: '4', title: 'Goal Reached!', message: 'Congratulations! You reached 50% of your "iPhone 15" goal.', type: 'system', timestamp: new Date(Date.now() - 172800000), isRead: true },
];

const MERCHANT_OFFERS = [
  { id: '1', name: 'Monal Restaurant', discount: '15% OFF', category: 'Dining', distance: '0.8 km', location: 'Pir Sohawa, Islamabad', color: 'bg-orange-500' },
  { id: '2', name: 'Khaadi', discount: '10% Cashback', category: 'Shopping', distance: '1.2 km', location: 'Centaurus Mall', color: 'bg-emerald-500' },
  { id: '3', name: 'Savour Foods', discount: 'Free Drink', category: 'Dining', distance: '2.5 km', location: 'Blue Area', color: 'bg-red-500' },
  { id: '4', name: 'Outfitters', discount: 'Buy 1 Get 1', category: 'Shopping', distance: '3.1 km', location: 'F-7 Markaz', color: 'bg-indigo-500' },
  { id: '5', name: 'Gloria Jean\'s', discount: '20% OFF', category: 'Cafe', distance: '0.5 km', location: 'Kohsar Market', color: 'bg-amber-700' },
];

// --- Error Boundary ---
class ErrorBoundary extends (Component as any) {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      let message = "Something went wrong.";
      try {
        const errInfo = JSON.parse(this.state.error.message);
        message = `Error: ${errInfo.error} during ${errInfo.operationType} on ${errInfo.path}`;
      } catch (e) {
        message = this.state.error?.message || message;
      }

      return (
        <div className="min-h-screen bg-deep-green flex flex-col items-center justify-center p-8 text-center">
          <AlertCircle size={64} className="text-red-500 mb-6" />
          <h1 className="text-2xl font-bold text-soft-mint mb-4">Application Error</h1>
          <p className="text-soft-mint/60 mb-8 max-w-md">{message}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-forest-green text-soft-mint px-8 py-4 rounded-2xl font-bold"
          >
            Reload Application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- Components ---

const ReceiptModal = ({ tx, onClose, onDownload }: { tx: Transaction, onClose: () => void, onDownload: () => void }) => (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 z-[100]">
    <motion.div 
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      className="bg-white w-full max-w-sm rounded-[40px] overflow-hidden shadow-2xl text-black"
    >
      <div className="bg-forest-green p-8 text-center text-white relative">
        <div className="absolute top-4 right-4">
          <button onClick={onClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-white/20">
          <CheckCircle2 size={48} />
        </div>
        <h3 className="text-2xl font-bold">Payment Success</h3>
        <p className="text-white/60 text-sm mt-1">Transaction ID: #ZNT-{(tx.id || 'DEMO').slice(0, 8).toUpperCase()}</p>
      </div>

      <div className="p-8 space-y-6">
        <div className="text-center">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Amount Paid</p>
          <h2 className="text-4xl font-bold mt-1">Rs. {Math.abs(tx.amount).toLocaleString()}</h2>
        </div>

        <div className="space-y-4 border-t border-b border-gray-100 py-6">
          <div className="flex justify-between">
            <span className="text-gray-400 text-sm">Recipient</span>
            <span className="font-bold text-sm">{tx.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400 text-sm">Category</span>
            <span className="font-bold text-sm">{tx.category}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400 text-sm">Date & Time</span>
            <span className="font-bold text-sm">{tx.date}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400 text-sm">Payment Method</span>
            <span className="font-bold text-sm">Zenith Card •••• 4821</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={() => {
              onDownload();
              onClose();
            }}
            className="w-full bg-forest-green text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
          >
            <Download size={20} />
            Download Receipt
          </button>
          <button 
            onClick={onClose}
            className="w-full bg-gray-50 text-gray-400 py-4 rounded-2xl font-bold text-sm"
          >
            Close
          </button>
        </div>
      </div>
      
      {/* Decorative Cutouts */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-black/80 rounded-r-full" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-black/80 rounded-l-full" />
    </motion.div>
  </div>
);

const SubscriptionDetailModal = ({ sub, onClose, onViewReceipt }: { sub: Subscription, onClose: () => void, onViewReceipt: () => void }) => {
  const iconMap: Record<string, any> = {
    Tv, Music, ShoppingBag, FileText, Cloud, Youtube, Globe
  };
  const Icon = iconMap[sub.icon] || Globe;
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-deep-green/90 backdrop-blur-xl"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-forest-green rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl relative"
      >
        <div className="p-8">
          <div className="flex justify-between items-start mb-8">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
              <Icon size={32} className="text-light-green" />
            </div>
            <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
              sub.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'
            }`}>
              {sub.status}
            </div>
          </div>

          <h2 className="text-2xl font-bold text-soft-mint mb-1">{sub.name}</h2>
          <p className="text-white/40 text-sm mb-8">{sub.category} Subscription</p>

          <div className="space-y-6 mb-8">
            <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
              <div>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Monthly Price</p>
                <p className="text-lg font-bold text-soft-mint">Rs. {sub.price.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Next Renewal</p>
                <p className="text-sm font-bold text-light-green">{sub.renewalDate}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Usage</p>
                <p className="text-sm font-bold text-soft-mint">{sub.usage}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Auto-Pay</p>
                <p className="text-sm font-bold text-emerald-400">Enabled</p>
              </div>
            </div>

            <a 
              href={sub.websiteUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Globe size={20} className="text-white/40 group-hover:text-light-green transition-colors" />
                <span className="text-sm font-bold text-soft-mint">Visit Website</span>
              </div>
              <ChevronRight size={16} className="text-white/20" />
            </a>
          </div>

          <div className="space-y-3">
            <button 
              onClick={onViewReceipt}
              className="w-full bg-white/10 text-soft-mint font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <Receipt size={20} /> View Last Receipt
            </button>
            <button 
              onClick={onClose}
              className="w-full bg-white/5 text-soft-mint/60 font-bold py-4 rounded-2xl active:scale-95 transition-transform"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const BackgroundShapes = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    <motion.div 
      animate={{ 
        scale: [1, 1.2, 1],
        rotate: [0, 90, 0],
        x: [0, 50, 0],
        y: [0, 30, 0]
      }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      className="absolute -top-20 -left-20 w-96 h-96 bg-forest-green/20 rounded-full blur-3xl"
    />
    <motion.div 
      animate={{ 
        scale: [1, 1.5, 1],
        rotate: [0, -45, 0],
        x: [0, -30, 0],
        y: [0, 50, 0]
      }}
      transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      className="absolute top-1/2 -right-20 w-80 h-80 bg-vibrant-green/10 rounded-[80px] blur-3xl"
    />
    <motion.div 
      animate={{ 
        opacity: [0.1, 0.4, 0.1],
        y: [0, -100, 0]
      }}
      transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      className="absolute bottom-0 left-1/4 w-1 h-64 bg-gradient-to-t from-transparent via-light-green/30 to-transparent"
    />
    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.05]" />
  </div>
);

const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => (
  <motion.div 
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 50 }}
    className={`fixed bottom-24 left-4 right-4 p-4 rounded-2xl flex items-center gap-3 z-50 shadow-2xl ${type === 'success' ? 'bg-forest-green text-soft-mint' : 'bg-red-900 text-white'}`}
  >
    {type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
    <span className="flex-1 font-medium">{message}</span>
    <button onClick={onClose}><X size={18} /></button>
  </motion.div>
);

const Dialog = ({ title, children, onClose }: { title: string, children: React.ReactNode, onClose: () => void }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-[60]">
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-deep-green w-full max-w-sm rounded-[32px] p-6 border border-white/10 shadow-2xl"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-soft-mint">{title}</h3>
        <button onClick={onClose} className="p-2 bg-white/5 rounded-full"><X size={20} /></button>
      </div>
      {children}
    </motion.div>
  </div>
);

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [screen, setScreen] = useState<Screen>('splash');
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [dialog, setDialog] = useState<{ title: string, content: React.ReactNode } | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [cards, setCards] = useState<CardData[]>([]);
  const [wallets, setWallets] = useState<DigitalWallet[]>([]);
  const [jars, setJars] = useState<SavingJar[]>([]);
  const [splits, setSplits] = useState<SplitRequest[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [groupWallets, setGroupWallets] = useState<GroupWallet[]>([]);
  const [offers, setOffers] = useState(MERCHANT_OFFERS);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'analytics' | 'ai' | 'cards' | 'profile'>('home');
  const [screenHistory, setScreenHistory] = useState<Screen[]>([]);
  const [selectedTxForReceipt, setSelectedTxForReceipt] = useState<Transaction | null>(null);
  const [selectedSubForDetail, setSelectedSubForDetail] = useState<Subscription | null>(null);

  const navigateTo = (nextScreen: Screen) => {
    setScreenHistory(prev => [...prev, screen]);
    setScreen(nextScreen);
  };

  const goBack = () => {
    if (screenHistory.length > 0) {
      const prevScreen = screenHistory[screenHistory.length - 1];
      setScreenHistory(prev => prev.slice(0, -1));
      setScreen(prevScreen);
    } else {
      setScreen('dashboard');
    }
  };

  // New Auth State
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'otp'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupCnic, setSignupCnic] = useState('');
  const [signupDob, setSignupDob] = useState('');
  const [signupGender, setSignupGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [signupTerms, setSignupTerms] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [inputAmount, setInputAmount] = useState('');

  // --- Effects ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAuthReady(true);
      if (user) {
        // Initialize user document if it doesn't exist
        const userRef = doc(db, 'users', user.uid);
        
        // Real-time profile sync
        const unsubProfile = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserProfile(docSnap.data());
          } else {
            // Initialize if missing
            setDoc(userRef, {
              uid: user.uid,
              displayName: user.displayName,
              email: user.email,
              photoURL: user.photoURL,
              role: 'user',
              createdAt: Timestamp.now()
            }).catch(e => handleFirestoreError(e, OperationType.CREATE, 'users'));
          }
        }, (err) => handleFirestoreError(err, OperationType.GET, `users/${user.uid}`));

        // Real-time loans sync
        const unsubLoans = onSnapshot(collection(db, `users/${user.uid}/loans`), (snapshot) => {
          const loansData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Loan));
          setLoans(loansData);
        }, (err) => handleFirestoreError(err, OperationType.GET, `users/${user.uid}/loans`));

        return () => {
          unsubProfile();
          unsubLoans();
        };
      } else {
        setUserProfile(null);
        setLoans([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Test Connection
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        // Silently handle connection errors in demo mode
        console.warn("Firebase connection test failed, but continuing in demo mode.");
      }
    }
    testConnection();
  }, []);

  // Data Fetching & Sync
  useEffect(() => {
    // In demo mode, we use initial data if user is not logged in or data is empty
    const userPath = user ? `users/${user.uid}` : 'demo';

    if (!user) {
      setTransactions(INITIAL_TRANSACTIONS);
      setCards(INITIAL_CARDS);
      setWallets(INITIAL_WALLETS);
      setJars(INITIAL_JARS);
      setGroupWallets(INITIAL_GROUP_WALLETS);
      setNotifications(INITIAL_NOTIFICATIONS);
      setSubscriptions(INITIAL_SUBSCRIPTIONS);
      setMessages([
        { id: '1', text: "Assalamualaikm! I'm your Zenith Bank AI Assistant. How can I help you today?", sender: 'ai', timestamp: new Date() }
      ]);
      return;
    }

    // Sync Initial Data if empty
    const syncInitialData = async () => {
      try {
        const txSnap = await getDocs(collection(db, userPath, 'transactions'));
        const existingTxTitles = txSnap.docs.map(d => d.data().title);
        for (const tx of INITIAL_TRANSACTIONS) {
          if (!existingTxTitles.includes(tx.title)) {
            await addDoc(collection(db, userPath, 'transactions'), { ...tx, timestamp: Timestamp.now() });
          }
        }

        const cardSnap = await getDocs(collection(db, userPath, 'cards'));
        const existingCardNumbers = cardSnap.docs.map(d => d.data().number);
        for (const card of INITIAL_CARDS) {
          if (!existingCardNumbers.includes(card.number)) {
            await addDoc(collection(db, userPath, 'cards'), card);
          }
        }

        const walletSnap = await getDocs(collection(db, userPath, 'wallets'));
        const existingWalletNames = walletSnap.docs.map(d => d.data().name);
        for (const wallet of INITIAL_WALLETS) {
          if (!existingWalletNames.includes(wallet.name)) {
            await addDoc(collection(db, userPath, 'wallets'), wallet);
          }
        }
        const jarSnap = await getDocs(collection(db, userPath, 'jars'));
        if (jarSnap.empty) {
          for (const jar of INITIAL_JARS) {
            await addDoc(collection(db, userPath, 'jars'), jar);
          }
        }
        const groupSnap = await getDocs(collection(db, userPath, 'group_wallets'));
        if (groupSnap.empty) {
          for (const group of INITIAL_GROUP_WALLETS) {
            await addDoc(collection(db, userPath, 'group_wallets'), { ...group, createdAt: Timestamp.now() });
          }
        }
        const notifSnap = await getDocs(collection(db, userPath, 'notifications'));
        if (notifSnap.empty) {
          for (const notif of INITIAL_NOTIFICATIONS) {
            await addDoc(collection(db, userPath, 'notifications'), { ...notif, timestamp: Timestamp.now() });
          }
        }
        const subSnap = await getDocs(collection(db, userPath, 'subscriptions'));
        if (subSnap.empty) {
          for (const sub of INITIAL_SUBSCRIPTIONS) {
            await addDoc(collection(db, userPath, 'subscriptions'), sub);
          }
        }
      } catch (e) {
        console.error("Sync Error:", e);
      }
    };

    syncInitialData();

    // User Profile
    const unsubProfile = onSnapshot(doc(db, 'users', user.uid), (snapshot) => {
      if (snapshot.exists()) {
        setUserProfile(snapshot.data());
      }
    }, (e) => handleFirestoreError(e, OperationType.GET, `users/${user.uid}`));

    // Transactions
    const qTransactions = query(collection(db, userPath, 'transactions'), orderBy('timestamp', 'desc'), limit(50));
    const unsubTransactions = onSnapshot(qTransactions, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({ 
        ...doc.data(), 
        id: doc.id,
        date: doc.data().timestamp instanceof Timestamp ? doc.data().timestamp.toDate().toLocaleString() : doc.data().date
      } as Transaction));
      setTransactions(txs.length > 0 ? txs : INITIAL_TRANSACTIONS);
    }, (e) => handleFirestoreError(e, OperationType.LIST, `${userPath}/transactions`));

    // Cards
    const unsubCards = onSnapshot(collection(db, userPath, 'cards'), (snapshot) => {
      const fetchedCards = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as CardData));
      setCards(fetchedCards.length > 0 ? fetchedCards : INITIAL_CARDS);
    }, (e) => handleFirestoreError(e, OperationType.LIST, `${userPath}/cards`));

    // Wallets
    const unsubWallets = onSnapshot(collection(db, userPath, 'wallets'), (snapshot) => {
      const fetchedWallets = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as DigitalWallet));
      setWallets(fetchedWallets.length > 0 ? fetchedWallets : INITIAL_WALLETS);
    }, (e) => handleFirestoreError(e, OperationType.LIST, `${userPath}/wallets`));

    // Jars
    const unsubJars = onSnapshot(collection(db, userPath, 'jars'), (snapshot) => {
      const fetchedJars = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as SavingJar));
      setJars(fetchedJars.length > 0 ? fetchedJars : INITIAL_JARS);
    }, (e) => handleFirestoreError(e, OperationType.LIST, `${userPath}/jars`));

    // Group Wallets
    const unsubGroups = onSnapshot(collection(db, userPath, 'group_wallets'), (snapshot) => {
      const fetchedGroups = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as GroupWallet));
      setGroupWallets(fetchedGroups.length > 0 ? fetchedGroups : INITIAL_GROUP_WALLETS);
    }, (e) => handleFirestoreError(e, OperationType.LIST, `${userPath}/group_wallets`));

    // Notifications
    const qNotifications = query(collection(db, userPath, 'notifications'), orderBy('timestamp', 'desc'));
    const unsubNotifications = onSnapshot(qNotifications, (snapshot) => {
      const fetchedNotifs = snapshot.docs.map(doc => ({ 
        ...doc.data(), 
        id: doc.id,
        timestamp: doc.data().timestamp instanceof Timestamp ? doc.data().timestamp.toDate() : new Date(doc.data().timestamp)
      } as Notification));
      setNotifications(fetchedNotifs.length > 0 ? fetchedNotifs : INITIAL_NOTIFICATIONS);
    }, (e) => handleFirestoreError(e, OperationType.LIST, `${userPath}/notifications`));

    // Subscriptions
    const unsubSubscriptions = onSnapshot(collection(db, userPath, 'subscriptions'), (snapshot) => {
      const fetchedSubs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Subscription));
      setSubscriptions(fetchedSubs.length > 0 ? fetchedSubs : INITIAL_SUBSCRIPTIONS);
    }, (e) => handleFirestoreError(e, OperationType.LIST, `${userPath}/subscriptions`));

    // Splits
    const unsubSplits = onSnapshot(collection(db, userPath, 'splits'), (snapshot) => {
      const fetchedSplits = snapshot.docs.map(doc => ({ 
        ...doc.data(), 
        id: doc.id,
        timestamp: doc.data().timestamp instanceof Timestamp ? doc.data().timestamp.toDate() : new Date(doc.data().timestamp)
      } as SplitRequest));
      setSplits(fetchedSplits);
    }, (e) => handleFirestoreError(e, OperationType.LIST, `${userPath}/splits`));

    // Investments
    const unsubInvestments = onSnapshot(collection(db, userPath, 'investments'), (snapshot) => {
      const fetchedInvestments = snapshot.docs.map(doc => ({ 
        ...doc.data(), 
        id: doc.id,
        investedAt: doc.data().investedAt instanceof Timestamp ? doc.data().investedAt.toDate() : new Date(doc.data().investedAt)
      }));
      setInvestments(fetchedInvestments);
    }, (e) => handleFirestoreError(e, OperationType.LIST, `${userPath}/investments`));

    // Donations
    const unsubDonations = onSnapshot(collection(db, userPath, 'donations'), (snapshot) => {
      const fetchedDonations = snapshot.docs.map(doc => ({ 
        ...doc.data(), 
        id: doc.id,
        donatedAt: doc.data().donatedAt instanceof Timestamp ? doc.data().donatedAt.toDate() : new Date(doc.data().donatedAt)
      }));
      setDonations(fetchedDonations);
    }, (e) => handleFirestoreError(e, OperationType.LIST, `${userPath}/donations`));

    // Messages
    const qMessages = query(collection(db, userPath, 'messages'), orderBy('timestamp', 'asc'));
    const unsubMessages = onSnapshot(qMessages, (snapshot) => {
      const fetchedMsgs = snapshot.docs.map(doc => ({ 
        ...doc.data(), 
        id: doc.id,
        timestamp: doc.data().timestamp instanceof Timestamp ? doc.data().timestamp.toDate() : new Date(doc.data().timestamp)
      } as Message));
      setMessages(fetchedMsgs.length > 0 ? fetchedMsgs : [
        { id: '1', text: `Assalamualaikm ${user.displayName || 'Manan'}! I'm your Zenith Bank AI Assistant. How can I help you today?`, sender: 'ai', timestamp: new Date() }
      ]);
    }, (e) => handleFirestoreError(e, OperationType.LIST, `${userPath}/messages`));

    return () => {
      unsubTransactions();
      unsubCards();
      unsubWallets();
      unsubJars();
      unsubGroups();
      unsubNotifications();
      unsubSubscriptions();
      unsubSplits();
      unsubInvestments();
      unsubDonations();
      unsubMessages();
      unsubProfile();
    };
  }, [user, isAuthReady]);

  useEffect(() => {
    if (screen === 'splash') {
      const timer = setTimeout(() => {
        if (user) setScreen('dashboard');
        else setScreen('login');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [screen, user]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    if (screen === 'dashboard') setActiveTab('home');
    else if (screen === 'analytics') setActiveTab('analytics');
    else if (screen === 'chat') setActiveTab('ai');
    else if (screen === 'cards') setActiveTab('cards');
    else if (screen === 'profile') setActiveTab('profile');
  }, [screen]);

  // --- Handlers ---
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      showToast('Please enter email and password', 'error');
      return;
    }
    try {
      // For demo: try real login, if fails or user not found, force login
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await response.json();
      
      if (response.ok && data.customToken) {
        await signInWithCustomToken(auth, data.customToken);
        setScreen('dashboard');
        showToast('Welcome back to Zenith!', 'success');
      } else {
        // Force demo login for ANY email/password if API fails
        setScreen('dashboard');
        showToast('Demo Mode: Logged in with ' + loginEmail, 'success');
      }
    } catch (error) {
      // Fallback for network errors
      setScreen('dashboard');
      showToast('Demo Mode: Logged in (Offline)', 'success');
    }
  };

  const formatCNIC = (value: string) => {
    const digits = value.replace(/\D/g, '');
    let formatted = '';
    if (digits.length > 0) {
      formatted += digits.substring(0, 5);
      if (digits.length > 5) {
        formatted += '-' + digits.substring(5, 12);
        if (digits.length > 12) {
          formatted += '-' + digits.substring(12, 13);
        }
      }
    }
    return formatted;
  };

  const handleSignupInitiate = async () => {
    if (!signupName || !signupPhone || !loginEmail || !loginPassword || !signupCnic || !signupDob) {
      showToast('Please fill all fields', 'error');
      return;
    }
    if (!signupTerms) {
      showToast('Please accept the Terms & Conditions', 'error');
      return;
    }
    // Simple CNIC format validation (XXXXX-XXXXXXX-X)
    const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
    if (!cnicRegex.test(signupCnic)) {
      showToast('Invalid CNIC format (XXXXX-XXXXXXX-X)', 'error');
      return;
    }
    try {
      const response = await fetch('/api/otp/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: signupPhone, email: loginEmail }),
      });
      const data = await response.json();
      if (response.ok) {
        setGeneratedOtp(data.otp);
        setAuthMode('otp');
        showToast(`OTP sent: ${data.otp}`, 'success');
      } else {
        showToast(data.error || 'Failed to send OTP', 'error');
      }
    } catch (error) {
      showToast('Signup failed', 'error');
    }
  };

  const handleVerifyOtp = async () => {
    // For demo purposes, allow any 6-digit code or the generated one
    if (otpValue.length === 6) {
      try {
        const response = await fetch('/api/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: signupName,
            cnic: signupCnic,
            dob: signupDob,
            gender: signupGender,
            phoneNumber: signupPhone,
            email: loginEmail,
            password: loginPassword
          }),
        });
        const data = await response.json();
        if (response.ok) {
          // Authenticate with Firebase using custom token
          if (data.customToken) {
            await signInWithCustomToken(auth, data.customToken);
          }
          setScreen('dashboard');
          showToast('Account created successfully!', 'success');
          // Clear states
          setSignupName('');
          setSignupPhone('');
          setSignupCnic('');
          setSignupDob('');
          setSignupGender('Male');
          setSignupTerms(false);
          setLoginEmail('');
          setLoginPassword('');
          setOtpValue('');
        } else {
          showToast(data.error || 'Signup failed', 'error');
        }
      } catch (error) {
        showToast('Signup failed', 'error');
      }
    } else {
      showToast('Invalid OTP', 'error');
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setScreen('login');
      showToast('Logged out successfully');
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'auth');
    }
  };

  const handleFaceID = () => {
    setScreen('faceid');
  };

  const handleOTPSuccess = () => {
    setScreen('dashboard');
    showToast('Welcome back, Manan Ahmad!');
  };

  const handleSendMoney = async (amount: number, recipient: string) => {
    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      title: `To ${recipient}`,
      category: 'Transfer',
      amount: -amount,
      date: 'Just Now',
      type: 'debit',
      icon: 'Send'
    };

    if (!user) {
      // Demo Mode
      setTransactions(prev => [newTx, ...prev]);
      if (cards.length > 0) {
        setCards(prev => prev.map((c, i) => i === 0 ? { ...c, balance: c.balance - amount } : c));
      }
      setSelectedTxForReceipt(newTx);
      setDialog(null);
      showToast(`Successfully sent Rs. ${amount} to ${recipient}`);
      return;
    }

    const userPath = `users/${user.uid}`;
    try {
      const txData = {
        ...newTx,
        date: Timestamp.now()
      };
      await addDoc(collection(db, userPath, 'transactions'), txData);
      
      if (cards.length > 0) {
        const mainCard = cards[0];
        await updateDoc(doc(db, userPath, 'cards', mainCard.id), {
          balance: mainCard.balance - amount
        });
      }

      setSelectedTxForReceipt(newTx);
      setDialog(null);
      showToast(`Successfully sent Rs. ${amount} to ${recipient}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${userPath}/transactions`);
    }
  };

  const handleAddMoney = async (amount: number) => {
    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'Top-up',
      category: 'Deposit',
      amount: amount,
      date: 'Just Now',
      type: 'credit',
      icon: 'Plus'
    };

    if (!user) {
      setTransactions(prev => [newTx, ...prev]);
      if (cards.length > 0) {
        setCards(prev => prev.map((c, i) => i === 0 ? { ...c, balance: c.balance + amount } : c));
      }
      setDialog(null);
      showToast(`Successfully added Rs. ${amount} to your account`);
      return;
    }

    const userPath = `users/${user.uid}`;
    try {
      const txData = {
        ...newTx,
        date: Timestamp.now()
      };
      await addDoc(collection(db, userPath, 'transactions'), txData);
      
      if (cards.length > 0) {
        const mainCard = cards[0];
        await updateDoc(doc(db, userPath, 'cards', mainCard.id), {
          balance: mainCard.balance + amount
        });
      }

      setDialog(null);
      showToast(`Successfully added Rs. ${amount} to your account`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${userPath}/transactions`);
    }
  };

  const handleWithdrawMoney = async (amount: number) => {
    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'Withdrawal',
      category: 'Withdraw',
      amount: -amount,
      date: 'Just Now',
      type: 'debit',
      icon: 'ArrowRight'
    };

    if (!user) {
      setTransactions(prev => [newTx, ...prev]);
      if (cards.length > 0) {
        setCards(prev => prev.map((c, i) => i === 0 ? { ...c, balance: c.balance - amount } : c));
      }
      setDialog(null);
      showToast(`Successfully withdrawn Rs. ${amount} from your account`);
      return;
    }

    const userPath = `users/${user.uid}`;
    try {
      const txData = {
        ...newTx,
        date: Timestamp.now()
      };
      await addDoc(collection(db, userPath, 'transactions'), txData);
      
      if (cards.length > 0) {
        const mainCard = cards[0];
        await updateDoc(doc(db, userPath, 'cards', mainCard.id), {
          balance: mainCard.balance - amount
        });
      }

      setDialog(null);
      showToast(`Successfully withdrawn Rs. ${amount} from your account`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${userPath}/transactions`);
    }
  };

  const handlePayBill = async (type: string, amount: number) => {
    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      title: `${type} Bill`,
      category: 'Bills',
      amount: -amount,
      date: 'Just Now',
      type: 'debit',
      icon: 'Receipt'
    };

    if (!user) {
      // Demo Mode
      setTransactions(prev => [newTx, ...prev]);
      if (cards.length > 0) {
        setCards(prev => prev.map((c, i) => i === 0 ? { ...c, balance: c.balance - amount } : c));
      }
      setSelectedTxForReceipt(newTx);
      setDialog(null);
      showToast(`${type} bill of Rs. ${amount} paid successfully`);
      return;
    }

    const userPath = `users/${user.uid}`;
    try {
      const txData = {
        ...newTx,
        date: Timestamp.now()
      };
      await addDoc(collection(db, userPath, 'transactions'), txData);

      if (cards.length > 0) {
        const mainCard = cards[0];
        await updateDoc(doc(db, userPath, 'cards', mainCard.id), {
          balance: mainCard.balance - amount
        });
      }

      setSelectedTxForReceipt(newTx);
      setDialog(null);
      showToast(`${type} bill of Rs. ${amount} paid successfully`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${userPath}/transactions`);
    }
  };

  const handleCancelSubscription = async (id: string) => {
    const sub = subscriptions.find(s => s.id === id);
    if (!user) {
      setSubscriptions(subscriptions.filter(s => s.id !== id));
      showToast(`Cancelled ${sub?.name} subscription`);
      return;
    }

    const userPath = `users/${user.uid}`;
    try {
      await deleteDoc(doc(db, userPath, 'subscriptions', id));
      showToast(`Cancelled ${sub?.name} subscription`);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${userPath}/subscriptions/${id}`);
    }
  };

  const handleAddCard = async (type?: string, color?: string) => {
    if (!user) return;
    const userPath = `users/${user.uid}`;

    const cardTypes = ['VIRTUAL CARD', 'DEBIT CARD', 'CREDIT CARD'];
    const cardColors = ['bg-forest-green', 'bg-orange-600', 'bg-indigo-600', 'bg-emerald-600', 'bg-purple-600'];
    const randomType = type || cardTypes[Math.floor(Math.random() * cardTypes.length)];
    const randomColor = color || cardColors[Math.floor(Math.random() * cardColors.length)];
    
    try {
      const newCard = {
        uid: user.uid,
        type: randomType,
        number: `**** **** **** ${Math.floor(1000 + Math.random() * 9000)}`,
        balance: Math.floor(Math.random() * 50000),
        expiry: '12/28',
        color: randomColor,
        isFrozen: false
      };
      await addDoc(collection(db, userPath, 'cards'), newCard);
      showToast(`New ${randomType.toLowerCase()} added successfully`);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `${userPath}/cards`);
    }
  };

  const handleRemoveCard = async (id: string) => {
    if (!user) {
      setCards(prev => prev.filter(c => c.id !== id));
      showToast(`Card removed successfully (Demo Mode)`);
      return;
    }
    const userPath = `users/${user.uid}`;
    try {
      await deleteDoc(doc(db, userPath, 'cards', id));
      showToast(`Card removed successfully`);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${userPath}/cards/${id}`);
    }
  };

  const handleFreezeCard = async (id: string) => {
    if (!user) {
      setCards(prev => {
        const newCards = prev.map(c => c.id === id ? { ...c, isFrozen: !c.isFrozen } : c);
        const card = newCards.find(c => c.id === id);
        if (card) {
          showToast(`Card ${card.number.slice(-4)} ${card.isFrozen ? 'frozen' : 'unfrozen'} successfully (Demo Mode)`);
        }
        return newCards;
      });
      return;
    }
    const userPath = `users/${user.uid}`;
    const card = cards.find(c => c.id === id);
    if (!card) return;

    try {
      await updateDoc(doc(db, userPath, 'cards', id), {
        isFrozen: !card.isFrozen
      });
      showToast(`Card ${card.number.slice(-4)} ${!card.isFrozen ? 'frozen' : 'unfrozen'} successfully`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${userPath}/cards/${id}`);
    }
  };

  const handleLinkWallet = async (id: string) => {
    if (!user) return;
    const userPath = `users/${user.uid}`;
    try {
      await updateDoc(doc(db, userPath, 'wallets', id), { isLinked: true });
      showToast(`Wallet linked successfully`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${userPath}/wallets/${id}`);
    }
  };

  const handleUnlinkWallet = async (id: string) => {
    if (!user) return;
    const userPath = `users/${user.uid}`;
    try {
      await updateDoc(doc(db, userPath, 'wallets', id), { isLinked: false });
      showToast(`Wallet unlinked`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${userPath}/wallets/${id}`);
    }
  };

  const handleWalletTransfer = async (walletId: string, amount: number, direction: 'to' | 'from') => {
    const wallet = wallets.find(w => w.id === walletId);
    if (!wallet) return;

    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      title: direction === 'to' ? `To ${wallet.name}` : `From ${wallet.name}`,
      category: 'Transfer',
      amount: direction === 'to' ? -amount : amount,
      date: 'Just Now',
      type: direction === 'to' ? 'debit' : 'credit',
      icon: 'Wallet'
    };

    if (!user) {
      // Demo Mode
      setTransactions(prev => [newTx, ...prev]);
      setWallets(prev => prev.map(w => w.id === walletId ? { ...w, balance: direction === 'to' ? w.balance + amount : w.balance - amount } : w));
      if (cards.length > 0) {
        setCards(prev => prev.map((c, i) => i === 0 ? { ...c, balance: direction === 'to' ? c.balance - amount : c.balance + amount } : c));
      }
      setSelectedTxForReceipt(newTx);
      setDialog(null);
      showToast(`Rs. ${amount} ${direction === 'to' ? 'transferred to' : 'pulled from'} ${wallet.name}`);
      return;
    }

    const userPath = `users/${user.uid}`;
    try {
      if (direction === 'to') {
        if (cards.length > 0 && cards[0].balance < amount) return showToast('Insufficient balance', 'error');
        await updateDoc(doc(db, userPath, 'wallets', walletId), { balance: wallet.balance + amount });
        if (cards.length > 0) {
          await updateDoc(doc(db, userPath, 'cards', cards[0].id), { balance: cards[0].balance - amount });
        }
      } else {
        if (amount > wallet.balance) return showToast(`Insufficient ${wallet.name} balance`, 'error');
        await updateDoc(doc(db, userPath, 'wallets', walletId), { balance: wallet.balance - amount });
        if (cards.length > 0) {
          await updateDoc(doc(db, userPath, 'cards', cards[0].id), { balance: cards[0].balance + amount });
        }
      }
      
      const txData = { ...newTx, date: Timestamp.now() };
      await addDoc(collection(db, userPath, 'transactions'), txData);
      
      setSelectedTxForReceipt(newTx);
      setDialog(null);
      showToast(`Rs. ${amount} ${direction === 'to' ? 'transferred to' : 'pulled from'} ${wallet.name}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${userPath}/wallets/${walletId}`);
    }
  };

  const handleAddJar = async (name: string, target: number, deadline: string, category: any) => {
    if (!user) return;
    const userPath = `users/${user.uid}`;
    try {
      const newJar = {
        uid: user.uid,
        name,
        targetAmount: target,
        currentAmount: 0,
        deadline,
        category,
        color: ['bg-indigo-600', 'bg-emerald-600', 'bg-orange-600', 'bg-purple-600'][Math.floor(Math.random() * 4)]
      };
      await addDoc(collection(db, userPath, 'jars'), newJar);
      showToast(`Savings Jar "${name}" created!`);
      setDialog(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `${userPath}/jars`);
    }
  };

  const handleAddToJar = async (id: string, amount: number) => {
    if (!user) return;
    const userPath = `users/${user.uid}`;
    const jar = jars.find(j => j.id === id);
    if (!jar) return;

    try {
      await updateDoc(doc(db, userPath, 'jars', id), {
        currentAmount: jar.currentAmount + amount
      });
      showToast(`Rs. ${amount} added to jar`);
      setDialog(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${userPath}/jars/${id}`);
    }
  };

  const handleSplitBill = async (transactionId: string, amount: number) => {
    if (!user) return;
    const userPath = `users/${user.uid}`;
    try {
      const newNotif = {
        uid: user.uid,
        title: 'Split Request Sent',
        message: `You requested Rs. ${amount / 2} for a transaction.`,
        type: 'split',
        timestamp: Timestamp.now(),
        isRead: false
      };
      await addDoc(collection(db, userPath, 'notifications'), newNotif);
      showToast('Split request sent to friends');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${userPath}/notifications`);
    }
  };

  const handleDonate = async (ngoId: string, amount: number) => {
    const ngo = NGOS.find(n => n.id === ngoId);
    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      title: `Donation: ${ngo?.name}`,
      category: 'Charity',
      amount: -amount,
      date: 'Just Now',
      type: 'debit',
      icon: 'Heart'
    };

    if (!user) {
      setTransactions(prev => [newTx, ...prev]);
      if (cards.length > 0) {
        setCards(prev => prev.map((c, i) => i === 0 ? { ...c, balance: c.balance - amount } : c));
      }
      setSelectedTxForReceipt(newTx);
      setDialog(null);
      showToast(`JazakAllah! Rs. ${amount} donated to ${ngo?.name}`);
      return;
    }

    const userPath = `users/${user.uid}`;
    try {
      const txData = { ...newTx, date: Timestamp.now() };
      await addDoc(collection(db, userPath, 'transactions'), txData);

      if (cards.length > 0) {
        await updateDoc(doc(db, userPath, 'cards', cards[0].id), {
          balance: cards[0].balance - amount
        });
      }

      setSelectedTxForReceipt(newTx);
      setDialog(null);
      showToast(`JazakAllah! Rs. ${amount} donated to ${ngo?.name}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${userPath}/transactions`);
    }
  };

  const handlePayZakat = async (amount: number) => {
    if (amount <= 0) return;
    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'Zakat Payment',
      category: 'Religious',
      amount: -amount,
      date: 'Just Now',
      type: 'debit',
      icon: 'Moon'
    };

    if (!user) {
      setTransactions(prev => [newTx, ...prev]);
      if (cards.length > 0) {
        setCards(prev => prev.map((c, i) => i === 0 ? { ...c, balance: c.balance - amount } : c));
      }
      setSelectedTxForReceipt(newTx);
      setDialog(null);
      showToast(`Rs. ${amount.toLocaleString()} Zakat paid successfully!`);
      return;
    }

    const userPath = `users/${user.uid}`;
    try {
      const mainCard = cards.find(c => c.type === 'Visa Platinum') || cards[0];
      if (mainCard && mainCard.balance >= amount) {
        const txData = { ...newTx, date: Timestamp.now() };
        await addDoc(collection(db, userPath, 'transactions'), txData);
        await updateDoc(doc(db, userPath, 'cards', mainCard.id), {
          balance: mainCard.balance - amount
        });

        setSelectedTxForReceipt(newTx);
        showToast(`Rs. ${amount.toLocaleString()} Zakat paid successfully!`);
        setDialog(null);
      } else {
        showToast('Insufficient balance in main account');
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${userPath}/transactions`);
    }
  };

  const handleExchangeCurrency = async (from: string, to: string, amount: number) => {
    if (!user) return;
    const userPath = `users/${user.uid}`;
    try {
      const rate = 278.5; // Mock rate
      const result = amount * rate;
      showToast(`Exchanged ${amount} ${from} to ${result.toFixed(2)} ${to}`);
      setDialog(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${userPath}/wallets`);
    }
  };

  const handleAddFriend = async (email: string) => {
    if (!user) return;
    const userPath = `users/${user.uid}`;
    try {
      await addDoc(collection(db, userPath, 'friends'), {
        email,
        addedAt: new Date()
      });
      showToast(`Friend request sent to ${email}`);
      setDialog(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `${userPath}/friends`);
    }
  };

  const handleCreateGroupWallet = async (name: string, goal: number, members: { name: string; accountNumber: string }[]) => {
    if (!user) return;
    const userPath = `users/${user.uid}`;
    try {
      await addDoc(collection(db, userPath, 'group_wallets'), {
        name,
        goal,
        members,
        balance: 0,
        createdAt: new Date()
      });
      showToast(`Group wallet "${name}" created!`);
      setDialog(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `${userPath}/group_wallets`);
    }
  };

  const handleContributeToGroup = async (groupId: string, amount: number) => {
    if (!user) return;
    const userPath = `users/${user.uid}`;
    try {
      const groupRef = doc(db, userPath, 'group_wallets', groupId);
      await updateDoc(groupRef, {
        balance: increment(amount)
      });

      // Deduct from card balance
      if (cards.length > 0) {
        await updateDoc(doc(db, userPath, 'cards', cards[0].id), {
          balance: cards[0].balance - amount
        });
      }

      // Create transaction
      const newTx = {
        uid: user.uid,
        title: `Group Contribution`,
        category: 'Social',
        amount: -amount,
        date: Timestamp.now(),
        type: 'debit',
        icon: 'Users'
      };
      await addDoc(collection(db, userPath, 'transactions'), newTx);

      showToast(`Contributed Rs. ${amount} to group`);
      setDialog(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${userPath}/group_wallets/${groupId}`);
    }
  };

  const handleInvest = async (asset: string, amount: number) => {
    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      title: `Investment: ${asset}`,
      category: 'Investment',
      amount: -amount,
      date: 'Just Now',
      type: 'debit',
      icon: 'TrendingUp'
    };

    if (!user) {
      setTransactions(prev => [newTx, ...prev]);
      setInvestments(prev => [{ id: Math.random().toString(), asset, amount, investedAt: new Date() }, ...prev]);
      if (cards.length > 0) {
        setCards(prev => prev.map((c, i) => i === 0 ? { ...c, balance: c.balance - amount } : c));
      }
      setSelectedTxForReceipt(newTx);
      setDialog(null);
      showToast(`Invested Rs. ${amount} in ${asset}`);
      return;
    }

    const userPath = `users/${user.uid}`;
    try {
      await addDoc(collection(db, userPath, 'investments'), {
        asset,
        amount,
        investedAt: Timestamp.now()
      });

      if (cards.length > 0) {
        await updateDoc(doc(db, userPath, 'cards', cards[0].id), {
          balance: cards[0].balance - amount
        });
      }

      const txData = { ...newTx, date: Timestamp.now() };
      await addDoc(collection(db, userPath, 'transactions'), txData);

      setSelectedTxForReceipt(newTx);
      setDialog(null);
      showToast(`Invested Rs. ${amount} in ${asset}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `${userPath}/investments`);
    }
  };

  const handleJarTransaction = async (jarId: string, amount: number, type: 'add' | 'withdraw') => {
    if (!user) return;
    const userPath = `users/${user.uid}`;
    const jar = jars.find(j => j.id === jarId);
    if (!jar) return;

    try {
      const newBalance = type === 'add' ? jar.currentAmount + amount : jar.currentAmount - amount;
      await updateDoc(doc(db, userPath, 'jars', jarId), {
        currentAmount: Math.max(0, newBalance)
      });
      showToast(`${type === 'add' ? 'Added' : 'Withdrawn'} Rs. ${amount} ${type === 'add' ? 'to' : 'from'} jar`);
      setDialog(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${userPath}/jars/${jarId}`);
    }
  };

  const handleFXExchange = async (from: string, to: string, amount: number, rate: number) => {
    if (!user) return;
    const userPath = `users/${user.uid}`;
    try {
      // Create transaction for FX
      const newTx = {
        uid: user.uid,
        title: `FX Exchange: ${from} to ${to}`,
        category: 'FX',
        amount: -amount,
        date: Timestamp.now(),
        type: 'debit',
        icon: 'Globe'
      };
      await addDoc(collection(db, userPath, 'transactions'), newTx);
      
      // Update balance (assuming first card is main)
      if (cards.length > 0) {
        const mainCard = cards[0];
        await updateDoc(doc(db, userPath, 'cards', mainCard.id), {
          balance: mainCard.balance - amount
        });
      }
      
      showToast(`Exchanged ${amount} ${from} to ${to} at rate ${rate}`);
      setDialog(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${userPath}/transactions`);
    }
  };

  const handleQRScan = async (data: string) => {
    if (!user) return;
    const userPath = `users/${user.uid}`;
    try {
      // Simulate payment from QR
      const amount = 1500; // Mock amount
      const newTx = {
        uid: user.uid,
        title: `QR Payment: ${data}`,
        category: 'Shopping',
        amount: -amount,
        date: Timestamp.now(),
        type: 'debit',
        icon: 'QrCode'
      };
      await addDoc(collection(db, userPath, 'transactions'), newTx);
      
      // Update balance
      if (cards.length > 0) {
        const mainCard = cards[0];
        await updateDoc(doc(db, userPath, 'cards', mainCard.id), {
          balance: mainCard.balance - amount
        });
      }
      
      showToast(`QR Payment of Rs. ${amount} successful`);
      setScreen('dashboard');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${userPath}/transactions`);
    }
  };

  const handleSettleSplit = async (id: string, amount: number, from: string) => {
    if (!user) return;
    const userPath = `users/${user.uid}`;
    try {
      // Update split status
      await updateDoc(doc(db, userPath, 'splits', id), { status: 'settled' });
      
      // Create transaction
      const newTx = {
        uid: user.uid,
        title: `Settled Split with ${from}`,
        category: 'Social',
        amount: -amount,
        date: Timestamp.now(),
        type: 'debit',
        icon: 'Users'
      };
      await addDoc(collection(db, userPath, 'transactions'), newTx);
      
      // Update balance
      if (cards.length > 0) {
        const mainCard = cards[0];
        await updateDoc(doc(db, userPath, 'cards', mainCard.id), {
          balance: mainCard.balance - amount
        });
      }
      
      showToast(`Paid Rs. ${amount} to ${from}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${userPath}/splits/${id}`);
    }
  };

  const handleMarkAsRead = async (id?: string) => {
    if (!user) return;
    const userPath = `users/${user.uid}`;
    try {
      if (id) {
        await updateDoc(doc(db, userPath, 'notifications', id), { isRead: true });
      } else {
        // Mark all as read
        const q = query(collection(db, userPath, 'notifications'), where('isRead', '==', false));
        const snap = await getDocs(q);
        const batch = writeBatch(db);
        snap.docs.forEach(d => {
          batch.update(d.ref, { isRead: true });
        });
        await batch.commit();
        showToast('All marked as read');
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${userPath}/notifications`);
    }
  };

  const handleUpdateProfile = async (data: any) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(userRef, data);
      showToast('Profile updated successfully');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const handleAIChat = async (text: string) => {
    const userMsg: Message = { id: Date.now().toString(), text, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    const userPath = user ? `users/${user.uid}` : 'demo';

    try {
      // Save user message to Firestore if logged in
      if (user) {
        await addDoc(collection(db, userPath, 'messages'), {
          uid: user.uid,
          text,
          sender: 'user',
          timestamp: Timestamp.now()
        });
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      // Prepare history
      const history = messages
        .filter((msg, index) => !(index === 0 && msg.sender === 'ai')) // Skip initial AI greeting if it's the first message
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        }));
      
      // Add current user message to history
      history.push({ role: 'user', parts: [{ text }] });

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: history,
        config: {
          systemInstruction: `You are Zenith AI, a helpful and intelligent banking assistant for Zenith Bank Pakistan. You help users with balance inquiries, spending analysis, financial advice, and navigating the app. Be polite, professional, and concise. Use Pakistani Rupee (Rs.) as the currency. The user's name is ${user?.displayName || 'Manan Ahmad'}. Their total balance is Rs. ${cards.reduce((acc, c) => acc + c.balance, 0).toLocaleString()}. They have savings jars, a multi-currency wallet, and an Islamic hub for Zakat and Sadaqah. Recent transactions: ${transactions.slice(0, 5).map(t => `${t.title}: Rs. ${t.amount}`).join(', ')}.`
        }
      });

      const reply = response.text || "I'm sorry, I encountered an error. How else can I help you?";
      const aiMsg: Message = { id: (Date.now() + 1).toString(), text: reply, sender: 'ai', timestamp: new Date() };
      
      // Manually update state for immediate feedback
      setMessages(prev => [...prev, aiMsg]);

      // Save AI message to Firestore if logged in
      if (user) {
        await addDoc(collection(db, userPath, 'messages'), {
          uid: user.uid,
          text: reply,
          sender: 'ai',
          timestamp: Timestamp.now()
        });
      }

    } catch (error) {
      console.error("AI Chat Error:", error);
      const errorMsg: Message = { id: (Date.now() + 1).toString(), text: "I'm having trouble connecting right now. Please try again later.", sender: 'ai', timestamp: new Date() };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  // --- Screen Components ---

  const handleSyncDefaults = async () => {
    // If no user, just reset local state to defaults
    if (!user) {
      setTransactions(INITIAL_TRANSACTIONS);
      setCards(INITIAL_CARDS);
      setWallets(INITIAL_WALLETS);
      setJars(INITIAL_JARS);
      setGroupWallets(INITIAL_GROUP_WALLETS);
      setNotifications(INITIAL_NOTIFICATIONS);
      setSubscriptions(INITIAL_SUBSCRIPTIONS);
      showToast('Default data synced locally!');
      return;
    }

    const userPath = `users/${user.uid}`;
    try {
      showToast('Syncing with cloud...');
      // Sync Cards
      const cardSnap = await getDocs(collection(db, userPath, 'cards'));
      const existingCardNumbers = cardSnap.docs.map(d => d.data().number);
      for (const card of INITIAL_CARDS) {
        if (!existingCardNumbers.includes(card.number)) {
          await addDoc(collection(db, userPath, 'cards'), card);
        }
      }

      // Sync Wallets
      const walletSnap = await getDocs(collection(db, userPath, 'wallets'));
      const existingWalletNames = walletSnap.docs.map(d => d.data().name);
      for (const wallet of INITIAL_WALLETS) {
        if (!existingWalletNames.includes(wallet.name)) {
          await addDoc(collection(db, userPath, 'wallets'), wallet);
        }
      }
      
      // Sync Transactions
      const txSnap = await getDocs(collection(db, userPath, 'transactions'));
      if (txSnap.empty) {
        for (const tx of INITIAL_TRANSACTIONS) {
          await addDoc(collection(db, userPath, 'transactions'), { ...tx, timestamp: Timestamp.now() });
        }
      }

      showToast('Default data synced successfully!');
    } catch (error) {
      console.error("Sync Error:", error);
      handleFirestoreError(error, OperationType.WRITE, userPath);
    }
  };

  const SplashScreen = () => (
    <div className="fixed inset-0 lush-gradient flex flex-col items-center justify-center z-50">
      <motion.div 
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="w-32 h-32 bg-forest-green rounded-[40px] flex items-center justify-center shadow-2xl mb-6 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/10 animate-pulse" />
        <Wallet size={64} className="text-soft-mint relative z-10" />
      </motion.div>
      <motion.h1 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="text-3xl font-bold text-soft-mint tracking-tight"
      >
        Zenith Bank AI
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="text-soft-mint/60 mt-2 text-sm font-medium tracking-widest uppercase"
      >
        Smart Banking Powered by AI
      </motion.p>
    </div>
  );

  const LoginScreen = () => (
    <div className="min-h-screen bg-deep-green p-8 flex flex-col overflow-y-auto">
      <div className="mt-12 flex items-center gap-3">
        <div className="w-12 h-12 bg-forest-green rounded-2xl flex items-center justify-center shadow-lg">
          <Wallet size={24} className="text-soft-mint" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-soft-mint">ZENITH BANK AI</h2>
          <p className="text-xs text-soft-mint/40">Intelligent Banking</p>
        </div>
      </div>

      <div className="mt-12">
        <h1 className="text-4xl font-bold text-soft-mint leading-tight">
          {authMode === 'login' ? 'Welcome Back' : authMode === 'signup' ? 'Create Account' : 'Verify OTP'}
        </h1>
        <p className="text-soft-mint/60 mt-2">
          {authMode === 'login' ? 'Sign in to your intelligent bank' : authMode === 'signup' ? 'Join the future of banking' : 'Enter the code sent to your phone'}
        </p>
      </div>

      <div className="mt-10 space-y-4">
        <button 
          onClick={() => {
            setScreen('dashboard');
            showToast('Demo Mode: Logged in successfully', 'success');
          }}
          className="w-full bg-white/5 border border-white/10 text-soft-mint py-4 rounded-2xl font-bold hover:bg-white/10 transition-colors mb-4"
        >
          Try Demo Version
        </button>

        {authMode === 'otp' ? (
          <div className="space-y-6">
            <div className="flex justify-center gap-2">
              <input 
                type="text" 
                maxLength={6}
                value={otpValue}
                onChange={(e) => setOtpValue(e.target.value)}
                placeholder="000000"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 text-center text-2xl font-bold text-soft-mint tracking-[1em] focus:outline-none focus:border-light-green"
              />
            </div>
            <button 
              onClick={handleVerifyOtp}
              className="w-full bg-forest-green text-soft-mint py-4 rounded-2xl font-bold shadow-xl active:scale-95 transition-transform"
            >
              Verify & Continue
            </button>
            <button 
              onClick={() => setScreen('dashboard')}
              className="w-full text-soft-mint/40 text-sm font-medium py-2"
            >
              Skip for Demo
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {authMode === 'signup' && (
              <div className="space-y-4">
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-soft-mint/40" size={20} />
                  <input 
                    type="text" 
                    placeholder="Full Name"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-soft-mint focus:outline-none focus:border-light-green transition-all"
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-soft-mint/40" size={20} />
                  <input 
                    type="tel" 
                    placeholder="Phone Number"
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-soft-mint focus:outline-none focus:border-light-green transition-all"
                  />
                </div>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-soft-mint/40" size={20} />
                  <input 
                    type="text" 
                    placeholder="CNIC (XXXXX-XXXXXXX-X)"
                    value={signupCnic}
                    onChange={(e) => setSignupCnic(formatCNIC(e.target.value))}
                    maxLength={15}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-soft-mint focus:outline-none focus:border-light-green transition-all placeholder:text-soft-mint/20"
                  />
                  <p className="text-[10px] text-soft-mint/20 ml-12 mt-1">Format: 12345-1234567-1</p>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-soft-mint/40 ml-2 uppercase tracking-widest">Date of Birth</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-soft-mint/40" size={20} />
                      <input 
                        type="date" 
                        value={signupDob}
                        onChange={(e) => setSignupDob(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-soft-mint focus:outline-none focus:border-light-green transition-all"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-soft-mint/40 ml-2 uppercase tracking-widest">Gender</label>
                  <div className="flex gap-2">
                    {['Male', 'Female', 'Other'].map((g) => (
                      <button
                        key={g}
                        onClick={() => setSignupGender(g as any)}
                        className={`flex-1 py-3 rounded-xl border transition-all font-bold text-xs ${
                          signupGender === g 
                            ? 'bg-forest-green border-light-green text-soft-mint shadow-lg shadow-forest-green/20' 
                            : 'bg-white/5 border-white/10 text-soft-mint/40 hover:bg-white/10'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-soft-mint/40" size={20} />
              <input 
                type="email" 
                placeholder="Email Address"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-soft-mint focus:outline-none focus:border-light-green transition-all"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-soft-mint/40" size={20} />
              <input 
                type="password" 
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-soft-mint focus:outline-none focus:border-light-green transition-all"
              />
            </div>

            {authMode === 'signup' && (
              <div className="flex items-center gap-3 px-2 py-2">
                <button 
                  onClick={() => setSignupTerms(!signupTerms)}
                  className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                    signupTerms ? 'bg-forest-green border-light-green' : 'bg-white/5 border-white/10'
                  }`}
                >
                  {signupTerms && <CheckCircle2 size={16} className="text-soft-mint" />}
                </button>
                <span className="text-xs text-soft-mint/40">
                  I agree to the <span className="text-light-green font-bold">Terms & Conditions</span>
                </span>
              </div>
            )}

            <button 
              onClick={authMode === 'login' ? handleLogin : handleSignupInitiate}
              className="w-full bg-forest-green text-soft-mint py-4 rounded-2xl font-bold shadow-xl active:scale-95 transition-transform mt-4 flex items-center justify-center gap-2"
            >
              {authMode === 'login' ? 'Login' : 'Create Account'}
              <ArrowRight size={20} />
            </button>

            <div className="flex items-center gap-4 my-4">
              <div className="h-px bg-white/10 flex-1" />
              <span className="text-soft-mint/20 text-xs font-bold uppercase tracking-widest">Or Secure Access</span>
              <div className="h-px bg-white/10 flex-1" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => {
                  setScreen('dashboard');
                  showToast('Fingerprint Verified', 'success');
                }}
                className="glass-card p-6 flex flex-col items-center gap-4 active:scale-95 transition-transform"
              >
                <div className="w-14 h-14 bg-forest-green/20 rounded-full flex items-center justify-center">
                  <Fingerprint size={32} className="text-light-green" />
                </div>
                <span className="text-sm font-medium">Fingerprint</span>
              </button>
              <button 
                onClick={handleFaceID}
                className="glass-card p-6 flex flex-col items-center gap-4 active:scale-95 transition-transform relative overflow-hidden"
              >
                <div className="absolute top-2 right-2 bg-red-500 text-[8px] font-bold px-1.5 py-0.5 rounded text-white">LIVE</div>
                <div className="w-14 h-14 bg-forest-green/20 rounded-full flex items-center justify-center">
                  <ScanFace size={32} className="text-light-green" />
                </div>
                <span className="text-sm font-medium">Face ID</span>
              </button>
            </div>

            <button 
              onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
              className="w-full text-light-green font-bold py-4"
            >
              {authMode === 'login' ? 'Create New Account' : 'Already have an account? Login'}
            </button>
          </div>
        )}
      </div>

      <div className="mt-auto py-8">
        <p className="text-center text-soft-mint/40 text-sm">
          By continuing, you agree to our <span className="text-light-green font-bold">Terms of Service</span>
        </p>
      </div>
    </div>
  );

  const FaceIDScreen = () => {
    const [status, setStatus] = useState<'scanning' | 'success'>('scanning');
    const videoRef = useRef<HTMLVideoElement>(null);
    
    useEffect(() => {
      let stream: MediaStream | null = null;
      
      const startCamera = async () => {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error("Error accessing camera:", err);
          showToast("Camera access denied. Using simulation.", "error");
        }
      };

      startCamera();

      const timer = setTimeout(() => {
        setStatus('success');
        setTimeout(() => {
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
          }
          setScreen('dashboard');
        }, 1500);
      }, 4000);

      return () => {
        clearTimeout(timer);
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      };
    }, []);

    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center p-8 z-50">
        <div className="w-full max-w-xs aspect-[3/4] border-2 border-white/10 rounded-[60px] relative flex items-center justify-center overflow-hidden">
          {/* Real Camera Feed */}
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale"
          />

          {/* Scanning Overlay */}
          <div className="absolute inset-0 z-10">
            <div className="absolute top-8 left-8 w-8 h-8 border-t-2 border-l-2 border-light-green rounded-tl-xl" />
            <div className="absolute top-8 right-8 w-8 h-8 border-t-2 border-r-2 border-light-green rounded-tr-xl" />
            <div className="absolute bottom-8 left-8 w-8 h-8 border-b-2 border-l-2 border-light-green rounded-bl-xl" />
            <div className="absolute bottom-8 right-8 w-8 h-8 border-b-2 border-r-2 border-light-green rounded-br-xl" />
            
            <div className="absolute inset-0 opacity-20 grid grid-cols-10 gap-2 p-4">
              {Array.from({ length: 100 }).map((_, i) => (
                <div key={i} className="w-1 h-1 bg-light-green rounded-full" />
              ))}
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`w-48 h-64 border-2 rounded-full relative flex items-center justify-center transition-colors duration-500 ${status === 'success' ? 'border-light-green bg-light-green/10' : 'border-white/20'}`}>
                {status === 'scanning' && (
                  <>
                    <div className="absolute inset-0 bg-light-green/5 rounded-full animate-pulse" />
                    <div className="absolute left-0 right-0 h-0.5 bg-light-green shadow-[0_0_15px_rgba(104,186,127,0.8)] animate-scan-line z-20" />
                  </>
                )}
                
                <ScanFace size={status === 'success' ? 80 : 120} className={`transition-all duration-700 ${status === 'scanning' ? 'text-white/40 scale-110' : 'text-light-green scale-100'}`} />
                
                {status === 'success' && (
                  <motion.div 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <CheckCircle2 size={80} className="text-light-green" />
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center z-20">
          <h2 className="text-2xl font-bold text-soft-mint">
            {status === 'scanning' ? 'Authenticating...' : 'Identity Verified'}
          </h2>
          <p className="text-soft-mint/60 mt-2">
            {status === 'scanning' ? 'Keep your face within the frame' : 'Welcome back, Ahmad'}
          </p>
        </div>
      </div>
    );
  };

  const OTPScreen = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const inputs = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (index: number, value: string) => {
      if (value.length > 1) value = value[0];
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) {
        inputs.current[index + 1]?.focus();
      }
    };

    return (
      <div className="min-h-screen bg-deep-green p-8 flex flex-col">
        <button onClick={() => setScreen('login')} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
          <ChevronRight size={24} className="rotate-180" />
        </button>
        <div className="mt-12">
          <h1 className="text-3xl font-bold">Verification Code</h1>
          <p className="text-soft-mint/60 mt-2">We've sent a 6-digit code to your registered mobile number ending in ****4821</p>
        </div>

        <div className="mt-12 flex justify-between gap-2">
          {otp.map((digit, i) => (
            <input 
              key={i}
              ref={el => inputs.current[i] = el}
              type="number"
              value={digit}
              onChange={e => handleChange(i, e.target.value)}
              className="w-12 h-16 bg-white/5 border border-white/10 rounded-2xl text-center text-2xl font-bold text-light-green focus:outline-none focus:border-light-green"
            />
          ))}
        </div>

        <button className="mt-8 text-light-green font-semibold text-sm">Resend Code in 00:45</button>

        <button 
          onClick={handleOTPSuccess}
          className="mt-auto mb-8 w-full bg-forest-green text-soft-mint py-5 rounded-3xl font-bold text-lg shadow-xl active:scale-95 transition-transform"
        >
          Verify & Continue
        </button>
      </div>
    );
  };

  const LoanCenterScreen = () => {
    const [loanTab, setLoanTab] = useState<'apply' | 'my-loans' | 'calculator'>('apply');
    const [selectedType, setSelectedType] = useState<Loan['type']>('Personal');
    const [amount, setAmount] = useState<string>('');
    const [duration, setDuration] = useState<string>('');
    const [income, setIncome] = useState<string>('');
    const [purpose, setPurpose] = useState<string>('');

    const loanTypes = [
      { type: 'Personal', rate: 12, icon: UserIcon, desc: 'For your personal needs' },
      { type: 'Car', rate: 8, icon: ShoppingBag, desc: 'Drive your dream car' },
      { type: 'Home', rate: 7, icon: Home, desc: 'Build your own home' },
      { type: 'Education', rate: 5, icon: Globe, desc: 'Invest in your future' },
    ];

    const currentRate = loanTypes.find(l => l.type === selectedType)?.rate || 12;

    const calculateEMI = (p: number, annualRate: number, n: number) => {
      if (!p || !annualRate || !n) return { emi: 0, total: 0, interest: 0 };
      const r = annualRate / 12 / 100;
      const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const total = emi * n;
      const interest = total - p;
      return { emi: Math.round(emi), total: Math.round(total), interest: Math.round(interest) };
    };

    const emiData = calculateEMI(Number(amount), currentRate, Number(duration));

    const handleApply = async () => {
      if (!amount || !duration || !income) {
        showToast('Please fill all required fields', 'error');
        return;
      }

      const loanAmount = Number(amount);
      const monthlyIncome = Number(income);
      
      // Simulation logic
      const isApproved = monthlyIncome > (loanAmount / Number(duration)) * 2;
      
      const newLoan: Loan = {
        id: Math.random().toString(36).substr(2, 9),
        type: selectedType,
        amount: loanAmount,
        duration: Number(duration),
        interestRate: currentRate,
        monthlyEMI: emiData.emi,
        totalPayable: emiData.total,
        status: isApproved ? 'Approved' : 'Under Review',
        remainingBalance: emiData.total,
        startDate: new Date().toISOString(),
        nextDueDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
        income: monthlyIncome,
        purpose
      };

      if (!user) {
        setLoans(prev => [newLoan, ...prev]);
        showToast(isApproved ? 'Loan Approved Instantly!' : 'Application Submitted for Review', isApproved ? 'success' : 'error');
        setLoanTab('my-loans');
        return;
      }

      try {
        await addDoc(collection(db, `users/${user.uid}/loans`), {
          ...newLoan,
          startDate: Timestamp.now(),
          nextDueDate: Timestamp.now() // Simplified for now
        });
        showToast(isApproved ? 'Loan Approved Instantly!' : 'Application Submitted for Review', isApproved ? 'success' : 'error');
        setLoanTab('my-loans');
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}/loans`);
      }
    };

    const handlePayEMI = async (loanId: string) => {
      const loan = loans.find(l => l.id === loanId);
      if (!loan) return;

      if (cards[0]?.balance < loan.monthlyEMI) {
        showToast('Insufficient balance in main card', 'error');
        return;
      }

      const updatedBalance = loan.remainingBalance - loan.monthlyEMI;
      const isPaid = updatedBalance <= 0;

      if (!user) {
        setLoans(prev => prev.map(l => l.id === loanId ? { 
          ...l, 
          remainingBalance: Math.max(0, updatedBalance),
          status: isPaid ? 'Paid' : l.status 
        } : l));
        setCards(prev => prev.map((c, i) => i === 0 ? { ...c, balance: c.balance - loan.monthlyEMI } : c));
        showToast('EMI Paid Successfully', 'success');
        return;
      }

      try {
        const userPath = `users/${user.uid}`;
        await updateDoc(doc(db, userPath, 'loans', loanId), {
          remainingBalance: Math.max(0, updatedBalance),
          status: isPaid ? 'Paid' : loan.status
        });
        await updateDoc(doc(db, userPath, 'cards', cards[0].id), {
          balance: cards[0].balance - loan.monthlyEMI
        });
        showToast('EMI Paid Successfully', 'success');
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}/loans/${loanId}`);
      }
    };

    return (
      <div className="min-h-screen bg-deep-forest-1 pb-32">
        <div className="p-6 flex items-center gap-4 bg-deep-forest-2/50 backdrop-blur-md sticky top-0 z-30">
          <button onClick={goBack} className="w-10 h-10 glass-card flex items-center justify-center rounded-full">
            <ArrowRight className="rotate-180" size={20} />
          </button>
          <h2 className="text-xl font-bold text-soft-mint">Loan Center</h2>
        </div>

        <div className="px-6 mt-6">
          <div className="flex gap-2 p-1 bg-white/5 rounded-2xl mb-6">
            {(['apply', 'my-loans', 'calculator'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setLoanTab(tab)}
                className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                  loanTab === tab ? 'bg-forest-green text-soft-mint shadow-lg' : 'text-soft-mint/40'
                }`}
              >
                {tab.replace('-', ' ')}
              </button>
            ))}
          </div>

          {loanTab === 'apply' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {loanTypes.map(l => (
                  <button
                    key={l.type}
                    onClick={() => setSelectedType(l.type as any)}
                    className={`p-4 rounded-[32px] border transition-all text-left relative overflow-hidden group ${
                      selectedType === l.type ? 'bg-forest-green border-light-green shadow-xl' : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 ${
                      selectedType === l.type ? 'bg-white/20' : 'bg-forest-green/20'
                    }`}>
                      <l.icon size={20} className={selectedType === l.type ? 'text-white' : 'text-light-green'} />
                    </div>
                    <h4 className={`font-bold text-sm ${selectedType === l.type ? 'text-white' : 'text-soft-mint'}`}>{l.type}</h4>
                    <p className={`text-[10px] mt-1 ${selectedType === l.type ? 'text-white/60' : 'text-soft-mint/40'}`}>{l.rate}% Interest</p>
                  </button>
                ))}
              </div>

              <div className="glass-card p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-soft-mint/40 uppercase tracking-widest ml-1">Loan Amount (Rs.)</label>
                  <div className="relative">
                    <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-soft-mint/40" size={18} />
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="e.g. 500,000"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-soft-mint focus:outline-none focus:border-light-green transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-soft-mint/40 uppercase tracking-widest ml-1">Duration (Months)</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-soft-mint/40" size={18} />
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="e.g. 24"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-soft-mint focus:outline-none focus:border-light-green transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-soft-mint/40 uppercase tracking-widest ml-1">Monthly Income (Rs.)</label>
                  <div className="relative">
                    <TrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 text-soft-mint/40" size={18} />
                    <input
                      type="number"
                      value={income}
                      onChange={(e) => setIncome(e.target.value)}
                      placeholder="e.g. 150,000"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-soft-mint focus:outline-none focus:border-light-green transition-all"
                    />
                  </div>
                </div>

                {amount && duration && (
                  <div className="bg-forest-green/20 p-4 rounded-2xl border border-light-green/20">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-soft-mint/60">Estimated Monthly EMI</span>
                      <span className="text-lg font-bold text-light-green">Rs. {emiData.emi.toLocaleString()}</span>
                    </div>
                    <div className="h-px bg-white/5 my-2" />
                    <div className="flex justify-between text-[10px] text-soft-mint/40">
                      <span>Total Interest: Rs. {emiData.interest.toLocaleString()}</span>
                      <span>Total Payable: Rs. {emiData.total.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleApply}
                  className="w-full bg-forest-green text-soft-mint py-4 rounded-2xl font-bold shadow-xl active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                  Apply for {selectedType} Loan
                  <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {loanTab === 'my-loans' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {loans.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText size={40} className="text-soft-mint/20" />
                  </div>
                  <p className="text-soft-mint/40 font-medium">No active loans found</p>
                </div>
              ) : (
                loans.map(loan => (
                  <div key={loan.id} className="glass-card p-6 relative overflow-hidden">
                    <div className={`absolute top-0 right-0 px-4 py-1 rounded-bl-2xl text-[10px] font-bold uppercase tracking-widest ${
                      loan.status === 'Approved' ? 'bg-emerald-500 text-white' : 
                      loan.status === 'Paid' ? 'bg-blue-500 text-white' : 'bg-amber-500 text-white'
                    }`}>
                      {loan.status}
                    </div>
                    
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-forest-green/20 rounded-2xl flex items-center justify-center">
                        {loanTypes.find(l => l.type === loan.type)?.icon && React.createElement(loanTypes.find(l => l.type === loan.type)!.icon, { size: 24, className: 'text-light-green' })}
                      </div>
                      <div>
                        <h4 className="font-bold text-soft-mint">{loan.type} Loan</h4>
                        <p className="text-[10px] text-soft-mint/40 uppercase tracking-widest">ID: {loan.id}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <p className="text-[10px] font-bold text-soft-mint/40 uppercase tracking-widest">Remaining</p>
                        <p className="text-lg font-bold text-soft-mint">Rs. {loan.remainingBalance.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-soft-mint/40 uppercase tracking-widest">Monthly EMI</p>
                        <p className="text-lg font-bold text-light-green">Rs. {loan.monthlyEMI.toLocaleString()}</p>
                      </div>
                    </div>

                    {loan.status === 'Approved' && loan.remainingBalance > 0 && (
                      <div className="space-y-4">
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${((loan.totalPayable - loan.remainingBalance) / loan.totalPayable) * 100}%` }}
                            className="h-full bg-light-green"
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-soft-mint/40 font-bold uppercase tracking-widest">
                          <span>Paid: Rs. {(loan.totalPayable - loan.remainingBalance).toLocaleString()}</span>
                          <span>{Math.round(((loan.totalPayable - loan.remainingBalance) / loan.totalPayable) * 100)}%</span>
                        </div>
                        <button
                          onClick={() => handlePayEMI(loan.id)}
                          className="w-full bg-white/5 border border-white/10 text-soft-mint py-3 rounded-xl font-bold active:scale-95 transition-transform"
                        >
                          Pay EMI (Rs. {loan.monthlyEMI.toLocaleString()})
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}

              {loans.some(l => l.status === 'Paid') && (
                <div className="mt-8">
                  <h3 className="text-[10px] font-bold text-soft-mint/40 uppercase tracking-widest mb-4 ml-1">Loan History</h3>
                  <div className="space-y-3">
                    {loans.filter(l => l.status === 'Paid').map(loan => (
                      <div key={loan.id} className="glass-card p-4 flex justify-between items-center opacity-60">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 size={20} className="text-emerald-500" />
                          <div>
                            <p className="text-sm font-bold text-soft-mint">{loan.type} Loan</p>
                            <p className="text-[10px] text-soft-mint/40">Completed on {new Date(loan.startDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-soft-mint">Rs. {loan.amount.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {loanTab === 'calculator' && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
              <div className="glass-card p-8 lush-gradient relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                <p className="text-soft-mint/60 text-sm font-medium">Estimated Monthly EMI</p>
                <h1 className="text-4xl font-bold mt-2 tracking-tight text-soft-mint">
                  Rs. {emiData.emi.toLocaleString()}
                </h1>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="bg-white/10 p-3 rounded-2xl">
                    <p className="text-[10px] font-bold text-white/40 uppercase">Total Interest</p>
                    <p className="text-sm font-bold text-white">Rs. {emiData.interest.toLocaleString()}</p>
                  </div>
                  <div className="bg-white/10 p-3 rounded-2xl">
                    <p className="text-[10px] font-bold text-white/40 uppercase">Total Payable</p>
                    <p className="text-sm font-bold text-white">Rs. {emiData.total.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-soft-mint">Loan Amount</label>
                    <span className="text-light-green font-bold">Rs. {Number(amount).toLocaleString()}</span>
                  </div>
                  <input 
                    type="range" 
                    min="10000" 
                    max="5000000" 
                    step="10000"
                    value={amount || 10000}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-light-green"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-soft-mint">Duration (Months)</label>
                    <span className="text-light-green font-bold">{duration || 12} Months</span>
                  </div>
                  <input 
                    type="range" 
                    min="6" 
                    max="120" 
                    step="6"
                    value={duration || 12}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-light-green"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-soft-mint">Interest Rate (%)</label>
                    <span className="text-light-green font-bold">{currentRate}%</span>
                  </div>
                  <div className="flex gap-2">
                    {loanTypes.map(l => (
                      <button
                        key={l.type}
                        onClick={() => setSelectedType(l.type as any)}
                        className={`flex-1 py-2 rounded-xl text-[10px] font-bold transition-all ${
                          selectedType === l.type ? 'bg-forest-green text-soft-mint' : 'bg-white/5 text-soft-mint/40'
                        }`}
                      >
                        {l.type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  };

  const Dashboard = () => {
    const [showBalance, setShowBalance] = useState(true);
    const totalBalance = cards.length > 0 
      ? cards.reduce((acc, card) => acc + card.balance, 0)
      : wallets.reduce((acc, w) => acc + w.balance, 0);

    return (
      <div className="min-h-screen bg-deep-forest-1 pb-32">
        {/* Header */}
        <div className="p-6 flex justify-between items-center bg-deep-forest-2/50 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div 
              onClick={() => navigateTo('profile')}
              className="w-10 h-10 bg-forest-green rounded-full flex items-center justify-center text-soft-mint font-bold shadow-lg border border-white/10 overflow-hidden cursor-pointer"
            >
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                user?.displayName?.split(' ').map(n => n[0]).join('') || 'MA'
              )}
            </div>
            <div>
              <p className="text-soft-mint/40 text-[10px] uppercase tracking-widest font-bold">Zenith Member</p>
              <h2 className="text-lg font-bold text-soft-mint">{user?.displayName || 'Manan Ahmad'}</h2>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => navigateTo('notifications')}
              className="w-10 h-10 glass-card !rounded-full flex items-center justify-center relative active:scale-90 transition-all"
            >
              <Bell size={20} className="text-soft-mint/80" />
              {notifications.some(n => !n.isRead) && (
                <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-light-green rounded-full border-2 border-deep-forest-1 shadow-[0_0_5px_rgba(163,230,53,0.5)]" />
              )}
            </button>
            <button 
              onClick={() => navigateTo('search')}
              className="w-10 h-10 glass-card !rounded-full flex items-center justify-center active:scale-90 transition-all"
            >
              <Search size={20} className="text-soft-mint/80" />
            </button>
          </div>
        </div>

        {/* Balance Card */}
        <div className="px-6 mt-4">
          <div 
            onClick={() => navigateTo('transactions')}
            className="glass-card p-8 premium-gradient relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-all"
          >
            {/* Decorative Elements */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-light-green/5 rounded-full blur-3xl group-hover:bg-light-green/10 transition-all duration-1000" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all duration-1000" />
            
            <div className="relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-1.5 h-1.5 bg-light-green rounded-full animate-pulse" />
                    <p className="text-soft-mint/40 text-[10px] font-bold uppercase tracking-[0.2em]">Zenith Portfolio</p>
                  </div>
                  <h1 className="text-4xl font-bold tracking-tight text-soft-mint">
                    {showBalance ? `Rs. ${totalBalance.toLocaleString()}` : '••••••••'}
                  </h1>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowBalance(!showBalance); }} 
                  className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-soft-mint/40 hover:text-soft-mint transition-all border border-white/5"
                >
                  {showBalance ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="mt-6 flex items-end justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-vibrant-green text-sm font-bold">
                    <ArrowUpRight size={16} />
                    <span>+12.4%</span>
                    <span className="text-soft-mint/20 font-normal text-xs ml-1">this month</span>
                  </div>
                  <p className="text-[10px] text-soft-mint/40 font-medium">Last updated: Just now</p>
                </div>
                
                <div className="flex gap-2">
                  <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center border border-white/5">
                    <TrendingUp size={16} className="text-light-green" />
                  </div>
                  <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center border border-white/5">
                    <ShieldCheck size={16} className="text-emerald-400" />
                  </div>
                </div>
              </div>

              {/* Quick Mini Actions */}
              <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-2 gap-4">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setDialog({
                      title: 'Add Money',
                      content: (
                        <div className="space-y-4">
                          <p className="text-xs text-soft-mint/60">Enter the amount you want to add to your Zenith account.</p>
                          <input 
                            type="number" 
                            placeholder="Amount (Rs.)" 
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-soft-mint"
                            onChange={(e) => setInputAmount(e.target.value)}
                          />
                          <button 
                            onClick={() => handleAddMoney(Number(inputAmount))}
                            className="w-full bg-light-green text-deep-forest-1 py-4 rounded-2xl font-bold"
                          >
                            Confirm Top-up
                          </button>
                        </div>
                      )
                    });
                  }}
                  className="flex items-center justify-center gap-2 py-2.5 bg-light-green text-deep-forest-1 rounded-xl text-xs font-bold active:scale-95 transition-transform"
                >
                  <Plus size={14} strokeWidth={3} />
                  Add Money
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setDialog({
                      title: 'Withdraw Money',
                      content: (
                        <div className="space-y-4">
                          <p className="text-xs text-soft-mint/60">Enter the amount you want to withdraw from your Zenith account.</p>
                          <input 
                            type="number" 
                            placeholder="Amount (Rs.)" 
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-soft-mint"
                            onChange={(e) => setInputAmount(e.target.value)}
                          />
                          <button 
                            onClick={() => handleWithdrawMoney(Number(inputAmount))}
                            className="w-full bg-forest-green text-soft-mint py-4 rounded-2xl font-bold"
                          >
                            Confirm Withdrawal
                          </button>
                        </div>
                      )
                    });
                  }}
                  className="flex items-center justify-center gap-2 py-2.5 bg-white/5 text-soft-mint rounded-xl text-xs font-bold border border-white/10 active:scale-95 transition-transform"
                >
                  <ArrowRight size={14} strokeWidth={3} />
                  Withdraw
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Islamic Verse Widget */}
        <div className="px-6 mt-6">
          <div className="glass-card p-5 bg-emerald-600/10 border-emerald-600/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-10">
              <Moon size={80} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <h3 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Verse of the Day</h3>
              </div>
              <p className="text-sm font-medium text-soft-mint italic leading-relaxed">
                "And whoever fears Allah - He will make for him a way out and will provide for him from where he does not expect."
              </p>
              <p className="text-[10px] text-soft-mint/40 mt-3 font-bold uppercase tracking-widest">— Surah At-Talaq 2-3</p>
            </div>
          </div>
        </div>

        {/* Active Loan Summary */}
        {loans.some(l => l.status === 'Approved' && l.remainingBalance > 0) && (
          <div className="px-6 mt-8">
            <button 
              onClick={() => navigateTo('loans')}
              className="w-full glass-card p-4 bg-emerald-500/10 border-emerald-500/20 flex items-center justify-between group active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center">
                  <Calculator size={24} className="text-emerald-400" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Active Loan Summary</p>
                  <p className="text-sm font-bold text-soft-mint">
                    Rs. {loans.filter(l => l.status === 'Approved').reduce((acc, l) => acc + l.remainingBalance, 0).toLocaleString()} Remaining
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">View Details</span>
                <ChevronRight size={16} className="text-emerald-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>
        )}

        {/* My Cards Section */}
        <div className="mt-8">
          <div className="px-6 flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-soft-mint/80">My Cards</h3>
            <button onClick={() => navigateTo('cards')} className="text-light-green text-sm font-bold flex items-center gap-1">
              <Plus size={16} /> Manage
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto px-6 pb-4 hide-scrollbar snap-x">
            {cards.map((card, idx) => (
              <motion.div 
                key={card.id} 
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`${card.color} min-w-[280px] h-44 rounded-[32px] p-6 flex flex-col justify-between shadow-xl snap-center relative overflow-hidden cursor-pointer`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10" />
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-bold opacity-60 tracking-widest uppercase">{card.type}</p>
                    <h4 className="text-sm font-bold mt-1 tracking-tighter">ZENITH BANK AI</h4>
                  </div>
                  <div className="w-10 h-6 bg-white/20 rounded-md backdrop-blur-sm" />
                </div>
                <div className="mt-4">
                  <p className="text-[10px] opacity-60 font-bold uppercase tracking-widest">Balance</p>
                  <p className="text-xl font-bold">Rs. {card.balance.toLocaleString()}</p>
                </div>
                <div className="flex justify-between items-end mt-auto">
                  <p className="text-sm font-mono tracking-wider">{card.number}</p>
                  <p className="text-[10px] font-bold opacity-60">{card.expiry}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Digital Wallets Section */}
        <div className="mt-8">
          <div className="px-6 flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-soft-mint/80">Digital Wallets</h3>
            <button onClick={() => navigateTo('wallets')} className="text-light-green text-sm font-bold flex items-center gap-1">
              <Plus size={16} /> Link New
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto px-6 pb-4 hide-scrollbar snap-x">
            {wallets.map((wallet, idx) => (
              <motion.div 
                key={wallet.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => navigateTo('wallets')}
                className={`min-w-[160px] glass-card p-4 flex flex-col items-center gap-3 snap-center cursor-pointer active:scale-95 transition-all ${wallet.isLinked ? 'border-emerald-500/30' : 'opacity-50'}`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden bg-white/5 p-2`}>
                  <img src={wallet.logo} alt={wallet.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-soft-mint">{wallet.name}</p>
                  <p className="text-[10px] text-soft-mint/40 mt-1">
                    {wallet.isLinked ? `Rs. ${wallet.balance.toLocaleString()}` : 'Not Linked'}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 px-6">
          <h3 className="font-bold text-lg mb-4 text-soft-mint/80">Quick Actions</h3>
          <div className="grid grid-cols-4 gap-y-6 gap-x-4">
            {[
              { icon: Send, label: 'Send', color: 'bg-blue-500', action: () => navigateTo('transfer') },
              { icon: Receipt, label: 'Bills', color: 'bg-orange-500', action: () => navigateTo('bills') },
              { icon: QrCode, label: 'Scan', color: 'bg-emerald-500', action: () => navigateTo('qr_scan') },
              { icon: Calculator, label: 'Loans', color: 'bg-emerald-600', action: () => navigateTo('loans') },
              { icon: Repeat, label: 'Jars', color: 'bg-indigo-500', action: () => navigateTo('jars') },
              { icon: MessageSquare, label: 'Social', color: 'bg-pink-500', action: () => navigateTo('social') },
              { icon: Calculator, label: 'Islamic', color: 'bg-yellow-600', action: () => navigateTo('islamic_hub') },
              { icon: Wallet, label: 'Wallets', color: 'bg-emerald-500', action: () => navigateTo('wallets') },
              { icon: Bot, label: 'AI Chat', color: 'bg-indigo-500', action: () => navigateTo('chat') },
              { icon: Mic, label: 'Voice', color: 'bg-emerald-600', action: () => navigateTo('voice_banking') },
              { icon: MapPin, label: 'Offers', color: 'bg-rose-500', action: () => navigateTo('offers') },
            ].map((item, i) => (
              <button 
                key={i} 
                onClick={item.action}
                className="flex flex-col items-center gap-2 group"
              >
                <div className={`w-14 h-14 ${item.color}/10 rounded-2xl flex items-center justify-center border border-${item.color.replace('bg-', '')}/20 group-active:scale-90 transition-all duration-200`}>
                  <item.icon size={24} className={item.color.replace('bg-', 'text-')} />
                </div>
                <span className="text-[10px] font-bold text-soft-mint/60 uppercase tracking-wider text-center">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mt-8 px-6 grid grid-cols-2 gap-4">
          <button 
            onClick={() => navigateTo('subscriptions')}
            className="glass-card p-4 bg-pink-500/5 border-pink-500/10 text-left group"
          >
            <div className="w-10 h-10 bg-pink-500/20 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Repeat size={20} className="text-pink-400" />
            </div>
            <p className="text-[10px] font-bold text-pink-400 uppercase tracking-widest">Subscriptions</p>
            <p className="text-sm font-bold text-soft-mint mt-1">6 Active</p>
            <p className="text-[10px] text-soft-mint/40 mt-1">Rs. 5,700/mo</p>
          </button>
          
          <button 
            onClick={() => navigateTo('fx_wallet')}
            className="glass-card p-4 bg-cyan-500/5 border-cyan-500/10 text-left group"
          >
            <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Globe size={20} className="text-cyan-400" />
            </div>
            <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">FX Wallet</p>
            <p className="text-sm font-bold text-soft-mint mt-1">6 Currencies</p>
            <p className="text-[10px] text-soft-mint/40 mt-1">Live Rates</p>
          </button>
        </div>

        {/* Islamic Features Section */}
        <div className="mt-8 px-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-soft-mint/80">Islamic Features</h3>
            <button onClick={() => navigateTo('islamic_hub')} className="text-light-green text-sm font-bold flex items-center gap-1">
              View Hub
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Calculator, label: 'Zakat', color: 'text-emerald-400', bg: 'bg-emerald-500/10', screen: 'zakat' },
              { icon: Heart, label: 'Sadaqah', color: 'text-amber-400', bg: 'bg-amber-500/10', screen: 'sadaqah' },
              { icon: TrendingUp, label: 'Halal Invest', color: 'text-indigo-400', bg: 'bg-indigo-500/10', screen: 'halal_invest' },
              { icon: Clock, label: 'Prayers', color: 'text-blue-400', bg: 'bg-blue-500/10', screen: 'prayer_times' },
              { icon: Compass, label: 'Qibla', color: 'text-rose-400', bg: 'bg-rose-500/10', screen: 'qibla' },
              { icon: Book, label: 'Quran', color: 'text-purple-400', bg: 'bg-purple-500/10', screen: 'quran' },
            ].map((feature, idx) => (
              <button 
                key={idx}
                onClick={() => navigateTo(feature.screen as any)}
                className="glass-card p-3 flex flex-col items-center gap-2 bg-white/5 border border-white/10 active:scale-95 transition-transform"
              >
                <div className={`w-10 h-10 ${feature.bg} rounded-xl flex items-center justify-center`}>
                  <feature.icon size={20} className={feature.color} />
                </div>
                <span className="text-[10px] font-bold text-soft-mint/60 uppercase tracking-tighter">{feature.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="mt-8 px-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-soft-mint/80">Recent Activity</h3>
            <button 
              onClick={() => navigateTo('transactions')}
              className="text-light-green text-sm font-bold hover:underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {transactions.map(tx => (
              <div 
                key={tx.id} 
                onClick={() => setSelectedTxForReceipt(tx)}
                className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tx.type === 'credit' ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                  {tx.type === 'credit' ? <ArrowDownLeft size={20} className="text-emerald-400" /> : <ArrowUpRight size={20} className="text-red-400" />}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-soft-mint group-hover:text-light-green transition-colors">{tx.title}</h4>
                  <p className="text-[10px] text-soft-mint/40 font-bold uppercase tracking-wider">{tx.category} • {tx.date}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-sm ${tx.type === 'credit' ? 'text-emerald-400' : 'text-soft-mint'}`}>
                    {tx.type === 'credit' ? '+' : '-'} Rs. {Math.abs(tx.amount).toLocaleString()}
                  </p>
                  <div className="flex gap-2 justify-end mt-1">
                    {tx.type === 'debit' && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleSplitBill(tx.id, tx.amount); }}
                        className="text-[9px] font-bold text-light-green uppercase tracking-widest hover:underline"
                      >
                        Split
                      </button>
                    )}
                    <button className="text-[9px] font-bold text-soft-mint/20 uppercase tracking-widest group-hover:text-soft-mint/60 transition-colors">
                      Receipt
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const AnalyticsScreen = () => {
    const [timeframe, setTimeframe] = useState<'week' | 'month'>('week');
    const data = timeframe === 'week' ? [
      { name: 'Mon', amount: 4000 },
      { name: 'Tue', amount: 3000 },
      { name: 'Wed', amount: 2000 },
      { name: 'Thu', amount: 2780 },
      { name: 'Fri', amount: 1890 },
      { name: 'Sat', amount: 2390 },
      { name: 'Sun', amount: 3490 },
    ] : [
      { name: 'Week 1', amount: 14000 },
      { name: 'Week 2', amount: 13000 },
      { name: 'Week 3', amount: 12000 },
      { name: 'Week 4', amount: 12780 },
    ];

    const pieData = [
      { name: 'Shopping', value: 400, color: '#68BA7F' },
      { name: 'Food', value: 300, color: '#2E7D32' },
      { name: 'Bills', value: 300, color: '#CFFFDC' },
      { name: 'Travel', value: 200, color: '#071a09' },
    ];

    return (
      <div className="min-h-screen bg-deep-forest-1 pb-32 p-6">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={goBack} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
            <ChevronRight size={24} className="rotate-180" />
          </button>
          <h1 className="text-2xl font-bold text-soft-mint">Analytics</h1>
          <div className="flex-1" />
          <button 
            onClick={() => setTimeframe(timeframe === 'week' ? 'month' : 'week')}
            className="glass-card px-4 py-2 text-xs font-bold text-soft-mint/60 uppercase tracking-widest"
          >
            {timeframe === 'week' ? 'This Week' : 'This Month'}
          </button>
        </div>

        <div className="glass-card p-6 mb-6">
          <p className="text-soft-mint/40 text-xs font-bold uppercase tracking-widest mb-2">Total Spending</p>
          <h2 className="text-3xl font-bold text-soft-mint">Rs. 45,200</h2>
          <div className="h-48 mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#68BA7F" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#68BA7F" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#ffffff40', fontSize: 10}} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0d2810', border: 'none', borderRadius: '12px', color: '#CFFFDC' }}
                  itemStyle={{ color: '#68BA7F' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#68BA7F" strokeWidth={3} fillOpacity={1} fill="url(#colorAmt)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="glass-card p-4">
            <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-2">
              <ArrowDownLeft size={16} className="text-emerald-400" />
            </div>
            <p className="text-[10px] font-bold text-soft-mint/40 uppercase tracking-widest">Income</p>
            <p className="text-lg font-bold text-soft-mint">Rs. 120k</p>
          </div>
          <div className="glass-card p-4">
            <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center mb-2">
              <ArrowUpRight size={16} className="text-red-400" />
            </div>
            <p className="text-[10px] font-bold text-soft-mint/40 uppercase tracking-widest">Expense</p>
            <p className="text-lg font-bold text-soft-mint">Rs. 45k</p>
          </div>
        </div>

        <h3 className="font-bold text-lg mb-4 text-soft-mint/80">Spending Breakdown</h3>
        <div className="space-y-4 mb-8">
          {pieData.map((item, i) => (
            <div key={i} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <div className="flex-1">
                <h4 className="font-bold text-sm text-soft-mint">{item.name}</h4>
                <div className="w-full h-1.5 bg-white/5 rounded-full mt-2 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(item.value / 1200) * 100}%`, backgroundColor: item.color }} />
                </div>
              </div>
              <p className="font-bold text-sm text-soft-mint">Rs. {item.value * 100}</p>
            </div>
          ))}
        </div>

        {/* AI Insights Section */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <Bot size={20} className="text-light-green" />
            <h3 className="font-bold text-lg text-soft-mint/80">AI Financial Insights</h3>
          </div>
          <div className="space-y-4">
            {[
              { title: 'Spending Alert', desc: 'Your food expenses are 15% higher than last week. Consider cooking at home more often.', icon: AlertCircle, color: 'text-orange-400' },
              { title: 'Savings Opportunity', desc: 'You could save Rs. 2,500 by switching to a yearly subscription for Netflix.', icon: TrendingUp, color: 'text-emerald-400' },
              { title: 'Budget Status', desc: 'You are on track to save Rs. 15,000 this month. Keep it up!', icon: CheckCircle2, color: 'text-blue-400' }
            ].map((insight, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.2 }}
                className="glass-card p-4 bg-white/5 border-white/10 flex gap-4"
              >
                <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${insight.color}`}>
                  <insight.icon size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-soft-mint">{insight.title}</h4>
                  <p className="text-xs text-soft-mint/60 mt-1 leading-relaxed">{insight.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const CardsScreen = () => {
    const [selectedCard, setSelectedCard] = useState(cards[0] || null);
    const [isFlipped, setIsFlipped] = useState(false);

    useEffect(() => {
      if (selectedCard && !cards.find(c => c.id === selectedCard.id)) {
        setSelectedCard(cards[0] || null);
      } else if (!selectedCard && cards.length > 0) {
        setSelectedCard(cards[0]);
      }
    }, [cards]);

    const cardActions = [
      { 
        icon: selectedCard?.isFrozen ? Unlock : Lock, 
        label: selectedCard?.isFrozen ? 'Unfreeze Card' : 'Freeze Card', 
        sub: selectedCard?.isFrozen ? 'Enable this card for use' : 'Temporarily disable this card', 
        color: selectedCard?.isFrozen ? 'text-emerald-400' : 'text-blue-400', 
        action: () => selectedCard && handleFreezeCard(selectedCard.id) 
      },
      { 
        icon: Settings, 
        label: 'Spending Limit', 
        sub: 'Set monthly transaction limit', 
        color: 'text-orange-400', 
        action: () => selectedCard && showToast(`Spending limit updated for card ${selectedCard.number.slice(-4)}`) 
      },
      { 
        icon: Eye, 
        label: 'View PIN', 
        sub: 'Securely reveal your card PIN', 
        color: 'text-emerald-400', 
        action: () => selectedCard && showToast(`PIN for card ${selectedCard.number.slice(-4)} is 4821`) 
      },
      { 
        icon: Trash2, 
        label: 'Remove Card', 
        sub: 'Permanently delete this card', 
        color: 'text-red-400', 
        action: () => selectedCard && handleRemoveCard(selectedCard.id) 
      },
    ];

    return (
      <div className="min-h-screen bg-deep-forest-1 pb-32 p-6 z-10 relative">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={goBack} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
            <ChevronRight size={24} className="rotate-180" />
          </button>
          <h1 className="text-2xl font-bold text-soft-mint">My Cards</h1>
          <div className="flex-1" />
          <button 
            onClick={() => setDialog({
              title: 'Add New Card',
              content: (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-soft-mint/40 uppercase tracking-widest">Card Type</p>
                    <select id="cardType" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-soft-mint">
                      <option value="VIRTUAL CARD">Virtual Card</option>
                      <option value="DEBIT CARD">Debit Card</option>
                      <option value="CREDIT CARD">Credit Card</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-soft-mint/40 uppercase tracking-widest">Card Color</p>
                    <div className="flex gap-2">
                      {['bg-forest-green', 'bg-orange-600', 'bg-indigo-600', 'bg-emerald-600', 'bg-purple-600'].map(color => (
                        <button 
                          key={color} 
                          onClick={() => (document.getElementById('cardColor') as HTMLInputElement).value = color}
                          className={`w-8 h-8 rounded-full ${color} border-2 border-transparent focus:border-white`}
                        />
                      ))}
                      <input type="hidden" id="cardColor" defaultValue="bg-forest-green" />
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      const type = (document.getElementById('cardType') as HTMLSelectElement).value;
                      const color = (document.getElementById('cardColor') as HTMLInputElement).value;
                      handleAddCard(type, color);
                      setDialog(null);
                    }}
                    className="w-full bg-forest-green text-soft-mint py-4 rounded-2xl font-bold"
                  >
                    Create Card
                  </button>
                </div>
              )
            })}
            className="w-10 h-10 glass-card !rounded-full flex items-center justify-center"
          >
            <Plus size={20} className="text-soft-mint" />
          </button>
        </div>

        {cards.length > 0 ? (
          <>
            <div className="flex gap-4 overflow-x-auto pb-8 hide-scrollbar snap-x">
              {cards.map((card, idx) => (
                <motion.div 
                  key={card.id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedCard(card);
                    setIsFlipped(false);
                  }}
                  className={`perspective-1000 min-w-[300px] h-48 snap-center cursor-pointer`}
                >
                  <motion.div 
                    animate={{ rotateY: selectedCard?.id === card.id && isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
                    className="w-full h-full relative preserve-3d"
                  >
                    {/* Front */}
                    <div className={`absolute inset-0 backface-hidden ${card.color} rounded-[32px] p-8 flex flex-col justify-between shadow-2xl transition-all ${selectedCard?.id === card.id ? 'ring-4 ring-vibrant-green/50' : 'opacity-60'} ${card.isFrozen ? 'grayscale-[0.8]' : ''}`}>
                      {card.isFrozen && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-10 rounded-[32px]">
                          <div className="bg-white/10 p-3 rounded-full border border-white/20">
                            <Lock size={32} className="text-white" />
                          </div>
                        </div>
                      )}
                      <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-12 -mt-12" />
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] font-bold opacity-60 tracking-widest uppercase">{card.type}</p>
                          <h4 className="text-sm font-bold mt-1 tracking-tighter">ZENITH BANK AI</h4>
                        </div>
                        <div className="w-12 h-8 bg-white/20 rounded-lg backdrop-blur-sm flex items-center justify-center">
                          <div className="w-6 h-6 bg-orange-500/80 rounded-full -mr-2" />
                          <div className="w-6 h-6 bg-yellow-500/80 rounded-full" />
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-[10px] opacity-60 font-bold uppercase tracking-widest">Balance</p>
                        <p className="text-2xl font-bold">Rs. {card.balance.toLocaleString()}</p>
                      </div>
                      <div className="flex justify-between items-end mt-auto">
                        <p className="text-md font-mono tracking-widest">{card.number}</p>
                        <p className="text-[10px] font-bold opacity-60">{card.expiry}</p>
                      </div>
                    </div>

                    {/* Back */}
                    <div className={`absolute inset-0 backface-hidden ${card.color} rounded-[32px] p-8 flex flex-col justify-between shadow-2xl rotate-y-180 brightness-90`}>
                      <div className="w-full h-10 bg-black/80 -mx-8 mt-4" />
                      <div className="flex justify-between items-center mt-4">
                        <div className="w-2/3 h-8 bg-white/20 rounded flex items-center px-4">
                          <p className="text-xs font-mono tracking-widest text-white/40">•••• •••• •••• ••••</p>
                        </div>
                        <div className="bg-white p-2 rounded">
                          <p className="text-xs font-bold text-black italic">482</p>
                        </div>
                      </div>
                      <p className="text-[8px] text-white/40 mt-4 leading-tight">This card is issued by Zenith Bank AI. Use is subject to terms and conditions. If found, please return to any Zenith Bank branch.</p>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>

            <div className="flex justify-center gap-2 mb-8">
              <button 
                onClick={() => setIsFlipped(!isFlipped)}
                className="bg-white/5 border border-white/10 px-6 py-2 rounded-full text-xs font-bold text-soft-mint flex items-center gap-2 active:scale-95 transition-all"
              >
                <RefreshCw size={14} className={isFlipped ? 'rotate-180 transition-transform' : ''} />
                Flip Card
              </button>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-lg text-soft-mint/80 mb-4">Card Settings</h3>
              {cardActions.map((item, i) => (
                <button 
                  key={i}
                  onClick={item.action}
                  className="w-full glass-card p-4 flex items-center gap-4 group active:scale-[0.98] transition-all"
                >
                  <div className={`w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <item.icon size={20} className={item.color} />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-bold text-sm text-soft-mint">{item.label}</h4>
                    <p className="text-[10px] text-soft-mint/40 font-bold uppercase tracking-wider">{item.sub}</p>
                  </div>
                  <ChevronRight size={18} className="text-soft-mint/20" />
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
              <CreditCard size={40} className="text-soft-mint/20" />
            </div>
            <h3 className="text-lg font-bold text-soft-mint/60">No cards found</h3>
            <p className="text-sm text-soft-mint/40 mt-2">Add a new card to get started</p>
            <button 
              onClick={() => handleAddCard('VIRTUAL CARD', 'bg-forest-green')}
              className="mt-6 bg-forest-green text-soft-mint px-8 py-3 rounded-2xl font-bold shadow-lg active:scale-95 transition-transform"
            >
              Add New Card
            </button>
          </div>
        )}
      </div>
    );
  };

  const DigitalWalletsScreen = () => {
    const [selectedWallet, setSelectedWallet] = useState<DigitalWallet | null>(null);
    const [transferAmount, setTransferAmount] = useState('');
    const [walletPhone, setWalletPhone] = useState('');
    const [walletStep, setWalletStep] = useState<'input' | 'otp' | 'stripe'>('input');
    const [walletOtp, setWalletOtp] = useState('');
    const [walletGeneratedOtp, setWalletGeneratedOtp] = useState('');

    const handleStripePayment = async () => {
      if (!transferAmount) return showToast('Enter amount', 'error');
      try {
        const res = await fetch('/api/payments/stripe/create-intent', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ amount: Number(transferAmount) }),
        });
        const { clientSecret, error } = await res.json();
        if (error) throw new Error(error);

        // In a real app, we'd use Stripe Elements here.
        // For this demo, we'll simulate a successful confirmation.
        showToast('Simulating Stripe Payment...', 'success');
        
        const confirmRes = await fetch('/api/payments/stripe/confirm', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ 
            paymentIntentId: 'pi_demo_' + Math.random().toString(36).substr(2, 9),
            amount: Number(transferAmount)
          }),
        });
        
        if (confirmRes.ok) {
          showToast('Payment Successful via Stripe', 'success');
          setDialog(null);
        } else {
          showToast('Payment failed', 'error');
        }
      } catch (err: any) {
        showToast(err.message, 'error');
      }
    };

    const handleWalletAddMoney = async () => {
      if (!walletPhone || !transferAmount) {
        showToast('Please enter phone and amount', 'error');
        return;
      }
      try {
        const response = await fetch('/api/otp/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneNumber: walletPhone }),
        });
        const data = await response.json();
        if (response.ok) {
          setWalletGeneratedOtp(data.otp);
          setWalletStep('otp');
          showToast(`OTP sent: ${data.otp}`, 'success');
        } else {
          showToast(data.error || 'Failed to send OTP', 'error');
        }
      } catch (error) {
        showToast('Failed to send OTP', 'error');
      }
    };

    const verifyWalletOtp = () => {
      if (walletOtp === walletGeneratedOtp) {
        handleWalletTransfer(selectedWallet!.id, Number(transferAmount), 'from');
        setDialog(null);
        showToast(`Payment Successful via ${selectedWallet!.name}`, 'success');
      } else {
        showToast('Invalid OTP', 'error');
      }
    };

    return (
      <div className="min-h-screen bg-deep-forest-1 pb-32">
        <div className="p-6 flex items-center gap-4 bg-deep-forest-2/50 backdrop-blur-md sticky top-0 z-30">
          <button onClick={goBack} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
            <ChevronRight size={24} className="rotate-180" />
          </button>
          <h1 className="text-2xl font-bold text-soft-mint">Digital Wallets</h1>
        </div>

        <div className="p-6 space-y-6">
          {wallets.map(wallet => (
            <div key={wallet.id} className="glass-card p-6 bg-white/5 border border-white/10 overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
              
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center p-2 shadow-lg">
                  <img src={wallet.logo} alt={wallet.name} className="w-12 h-12 object-contain" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-soft-mint">{wallet.name}</h3>
                  <p className="text-xs text-soft-mint/40 font-bold uppercase tracking-widest">{wallet.accountNumber}</p>
                </div>
                <div className="text-right">
                  {wallet.isLinked ? (
                    <>
                      <p className="text-[10px] font-bold text-soft-mint/40 uppercase tracking-widest">Balance</p>
                      <p className="text-lg font-bold text-light-green">Rs. {wallet.balance.toLocaleString()}</p>
                    </>
                  ) : (
                    <span className="text-[10px] font-bold bg-white/5 px-3 py-1 rounded-full text-soft-mint/40 uppercase tracking-widest">Not Linked</span>
                  )}
                </div>
              </div>

              <div className="mt-6 flex gap-3 relative z-10">
                <button 
                  onClick={() => {
                    setSelectedWallet(wallet);
                    setWalletStep('input');
                    setDialog({
                      title: `Add Money via ${wallet.name}`,
                      content: (
                        <div className="space-y-4">
                          {wallet.name === 'Stripe' ? (
                            <>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-light-green">Rs.</span>
                                <input 
                                  type="number" 
                                  placeholder="Enter amount"
                                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-soft-mint focus:outline-none focus:border-light-green"
                                  onChange={(e) => setTransferAmount(e.target.value)}
                                />
                              </div>
                              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                                <input type="text" placeholder="Card Number" className="w-full bg-transparent text-soft-mint focus:outline-none" />
                                <div className="flex gap-4">
                                  <input type="text" placeholder="MM/YY" className="w-1/2 bg-transparent text-soft-mint focus:outline-none" />
                                  <input type="text" placeholder="CVC" className="w-1/2 bg-transparent text-soft-mint focus:outline-none" />
                                </div>
                              </div>
                              <button 
                                onClick={handleStripePayment}
                                className="w-full bg-[#635BFF] text-white py-4 rounded-2xl font-bold shadow-xl active:scale-95 transition-transform flex items-center justify-center gap-2"
                              >
                                Pay with Stripe
                              </button>
                            </>
                          ) : walletStep === 'input' ? (
                            <>
                              <input 
                                type="tel" 
                                placeholder="Phone Number"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-soft-mint focus:outline-none focus:border-light-green"
                                onChange={(e) => setWalletPhone(e.target.value)}
                              />
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-light-green">Rs.</span>
                                <input 
                                  type="number" 
                                  placeholder="Enter amount"
                                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-soft-mint focus:outline-none focus:border-light-green"
                                  onChange={(e) => setTransferAmount(e.target.value)}
                                />
                              </div>
                              <button 
                                onClick={handleWalletAddMoney}
                                className="w-full bg-forest-green text-soft-mint py-4 rounded-2xl font-bold shadow-xl active:scale-95 transition-transform"
                              >
                                Continue
                              </button>
                            </>
                          ) : (
                            <>
                              <p className="text-center text-soft-mint/60">Enter the 6-digit OTP sent to {walletPhone}</p>
                              <input 
                                type="text" 
                                maxLength={6}
                                placeholder="000000"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 text-center text-2xl font-bold text-soft-mint tracking-[1em] focus:outline-none focus:border-light-green"
                                onChange={(e) => setWalletOtp(e.target.value)}
                              />
                              <button 
                                onClick={verifyWalletOtp}
                                className="w-full bg-forest-green text-soft-mint py-4 rounded-2xl font-bold shadow-xl active:scale-95 transition-transform"
                              >
                                Verify & Add Money
                              </button>
                            </>
                          )}
                        </div>
                      )
                    });
                  }}
                  className="flex-1 bg-forest-green text-soft-mint py-3 rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-transform"
                >
                  Add Money
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6">
          <div className="glass-card p-6 bg-gradient-to-br from-light-green/10 to-transparent border border-light-green/20">
            <div className="flex items-center gap-3 text-light-green mb-2">
              <Shield size={20} />
              <h4 className="font-bold">Secure Integration</h4>
            </div>
            <p className="text-xs text-soft-mint/60 leading-relaxed">
              All digital wallet integrations are secured with 256-bit encryption. Transfers are processed instantly via 1Link and RAAST networks.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const SavingJarsScreen = () => {
    const [jarAmount, setJarAmount] = useState('');
    
    return (
      <div className="min-h-screen bg-deep-forest-1 pb-32">
        <div className="p-6 flex items-center justify-between bg-deep-forest-2/50 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={goBack} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
              <ChevronRight size={24} className="rotate-180" />
            </button>
            <h1 className="text-2xl font-bold text-soft-mint">Saving Jars</h1>
          </div>
          <button 
            onClick={() => setDialog({
              title: 'Create New Jar',
              content: (
                <div className="space-y-4">
                  <input type="text" placeholder="Jar Name (e.g. New Bike)" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-soft-mint" id="jarName" />
                  <input type="number" placeholder="Target Amount" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-soft-mint" id="jarTarget" />
                  <input type="date" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-soft-mint" id="jarDeadline" />
                  <button 
                    onClick={() => {
                      const name = (document.getElementById('jarName') as HTMLInputElement).value;
                      const target = Number((document.getElementById('jarTarget') as HTMLInputElement).value);
                      const deadline = (document.getElementById('jarDeadline') as HTMLInputElement).value;
                      handleAddJar(name, target, deadline, 'other');
                    }}
                    className="w-full bg-forest-green text-soft-mint py-4 rounded-2xl font-bold"
                  >
                    Create Jar
                  </button>
                </div>
              )
            })}
            className="w-10 h-10 bg-forest-green text-soft-mint rounded-full flex items-center justify-center shadow-lg"
          >
            <Plus size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="glass-card p-6 bg-indigo-600/10 border-indigo-600/20">
            <div className="flex items-center gap-3 text-indigo-400 mb-2">
              <Bot size={20} />
              <h4 className="font-bold">AI Savings Tip</h4>
            </div>
            <p className="text-sm text-soft-mint/70">
              Based on your spending, you can save **Rs. 450/day** to reach your iPhone goal by December!
            </p>
          </div>

          {jars.map(jar => {
            const progress = (jar.currentAmount / jar.targetAmount) * 100;
            return (
              <div key={jar.id} className="glass-card p-6 bg-white/5 border border-white/10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-soft-mint">{jar.name}</h3>
                    <p className="text-xs text-soft-mint/40 mt-1 uppercase tracking-widest">Target: Rs. {jar.targetAmount.toLocaleString()}</p>
                  </div>
                  <div className={`w-10 h-10 ${jar.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <Repeat size={20} className="text-white" />
                  </div>
                </div>

                <div className="space-y-3 relative z-10">
                  <div className="flex justify-between items-end">
                    <p className="text-2xl font-bold text-soft-mint">Rs. {jar.currentAmount.toLocaleString()}</p>
                    <p className="text-xs font-bold text-light-green">{Math.round(progress)}% Reached</p>
                  </div>
                  <div className="h-3 bg-white/5 rounded-full overflow-hidden relative">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className={`h-full ${jar.color} rounded-full shadow-[0_0_15px_rgba(255,255,255,0.2)]`}
                    />
                  </div>
                  
                  {/* Milestones */}
                  <div className="flex justify-between px-1">
                    {[25, 50, 75].map(m => (
                      <div key={m} className="flex flex-col items-center gap-1">
                        <div className={`w-1 h-1 rounded-full ${progress >= m ? 'bg-light-green' : 'bg-white/10'}`} />
                        <span className={`text-[8px] font-bold uppercase ${progress >= m ? 'text-light-green' : 'text-white/20'}`}>{m}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                  <div className="mt-6 flex gap-3">
                    <button 
                      onClick={() => setDialog({
                        title: `Add to ${jar.name}`,
                        content: (
                          <div className="space-y-4">
                            <input 
                              type="number" 
                              placeholder="Amount to save" 
                              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-soft-mint"
                              onChange={(e) => setJarAmount(e.target.value)}
                            />
                            <button 
                              onClick={() => handleAddToJar(jar.id, Number(jarAmount))}
                              className="w-full bg-forest-green text-soft-mint py-4 rounded-2xl font-bold"
                            >
                              Add Funds
                            </button>
                          </div>
                        )
                      })}
                      className="flex-1 bg-white/5 text-soft-mint py-3 rounded-xl font-bold text-sm border border-white/10 active:scale-95 transition-transform"
                    >
                      Add Funds
                    </button>
                    <button 
                      onClick={() => setDialog({
                        title: `${jar.name} Settings`,
                        content: (
                          <div className="space-y-4">
                            <button 
                              onClick={() => {
                                setJars(jars.filter(j => j.id !== jar.id));
                                showToast(`Jar "${jar.name}" deleted`);
                                setDialog(null);
                              }}
                              className="w-full bg-red-500/10 text-red-500 py-4 rounded-2xl font-bold border border-red-500/20"
                            >
                              Delete Jar
                            </button>
                            <button 
                              onClick={() => {
                                handleJarTransaction(jar.id, jar.currentAmount, 'withdraw');
                                setDialog(null);
                              }}
                              className="w-full bg-white/5 text-soft-mint py-4 rounded-2xl font-bold border border-white/10"
                            >
                              Withdraw All Funds
                            </button>
                          </div>
                        )
                      })}
                      className="flex-1 bg-white/5 text-soft-mint py-3 rounded-xl font-bold text-sm border border-white/10 active:scale-95 transition-transform"
                    >
                      Settings
                    </button>
                  </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const SocialScreen = () => {
    return (
      <div className="min-h-screen bg-deep-forest-1 pb-32">
        <div className="p-6 flex items-center justify-between bg-deep-forest-2/50 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={goBack} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
              <ChevronRight size={24} className="rotate-180" />
            </button>
            <h1 className="text-2xl font-bold text-soft-mint">Social</h1>
          </div>
          <button 
            onClick={() => setScreen('search')}
            className="w-10 h-10 glass-card !rounded-full flex items-center justify-center active:scale-90 transition-all"
          >
            <Search size={20} className="text-soft-mint/80" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Split Requests */}
          <div>
            <h3 className="text-[10px] font-bold text-soft-mint/40 uppercase tracking-[0.2em] mb-4">Pending Splits</h3>
            <div className="space-y-4">
              {splits.filter(s => s.status === 'pending').map(split => (
                <div key={split.id} className="glass-card p-4 bg-white/5 border border-white/10 flex items-center gap-4">
                  <div className="w-12 h-12 bg-pink-500/20 rounded-full flex items-center justify-center text-pink-400 font-bold">
                    {split.from[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-soft-mint">{split.from}</p>
                    <p className="text-xs text-soft-mint/40">Requested a split</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-light-green">Rs. {split.amount.toLocaleString()}</p>
                    <button 
                      onClick={() => {
                        handleSettleSplit(split.id, split.amount, split.from);
                      }}
                      className="mt-2 text-[10px] font-bold bg-forest-green text-soft-mint px-3 py-1 rounded-full uppercase tracking-widest active:scale-90 transition-transform"
                    >
                      Pay
                    </button>
                  </div>
                </div>
              ))}
              {splits.filter(s => s.status === 'pending').length === 0 && (
                <p className="text-center text-xs text-soft-mint/20 py-4 italic">No pending split requests</p>
              )}
            </div>
          </div>

          {/* Friends List */}
          <div>
            <h3 className="text-[10px] font-bold text-soft-mint/40 uppercase tracking-[0.2em] mb-4">Quick Split</h3>
            <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
              {['Ahmed', 'Sara', 'Zain', 'Dania', 'Bilal'].map((name, i) => (
                <motion.button 
                  key={i} 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setDialog({
                    title: `Split with ${name}`,
                    content: (
                      <div className="space-y-4">
                        <p className="text-sm text-soft-mint/60">Enter the amount you want to split with {name}.</p>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-light-green">Rs.</span>
                          <input type="number" placeholder="0.00" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-soft-mint" id="splitAmt" />
                        </div>
                        <button 
                          onClick={async () => {
                            const amt = Number((document.getElementById('splitAmt') as HTMLInputElement).value);
                            if (amt > 0 && user) {
                              const userPath = `users/${user.uid}`;
                              const newSplit = {
                                transactionId: 'manual',
                                amount: amt,
                                from: name,
                                status: 'pending',
                                timestamp: Timestamp.now()
                              };
                              await addDoc(collection(db, userPath, 'splits'), newSplit);
                              showToast(`Split request sent to ${name}`);
                              setDialog(null);
                            }
                          }}
                          className="w-full bg-forest-green text-soft-mint py-4 rounded-2xl font-bold"
                        >
                          Send Request
                        </button>
                      </div>
                    )
                  })}
                  className="flex flex-col items-center gap-2 min-w-[70px]"
                >
                  <div className="w-14 h-14 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center text-soft-mint font-bold text-xl">
                    {name[0]}
                  </div>
                  <span className="text-[10px] font-bold text-soft-mint/60">{name}</span>
                </motion.button>
              ))}
              <button 
                onClick={() => setDialog({
                  title: 'Add Friend',
                  content: (
                    <div className="space-y-4">
                      <input type="text" placeholder="Friend's Name" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-soft-mint" id="friendName" />
                      <input type="text" placeholder="Account Number / Phone" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-soft-mint" id="friendAcc" />
                      <button 
                        onClick={() => {
                          const name = (document.getElementById('friendName') as HTMLInputElement).value;
                          if (name) handleAddFriend(name);
                        }}
                        className="w-full bg-forest-green text-soft-mint py-4 rounded-2xl font-bold"
                      >
                        Add Friend
                      </button>
                    </div>
                  )
                })}
                className="flex flex-col items-center gap-2 min-w-[70px]"
              >
                <div className="w-14 h-14 bg-white/5 rounded-2xl border border-dashed border-white/20 flex items-center justify-center text-soft-mint/40">
                  <Plus size={24} />
                </div>
                <span className="text-[10px] font-bold text-soft-mint/40">Add</span>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h3 className="text-[10px] font-bold text-soft-mint/40 uppercase tracking-[0.2em] mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {splits.filter(s => s.status === 'settled').map(split => (
                <div key={split.id} className="flex items-center gap-4 opacity-60">
                  <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-soft-mint/40 text-xs font-bold">
                    {split.from[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-soft-mint">You settled a split with **{split.from}**</p>
                    <p className="text-[10px] text-soft-mint/40 mt-0.5">{split.timestamp.toLocaleDateString()}</p>
                  </div>
                  <p className="text-xs font-bold text-soft-mint/40">Rs. {split.amount.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Group Wallets */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[10px] font-bold text-soft-mint/40 uppercase tracking-[0.2em]">Group Wallets</h3>
              <button 
                onClick={() => {
                  let members: { name: string; accountNumber: string }[] = [];
                  setDialog({
                    title: 'Create Group Wallet',
                    content: (
                      <div className="space-y-4">
                        <input type="text" placeholder="Group Name" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-soft-mint" id="groupName" />
                        <input type="number" placeholder="Target Goal (Optional)" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-soft-mint" id="groupGoal" />
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-soft-mint/40 uppercase tracking-widest">Add Members</p>
                          <div className="flex gap-2">
                            <input type="text" placeholder="Name" className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs text-soft-mint" id="memberName" />
                            <input type="text" placeholder="A/C #" className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs text-soft-mint" id="memberAccount" />
                            <button 
                              onClick={() => {
                                const name = (document.getElementById('memberName') as HTMLInputElement).value;
                                const account = (document.getElementById('memberAccount') as HTMLInputElement).value;
                                if (name && account) {
                                  members.push({ name, accountNumber: account });
                                  showToast(`Added ${name}`);
                                  (document.getElementById('memberName') as HTMLInputElement).value = '';
                                  (document.getElementById('memberAccount') as HTMLInputElement).value = '';
                                }
                              }}
                              className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-light-green"
                            >
                              <Plus size={20} />
                            </button>
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            const name = (document.getElementById('groupName') as HTMLInputElement).value;
                            const goal = Number((document.getElementById('groupGoal') as HTMLInputElement).value);
                            handleCreateGroupWallet(name, goal, members);
                          }}
                          className="w-full bg-forest-green text-soft-mint py-4 rounded-2xl font-bold"
                        >
                          Create Group
                        </button>
                      </div>
                    )
                  });
                }}
                className="text-light-green text-[10px] font-bold uppercase tracking-widest"
              >
                + New Group
              </button>
            </div>
            <div className="space-y-4">
              {groupWallets.map(group => (
                <div key={group.id} className="glass-card p-6 bg-white/5 border border-white/10">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-soft-mint">{group.name}</h4>
                      <p className="text-[10px] text-soft-mint/40 mt-1 uppercase tracking-widest">{group.members.length} Members</p>
                    </div>
                    <div className={`w-10 h-10 ${group.color} rounded-xl flex items-center justify-center shadow-lg`}>
                      <UserIcon size={20} className="text-white" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-light-green">Rs. {group.balance.toLocaleString()}</span>
                      {group.goal && <span className="text-soft-mint/40">Goal: Rs. {group.goal.toLocaleString()}</span>}
                    </div>
                    {group.goal && (
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(group.balance / group.goal) * 100}%` }}
                          className={`h-full ${group.color}`}
                        />
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button 
                      onClick={() => setDialog({
                        title: `Contribute to ${group.name}`,
                        content: (
                          <div className="space-y-4">
                            <input type="number" placeholder="Amount" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-soft-mint" id="contributeAmount" />
                            <button 
                              onClick={() => {
                                const amount = Number((document.getElementById('contributeAmount') as HTMLInputElement).value);
                                handleContributeToGroup(group.id, amount);
                              }}
                              className="w-full bg-forest-green text-soft-mint py-4 rounded-2xl font-bold"
                            >
                              Contribute
                            </button>
                          </div>
                        )
                      })}
                      className="flex-1 bg-white/5 text-soft-mint py-3 rounded-xl font-bold text-sm border border-white/10 active:scale-95 transition-transform"
                    >
                      Contribute
                    </button>
                    <button 
                      onClick={() => navigateTo('chat')}
                      className="flex-1 bg-white/5 text-soft-mint py-3 rounded-xl font-bold text-sm border border-white/10 active:scale-95 transition-transform"
                    >
                      Chat
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SadaqahScreen = ({ isSubComponent }: { isSubComponent?: boolean; key?: string }) => {
    const [donateAmount, setDonateAmount] = useState('');
    return (
      <div className={`min-h-screen bg-deep-forest-1 pb-32 ${isSubComponent ? 'min-h-0 pb-0' : ''}`}>
        {!isSubComponent && (
          <div className="p-6 bg-deep-forest-2/50 backdrop-blur-md sticky top-0 z-30">
            <div className="flex items-center gap-4 mb-6">
              <button onClick={goBack} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
                <ChevronRight size={24} className="rotate-180" />
              </button>
              <h1 className="text-2xl font-bold text-soft-mint">Sadaqah</h1>
            </div>
          </div>
        )}

        <div className={`${isSubComponent ? '' : 'p-6'} space-y-6`}>
          <div className="glass-card p-6 bg-emerald-600/10 border-emerald-600/20">
            <h3 className="text-lg font-bold text-emerald-400 mb-2">One-Tap Sadaqah</h3>
            <p className="text-sm text-soft-mint/60">Support verified NGOs across Pakistan instantly and securely.</p>
          </div>

          <div className="space-y-4">
            {NGOS.map(ngo => (
              <div key={ngo.id} className="glass-card p-6 bg-white/5 border border-white/10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center p-2">
                    <img src={ngo.logo} alt={ngo.name} className="w-12 h-12 object-contain" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-soft-mint">{ngo.name}</h4>
                    <p className="text-[10px] text-light-green font-bold uppercase tracking-widest">{ngo.category}</p>
                  </div>
                </div>
                <p className="text-xs text-soft-mint/60 mb-6 leading-relaxed">{ngo.description}</p>
                <button 
                  onClick={() => setDialog({
                    title: `Donate to ${ngo.name}`,
                    content: (
                      <div className="space-y-4">
                        <input 
                          type="number" 
                          placeholder="Amount (Rs.)" 
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-soft-mint"
                          onChange={(e) => setDonateAmount(e.target.value)}
                        />
                        <button 
                          onClick={() => handleDonate(ngo.id, Number(donateAmount))}
                          className="w-full bg-forest-green text-soft-mint py-4 rounded-2xl font-bold"
                        >
                          Confirm Donation
                        </button>
                      </div>
                    )
                  })}
                  className="w-full bg-white/5 text-soft-mint py-3 rounded-xl font-bold text-sm border border-white/10"
                >
                  Donate Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const HalalInvestScreen = ({ isSubComponent }: { isSubComponent?: boolean; key?: string }) => {
    const [donateAmount, setDonateAmount] = useState('');
    return (
      <div className={`min-h-screen bg-deep-forest-1 pb-32 ${isSubComponent ? 'min-h-0 pb-0' : ''}`}>
        {!isSubComponent && (
          <div className="p-6 bg-deep-forest-2/50 backdrop-blur-md sticky top-0 z-30">
            <div className="flex items-center gap-4 mb-6">
              <button onClick={goBack} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
                <ChevronRight size={24} className="rotate-180" />
              </button>
              <h1 className="text-2xl font-bold text-soft-mint">Halal Invest</h1>
            </div>
          </div>
        )}

        <div className={`${isSubComponent ? '' : 'p-6'} space-y-6`}>
          <div className="glass-card p-6 bg-indigo-600/10 border-indigo-600/20">
            <h3 className="text-lg font-bold text-indigo-400 mb-2">Halal Investments</h3>
            <p className="text-sm text-soft-mint/60">Grow your wealth with Shariah-compliant mutual funds and stocks.</p>
          </div>

          <div className="space-y-4">
            {INVESTMENT_FUNDS.map(fund => (
              <div key={fund.id} className="glass-card p-6 bg-white/5 border border-white/10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-soft-mint">{fund.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${fund.risk === 'Low' ? 'bg-emerald-500/20 text-emerald-400' : fund.risk === 'Medium' ? 'bg-orange-500/20 text-orange-400' : 'bg-red-500/20 text-red-400'}`}>
                        {fund.risk} Risk
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-soft-mint/40 uppercase tracking-widest">Est. Return</p>
                    <p className="text-lg font-bold text-light-green">{fund.returnRate}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-6">
                  <p className="text-[10px] text-soft-mint/40">Min. Investment: Rs. {fund.minInvestment.toLocaleString()}</p>
                  <button 
                    onClick={() => setDialog({
                      title: `Invest in ${fund.name}`,
                      content: (
                        <div className="space-y-4">
                          <input 
                            type="number" 
                            placeholder="Investment Amount" 
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-soft-mint"
                            onChange={(e) => setDonateAmount(e.target.value)}
                          />
                          <button 
                            onClick={() => handleInvest(fund.id, Number(donateAmount))}
                            className="w-full bg-forest-green text-soft-mint py-4 rounded-2xl font-bold"
                          >
                            Invest Now
                          </button>
                        </div>
                      )
                    })}
                    className="bg-forest-green text-soft-mint px-6 py-2 rounded-xl font-bold text-xs"
                  >
                    Invest
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const IslamicHubScreen = ({ initialTab = 'zakat' }: { initialTab?: 'zakat' | 'sadaqah' | 'invest' | 'prayers' | 'qibla' | 'quran'; key?: string }) => {
    const [tab, setTab] = useState(initialTab);
    const [donateAmount, setDonateAmount] = useState('');

    return (
      <div className="min-h-screen bg-deep-forest-1 pb-32">
        <div className="p-6 bg-deep-forest-2/50 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={goBack} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
              <ChevronRight size={24} className="rotate-180" />
            </button>
            <h1 className="text-2xl font-bold text-soft-mint">Islamic Hub</h1>
          </div>
          
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 overflow-x-auto hide-scrollbar">
            {[
              { id: 'zakat', label: 'Zakat' },
              { id: 'sadaqah', label: 'Sadaqah' },
              { id: 'invest', label: 'Invest' },
              { id: 'prayers', label: 'Prayers' },
              { id: 'qibla', label: 'Qibla' },
              { id: 'quran', label: 'Quran' },
            ].map(t => (
              <button 
                key={t.id}
                onClick={() => setTab(t.id as any)}
                className={`flex-1 min-w-[80px] py-3 rounded-xl text-xs font-bold transition-all ${tab === t.id ? 'bg-forest-green text-soft-mint shadow-lg' : 'text-soft-mint/40'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {tab === 'zakat' && <ZakatCalculatorScreen isSubComponent />}
          {tab === 'prayers' && <PrayerTimesScreen isSubComponent />}
          {tab === 'qibla' && <QiblaScreen isSubComponent />}
          {tab === 'quran' && <QuranScreen isSubComponent />}
          {tab === 'sadaqah' && <SadaqahScreen isSubComponent />}
          {tab === 'invest' && <HalalInvestScreen isSubComponent />}
        </div>
      </div>
    );
  };

  const PrayerTimesScreen = ({ isSubComponent }: { isSubComponent?: boolean; key?: string }) => {
    const prayerTimes = [
      { name: 'Fajr', time: '04:45 AM', status: 'Passed' },
      { name: 'Sunrise', time: '06:12 AM', status: 'Passed' },
      { name: 'Dhuhr', time: '12:30 PM', status: 'Current' },
      { name: 'Asr', time: '04:15 PM', status: 'Upcoming' },
      { name: 'Maghrib', time: '06:45 PM', status: 'Upcoming' },
      { name: 'Isha', time: '08:15 PM', status: 'Upcoming' },
    ];

    return (
      <div className={`min-h-screen bg-deep-forest-1 pb-32 ${isSubComponent ? 'min-h-0 pb-0' : ''}`}>
        {!isSubComponent && (
          <div className="p-6 bg-deep-forest-2/50 backdrop-blur-md sticky top-0 z-30">
            <div className="flex items-center gap-4 mb-6">
              <button onClick={goBack} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
                <ChevronRight size={24} className="rotate-180" />
              </button>
              <h1 className="text-2xl font-bold text-soft-mint">Prayer Times</h1>
            </div>
            <div className="glass-card p-6 bg-emerald-600/10 border-emerald-600/20 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Next Prayer</p>
                <h2 className="text-2xl font-bold text-soft-mint mt-1">Asr</h2>
                <p className="text-xs text-soft-mint/60 mt-1">In 3 hours 45 mins</p>
              </div>
              <div className="text-right">
                <Clock size={40} className="text-emerald-400 opacity-20" />
              </div>
            </div>
          </div>
        )}

        {isSubComponent && (
          <div className="glass-card p-6 bg-emerald-600/10 border-emerald-600/20 flex justify-between items-center mb-6">
            <div>
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Next Prayer</p>
              <h2 className="text-2xl font-bold text-soft-mint mt-1">Asr</h2>
              <p className="text-xs text-soft-mint/60 mt-1">In 3 hours 45 mins</p>
            </div>
            <div className="text-right">
              <Clock size={40} className="text-emerald-400 opacity-20" />
            </div>
          </div>
        )}

        <div className={`${isSubComponent ? '' : 'p-6'} space-y-4`}>
          {prayerTimes.map((prayer, idx) => (
            <div 
              key={idx}
              className={`glass-card p-4 flex justify-between items-center border ${prayer.status === 'Current' ? 'bg-emerald-600/20 border-emerald-600/40' : 'bg-white/5 border-white/5'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${prayer.status === 'Current' ? 'bg-emerald-400 text-deep-forest-1' : 'bg-white/5 text-soft-mint/40'}`}>
                  <Clock size={20} />
                </div>
                <div>
                  <p className="font-bold text-soft-mint">{prayer.name}</p>
                  <p className="text-[10px] text-soft-mint/40 uppercase tracking-widest">{prayer.status}</p>
                </div>
              </div>
              <p className={`text-lg font-bold ${prayer.status === 'Current' ? 'text-emerald-400' : 'text-soft-mint'}`}>{prayer.time}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const QiblaScreen = ({ isSubComponent }: { isSubComponent?: boolean; key?: string }) => {
    return (
      <div className={`min-h-screen bg-deep-forest-1 pb-32 ${isSubComponent ? 'min-h-0 pb-0' : ''}`}>
        {!isSubComponent && (
          <div className="p-6 bg-deep-forest-2/50 backdrop-blur-md sticky top-0 z-30">
            <div className="flex items-center gap-4 mb-6">
              <button onClick={goBack} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
                <ChevronRight size={24} className="rotate-180" />
              </button>
              <h1 className="text-2xl font-bold text-soft-mint">Qibla Finder</h1>
            </div>
          </div>
        )}

        <div className={`flex flex-col items-center justify-center ${isSubComponent ? '' : 'p-6 mt-12'}`}>
          <div className="relative w-72 h-72">
            <div className="absolute inset-0 border-4 border-white/5 rounded-full" />
            <div className="absolute inset-4 border-2 border-white/10 rounded-full border-dashed" />
            
            {/* Compass Rose */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-full relative animate-[spin_10s_linear_infinite] opacity-20">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 text-soft-mint font-bold">N</div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-soft-mint font-bold">S</div>
                <div className="absolute left-0 top-1/2 -translate-y-1/2 text-soft-mint font-bold">W</div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 text-soft-mint font-bold">E</div>
              </div>
            </div>

            {/* Qibla Needle */}
            <motion.div 
              animate={{ rotate: 265 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="relative w-1 h-48 bg-gradient-to-b from-rose-500 to-transparent rounded-full">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-rose-500">
                  <Compass size={32} />
                </div>
              </div>
            </motion.div>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 bg-soft-mint rounded-full shadow-[0_0_20px_rgba(255,255,255,0.5)]" />
            </div>
          </div>

          <div className="mt-16 text-center">
            <p className="text-4xl font-bold text-soft-mint">265°</p>
            <p className="text-sm text-soft-mint/60 mt-2 uppercase tracking-widest font-bold">Degrees from North</p>
            <div className="mt-8 glass-card p-4 bg-rose-500/10 border-rose-500/20">
              <p className="text-xs text-rose-400 font-bold">Rotate your phone to align with the red needle</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const QuranScreen = ({ isSubComponent }: { isSubComponent?: boolean; key?: string }) => {
    const surahs = [
      { id: 1, name: 'Al-Fatihah', meaning: 'The Opening', verses: 7, type: 'Meccan' },
      { id: 2, name: 'Al-Baqarah', meaning: 'The Cow', verses: 286, type: 'Medinan' },
      { id: 3, name: 'Ali \'Imran', meaning: 'Family of Imran', verses: 200, type: 'Medinan' },
      { id: 4, name: 'An-Nisa', meaning: 'The Women', verses: 176, type: 'Medinan' },
      { id: 5, name: 'Al-Ma\'idah', meaning: 'The Table Spread', verses: 120, type: 'Medinan' },
    ];

    return (
      <div className={`min-h-screen bg-deep-forest-1 pb-32 ${isSubComponent ? 'min-h-0 pb-0' : ''}`}>
        {!isSubComponent && (
          <div className="p-6 bg-deep-forest-2/50 backdrop-blur-md sticky top-0 z-30">
            <div className="flex items-center gap-4 mb-6">
              <button onClick={goBack} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
                <ChevronRight size={24} className="rotate-180" />
              </button>
              <h1 className="text-2xl font-bold text-soft-mint">Holy Quran</h1>
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-soft-mint/40" size={20} />
              <input 
                type="text" 
                placeholder="Search Surah..." 
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-soft-mint focus:outline-none focus:border-forest-green transition-colors"
              />
            </div>
          </div>
        )}

        {isSubComponent && (
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-soft-mint/40" size={20} />
            <input 
              type="text" 
              placeholder="Search Surah..." 
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-soft-mint focus:outline-none focus:border-forest-green transition-colors"
            />
          </div>
        )}

        <div className={`${isSubComponent ? '' : 'p-6'} space-y-4`}>
          {surahs.map((surah) => (
            <button 
              key={surah.id}
              className="w-full glass-card p-4 flex items-center gap-4 bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-left group"
            >
              <div className="w-12 h-12 bg-forest-green/20 rounded-2xl flex items-center justify-center text-light-green font-bold group-hover:bg-forest-green group-hover:text-soft-mint transition-colors">
                {surah.id}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-soft-mint">{surah.name}</h4>
                <p className="text-[10px] text-soft-mint/40 uppercase tracking-widest">{surah.meaning}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-soft-mint/60">{surah.verses} Verses</p>
                <p className="text-[10px] text-soft-mint/20 uppercase tracking-widest mt-1">{surah.type}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const NotificationsScreen = () => {
    return (
      <div className="min-h-screen bg-deep-forest-1 pb-32">
        <div className="p-6 flex items-center justify-between bg-deep-forest-2/50 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={goBack} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
              <ChevronRight size={24} className="rotate-180" />
            </button>
            <h1 className="text-2xl font-bold text-soft-mint">Notifications</h1>
          </div>
          <button 
            onClick={() => {
              handleMarkAsRead();
            }}
            className="text-[10px] font-bold text-light-green uppercase tracking-widest"
          >
            Mark all read
          </button>
        </div>

        <div className="p-6 space-y-4">
          {notifications.map(notif => (
            <div 
              key={notif.id} 
              className={`glass-card p-5 border flex gap-4 transition-all ${notif.isRead ? 'bg-white/5 border-white/5 opacity-60' : 'bg-white/10 border-light-green/20 shadow-lg'}`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                notif.type === 'transaction' ? 'bg-emerald-500/20 text-emerald-400' :
                notif.type === 'split' ? 'bg-pink-500/20 text-pink-400' :
                notif.type === 'security' ? 'bg-red-500/20 text-red-400' :
                'bg-blue-500/20 text-blue-400'
              }`}>
                {notif.type === 'transaction' ? <ArrowDownLeft size={20} /> :
                 notif.type === 'split' ? <Users size={20} /> :
                 notif.type === 'security' ? <Shield size={20} /> :
                 <Bell size={20} />}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-soft-mint text-sm">{notif.title}</h4>
                  <span className="text-[9px] font-bold text-soft-mint/30 uppercase tracking-widest">{notif.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-xs text-soft-mint/60 mt-1 leading-relaxed">{notif.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const ProfileScreen = () => {
    return (
      <div className="min-h-screen bg-deep-forest-1 pb-32">
        <div className="p-6 flex items-center gap-4 bg-deep-forest-2/50 backdrop-blur-md sticky top-0 z-30">
          <button onClick={goBack} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
            <ChevronRight size={24} className="rotate-180" />
          </button>
          <h1 className="text-2xl font-bold text-soft-mint">Profile Settings</h1>
        </div>
        <div className="lush-gradient p-10 pt-16 rounded-b-[60px] flex flex-col items-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
          <div className="relative">
            <div className="w-32 h-32 bg-forest-green rounded-[40px] flex items-center justify-center text-soft-mint text-4xl font-bold shadow-2xl border-4 border-white/10 relative z-10 overflow-hidden">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                user?.displayName?.split(' ').map(n => n[0]).join('') || 'MA'
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center border-4 border-deep-forest-1 z-20 shadow-lg">
              <Camera size={18} className="text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-soft-mint mt-6">{user?.displayName || 'Manan Ahmad'}</h2>
          <p className="text-soft-mint/60 text-sm font-medium mt-1">{user?.email || 'Premium Zenith Member • Since 2024'}</p>
          
          <div className="flex gap-4 mt-8">
            <div className="glass-card px-6 py-3 flex flex-col items-center">
              <p className="text-[10px] font-bold text-soft-mint/40 uppercase tracking-widest">Rewards</p>
              <p className="text-lg font-bold text-emerald-400">2,450 pts</p>
            </div>
            <div className="glass-card px-6 py-3 flex flex-col items-center">
              <p className="text-[10px] font-bold text-soft-mint/40 uppercase tracking-widest">Tier</p>
              <p className="text-lg font-bold text-emerald-400">Gold</p>
            </div>
          </div>
        </div>

        <div className="px-6 mt-8 space-y-4">
          <h3 className="font-bold text-lg text-soft-mint/80 mb-4">Account Settings</h3>
          {[
            { icon: UserIcon, label: 'Personal Information', sub: 'Name, Email, Phone', color: 'text-blue-400', action: () => setDialog({
              title: 'Personal Information',
              content: (
                <div className="space-y-4">
                  <div className="bg-white/5 p-4 rounded-2xl">
                    <p className="text-[10px] font-bold text-soft-mint/40 uppercase tracking-widest">Full Name</p>
                    <input id="editName" defaultValue={user?.displayName || ''} className="bg-transparent border-none text-soft-mint font-bold w-full focus:outline-none" />
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl">
                    <p className="text-[10px] font-bold text-soft-mint/40 uppercase tracking-widest">Email Address</p>
                    <input id="editEmail" defaultValue={user?.email || ''} className="bg-transparent border-none text-soft-mint font-bold w-full focus:outline-none" />
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl">
                    <p className="text-[10px] font-bold text-soft-mint/40 uppercase tracking-widest">Phone Number</p>
                    <p className="text-soft-mint font-bold">{userProfile?.phoneNumber || '+92 321 4567890'}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl">
                    <p className="text-[10px] font-bold text-soft-mint/40 uppercase tracking-widest">CNIC</p>
                    <p className="text-soft-mint font-bold">{userProfile?.cnic || '42101-1234567-1'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-2xl">
                      <p className="text-[10px] font-bold text-soft-mint/40 uppercase tracking-widest">Date of Birth</p>
                      <p className="text-soft-mint font-bold">{userProfile?.dob || '1995-01-01'}</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl">
                      <p className="text-[10px] font-bold text-soft-mint/40 uppercase tracking-widest">Gender</p>
                      <p className="text-soft-mint font-bold">{userProfile?.gender || 'Male'}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      const name = (document.getElementById('editName') as HTMLInputElement).value;
                      const email = (document.getElementById('editEmail') as HTMLInputElement).value;
                      handleUpdateProfile({ displayName: name, email: email });
                      setDialog(null);
                    }} 
                    className="w-full bg-forest-green text-soft-mint py-4 rounded-2xl font-bold"
                  >
                    Save Changes
                  </button>
                </div>
              )
            }) },
            { icon: Shield, label: 'Security & Privacy', sub: 'Face ID, PIN, Password', color: 'text-emerald-400', action: () => setDialog({
              title: 'Security Settings',
              content: (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl">
                    <span className="text-soft-mint font-bold">Face ID Login</span>
                    <div className="w-12 h-6 bg-emerald-500 rounded-full relative"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" /></div>
                  </div>
                  <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl">
                    <span className="text-soft-mint font-bold">2-Factor Auth</span>
                    <div className="w-12 h-6 bg-white/10 rounded-full relative"><div className="absolute left-1 top-1 w-4 h-4 bg-white/40 rounded-full" /></div>
                  </div>
                  <button onClick={() => showToast('PIN change requested')} className="w-full bg-white/5 border border-white/10 text-soft-mint py-4 rounded-2xl font-bold">Change App PIN</button>
                </div>
              )
            }) },
            { icon: Bell, label: 'Notifications', sub: 'Alerts, Emails, SMS', color: 'text-orange-400', action: () => navigateTo('notifications') },
            { icon: Globe, label: 'Language', sub: 'English, Urdu', color: 'text-purple-400', action: () => showToast('Language changed to English') },
            { icon: HelpCircle, label: 'Help & Support', sub: 'FAQs, Contact Us', color: 'text-cyan-400', action: () => showToast('Connecting to support...') },
            { icon: RefreshCw, label: 'Sync Default Data', sub: 'Add missing initial cards & wallets', color: 'text-emerald-400', action: handleSyncDefaults },
            { icon: LogOut, label: 'Logout', sub: 'Sign out of your account', color: 'text-red-400', action: handleLogout },
          ].map((item, i) => (
            <button 
              key={i}
              onClick={item.action || (() => showToast(`${item.label} settings`))}
              className="w-full glass-card p-4 flex items-center gap-4 group active:scale-[0.98] transition-all"
            >
              <div className={`w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <item.icon size={20} className={item.color} />
              </div>
              <div className="flex-1 text-left">
                <h4 className="font-bold text-sm text-soft-mint">{item.label}</h4>
                <p className="text-[10px] text-soft-mint/40 font-bold uppercase tracking-wider">{item.sub}</p>
              </div>
              <ChevronRight size={18} className="text-soft-mint/20" />
            </button>
          ))}
        </div>

        <div className="mt-10 px-6 pb-10 text-center">
          <p className="text-[10px] font-bold text-soft-mint/20 uppercase tracking-[0.3em]">Zenith Bank AI v2.4.0</p>
        </div>
      </div>
    );
  };
  const TransferScreen = () => {
    const [amount, setAmount] = useState('');
    const [recipient, setRecipient] = useState('');

    return (
      <div className="min-h-screen bg-deep-green p-8 flex flex-col">
        <div className="flex items-center gap-4">
          <button onClick={goBack} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
            <ChevronRight size={24} className="rotate-180" />
          </button>
          <h1 className="text-2xl font-bold">Send Money</h1>
        </div>

        <div className="mt-12 space-y-6">
          <div>
            <label className="text-xs font-bold text-soft-mint/40 uppercase tracking-widest ml-1">Recipient Name</label>
            <input 
              type="text" 
              placeholder="Enter name or account number"
              value={recipient}
              onChange={e => setRecipient(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-soft-mint mt-2 focus:outline-none focus:border-light-green"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-soft-mint/40 uppercase tracking-widest ml-1">Amount (PKR)</label>
            <div className="relative mt-2">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-bold text-light-green">Rs.</span>
              <input 
                type="number" 
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 pl-16 pr-6 text-3xl font-bold text-soft-mint focus:outline-none focus:border-light-green"
              />
            </div>
          </div>
        </div>

        <div className="mt-12">
          <h3 className="font-bold mb-4">Recent Recipients</h3>
          <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
            {['Ahmed', 'Sara', 'Zain', 'Fatima', 'Bilal', 'JazzCash'].map((name, i) => (
              <button 
                key={i} 
                onClick={() => setRecipient(name)}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-14 h-14 bg-forest-green/20 rounded-full flex items-center justify-center text-light-green font-bold">{name[0]}</div>
                <span className="text-xs font-medium">{name}</span>
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={() => {
            if (!amount || !recipient) return showToast('Please fill all fields', 'error');
            handleSendMoney(Number(amount), recipient);
            setScreen('dashboard');
          }}
          className="mt-auto mb-8 w-full bg-forest-green text-soft-mint py-5 rounded-3xl font-bold text-lg shadow-xl active:scale-95 transition-transform"
        >
          Confirm Transfer
        </button>
      </div>
    );
  };

  const AIChatScreen = () => {
    const [input, setInput] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
      <div className="min-h-screen bg-deep-green flex flex-col">
        <div className="p-6 bg-forest-green/10 border-b border-white/5 flex items-center gap-4">
          <button onClick={() => setScreen('dashboard')} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
            <ChevronRight size={24} className="rotate-180" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-forest-green rounded-2xl flex items-center justify-center">
              <Bot size={24} />
            </div>
            <div>
              <h2 className="font-bold">Zenith AI Assistant</h2>
              <p className="text-[10px] text-light-green font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-light-green rounded-full animate-pulse" /> ONLINE
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 hide-scrollbar">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-3xl ${msg.sender === 'user' ? 'bg-forest-green rounded-tr-none' : 'bg-white/5 rounded-tl-none border border-white/10'}`}>
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <p className="text-[8px] opacity-40 mt-2 text-right">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white/5 rounded-3xl rounded-tl-none border border-white/10 p-4 flex gap-1">
                <div className="w-1.5 h-1.5 bg-light-green rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-light-green rounded-full animate-bounce delay-100" />
                <div className="w-1.5 h-1.5 bg-light-green rounded-full animate-bounce delay-200" />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-6 bg-deep-green">
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2 hide-scrollbar">
            {['Balance?', 'Spending?', 'Advice?', 'Zakat?'].map(q => (
              <button 
                key={q} 
                onClick={() => !isTyping && handleAIChat(q)}
                disabled={isTyping}
                className={`whitespace-nowrap bg-white/5 border border-white/10 px-4 py-2 rounded-full text-xs font-bold text-light-green transition-opacity ${isTyping ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
              >
                {q}
              </button>
            ))}
          </div>
          <div className="relative">
            <input 
              type="text" 
              placeholder={isTyping ? "Zenith AI is thinking..." : "Ask Zenith AI..."}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && input && !isTyping && (handleAIChat(input), setInput(''))}
              disabled={isTyping}
              className={`w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-soft-mint focus:outline-none focus:border-light-green ${isTyping ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
            <button 
              onClick={() => input && !isTyping && (handleAIChat(input), setInput(''))}
              disabled={isTyping || !input}
              className={`absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-forest-green rounded-xl flex items-center justify-center text-soft-mint transition-all ${isTyping || !input ? 'opacity-50 scale-95' : 'active:scale-90'}`}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const CurrencyWalletScreen = () => {
    const [amount, setAmount] = useState('1');
    const [from, setFrom] = useState('USD');
    const [to, setTo] = useState('PKR');
    
    const rates: Record<string, number> = { USD: 280, EUR: 305, GBP: 355, PKR: 1 };
    const result = (Number(amount) * rates[from]) / rates[to];

    return (
      <div className="min-h-screen bg-deep-green p-8 flex flex-col">
        <div className="flex items-center gap-4">
          <button onClick={goBack} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
            <ChevronRight size={24} className="rotate-180" />
          </button>
          <h1 className="text-2xl font-bold">FX Wallet</h1>
        </div>

        <div className="mt-12">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Your Wallets</h3>
            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Swipe to view</p>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x">
            {CURRENCIES.map((curr, idx) => (
              <motion.div 
                key={curr.code}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`min-w-[240px] bg-gradient-to-br ${curr.color} rounded-[32px] p-6 shadow-xl snap-center relative overflow-hidden cursor-pointer`}
              >
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{curr.flag}</span>
                    <span className="font-bold text-soft-mint">{curr.code}</span>
                  </div>
                  {curr.rateChange && (
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${curr.rateChange.startsWith('+') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                      {curr.rateChange}
                    </span>
                  )}
                </div>
                <p className="text-[10px] font-bold text-soft-mint/60 uppercase tracking-widest">Available Balance</p>
                <h4 className="text-2xl font-bold text-soft-mint mt-1">
                  {curr.code === 'PKR' ? 'Rs. 125,000' : `${curr.code === 'USD' ? '$' : curr.code === 'EUR' ? '€' : curr.code === 'GBP' ? '£' : ''} 0.00`}
                </h4>
                <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                  <p className="text-[10px] font-bold text-soft-mint/40 uppercase">Live Rate</p>
                  <p className="text-xs font-bold text-soft-mint/80">{curr.rate} PKR</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-12">
          <h3 className="font-bold mb-4">Convert Currency</h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <input 
                type="number" 
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-xl font-bold"
              />
              <select 
                value={from}
                onChange={e => setFrom(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-2xl px-4 font-bold text-light-green"
              >
                {['USD', 'EUR', 'GBP', 'PKR'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex justify-center">
              <div className="w-10 h-10 bg-forest-green rounded-full flex items-center justify-center">
                <Repeat size={20} className="rotate-90" />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-xl font-bold text-light-green">
                {result.toFixed(2)}
              </div>
              <select 
                value={to}
                onChange={e => setTo(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-2xl px-4 font-bold text-light-green"
              >
                {['USD', 'EUR', 'GBP', 'PKR'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        <button 
          onClick={() => handleFXExchange(from, to, Number(amount), (rates[from] / rates[to]))}
          className="mt-auto mb-8 w-full bg-forest-green text-soft-mint py-5 rounded-3xl font-bold text-lg shadow-xl"
        >
          Convert Now
        </button>
      </div>
    );
  };

  const SubscriptionTrackerScreen = () => {
    const total = subscriptions.reduce((acc, s) => acc + s.price, 0);

    return (
      <div className="min-h-screen bg-deep-green p-8 flex flex-col">
        <div className="flex items-center gap-4">
          <button onClick={() => setScreen('dashboard')} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
            <ChevronRight size={24} className="rotate-180" />
          </button>
          <h1 className="text-2xl font-bold">Subscriptions</h1>
        </div>

        <div className="mt-12 glass-card p-8 bg-gradient-to-br from-pink-500/10 to-transparent text-center">
          <p className="text-soft-mint/60 text-sm">Monthly Spending</p>
          <h2 className="text-4xl font-bold mt-2 text-pink-500">Rs. {total.toLocaleString()}</h2>
          <p className="text-[10px] font-bold opacity-40 mt-2 uppercase tracking-widest">{subscriptions.length} Active Services</p>
        </div>

        {/* Subscription Insights */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="glass-card p-4 bg-emerald-500/5 border-emerald-500/10">
            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Upcoming</p>
            <p className="text-sm font-bold text-soft-mint">3 Renewals</p>
            <p className="text-[10px] text-soft-mint/40 mt-1">Next 7 days</p>
          </div>
          <div className="glass-card p-4 bg-orange-500/5 border-orange-500/10">
            <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-1">Savings</p>
            <p className="text-sm font-bold text-soft-mint">Rs. 1,200</p>
            <p className="text-[10px] text-soft-mint/40 mt-1">Potential cuts</p>
          </div>
        </div>

        <div className="mt-8 flex justify-between items-center">
          <h3 className="font-bold text-lg text-soft-mint/80">Active Services</h3>
          <div className="flex gap-2">
            <button className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-soft-mint/40 hover:text-light-green transition-colors">
              <Search size={16} />
            </button>
          </div>
        </div>

        <div className="mt-4 space-y-4 flex-1 overflow-y-auto hide-scrollbar">
          {subscriptions.map(sub => {
            const iconMap: Record<string, any> = {
              Tv, Music, ShoppingBag, FileText, Cloud, Youtube, Globe
            };
            const Icon = iconMap[sub.icon] || Repeat;
            
            return (
              <div 
                key={sub.id} 
                onClick={() => setSelectedSubForDetail(sub)}
                className="flex items-center gap-4 bg-white/5 p-4 rounded-[24px] border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
              >
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-pink-500 group-hover:scale-110 transition-transform">
                  <Icon size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm">{sub.name}</h4>
                  <p className="text-xs text-soft-mint/40">Renew: {sub.renewalDate} • Rs. {sub.price.toLocaleString()}</p>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleCancelSubscription(sub.id); }}
                  className="p-3 bg-red-500/10 text-red-500 rounded-xl active:scale-90 transition-transform"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            );
          })}
          {subscriptions.length === 0 && (
            <div className="text-center py-12 opacity-40">
              <Repeat size={48} className="mx-auto mb-4" />
              <p>No active subscriptions</p>
            </div>
          )}
        </div>

        <button 
          onClick={() => showToast('Subscription marketplace coming soon!')}
          className="mt-8 mb-8 w-full bg-forest-green text-soft-mint py-5 rounded-3xl font-bold text-lg shadow-xl"
        >
          Add New Subscription
        </button>
      </div>
    );
  };

  const ZakatCalculatorScreen = ({ isSubComponent = false, ...props }: { isSubComponent?: boolean; [key: string]: any }) => {
    const [savings, setSavings] = useState('');
    const [cash, setCash] = useState('');
    const [gold, setGold] = useState('');
    const [investment, setInvestment] = useState('');
    const [result, setResult] = useState<number | null>(null);

    const calculate = () => {
      const total = Number(savings) + Number(cash) + Number(gold) + Number(investment);
      setResult(total * 0.025);
    };

    return (
      <div className={`${isSubComponent ? '' : 'min-h-screen bg-deep-green p-8'} flex flex-col`}>
        {!isSubComponent && (
          <div className="flex items-center gap-4">
            <button onClick={() => setScreen('dashboard')} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
              <ChevronRight size={24} className="rotate-180" />
            </button>
            <h1 className="text-2xl font-bold">Zakat Calculator</h1>
          </div>
        )}

        <div className={`${isSubComponent ? 'mt-4' : 'mt-12'} space-y-4`}>
          {[
            { label: 'Savings Account', value: savings, setter: setSavings },
            { label: 'Cash on Hand', value: cash, setter: setCash },
            { label: 'Gold Value', value: gold, setter: setGold },
            { label: 'Investments', value: investment, setter: setInvestment },
          ].map((item, i) => (
            <div key={i}>
              <label className="text-[10px] font-bold text-soft-mint/40 uppercase tracking-widest ml-1">{item.label}</label>
              <input 
                type="number" 
                placeholder="0.00"
                value={item.value}
                onChange={e => item.setter(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-soft-mint mt-1 focus:outline-none focus:border-light-green"
              />
            </div>
          ))}
        </div>

        {result !== null && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mt-8 glass-card p-8 bg-yellow-600/10 border-yellow-600/20 text-center"
          >
            <p className="text-soft-mint/60 text-sm">Your Zakat Due</p>
            <h2 className="text-4xl font-bold mt-2 text-yellow-600">Rs. {result.toLocaleString()}</h2>
            <button 
              onClick={() => {
                handlePayZakat(result);
                setScreen('dashboard');
              }}
              className="mt-6 bg-yellow-600 text-soft-mint px-8 py-3 rounded-2xl font-bold text-sm"
            >
              Pay Now
            </button>
          </motion.div>
        )}

        <button 
          onClick={calculate}
          className="mt-auto mb-8 w-full bg-forest-green text-soft-mint py-5 rounded-3xl font-bold text-lg shadow-xl"
        >
          Calculate Zakat
        </button>
      </div>
    );
  };

  const BillPaymentScreen = () => {
    const [type, setType] = useState('Electricity');
    const [id, setId] = useState('');
    const [amount, setAmount] = useState('');

    return (
      <div className="min-h-screen bg-deep-green p-8 flex flex-col">
        <div className="flex items-center gap-4">
          <button onClick={() => setScreen('dashboard')} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
            <ChevronRight size={24} className="rotate-180" />
          </button>
          <h1 className="text-2xl font-bold">Pay Bills</h1>
        </div>

        <div className="mt-12 space-y-6">
          <div>
            <label className="text-xs font-bold text-soft-mint/40 uppercase tracking-widest ml-1">Bill Category</label>
            <div className="grid grid-cols-3 gap-3 mt-2">
              {['Electricity', 'Water', 'Gas', 'Internet', 'Phone', 'Education'].map(b => (
                <button 
                  key={b} 
                  onClick={() => setType(b)}
                  className={`py-3 rounded-2xl text-[10px] font-bold uppercase transition-all ${type === b ? 'bg-forest-green text-soft-mint border-forest-green' : 'bg-white/5 text-soft-mint/40 border-white/10 border'}`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-soft-mint/40 uppercase tracking-widest ml-1">Consumer ID / Reference</label>
            <input 
              type="text" 
              placeholder="Enter reference number"
              value={id}
              onChange={e => setId(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-soft-mint mt-2 focus:outline-none focus:border-light-green"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-soft-mint/40 uppercase tracking-widest ml-1">Amount Due</label>
            <input 
              type="number" 
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-soft-mint mt-2 focus:outline-none focus:border-light-green"
            />
          </div>
        </div>

        <button 
          onClick={() => {
            if (!id || !amount) return showToast('Please fill all fields', 'error');
            handlePayBill(type, Number(amount));
            setScreen('dashboard');
          }}
          className="mt-auto mb-8 w-full bg-forest-green text-soft-mint py-5 rounded-3xl font-bold text-lg shadow-xl"
        >
          Pay {type} Bill
        </button>
      </div>
    );
  };

  const TransactionsScreen = () => {
    return (
      <div className="min-h-screen bg-deep-forest-1 pb-32">
        <div className="p-6 flex items-center justify-between bg-deep-forest-2/50 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={goBack} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
              <ChevronRight size={24} className="rotate-180" />
            </button>
            <h1 className="text-2xl font-bold text-soft-mint">All Activity</h1>
          </div>
          <button 
            onClick={() => setScreen('search')}
            className="w-10 h-10 glass-card !rounded-full flex items-center justify-center active:scale-90 transition-all"
          >
            <Search size={20} className="text-soft-mint/80" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {transactions.map(tx => (
            <div 
              key={tx.id} 
              onClick={() => setSelectedTxForReceipt(tx)}
              className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tx.type === 'credit' ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                {tx.type === 'credit' ? <ArrowDownLeft size={20} className="text-emerald-400" /> : <ArrowUpRight size={20} className="text-red-400" />}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm text-soft-mint group-hover:text-light-green transition-colors">{tx.title}</h4>
                <p className="text-[10px] text-soft-mint/40 font-bold uppercase tracking-wider">{tx.category} • {tx.date}</p>
              </div>
              <div className="text-right">
                <p className={`font-bold text-sm ${tx.type === 'credit' ? 'text-emerald-400' : 'text-soft-mint'}`}>
                  {tx.type === 'credit' ? '+' : '-'} Rs. {Math.abs(tx.amount).toLocaleString()}
                </p>
                <button className="text-[9px] font-bold text-soft-mint/20 uppercase tracking-widest group-hover:text-soft-mint/60 transition-colors mt-1">
                  Receipt
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const SearchScreen = () => {
    const APP_FEATURES = [
      { name: 'Send Money', screen: 'transfer', icon: Send, category: 'Payments' },
      { name: 'Pay Bills', screen: 'bills', icon: Receipt, category: 'Payments' },
      { name: 'Zakat Calculator', screen: 'zakat', icon: Calculator, category: 'Islamic' },
      { name: 'Islamic Hub', screen: 'islamic_hub', icon: Calculator, category: 'Islamic' },
      { name: 'Saving Jars', screen: 'jars', icon: Repeat, category: 'Savings' },
      { name: 'Digital Wallets', screen: 'wallets', icon: Wallet, category: 'Wallets' },
      { name: 'Analytics', screen: 'analytics', icon: BarChart3, category: 'Insights' },
      { name: 'My Cards', screen: 'cards', icon: CreditCard, category: 'Management' },
      { name: 'Profile', screen: 'profile', icon: UserIcon, category: 'Account' },
      { name: 'FX Wallet', screen: 'fx_wallet', icon: Globe, category: 'Wallets' },
      { name: 'Subscriptions', screen: 'subscriptions', icon: Repeat, category: 'Management' },
      { name: 'AI Chat', screen: 'chat', icon: Bot, category: 'Support' },
      { name: 'QR Scan', screen: 'qr_scan', icon: QrCode, category: 'Payments' },
      { name: 'Voice Banking', screen: 'voice_banking', icon: Mic, category: 'AI' },
      { name: 'Smart Offers', screen: 'offers', icon: MapPin, category: 'Rewards' },
    ];

    const CONTACTS = ['Ahmed', 'Sara', 'Zain', 'Dania', 'Bilal', 'Fatima', 'Danyal', 'Ayesha'];

    const filteredFeatures = APP_FEATURES.filter(f => 
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      f.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredContacts = CONTACTS.filter(c => 
      c.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredTransactions = transactions.filter(t => 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const hasResults = filteredFeatures.length > 0 || filteredContacts.length > 0 || filteredTransactions.length > 0;

    return (
      <div className="min-h-screen bg-deep-forest-1 pb-32">
        <div className="p-6 bg-deep-forest-2/50 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-4 mb-4">
            <button onClick={() => { navigateTo('dashboard'); setSearchQuery(''); }} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
              <ChevronRight size={24} className="rotate-180" />
            </button>
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-soft-mint/40" />
              <input 
                autoFocus
                type="text" 
                placeholder="Search features, contacts, activity..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-soft-mint focus:outline-none focus:border-light-green transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-soft-mint/40 hover:text-soft-mint"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {!searchQuery ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={32} className="text-soft-mint/20" />
              </div>
              <p className="text-soft-mint/40 font-medium">Type to search Zenith Bank</p>
              <div className="mt-8 flex flex-wrap justify-center gap-2">
                {['Balance', 'Send', 'Zakat', 'Bills', 'Cards'].map(tag => (
                  <button 
                    key={tag}
                    onClick={() => setSearchQuery(tag)}
                    className="px-4 py-2 bg-white/5 rounded-full text-xs font-bold text-soft-mint/60 hover:bg-white/10 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : !hasResults ? (
            <div className="text-center py-20">
              <p className="text-soft-mint/40 font-medium">No results found for "{searchQuery}"</p>
            </div>
          ) : (
            <>
              {/* Features */}
              {filteredFeatures.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-bold text-soft-mint/40 uppercase tracking-[0.2em] mb-4 ml-2">App Features</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {filteredFeatures.map((feature, i) => (
                      <button 
                        key={i}
                        onClick={() => { navigateTo(feature.screen as any); setSearchQuery(''); }}
                        className="glass-card p-4 flex items-center gap-3 bg-white/5 border border-white/5 hover:bg-white/10 active:scale-95 transition-all"
                      >
                        <div className="w-10 h-10 bg-forest-green/20 rounded-xl flex items-center justify-center text-light-green">
                          <feature.icon size={20} />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-bold text-soft-mint">{feature.name}</p>
                          <p className="text-[9px] text-soft-mint/40 font-bold uppercase">{feature.category}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Contacts */}
              {filteredContacts.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-bold text-soft-mint/40 uppercase tracking-[0.2em] mb-4 ml-2">Contacts</h3>
                  <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
                    {filteredContacts.map((name, i) => (
                      <button 
                        key={i}
                        onClick={() => { navigateTo('transfer'); setSearchQuery(''); }}
                        className="flex flex-col items-center gap-2 min-w-[70px]"
                      >
                        <div className="w-14 h-14 bg-forest-green/20 rounded-2xl border border-white/10 flex items-center justify-center text-light-green font-bold text-xl">
                          {name[0]}
                        </div>
                        <span className="text-[10px] font-bold text-soft-mint/60">{name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Transactions */}
              {filteredTransactions.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-bold text-soft-mint/40 uppercase tracking-[0.2em] mb-4 ml-2">Recent Activity</h3>
                  <div className="space-y-3">
                    {filteredTransactions.map(tx => (
                      <div key={tx.id} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'credit' ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                          {tx.type === 'credit' ? <ArrowDownLeft size={18} className="text-emerald-400" /> : <ArrowUpRight size={18} className="text-red-400" />}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-xs text-soft-mint">{tx.title}</h4>
                          <p className="text-[9px] text-soft-mint/40 font-bold uppercase tracking-wider">{tx.category} • {tx.date}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold text-xs ${tx.type === 'credit' ? 'text-emerald-400' : 'text-soft-mint'}`}>
                            {tx.type === 'credit' ? '+' : '-'} Rs. {Math.abs(tx.amount).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  const VoiceBankingScreen = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [manualInput, setManualInput] = useState('');

    const startListening = () => {
      setIsListening(true);
      setTranscript('');
      // Simulate voice recognition
      const commands = [
        'Rs. 500 Ahmed ko bhej do',
        'Send 1000 to Sara',
        'Check my balance',
        'Pay my electricity bill'
      ];
      const randomCommand = commands[Math.floor(Math.random() * commands.length)];
      
      setTimeout(() => {
        setTranscript(randomCommand);
        setIsListening(false);
        processCommand(randomCommand);
      }, 3000);
    };

    const processCommand = async (text: string) => {
      if (!text) return;
      setIsProcessing(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Parse this banking command in Urdu/English: "${text}". 
          Extract: amount (number), recipient (string), action (string: 'transfer', 'balance', 'bill'). 
          Return ONLY JSON. Example: {"amount": 500, "recipient": "Ahmed", "action": "transfer"}`,
          config: { responseMimeType: "application/json" }
        });

        const result = JSON.parse(response.text || '{}');
        
        if (result.action === 'transfer' && result.amount && result.recipient) {
          setTimeout(() => {
            setIsProcessing(false);
            setDialog({
              title: 'Confirm Voice Transfer',
              content: (
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                    <p className="text-soft-mint/40 text-xs uppercase font-bold">Transferring to</p>
                    <p className="text-2xl font-bold text-soft-mint mt-1">{result.recipient}</p>
                    <p className="text-4xl font-bold text-light-green mt-4">Rs. {result.amount.toLocaleString()}</p>
                  </div>
                  <button 
                    onClick={() => {
                      handleSendMoney(result.amount, result.recipient);
                      setScreen('dashboard');
                    }}
                    className="w-full bg-forest-green py-4 rounded-2xl font-bold text-soft-mint shadow-xl active:scale-95 transition-all"
                  >
                    Confirm & Send
                  </button>
                </div>
              )
            });
          }, 1500);
        } else if (result.action === 'balance') {
          setIsProcessing(false);
          const total = cards.reduce((acc, c) => acc + c.balance, 0);
          showToast(`Your total balance is Rs. ${total.toLocaleString()}`);
        } else if (result.action === 'bill') {
          setIsProcessing(false);
          setScreen('bills');
          showToast("Opening bill payment screen...");
        } else {
          setIsProcessing(false);
          showToast("I couldn't understand that command. Try 'Send 500 to Ahmed'", "error");
        }
      } catch (error) {
        setIsProcessing(false);
        showToast("Error processing voice command", "error");
      }
    };

    return (
      <div className="min-h-screen bg-deep-forest-1 flex flex-col items-center justify-center p-8">
        <button onClick={() => setScreen('dashboard')} className="absolute top-8 left-8 w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
          <ChevronRight size={24} className="rotate-180" />
        </button>

        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-soft-mint">Voice Banking</h1>
          <p className="text-soft-mint/60 mt-2">Speak in Urdu or English</p>
        </div>

        <div className="relative">
          <motion.div 
            animate={isListening ? { scale: [1, 1.2, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className={`w-32 h-32 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 cursor-pointer ${isListening ? 'bg-light-green text-deep-forest-1' : 'bg-forest-green text-soft-mint'}`}
            onClick={!isProcessing ? startListening : undefined}
          >
            <Mic size={48} />
          </motion.div>
          {isListening && (
            <>
              <div className="absolute inset-0 rounded-full border-4 border-light-green animate-ping opacity-20" />
              <div className="absolute inset-0 rounded-full border-4 border-light-green animate-ping opacity-10 delay-300" />
            </>
          )}
        </div>

        <div className="mt-12 text-center max-w-xs w-full">
          {isProcessing ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-6 h-6 border-2 border-light-green border-t-transparent rounded-full animate-spin" />
              <p className="text-soft-mint font-medium">Processing command...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xl font-medium text-soft-mint min-h-[3rem]">
                {transcript || (isListening ? 'Listening...' : 'Tap the mic to start')}
              </p>
              {!isListening && (
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Or type command..."
                    value={manualInput}
                    onChange={e => setManualInput(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-soft-mint text-sm focus:outline-none focus:border-light-green"
                    onKeyDown={e => e.key === 'Enter' && processCommand(manualInput)}
                  />
                  <button 
                    onClick={() => processCommand(manualInput)}
                    className="bg-forest-green p-3 rounded-xl text-soft-mint"
                  >
                    <Send size={18} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-auto grid grid-cols-2 gap-3 w-full">
          <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
            <p className="text-[10px] text-soft-mint/40 font-bold uppercase mb-1">Try Urdu</p>
            <p className="text-xs text-soft-mint/60">"500 rupay Ahmed ko bhej do"</p>
          </div>
          <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
            <p className="text-[10px] text-soft-mint/40 font-bold uppercase mb-1">Try English</p>
            <p className="text-xs text-soft-mint/60">"Send 1000 to Sara"</p>
          </div>
        </div>
      </div>
    );
  };

  const OffersScreen = () => {
    const [nearbyOnly, setNearbyOnly] = useState(false);
    const [isLocating, setIsLocating] = useState(false);

    const handleLocate = () => {
      setIsLocating(true);
      setTimeout(() => {
        setIsLocating(false);
        setNearbyOnly(true);
        showToast("Found 3 offers near you!");
      }, 2000);
    };

    const filteredOffers = nearbyOnly 
      ? MERCHANT_OFFERS.filter(o => parseFloat(o.distance) < 1.5)
      : MERCHANT_OFFERS;

    return (
      <div className="min-h-screen bg-deep-forest-1 pb-32">
        <div className="p-6 flex items-center gap-4 bg-deep-forest-2/50 backdrop-blur-md sticky top-0 z-30">
          <button onClick={goBack} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
            <ChevronRight size={24} className="rotate-180" />
          </button>
          <h1 className="text-2xl font-bold text-soft-mint">Smart Offers</h1>
        </div>

        <div className="p-6 space-y-6">
          {/* Map Preview */}
          <div className="glass-card h-48 relative overflow-hidden bg-white/5 border border-white/10">
            <div className="absolute inset-0 opacity-40">
              <img 
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1000" 
                alt="Map" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className={`w-12 h-12 bg-light-green/20 rounded-full ${isLocating ? 'animate-ping' : ''}`} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 bg-light-green rounded-full border-2 border-white shadow-xl" />
                </div>
              </div>
            </div>
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-deep-forest-1 bg-forest-green flex items-center justify-center text-[10px] font-bold text-soft-mint shadow-lg">
                    <Tag size={12} />
                  </div>
                ))}
              </div>
              <button 
                onClick={handleLocate}
                disabled={isLocating}
                className="bg-forest-green text-soft-mint px-4 py-2 rounded-full text-xs font-bold shadow-xl flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50"
              >
                {isLocating ? (
                  <div className="w-3 h-3 border-2 border-soft-mint border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Navigation size={14} />
                )}
                {isLocating ? 'Locating...' : 'Find Nearby'}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold text-soft-mint/40 uppercase tracking-[0.2em]">
              {nearbyOnly ? 'Offers Near You' : 'All Discounts'}
            </h3>
            {nearbyOnly && (
              <button 
                onClick={() => setNearbyOnly(false)}
                className="text-xs text-light-green font-bold"
              >
                Show All
              </button>
            )}
          </div>

          <div className="space-y-4">
            {filteredOffers.map(offer => (
              <div key={offer.id} className="glass-card p-4 bg-white/5 border border-white/10 flex gap-4 hover:bg-white/10 transition-all group">
                <div className={`w-16 h-16 ${offer.color} rounded-2xl flex flex-col items-center justify-center text-white shadow-lg`}>
                  <Store size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-soft-mint">{offer.name}</h4>
                      <p className="text-xs text-soft-mint/40">{offer.location}</p>
                    </div>
                    <span className="bg-light-green/10 text-light-green px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                      {offer.discount}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[10px] font-bold text-soft-mint/60 uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <MapPin size={10} />
                        {offer.distance}
                      </span>
                      <span>•</span>
                      <span>{offer.category}</span>
                    </div>
                    <button className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center text-soft-mint/40 group-hover:bg-forest-green group-hover:text-soft-mint transition-all">
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const QRScanScreen = () => {
    const [scanning, setScanning] = useState(true);

    useEffect(() => {
      const timer = setTimeout(() => {
        setScanning(false);
        setDialog({
          title: 'QR Code Detected',
          content: (
            <div className="text-center">
              <div className="w-20 h-20 bg-forest-green/20 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <UserIcon size={40} className="text-light-green" />
              </div>
              <h4 className="font-bold text-lg">Merchant: McDonald's</h4>
              <p className="text-sm text-soft-mint/60 mt-1">F-11 Markaz, Islamabad</p>
              <button 
                onClick={() => {
                  handleQRScan("McDonald's F-11");
                  setDialog(null);
                }}
                className="w-full bg-forest-green text-soft-mint py-4 rounded-2xl font-bold mt-6"
              >
                Pay Merchant
              </button>
            </div>
          )
        });
      }, 2000);
      return () => clearTimeout(timer);
    }, []);

    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
        <div className="absolute top-12 left-8 right-8 flex justify-between items-center text-white z-10">
          <button onClick={() => setScreen('dashboard')} className="p-2 bg-white/10 rounded-full"><X size={24} /></button>
          <h2 className="font-bold">Scan QR Code</h2>
          <button className="p-2 bg-white/10 rounded-full"><Bell size={24} /></button>
        </div>
        
        <div className="w-72 h-72 border-2 border-light-green rounded-[40px] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-light-green/20 to-transparent animate-scan" />
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-light-green rounded-tl-2xl" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-light-green rounded-tr-2xl" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-light-green rounded-bl-2xl" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-light-green rounded-br-2xl" />
          <div className="w-full h-full bg-white/5 flex items-center justify-center">
            <Camera size={48} className="text-white/20" />
          </div>
        </div>

        <p className="text-white/60 mt-12 text-center px-12">Align the QR code within the frame to scan automatically</p>
        
        <div className="mt-auto mb-12 flex gap-8">
          <button className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center text-white"><Plus size={24} /></div>
            <span className="text-[10px] font-bold text-white/60 uppercase">Gallery</span>
          </button>
          <button className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center text-white"><QrCode size={24} /></div>
            <span className="text-[10px] font-bold text-white/60 uppercase">My Code</span>
          </button>
        </div>
      </div>
    );
  };

  // --- Main Render ---

  return (
    <ErrorBoundary>
      <div className="max-w-md mx-auto bg-deep-forest-1 min-h-screen relative overflow-hidden shadow-2xl border-x border-white/5">
      <BackgroundShapes />
      
      {/* Status Bar Simulation */}
      <div className="h-10 px-6 flex justify-between items-center text-[10px] font-bold opacity-60 z-[70] absolute top-0 left-0 right-0">
        <span>9:41</span>
        <div className="flex gap-1.5">
          <div className="w-4 h-2.5 border border-soft-mint/40 rounded-sm relative">
            <div className="absolute inset-0.5 bg-soft-mint rounded-[1px] w-[80%]" />
          </div>
          <div className="w-3 h-3 bg-soft-mint/40 rounded-full flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-soft-mint rounded-full" />
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {screen === 'splash' && <SplashScreen key="splash" />}
        {screen === 'login' && <LoginScreen key="login" />}
        {screen === 'faceid' && <FaceIDScreen key="faceid" />}
        {screen === 'otp' && <OTPScreen key="otp" />}
        {screen === 'dashboard' && <Dashboard key="dashboard" />}
        {screen === 'transfer' && <TransferScreen key="transfer" />}
        {screen === 'bills' && <BillPaymentScreen key="bills" />}
        {screen === 'chat' && <AIChatScreen key="chat" />}
        {screen === 'zakat' && <ZakatCalculatorScreen key="zakat" />}
        {screen === 'subscriptions' && <SubscriptionTrackerScreen key="subscriptions" />}
        {screen === 'fx_wallet' && <CurrencyWalletScreen key="fx_wallet" />}
        {screen === 'qr_scan' && <QRScanScreen key="qr_scan" />}
        {screen === 'analytics' && <AnalyticsScreen key="analytics" />}
        {screen === 'cards' && <CardsScreen key="cards" />}
        {screen === 'profile' && <ProfileScreen key="profile" />}
        {screen === 'wallets' && <DigitalWalletsScreen key="wallets" />}
        {screen === 'jars' && <SavingJarsScreen key="jars" />}
        {screen === 'social' && <SocialScreen key="social" />}
        {screen === 'islamic_hub' && <IslamicHubScreen key="islamic_hub" />}
        {screen === 'prayer_times' && <PrayerTimesScreen key="prayer_times" />}
        {screen === 'qibla' && <QiblaScreen key="qibla" />}
        {screen === 'quran' && <QuranScreen key="quran" />}
        {screen === 'sadaqah' && <SadaqahScreen key="sadaqah" />}
        {screen === 'halal_invest' && <HalalInvestScreen key="halal_invest" />}
        {screen === 'notifications' && <NotificationsScreen key="notifications" />}
        {screen === 'transactions' && <TransactionsScreen key="transactions" />}
        {screen === 'search' && <SearchScreen key="search" />}
        {screen === 'voice_banking' && <VoiceBankingScreen key="voice_banking" />}
        {screen === 'offers' && <OffersScreen key="offers" />}
        {screen === 'loans' && <LoanCenterScreen key="loans" />}
      </AnimatePresence>

      {selectedTxForReceipt && (
        <ReceiptModal 
          tx={selectedTxForReceipt} 
          onClose={() => setSelectedTxForReceipt(null)} 
          onDownload={() => showToast('Receipt saved to gallery', 'success')}
        />
      )}

      <AnimatePresence>
        {selectedSubForDetail && (
          <SubscriptionDetailModal 
            sub={selectedSubForDetail}
            onClose={() => setSelectedSubForDetail(null)}
            onViewReceipt={() => {
              const mockTx: Transaction = {
                id: `SUB-${selectedSubForDetail.id}`,
                title: `${selectedSubForDetail.name} Payment`,
                category: selectedSubForDetail.category || 'Subscription',
                amount: -selectedSubForDetail.price,
                date: 'Last Month',
                type: 'debit',
                icon: selectedSubForDetail.icon
              };
              setSelectedTxForReceipt(mockTx);
              setSelectedSubForDetail(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      {['dashboard', 'transfer', 'bills', 'chat', 'zakat', 'subscriptions', 'fx_wallet', 'analytics', 'cards', 'profile', 'wallets', 'jars', 'social', 'islamic_hub', 'notifications', 'transactions', 'search', 'voice_banking', 'offers', 'loans', 'prayer_times', 'qibla', 'quran', 'sadaqah', 'halal_invest'].includes(screen) && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-deep-forest-2/90 backdrop-blur-2xl border-t border-white/5 px-6 py-4 flex justify-between items-center z-40 rounded-t-[40px] shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          {[
            { id: 'home', icon: Home, label: 'Home', screen: 'dashboard' },
            { id: 'analytics', icon: BarChart3, label: 'Analytics', screen: 'analytics' },
            { id: 'ai', icon: Bot, label: 'AI', screen: 'chat' },
            { id: 'cards', icon: CreditCard, label: 'Cards', screen: 'cards' },
            { id: 'profile', icon: UserIcon, label: 'Profile', screen: 'profile' },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setScreen(tab.screen as any);
              }}
              className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === tab.id ? 'text-forest-green' : 'text-soft-mint/30'}`}
            >
              <motion.div 
                animate={activeTab === tab.id ? { scale: 1.2, y: -8 } : { scale: 1, y: 0 }}
                className={`p-2 rounded-2xl transition-colors ${activeTab === tab.id ? 'bg-forest-green/10 shadow-[0_0_20px_rgba(46,125,50,0.3)]' : ''}`}
              >
                <tab.icon size={24} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
              </motion.div>
              <span className={`text-[9px] font-bold uppercase tracking-[0.15em] transition-opacity ${activeTab === tab.id ? 'opacity-100' : 'opacity-40'}`}>
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Global Overlays */}
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        {dialog && <Dialog title={dialog.title} onClose={() => setDialog(null)}>{dialog.content}</Dialog>}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}} />
    </div>
    </ErrorBoundary>
  );
}
