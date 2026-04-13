import express from "express";
import type { Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { initializeApp, cert, getApp, getApps } from "firebase-admin/app";
import { getFirestore, Timestamp, FieldValue } from "firebase-admin/firestore";
import { getAuth as getAdminAuth } from "firebase-admin/auth";
import { GoogleGenAI } from "@google/genai";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import crypto from "crypto";
import fs from "fs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Firebase Admin Initialization ---
const configPath = path.join(__dirname, "firebase-applet-config.json");
const firebaseAppletConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));

if (!getApps().length) {
  initializeApp({
    projectId: firebaseAppletConfig.projectId,
  });
}

const db = getFirestore(firebaseAppletConfig.firestoreDatabaseId);
const adminAuth = getAdminAuth();
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

// --- 1. USER AUTHENTICATION SYSTEM ---

// Generate Demo OTP
app.post("/api/otp/generate", (req: Request, res: Response) => {
  const { phoneNumber, email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  // In a real app, send via SMS/Email. Here we just return it for the demo.
  res.json({ message: `OTP sent to ${phoneNumber || email}`, otp });
});

// POST /signup
app.post("/api/signup", async (req: Request, res: Response) => {
  try {
    const { fullName, cnic, dob, gender, phoneNumber, email, password } = req.body;

    // Basic validation
    if (!fullName || !cnic || !dob || !gender || !phoneNumber || !email || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Check if user exists
    const userRef = db.collection("users").doc(email);
    const doc = await userRef.get();
    if (doc.exists) {
      return res.status(400).json({ error: "User already exists with this email." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
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

    await userRef.set(userData);

    // Create initial wallet in sub-collection to match frontend
    await userRef.collection("wallets").add({
      name: 'Main Wallet',
      balance: 0,
      currencies: { PKR: 0, USD: 0, EUR: 0 },
      isLinked: true,
      accountNumber: phoneNumber
    });

    // Generate Firebase Custom Token
    const customToken = await adminAuth.createCustomToken(email);

    res.status(201).json({ message: "User created successfully.", customToken });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /login
app.post("/api/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const userRef = db.collection("users").doc(email);
    const doc = await userRef.get();

    if (!doc.exists) {
      // For demo purposes, if user doesn't exist, create a demo user
      const hashedPassword = await bcrypt.hash(password, 10);
      const userData = {
        fullName: "Demo User",
        cnic: "42101-1234567-1",
        phoneNumber: "03001234567",
        email,
        password: hashedPassword,
        isVerified: true,
        createdAt: Timestamp.now(),
      };
      await userRef.set(userData);
      
      // Create initial wallet
      await userRef.collection("wallets").add({
        name: 'Main Wallet',
        balance: 50000,
        currencies: { PKR: 50000, USD: 100, EUR: 50 },
        isLinked: true,
        accountNumber: "03001234567"
      });
      
      const customToken = await adminAuth.createCustomToken(email);
      const token = jwt.sign({ email, fullName: "Demo User" }, JWT_SECRET, { expiresIn: "24h" });
      return res.json({ token, customToken, user: { fullName: "Demo User", email } });
    }

    const user = doc.data();
    const validPassword = await bcrypt.compare(password, user?.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid password." });
    }

    // Generate JWT
    const token = jwt.sign({ email: user?.email, fullName: user?.fullName }, JWT_SECRET, { expiresIn: "24h" });

    // Generate Firebase Custom Token
    const customToken = await adminAuth.createCustomToken(email);

    // Log security event
    await db.collection("users").doc(email).collection("securityLogs").add({
      timestamp: Timestamp.now(),
      event: "Login",
      status: "Success",
      device: req.headers["user-agent"] || "Unknown",
    });

    res.json({ token, customToken, user: { fullName: user?.fullName, email: user?.email } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /verify-otp (Simulated)
app.post("/api/verify-otp", async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  // In a real app, we'd check the DB for the OTP and expiry.
  // For this simulation, we'll accept '123456' as a valid OTP.
  if (otp === "123456") {
    await db.collection("users").doc(email).update({ isVerified: true });
    res.json({ message: "OTP verified successfully." });
  } else {
    res.status(400).json({ error: "Invalid OTP." });
  }
});

// --- 2. USER ACCOUNT & WALLET SYSTEM ---

app.get("/api/user/profile", authenticateToken, async (req: any, res: Response) => {
  const doc = await db.collection("users").doc(req.user.email).get();
  res.json(doc.data());
});

app.get("/api/wallet/balance", authenticateToken, async (req: any, res: Response) => {
  const doc = await db.collection("wallets").doc(req.user.email).get();
  res.json(doc.data());
});

app.get("/api/wallet/cards", authenticateToken, async (req: any, res: Response) => {
  const snapshot = await db.collection("users").doc(req.user.email).collection("cards").get();
  const cards = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.json(cards);
});

// --- 3. MONEY TRANSFER SYSTEM ---

app.post("/api/transfer", authenticateToken, async (req: any, res: Response) => {
  const { receiverEmail, amount, note } = req.body;
  const senderEmail = req.user.email;

  if (amount <= 0) return res.status(400).json({ error: "Invalid amount." });

  try {
    const senderWalletRef = db.collection("wallets").doc(senderEmail);
    const receiverWalletRef = db.collection("wallets").doc(receiverEmail);

    await db.runTransaction(async (t) => {
      const senderDoc = await t.get(senderWalletRef);
      const receiverDoc = await t.get(receiverWalletRef);

      if (!senderDoc.exists) throw new Error("Sender wallet not found.");
      if (!receiverDoc.exists) throw new Error("Receiver wallet not found.");

      const senderBalance = senderDoc.data()?.balance || 0;
      if (senderBalance < amount) throw new Error("Insufficient balance.");

      t.update(senderWalletRef, { balance: FieldValue.increment(-amount) });
      t.update(receiverWalletRef, { balance: FieldValue.increment(amount) });

      // Record transaction for sender
      const txData = {
        title: `Transfer to ${receiverEmail}`,
        amount: -amount,
        type: "debit",
        category: "Transfer",
        timestamp: Timestamp.now(),
        note,
        status: "success"
      };
      t.set(db.collection("users").doc(senderEmail).collection("transactions").doc(), txData);

      // Record transaction for receiver
      const rxData = {
        title: `Received from ${senderEmail}`,
        amount: amount,
        type: "credit",
        category: "Transfer",
        timestamp: Timestamp.now(),
        note,
        status: "success"
      };
      t.set(db.collection("users").doc(receiverEmail).collection("transactions").doc(), rxData);
    });

    res.json({ message: "Transfer successful." });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/api/transactions", authenticateToken, async (req: any, res: Response) => {
  const snapshot = await db.collection("users").doc(req.user.email).collection("transactions").orderBy("timestamp", "desc").get();
  const txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.json(txs);
});

// --- 4. BILL PAYMENT SYSTEM ---

app.post("/api/pay-bill", authenticateToken, async (req: any, res: Response) => {
  const { billType, amount } = req.body;
  const email = req.user.email;

  try {
    const walletRef = db.collection("wallets").doc(email);
    const walletDoc = await walletRef.get();
    if ((walletDoc.data()?.balance || 0) < amount) {
      return res.status(400).json({ error: "Insufficient balance to pay bill." });
    }

    await walletRef.update({ balance: FieldValue.increment(-amount) });
    await db.collection("users").doc(email).collection("bills").add({
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

// --- 5. DIGITAL WALLET INTEGRATION (SIMULATED) ---

app.post("/api/add-money", authenticateToken, async (req: any, res: Response) => {
  const { source, amount } = req.body; // source: JazzCash, EasyPaisa, SadaPay
  const email = req.user.email;

  try {
    await db.collection("wallets").doc(email).update({ balance: FieldValue.increment(amount) });
    await db.collection("users").doc(email).collection("transactions").add({
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
  const snapshot = await db.collection("users").doc(req.user.email).collection("transactions").where("type", "==", "debit").get();
  const categories: any = {};
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    categories[data.category] = (categories[data.category] || 0) + Math.abs(data.amount);
  });
  res.json(categories);
});

// --- 11. SECURITY MODULE ---

app.get("/api/security/logins", authenticateToken, async (req: any, res: Response) => {
  const snapshot = await db.collection("users").doc(req.user.email).collection("securityLogs").orderBy("timestamp", "desc").limit(10).get();
  const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.json(logs);
});

// --- 12. REAL PAYMENT INTEGRATION (SANDBOX) ---

// JazzCash Sandbox Configuration
const JAZZCASH_MERCHANT_ID = process.env.JAZZCASH_MERCHANT_ID || "T45678";
const JAZZCASH_PASSWORD = process.env.JAZZCASH_PASSWORD || "p12345";
const JAZZCASH_INTEGERITY_SALT = process.env.JAZZCASH_INTEGERITY_SALT || "s12345";
const JAZZCASH_RETURN_URL = `${process.env.APP_URL}/api/payments/jazzcash/callback`;

// Generate JazzCash Secure Hash
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
    pp_Amount: (parseFloat(amount) * 100).toString(), // Amount in Paisas
    pp_TxnCurrency: "PKR",
    pp_TxnDateTime: dateTime,
    pp_BillReference: billReference || "bill123",
    pp_Description: productDescription || "Zenith Bank Deposit",
    pp_TxnExpiryDateTime: expiryDateTime,
    pp_ReturnURL: JAZZCASH_RETURN_URL,
    pp_SecureHash: ""
  };

  // Sort keys alphabetically and create message string
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

// JazzCash Callback
app.post("/api/payments/jazzcash/callback", async (req: Request, res: Response) => {
  const responseData = req.body;
  console.log("JazzCash Callback Received:", responseData);
  
  // In a real app, verify the secure hash here before updating balance
  if (responseData.pp_ResponseCode === "000") {
    // Success - Update user balance in Firestore
    // Note: You'd need to pass the user's email/ID in pp_BillReference or similar
    res.send("<h1>Payment Successful</h1><p>Your Zenith Bank wallet has been updated.</p>");
  } else {
    res.send(`<h1>Payment Failed</h1><p>Reason: ${responseData.pp_ResponseMessage}</p>`);
  }
});

// Easypaisa Sandbox Integration
app.post("/api/payments/easypaisa/initiate", authenticateToken, (req: Request, res: Response) => {
  const { amount, orderId } = req.body;
  
  // Easypaisa usually uses a redirect or a direct API call
  // For sandbox simulation, we provide the parameters needed for their hosted checkout
  const storeId = "12345";
  const postUrl = "https://easypay.easypaisa.com.pk/easypay/Index.jsf";
  
  res.json({
    postUrl,
    params: {
      storeId,
      amount,
      postBackURL: `${process.env.APP_URL}/api/payments/easypaisa/callback`,
      orderId: orderId || Date.now().toString()
    }
  });
});

app.post("/api/payments/easypaisa/callback", async (req: Request, res: Response) => {
  console.log("Easypaisa Callback Received:", req.body);
  res.json({ status: "received" });
});

// --- VITE MIDDLEWARE ---
// Serve frontend in production, or use Vite middleware in dev
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
