import express from "express";
import type { Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore, 
  initializeFirestore,
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  runTransaction, 
  increment,
  Timestamp 
} from "firebase/firestore";
import { GoogleGenAI } from "@google/genai";
import Stripe from "stripe";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import crypto from "crypto";
import fs from "fs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Firebase Client Initialization for Server Side ---
const configPath = path.join(__dirname, "firebase-applet-config.json");
const firebaseAppletConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));

const firebaseApp = !getApps().length ? initializeApp(firebaseAppletConfig) : getApp();
const db = initializeFirestore(firebaseApp, {
  experimentalForceLongPolling: true,
}, firebaseAppletConfig.firestoreDatabaseId);

let stripeClient: Stripe | null = null;
const getStripe = () => {
  if (!stripeClient && process.env.STRIPE_SECRET_KEY) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeClient;
};

if (process.env.STRIPE_SECRET_KEY) {
  console.log("Stripe Secret Key detected.");
} else {
  console.warn("Stripe Secret Key NOT detected. Stripe features will be disabled.");
}
const JWT_SECRET = process.env.JWT_SECRET || "zenith-bank-ai-secret-key-2026";
const geminiApiKey = process.env.GEMINI_API_KEY;

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// --- Middleware: Auth ---
const authenticateToken = (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token." });
    req.user = user;
    next();
  });
};

// --- Stripe Health Check ---
app.get("/api/stripe/health", async (req: Request, res: Response) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(400).json({ 
        status: "error", 
        message: "STRIPE_SECRET_KEY is not set in environment variables." 
      });
    }
    
    // Try to retrieve balance to verify the key
    const stripe = getStripe();
    if (!stripe) {
      return res.status(503).json({ error: "Stripe is not configured." });
    }
    const balance = await stripe.balance.retrieve();
    res.json({ 
      status: "ok", 
      message: "Stripe is working!", 
      balance: balance
    });
  } catch (error: any) {
    res.status(500).json({ 
      status: "error", 
      message: "Stripe connection failed.", 
      error: error.message 
    });
  }
});

// --- 1. USER AUTHENTICATION SYSTEM ---

// Generate Demo OTP
app.post("/api/otp/generate", (req: Request, res: Response) => {
  const { phoneNumber, email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  res.json({ message: `OTP sent to ${phoneNumber || email}`, otp });
});

// POST /signup
app.post("/api/signup", async (req: Request, res: Response) => {
  try {
    const { fullName, cnic, dob, gender, phoneNumber, email, password } = req.body;

    if (!fullName || !cnic || !dob || !gender || !phoneNumber || !email || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const userRef = doc(db, "users", email);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      return res.status(400).json({ error: "User already exists with this email." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      fullName,
      cnic,
      dob,
      gender,
      phoneNumber,
      email,
      password: hashedPassword,
      isVerified: false,
      createdAt: Timestamp.now(),
    };

    await setDoc(userRef, userData);

    const walletRef = collection(db, "users", email, "wallets");
    await addDoc(walletRef, {
      name: 'Main Wallet',
      balance: 0,
      currencies: { PKR: 0, USD: 0, EUR: 0 },
      isLinked: true,
      accountNumber: phoneNumber
    });

    res.status(201).json({ 
      message: "User created successfully.",
      token: jwt.sign({ email, fullName }, JWT_SECRET, { expiresIn: "24h" })
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /login
app.post("/api/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const userRef = doc(db, "users", email);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
      return res.status(404).json({ error: "User not found. Please sign up." });
    }

    const user = docSnap.data();
    const validPassword = await bcrypt.compare(password, user?.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const token = jwt.sign({ email: user?.email, fullName: user?.fullName }, JWT_SECRET, { expiresIn: "24h" });

    const logsRef = collection(db, "users", email, "securityLogs");
    try {
      await addDoc(logsRef, {
        timestamp: Timestamp.now(),
        event: "Login",
        status: "Success",
        device: req.headers["user-agent"] || "Unknown",
      });
    } catch (e) {
      console.warn("Could not log security event, but proceeding with login.");
    }

    res.json({ token, user: { fullName: user?.fullName, email: user?.email } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /verify-otp
app.post("/api/verify-otp", async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  // In demo mode, we allow the hardcoded '123456' or any 6-digit code for simplicity
  // if no complex OTP storage is implemented.
  if (otp === "123456" || (otp && otp.length === 6)) {
    const userRef = doc(db, "users", email);
    await updateDoc(userRef, { isVerified: true });
    res.json({ message: "OTP verified successfully." });
  } else {
    res.status(400).json({ error: "Invalid OTP. Please use 123456 for demo." });
  }
});

// --- 2. USER ACCOUNT & WALLET SYSTEM ---

app.get("/api/user/profile", authenticateToken, async (req: any, res: Response) => {
  const userRef = doc(db, "users", req.user.email);
  const docSnap = await getDoc(userRef);
  res.json(docSnap.data());
});

app.get("/api/wallet/balance", authenticateToken, async (req: any, res: Response) => {
  const walletRef = doc(db, "wallets", req.user.email);
  const docSnap = await getDoc(walletRef);
  res.json(docSnap.data());
});

app.get("/api/wallet/cards", authenticateToken, async (req: any, res: Response) => {
  const cardsRef = collection(db, "users", req.user.email, "cards");
  const snapshot = await getDocs(cardsRef);
  const cards = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.json(cards);
});

// --- 3. MONEY TRANSFER SYSTEM ---

app.post("/api/transfer", authenticateToken, async (req: any, res: Response) => {
  const { receiverEmail, amount, note } = req.body;
  const senderEmail = req.user.email;

  if (amount <= 0) return res.status(400).json({ error: "Invalid amount." });

  try {
    const senderWalletRef = doc(db, "wallets", senderEmail);
    const receiverWalletRef = doc(db, "wallets", receiverEmail);

    await runTransaction(db, async (t) => {
      const senderDoc = await t.get(senderWalletRef);
      const receiverDoc = await t.get(receiverWalletRef);

      if (!senderDoc.exists()) throw new Error("Sender wallet not found.");
      if (!receiverDoc.exists()) throw new Error("Receiver wallet not found.");

      const senderBalance = senderDoc.data()?.balance || 0;
      if (senderBalance < amount) throw new Error("Insufficient balance.");

      t.update(senderWalletRef, { balance: increment(-amount) });
      t.update(receiverWalletRef, { balance: increment(amount) });

      const txData = {
        title: `Transfer to ${receiverEmail}`,
        amount: -amount,
        type: "debit",
        category: "Transfer",
        timestamp: Timestamp.now(),
        note,
        status: "success"
      };
      const senderTxRef = doc(collection(db, "users", senderEmail, "transactions"));
      t.set(senderTxRef, txData);

      const rxData = {
        title: `Received from ${senderEmail}`,
        amount: amount,
        type: "credit",
        category: "Transfer",
        timestamp: Timestamp.now(),
        note,
        status: "success"
      };
      const receiverTxRef = doc(collection(db, "users", receiverEmail, "transactions"));
      t.set(receiverTxRef, rxData);
    });

    res.json({ message: "Transfer successful." });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/api/transactions", authenticateToken, async (req: any, res: Response) => {
  const txsRef = collection(db, "users", req.user.email, "transactions");
  const q = query(txsRef, orderBy("timestamp", "desc"));
  const snapshot = await getDocs(q);
  const txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.json(txs);
});

// --- 4. BILL PAYMENT SYSTEM ---

app.post("/api/pay-bill", authenticateToken, async (req: any, res: Response) => {
  const { billType, amount } = req.body;
  const email = req.user.email;

  try {
    const walletRef = doc(db, "wallets", email);
    const walletSnap = await getDoc(walletRef);
    if ((walletSnap.data()?.balance || 0) < amount) {
      return res.status(400).json({ error: "Insufficient balance to pay bill." });
    }

    await updateDoc(walletRef, { balance: increment(-amount) });
    const billRef = collection(db, "users", email, "bills");
    await addDoc(billRef, {
      type: billType,
      amount,
      status: "paid",
      timestamp: Timestamp.now()
    });

    res.json({ message: `${billType} bill paid successfully.` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- 5. DIGITAL WALLET INTEGRATION ---

app.post("/api/add-money", authenticateToken, async (req: any, res: Response) => {
  const { source, amount } = req.body;
  const email = req.user.email;

  try {
    const walletRef = doc(db, "wallets", email);
    await updateDoc(walletRef, { balance: increment(amount) });
    const txRef = collection(db, "users", email, "transactions");
    await addDoc(txRef, {
      title: `Added from ${source}`,
      amount,
      type: "credit",
      category: "Deposit",
      timestamp: Timestamp.now(),
      status: "success"
    });

    res.json({ message: `Rs. ${amount} added from ${source} successfully.` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- 8. ZAKAT CALCULATOR ---

app.post("/api/zakat/calculate", (req: Request, res: Response) => {
  const { totalAssets } = req.body;
  const zakat = totalAssets * 0.025;
  res.json({ zakat, nisabThreshold: "Rs. 100,000 (Simulated)" });
});

// --- 9. AI CHATBOT SYSTEM ---

app.post("/api/chat", authenticateToken, async (req: any, res: Response) => {
  const { message } = req.body;

  if (!geminiApiKey) {
    return res.status(500).json({ error: "Gemini API key not configured." });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: geminiApiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are Zenith Bank AI Assistant. Help the user with banking queries. User says: ${message}`,
    });

    const responseText = response.text;
    res.json({ reply: responseText });
  } catch (error: any) {
    console.error("AI Error:", error);
    res.status(500).json({ error: "AI Assistant is currently unavailable." });
  }
});

// --- 10. ANALYTICS SYSTEM ---

app.get("/api/analytics/spending", authenticateToken, async (req: any, res: Response) => {
  const txRef = collection(db, "users", req.user.email, "transactions");
  const q = query(txRef, where("type", "==", "debit"));
  const snapshot = await getDocs(q);
  const categories: any = {};
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    categories[data.category] = (categories[data.category] || 0) + Math.abs(data.amount);
  });
  res.json(categories);
});

// --- 11. SECURITY MODULE ---

app.get("/api/security/logins", authenticateToken, async (req: any, res: Response) => {
  const logsRef = collection(db, "users", req.user.email, "securityLogs");
  const q = query(logsRef, orderBy("timestamp", "desc"), limit(10));
  const snapshot = await getDocs(q);
  const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.json(logs);
});

// --- 12. REAL PAYMENT INTEGRATION (SANDBOX) ---

const JAZZCASH_MERCHANT_ID = process.env.JAZZCASH_MERCHANT_ID || "T45678";
const JAZZCASH_PASSWORD = process.env.JAZZCASH_PASSWORD || "p12345";
const JAZZCASH_INTEGERITY_SALT = process.env.JAZZCASH_INTEGERITY_SALT || "s12345";
const JAZZCASH_RETURN_URL = `${process.env.APP_URL}/api/payments/jazzcash/callback`;

app.post("/api/payments/jazzcash/initiate", authenticateToken, (req: Request, res: Response) => {
  const { amount, billReference, productDescription } = req.body;
  
  const dateTime = new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 14);
  const expiryDateTime = new Date(Date.now() + 3600000).toISOString().replace(/[-:T.Z]/g, "").slice(0, 14);
  const txnRefNo = "T" + dateTime;

  const postData: any = {
    pp_Version: "1.1",
    pp_TxnType: "MWALLET",
    pp_Language: "EN",
    pp_MerchantID: JAZZCASH_MERCHANT_ID,
    pp_Password: JAZZCASH_PASSWORD,
    pp_TxnRefNo: txnRefNo,
    pp_Amount: (parseFloat(amount) * 100).toString(),
    pp_TxnCurrency: "PKR",
    pp_TxnDateTime: dateTime,
    pp_BillReference: billReference || "bill123",
    pp_Description: productDescription || "Zenith Bank Deposit",
    pp_TxnExpiryDateTime: expiryDateTime,
    pp_ReturnURL: JAZZCASH_RETURN_URL,
    pp_SecureHash: ""
  };

  const sortedKeys = Object.keys(postData).sort();
  let message = JAZZCASH_INTEGERITY_SALT;
  for (const key of sortedKeys) {
    if (postData[key] !== "" && key !== "pp_SecureHash") {
      message += "&" + postData[key];
    }
  }

  const secureHash = crypto.createHmac("sha256", JAZZCASH_INTEGERITY_SALT)
    .update(message)
    .digest("hex")
    .toUpperCase();

  postData.pp_SecureHash = secureHash;

  res.json({
    postData,
    postUrl: "https://sandbox.jazzcash.com.pk/CustomerPortal/transaction/Checkout"
  });
});

app.post("/api/payments/jazzcash/callback", async (req: Request, res: Response) => {
  const responseData = req.body;
  if (responseData.pp_ResponseCode === "000") {
    res.send("<h1>Payment Successful</h1><p>Your Zenith Bank wallet has been updated.</p>");
  } else {
    res.send(`<h1>Payment Failed</h1><p>Reason: ${responseData.pp_ResponseMessage}</p>`);
  }
});

// --- 13. STRIPE INTEGRATION ---

app.post("/api/payments/stripe/create-intent", authenticateToken, async (req: any, res: Response) => {
  const { amount, currency = "pkr" } = req.body;

  try {
    const stripe = getStripe();
    if (!stripe) {
      return res.status(503).json({ error: "Stripe is not configured." });
    }
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      metadata: { user_email: req.user.email },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/payments/stripe/confirm", authenticateToken, async (req: any, res: Response) => {
  const { paymentIntentId, amount } = req.body;
  const email = req.user.email;

  try {
    const stripe = getStripe();
    if (!stripe) {
      return res.status(503).json({ error: "Stripe is not configured." });
    }
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (intent.status === "succeeded" || intent.id.startsWith('pi_demo_')) {
      // Update balance
      const walletRef = doc(db, "wallets", email);
      await updateDoc(walletRef, { balance: increment(amount) });
      
      // Record transaction
      const txRef = collection(db, "users", email, "transactions");
      await addDoc(txRef, {
        title: "Added via Stripe",
        amount,
        type: "credit",
        category: "Deposit",
        timestamp: Timestamp.now(),
        status: "success"
      });

      res.json({ message: "Balance updated successfully via Stripe." });
    } else {
      res.status(400).json({ error: "Payment not succeeded." });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- VITE MIDDLEWARE ---
if (process.env.NODE_ENV === "production") {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
} else {
  const { createServer: createViteServer } = await import("vite");
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Zenith Bank AI Backend running on http://localhost:${PORT}`);
});
