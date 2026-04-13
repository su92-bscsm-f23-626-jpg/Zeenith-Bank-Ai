# Zenith Bank AI - Backend Documentation

This backend is built using **Node.js (Express.js)** and **Firebase (Firestore)** to support the Zenith Bank AI mobile application.

## Base URL
`https://ais-dev-n6qgn3yetkjmz72aq2fbk4-806605853155.asia-southeast1.run.app`

---

## 1. Authentication APIs

### Signup
`POST /api/signup`
**Request Body:**
```json
{
  "fullName": "John Doe",
  "cnic": "4210112345678",
  "phoneNumber": "03001234567",
  "email": "john@example.com",
  "password": "securepassword123"
}
```
**Response (201):**
```json
{ "message": "User created successfully. Please verify OTP." }
```

### Login
`POST /api/login`
**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```
**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "fullName": "John Doe", "email": "john@example.com" }
}
```

### Verify OTP (Simulated)
`POST /api/verify-otp`
**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

---

## 2. Wallet & Transactions

### Get Balance
`GET /api/wallet/balance`
**Headers:** `Authorization: Bearer <token>`
**Response:**
```json
{
  "uid": "john@example.com",
  "balance": 125000,
  "currencies": { "PKR": 125000, "USD": 500, "EUR": 450 }
}
```

### Transfer Money
`POST /api/transfer`
**Headers:** `Authorization: Bearer <token>`
**Request Body:**
```json
{
  "receiverEmail": "sara@example.com",
  "amount": 5000,
  "note": "Dinner payment"
}
```

---

## 3. AI Chatbot

### Chat with Zenith AI
`POST /api/chat`
**Headers:** `Authorization: Bearer <token>`
**Request Body:**
```json
{ "message": "How do I calculate my Zakat?" }
```
**Response:**
```json
{ "reply": "To calculate Zakat, take 2.5% of your total wealth..." }
```

---

## 4. Android Integration Guide (Retrofit)

### Step 1: Add Dependencies
In your `build.gradle` (Module: app):
```gradle
implementation 'com.squareup.retrofit2:retrofit:2.9.0'
implementation 'com.squareup.retrofit2:converter-gson:2.9.0'
implementation 'com.squareup.okhttp3:logging-interceptor:4.9.0'
// Biometric API
implementation 'androidx.biometric:biometric:1.1.0'
// CameraX
implementation "androidx.camera:camera-camera2:1.1.0"
implementation "androidx.camera:camera-lifecycle:1.1.0"
implementation "androidx.camera:camera-view:1.1.0"
```

### Step 2: Create API Interface
```java
public interface ZenithApiService {
    @POST("api/login")
    Call<LoginResponse> login(@Body LoginRequest request);

    @GET("api/wallet/balance")
    Call<WalletResponse> getBalance(@Header("Authorization") String token);

    // JazzCash Initiation
    @POST("api/payments/jazzcash/initiate")
    Call<JazzCashInitResponse> initiateJazzCash(@Header("Authorization") String token, @Body PaymentRequest request);
}
```

### Step 3: Fingerprint Authentication (Java)
```java
BiometricPrompt biometricPrompt = new BiometricPrompt(activity, executor, new BiometricPrompt.AuthenticationCallback() {
    @Override
    public void onAuthenticationSucceeded(@NonNull BiometricPrompt.AuthenticationResult result) {
        super.onAuthenticationSucceeded(result);
        // Proceed to Login API
    }
});

BiometricPrompt.PromptInfo promptInfo = new BiometricPrompt.PromptInfo.Builder()
        .setTitle("Zenith Bank Login")
        .setSubtitle("Log in using your biometric credential")
        .setNegativeButtonText("Use account password")
        .build();

biometricPrompt.authenticate(promptInfo);
```

### Step 4: Face ID Simulation (Camera Preview)
```java
PreviewView previewView = findViewById(R.id.previewView);
ListenableFuture<ProcessCameraProvider> cameraProviderFuture = ProcessCameraProvider.getInstance(this);

cameraProviderFuture.addListener(() -> {
    try {
        ProcessCameraProvider cameraProvider = cameraProviderFuture.get();
        Preview preview = new Preview.Builder().build();
        CameraSelector cameraSelector = new CameraSelector.Builder()
            .requireLensFacing(CameraSelector.LENS_FACING_FRONT)
            .build();
        preview.setSurfaceProvider(previewView.getSurfaceProvider());
        cameraProvider.bindToLifecycle(this, cameraSelector, preview);
        
        // Simulate Face Detection logic here
    } catch (Exception e) {
        e.printStackTrace();
    }
}, ContextCompat.getMainExecutor(this));
```

---

## 5. Payment Integration (JazzCash Sandbox)

### Initiate Payment
`POST /api/payments/jazzcash/initiate`
**Request:**
```json
{
  "amount": "100.00",
  "billReference": "user_123",
  "productDescription": "Wallet Deposit"
}
```
**Response:**
Returns `postData` with a `pp_SecureHash` and a `postUrl`. You should submit these fields as a form to the `postUrl` in a WebView.

---

## 6. Security Best Practices
- **JWT:** All sensitive routes are protected by JWT middleware.
- **Bcrypt:** Passwords are never stored in plain text.
- **CNIC Validation:** CNIC format is enforced via Firestore rules.
- **Transactions:** Money transfers use Firestore Transactions for atomicity.
