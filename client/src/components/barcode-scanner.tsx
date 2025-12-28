import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BarcodeScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBarcodeScanned: (productName: string) => void;
}

interface ProductInfo {
  name: string;
  brand?: string;
}

async function lookupBarcode(barcode: string): Promise<ProductInfo | null> {
  try {
    console.log("Looking up barcode:", barcode);
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    const data = await response.json();
    
    console.log("Product data received:", data);
    
    if (data.status === 1 && data.product) {
      const product = {
        name: data.product.product_name || data.product.product_name_en || "Unknown Product",
        brand: data.product.brands,
      };
      console.log("Product found:", product);
      return product;
    }
    console.log("Product not found in database");
    return null;
  } catch (error) {
    console.error("Error looking up barcode:", error);
    return null;
  }
}

export function BarcodeScanner({ open, onOpenChange, onBarcodeScanned }: BarcodeScannerProps) {
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && !isScanning && !isInitializing) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        startScanner();
      }, 100);
    }
    
    return () => {
      stopScanner();
    };
  }, [open]);

  const startScanner = async () => {
    if (!containerRef.current) {
      console.log("Container ref not ready");
      return;
    }
    
    setIsInitializing(true);
    
    try {
      console.log("Initializing scanner...");
      const scanner = new Html5Qrcode("barcode-scanner-container");
      scannerRef.current = scanner;
      
      console.log("Requesting camera access...");
      const config = {
        fps: 10,
        qrbox: 250, // Full-width scanning for better detection
        aspectRatio: 1.777778, // 16:9
        disableFlip: false,
        // Support multiple barcode formats
        formatsToSupport: [
          0, // QR_CODE
          8, // EAN_13 (most common in Ireland/EU)
          9, // EAN_8
          13, // UPC_A
          14, // UPC_E
        ],
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true
        }
      };
      
      await scanner.start(
        { facingMode: "environment" },
        config,
        async (decodedText) => {
          console.log("Barcode detected:", decodedText);
          setIsLookingUp(true);
          await stopScanner();
          
          const product = await lookupBarcode(decodedText);
          
          if (product) {
            const productName = product.brand 
              ? `${product.brand} ${product.name}` 
              : product.name;
            console.log("Setting product name:", productName);
            onBarcodeScanned(productName);
            toast({
              title: "✅ Product found!",
              description: productName,
              duration: 3000,
            });
          } else {
            toast({
              title: "❌ Product not found",
              description: `Barcode: ${decodedText}. Please enter the name manually.`,
              variant: "destructive",
              duration: 5000,
            });
          }
          
          setIsLookingUp(false);
          onOpenChange(false);
        },
        () => {
          // Error callback - scanning errors, not camera errors
        }
      );
      
      console.log("Scanner started successfully");
      setIsScanning(true);
      setIsInitializing(false);
    } catch (error: any) {
      console.error("Error starting scanner:", error);
      console.error("Error details:", error.message, error.name);
      setIsInitializing(false);
      
      let errorMessage = "Could not access camera. Please check permissions.";
      if (error.name === "NotAllowedError") {
        errorMessage = "Camera permission denied. Please allow camera access in your browser settings.";
      } else if (error.name === "NotFoundError") {
        errorMessage = "No camera found on this device.";
      } else if (error.name === "NotReadableError") {
        errorMessage = "Camera is already in use by another application.";
      }
      
      toast({
        title: "Camera error",
        description: errorMessage,
        variant: "destructive",
      });
      onOpenChange(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (error) {
        console.error("Error stopping scanner:", error);
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleClose = async () => {
    await stopScanner();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg w-[90vw] p-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Scan Barcode
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {isLookingUp ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">Looking up product...</p>
            </div>
          ) : (
            <>
              <div className="relative w-full h-[300px] rounded-md overflow-hidden bg-black">
                {isInitializing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/80">
                    <Loader2 className="h-8 w-8 animate-spin text-white mb-2" />
                    <p className="text-sm text-white">Starting camera...</p>
                  </div>
                )}
                {!isInitializing && !isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted">
                    <p className="text-sm text-muted-foreground">Waiting for camera...</p>
                  </div>
                )}
                <div 
                  id="barcode-scanner-container" 
                  ref={containerRef}
                  className="w-full h-full"
                />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Point your camera at a product barcode
              </p>
            </>
          )}
          
          <Button variant="outline" className="w-full" onClick={handleClose}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
