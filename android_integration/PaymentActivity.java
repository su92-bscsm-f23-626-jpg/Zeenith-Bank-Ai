package com.zenithbank.activities;

import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import com.zenithbank.R;
import com.zenithbank.api.Models.*;
import com.zenithbank.api.RetrofitClient;
import com.zenithbank.api.ZenithApiService;
import java.util.Map;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class PaymentActivity extends AppCompatActivity {

    private ZenithApiService apiService;
    private WebView webView;
    private EditText etAmount;
    private Button btnPayJazzCash;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_payment);

        apiService = RetrofitClient.getClient().create(ZenithApiService.class);
        webView = findViewById(R.id.paymentWebView);
        etAmount = findViewById(R.id.etAmount);
        btnPayJazzCash = findViewById(R.id.btnPayJazzCash);

        btnPayJazzCash.setOnClickListener(v -> initiateJazzCashPayment());
    }

    private void initiateJazzCashPayment() {
        String amount = etAmount.getText().toString();
        String token = "Bearer " + getStoredToken(); // Retrieve from SharedPreferences

        PaymentRequest request = new PaymentRequest(amount, "bill_" + System.currentTimeMillis(), "Wallet Deposit");
        apiService.initiateJazzCash(token, request).enqueue(new Callback<JazzCashInitResponse>() {
            @Override
            public void onResponse(Call<JazzCashInitResponse> call, Response<JazzCashInitResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    loadJazzCashWebView(response.body());
                }
            }

            @Override
            public void onFailure(Call<JazzCashInitResponse> call, Throwable t) {
                Toast.makeText(PaymentActivity.this, "Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void loadJazzCashWebView(JazzCashInitResponse data) {
        StringBuilder html = new StringBuilder();
        html.append("<html><body onload='document.forms[0].submit()'>");
        html.append("<form method='POST' action='").append(data.postUrl).append("'>");
        
        for (Map.Entry<String, String> entry : data.postData.entrySet()) {
            html.append("<input type='hidden' name='").append(entry.getKey()).append("' value='").append(entry.getValue()).append("'/>");
        }
        
        html.append("</form></body></html>");
        
        webView.getSettings().setJavaScriptEnabled(true);
        webView.setWebViewClient(new WebViewClient());
        webView.loadData(html.toString(), "text/html", "UTF-8");
    }

    private String getStoredToken() {
        // Return stored JWT token
        return "YOUR_STORED_TOKEN";
    }
}
