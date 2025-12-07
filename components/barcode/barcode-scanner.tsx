
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface BarcodeScannerProps {
  onScanResult?: (data: string) => void;
}

export default function BarcodeScanner({ onScanResult }: BarcodeScannerProps) {
  const [manualInput, setManualInput] = useState("");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err: any) {
      console.error("Camera access denied:", err);
      setError("Unable to access camera. Please use manual input instead.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    setIsCameraActive(false);
  };

  const handleManualScan = () => {
    const trimmed = manualInput.trim();
    if (!trimmed) {
      setError("Please enter a valid barcode number.");
      return;
    }
    
    setError(null);
    onScanResult?.(trimmed);
    setManualInput("");
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Camera Feed */}
      {isCameraActive ? (
        <div className="space-y-4">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full max-w-md mx-auto rounded-lg border-2 border-blue-300"
          />
          <Button onClick={stopCamera} variant="outline" className="w-full">
            Stop Camera
          </Button>
        </div>
      ) : (
        <Button onClick={startCamera} className="w-full gap-2">
          Start Camera
        </Button>
      )}

      {/* Manual Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Or enter barcode manually:</label>
        <div className="flex gap-2">
          <Input
            placeholder="Enter barcode number (e.g., TG240710001)"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleManualScan()}
          />
          <Button onClick={handleManualScan}>Scan</Button>
        </div>
      </div>
    </div>
  );
}
