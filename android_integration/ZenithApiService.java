package com.zenithbank.api;

import java.util.List;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.POST;

public interface ZenithApiService {

    // --- Authentication ---
    @POST("api/signup")
    Call<MessageResponse> signup(@Body SignupRequest request);

    @POST("api/login")
    Call<LoginResponse> login(@Body LoginRequest request);

    @POST("api/otp/generate")
    Call<OtpResponse> generateOtp(@Body OtpRequest request);

    @POST("api/verify-otp")
    Call<MessageResponse> verifyOtp(@Body OtpRequest request);

    // --- Wallet & Profile ---
    @GET("api/user/profile")
    Call<UserProfile> getProfile(@Header("Authorization") String token);

    @GET("api/wallet/balance")
    Call<WalletBalance> getBalance(@Header("Authorization") String token);

    @GET("api/transactions")
    Call<List<Transaction>> getTransactions(@Header("Authorization") String token);

    // --- Payments ---
    @POST("api/transfer")
    Call<MessageResponse> transferMoney(@Header("Authorization") String token, @Body TransferRequest request);

    @POST("api/pay-bill")
    Call<MessageResponse> payBill(@Header("Authorization") String token, @Body BillRequest request);

    @POST("api/payments/jazzcash/initiate")
    Call<JazzCashInitResponse> initiateJazzCash(@Header("Authorization") String token, @Body PaymentRequest request);

    @POST("api/payments/easypaisa/initiate")
    Call<EasyPaisaInitResponse> initiateEasyPaisa(@Header("Authorization") String token, @Body PaymentRequest request);

    // --- AI Chat ---
    @POST("api/chat")
    Call<ChatResponse> chatWithAI(@Header("Authorization") String token, @Body ChatRequest request);
}
