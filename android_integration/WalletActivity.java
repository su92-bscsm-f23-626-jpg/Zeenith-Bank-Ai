package com.zenithbank.activities;

import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import com.zenithbank.R;
import com.zenithbank.api.Models.*;
import com.zenithbank.api.RetrofitClient;
import com.zenithbank.api.ZenithApiService;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class WalletActivity extends AppCompatActivity {

    private LinearLayout layoutInput, layoutOtp;
    private EditText etPhone, etAmount, etOtpInput;
    private Button btnContinue, btnVerify;
    private TextView tvWalletTitle;
    private String walletType; // JazzCash or EasyPaisa
    private String generatedOtp;
    private ZenithApiService apiService;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_wallet);

        apiService = RetrofitClient.getClient().create(ZenithApiService.class);
        walletType = getIntent().getStringExtra("WALLET_TYPE");

        layoutInput = findViewById(R.id.layoutInput);
        layoutOtp = findViewById(R.id.layoutOtp);
        etPhone = findViewById(R.id.etPhone);
        etAmount = findViewById(R.id.etAmount);
        etOtpInput = findViewById(R.id.etOtpInput);
        btnContinue = findViewById(R.id.btnContinue);
        btnVerify = findViewById(R.id.btnVerify);
        tvWalletTitle = findViewById(R.id.tvWalletTitle);

        tvWalletTitle.setText("Add Money via " + walletType);

        btnContinue.setOnClickListener(v -> requestOtp());
        btnVerify.setOnClickListener(v -> verifyOtp());
    }

    private void requestOtp() {
        String phone = etPhone.getText().toString();
        String amount = etAmount.getText().toString();

        if (phone.isEmpty() || amount.isEmpty()) {
            Toast.makeText(this, "Please enter phone and amount", Toast.LENGTH_SHORT).show();
            return;
        }

        // Simulate OTP generation via backend
        apiService.generateOtp(new OtpRequest("demo@zenith.com", phone)).enqueue(new Callback<OtpResponse>() {
            @Override
            public void onResponse(Call<OtpResponse> call, Response<OtpResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    generatedOtp = response.body().otp;
                    Toast.makeText(WalletActivity.this, "OTP sent to " + phone, Toast.LENGTH_LONG).show();
                    layoutInput.setVisibility(View.GONE);
                    layoutOtp.setVisibility(View.VISIBLE);
                }
            }

            @Override
            public void onFailure(Call<OtpResponse> call, Throwable t) {}
        });
    }

    private void verifyOtp() {
        if (etOtpInput.getText().toString().equals(generatedOtp)) {
            updateBalance();
        } else {
            Toast.makeText(this, "Invalid OTP", Toast.LENGTH_SHORT).show();
        }
    }

    private void updateBalance() {
        // In a real app, this would be a backend call. 
        // For demo, we just show success and update UI.
        Toast.makeText(this, "Payment Successful via " + walletType, Toast.LENGTH_LONG).show();
        finish(); // Go back to dashboard
    }
}
