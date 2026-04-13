package com.zenithbank.activities;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.biometric.BiometricPrompt;
import androidx.core.content.ContextCompat;
import com.zenithbank.R;
import com.zenithbank.api.Models.*;
import com.zenithbank.api.RetrofitClient;
import com.zenithbank.api.ZenithApiService;
import java.util.concurrent.Executor;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class LoginActivity extends AppCompatActivity {

    private EditText etEmail, etPassword, etFullName, etPhone;
    private Button btnLogin, btnSignup, btnFingerprint, btnFaceId, btnToggleSignup, btnVerifyOtp;
    private View layoutLogin, layoutSignup, layoutOtp;
    private ZenithApiService apiService;
    private String generatedOtp;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        apiService = RetrofitClient.getClient().create(ZenithApiService.class);

        // Layouts
        layoutLogin = findViewById(R.id.layoutLogin);
        layoutSignup = findViewById(R.id.layoutSignup);
        layoutOtp = findViewById(R.id.layoutOtp);

        // Fields
        etEmail = findViewById(R.id.etEmail);
        etPassword = findViewById(R.id.etPassword);
        etFullName = findViewById(R.id.etFullName);
        etPhone = findViewById(R.id.etPhone);
        EditText etOtpInput = findViewById(R.id.etOtpInput);

        // Buttons
        btnLogin = findViewById(R.id.btnLogin);
        btnSignup = findViewById(R.id.btnSignup);
        btnFingerprint = findViewById(R.id.btnFingerprint);
        btnFaceId = findViewById(R.id.btnFaceId);
        btnToggleSignup = findViewById(R.id.btnToggleSignup);
        btnVerifyOtp = findViewById(R.id.btnVerifyOtp);

        btnLogin.setOnClickListener(v -> performLogin());
        btnSignup.setOnClickListener(v -> initiateSignup());
        btnToggleSignup.setOnClickListener(v -> toggleSignupView());
        btnVerifyOtp.setOnClickListener(v -> {
            if (etOtpInput.getText().toString().equals(generatedOtp)) {
                completeSignup();
            } else {
                Toast.makeText(this, "Invalid OTP", Toast.LENGTH_SHORT).show();
            }
        });

        btnFingerprint.setOnClickListener(v -> showBiometricPrompt());
        btnFaceId.setOnClickListener(v -> startActivity(new Intent(this, FaceIdActivity.class)));
    }

    private void toggleSignupView() {
        if (layoutSignup.getVisibility() == View.GONE) {
            layoutSignup.setVisibility(View.VISIBLE);
            layoutLogin.setVisibility(View.GONE);
            btnToggleSignup.setText("Back to Login");
        } else {
            layoutSignup.setVisibility(View.GONE);
            layoutLogin.setVisibility(View.VISIBLE);
            btnToggleSignup.setText("Create New Account");
        }
    }

    private void initiateSignup() {
        String phone = etPhone.getText().toString();
        String email = etEmail.getText().toString();

        if (phone.isEmpty() || email.isEmpty()) {
            Toast.makeText(this, "Please fill all fields", Toast.LENGTH_SHORT).show();
            return;
        }

        // Call backend to "generate" OTP
        apiService.generateOtp(new OtpRequest(email, phone)).enqueue(new Callback<OtpResponse>() {
            @Override
            public void onResponse(Call<OtpResponse> call, Response<OtpResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    generatedOtp = response.body().otp;
                    Toast.makeText(LoginActivity.this, "OTP sent to " + phone, Toast.LENGTH_LONG).show();
                    layoutSignup.setVisibility(View.GONE);
                    layoutOtp.setVisibility(View.VISIBLE);
                }
            }

            @Override
            public void onFailure(Call<OtpResponse> call, Throwable t) {
                Toast.makeText(LoginActivity.this, "Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void completeSignup() {
        // Call the real signup API now
        SignupRequest request = new SignupRequest(
                etFullName.getText().toString(),
                "4210100000000", // Dummy CNIC
                etPhone.getText().toString(),
                etEmail.getText().toString(),
                etPassword.getText().toString()
        );

        apiService.signup(request).enqueue(new Callback<MessageResponse>() {
            @Override
            public void onResponse(Call<MessageResponse> call, Response<MessageResponse> response) {
                if (response.isSuccessful()) {
                    Toast.makeText(LoginActivity.this, "Account Created! Please Login.", Toast.LENGTH_SHORT).show();
                    layoutOtp.setVisibility(View.GONE);
                    layoutLogin.setVisibility(View.VISIBLE);
                }
            }

            @Override
            public void onFailure(Call<MessageResponse> call, Throwable t) {}
        });
    }

    private void performLogin() {
        String email = etEmail.getText().toString();
        String password = etPassword.getText().toString();

        LoginRequest request = new LoginRequest(email, password);
        apiService.login(request).enqueue(new Callback<LoginResponse>() {
            @Override
            public void onResponse(Call<LoginResponse> call, Response<LoginResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    String token = response.body().token;
                    // Save token in SharedPreferences
                    Toast.makeText(LoginActivity.this, "Login Successful", Toast.LENGTH_SHORT).show();
                    startActivity(new Intent(LoginActivity.this, MainActivity.class));
                } else {
                    Toast.makeText(LoginActivity.this, "Login Failed", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<LoginResponse> call, Throwable t) {
                Toast.makeText(LoginActivity.this, "Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void showBiometricPrompt() {
        Executor executor = ContextCompat.getMainExecutor(this);
        BiometricPrompt biometricPrompt = new BiometricPrompt(this, executor, new BiometricPrompt.AuthenticationCallback() {
            @Override
            public void onAuthenticationSucceeded(@NonNull BiometricPrompt.AuthenticationResult result) {
                super.onAuthenticationSucceeded(result);
                // In a real app, you'd use the biometric result to unlock a stored password
                Toast.makeText(LoginActivity.this, "Biometric Success! Logging in...", Toast.LENGTH_SHORT).show();
                // For demo, we might use a stored credential
                performLoginWithStoredCredentials();
            }
        });

        BiometricPrompt.PromptInfo promptInfo = new BiometricPrompt.PromptInfo.Builder()
                .setTitle("Zenith Bank Login")
                .setSubtitle("Log in using your biometric credential")
                .setNegativeButtonText("Use account password")
                .build();

        biometricPrompt.authenticate(promptInfo);
    }

    private void performLoginWithStoredCredentials() {
        // Implementation for biometric-based login
    }
}
