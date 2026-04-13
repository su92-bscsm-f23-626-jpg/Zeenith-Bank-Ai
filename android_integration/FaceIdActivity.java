package com.zenithbank.activities;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.View;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.camera.core.CameraSelector;
import androidx.camera.core.Preview;
import androidx.camera.lifecycle.ProcessCameraProvider;
import androidx.camera.view.PreviewView;
import androidx.core.content.ContextCompat;
import com.google.common.util.concurrent.ListenableFuture;
import com.zenithbank.R;
import java.util.concurrent.ExecutionException;

public class FaceIdActivity extends AppCompatActivity {

    private PreviewView previewView;
    private View scanningOverlay;
    private ProgressBar progressBar;
    private TextView tvStatus;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_face_id);

        previewView = findViewById(R.id.previewView);
        scanningOverlay = findViewById(R.id.scanningOverlay);
        progressBar = findViewById(R.id.progressBar);
        tvStatus = findViewById(R.id.tvStatus);

        startCamera();
    }

    private void startCamera() {
        ListenableFuture<ProcessCameraProvider> cameraProviderFuture = ProcessCameraProvider.getInstance(this);

        cameraProviderFuture.addListener(() -> {
            try {
                ProcessCameraProvider cameraProvider = cameraProviderFuture.get();
                bindPreview(cameraProvider);
            } catch (ExecutionException | InterruptedException e) {
                Toast.makeText(this, "Error starting camera: " + e.getMessage(), Toast.LENGTH_SHORT).show();
            }
        }, ContextCompat.getMainExecutor(this));
    }

    private void bindPreview(@NonNull ProcessCameraProvider cameraProvider) {
        Preview preview = new Preview.Builder().build();

        CameraSelector cameraSelector = new CameraSelector.Builder()
                .requireLensFacing(CameraSelector.LENS_FACING_FRONT)
                .build();

        preview.setSurfaceProvider(previewView.getSurfaceProvider());

        cameraProvider.unbindAll();
        cameraProvider.bindToLifecycle(this, cameraSelector, preview);

        // Simulate Scanning Process
        simulateScanning();
    }

    private void simulateScanning() {
        tvStatus.setText("Scanning Face...");
        scanningOverlay.setVisibility(View.VISIBLE);
        progressBar.setVisibility(View.VISIBLE);

        new Handler(Looper.getMainLooper()).postDelayed(() -> {
            tvStatus.setText("Face Recognized!");
            scanningOverlay.setBackgroundResource(R.drawable.circle_green); // Change overlay color to green
            progressBar.setVisibility(View.GONE);

            new Handler(Looper.getMainLooper()).postDelayed(() -> {
                Toast.makeText(FaceIdActivity.this, "Authentication Successful", Toast.LENGTH_SHORT).show();
                // Navigate to Dashboard
                startActivity(new Intent(FaceIdActivity.this, MainActivity.class));
                finish();
            }, 1500);

        }, 4000); // 4 seconds of "scanning"
    }
}
