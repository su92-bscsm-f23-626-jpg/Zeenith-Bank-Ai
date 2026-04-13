package com.zenithbank.api;

import com.google.gson.annotations.SerializedName;
import java.util.Map;

public class Models {

    public static class SignupRequest {
        public String fullName, cnic, phoneNumber, email, password;
        public SignupRequest(String fullName, String cnic, String phoneNumber, String email, String password) {
            this.fullName = fullName; this.cnic = cnic; this.phoneNumber = phoneNumber; this.email = email; this.password = password;
        }
    }

    public static class LoginRequest {
        public String email, password;
        public LoginRequest(String email, String password) { this.email = email; this.password = password; }
    }

    public static class LoginResponse {
        public String token;
        public UserProfile user;
    }

    public static class UserProfile {
        public String fullName, email, phoneNumber, cnic;
    }

    public static class WalletBalance {
        public double balance;
        public Map<String, Double> currencies;
    }

    public static class Transaction {
        public String id, title, type, category, timestamp, status;
        public double amount;
    }

    public static class MessageResponse {
        public String message, error;
    }

    public static class PaymentRequest {
        public String amount, billReference, productDescription;
        public PaymentRequest(String amount, String billReference, String productDescription) {
            this.amount = amount; this.billReference = billReference; this.productDescription = productDescription;
        }
    }

    public static class JazzCashInitResponse {
        public Map<String, String> postData;
        public String postUrl;
    }

    public static class EasyPaisaInitResponse {
        public String postUrl;
        public Map<String, String> params;
    }

    public static class ChatRequest {
        public String message;
        public ChatRequest(String message) { this.message = message; }
    }

    public static class ChatResponse {
        public String reply;
    }

    public static class OtpRequest {
        public String email, phoneNumber;
        public OtpRequest(String email, String phoneNumber) { this.email = email; this.phoneNumber = phoneNumber; }
    }

    public static class OtpResponse {
        public String message, otp;
    }

    public static class TransferRequest {
        public String receiverEmail, note;
        public double amount;
        public TransferRequest(String receiverEmail, double amount, String note) {
            this.receiverEmail = receiverEmail; this.amount = amount; this.note = note;
        }
    }

    public static class BillRequest {
        public String billType;
        public double amount;
        public BillRequest(String billType, double amount) { this.billType = billType; this.amount = amount; }
    }
}
