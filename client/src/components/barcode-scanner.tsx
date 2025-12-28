import { useState, useEffect, useRef } from "react";
import { BrowserMultiFormatReader, NotFoundException, DecodeHintType } from '@zxing/library';
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    if (open && !isScanning && !isInitializing) {
      setTimeout(() => {
        startScanner();
      }, 100);
    }
    
    return () => {
      stopScanner();
    };
  }, [open]);

  const startScanner = async () => {
    if (!videoRef.current) {
      console.log("Video ref not ready");
      return;
    }
    
    setIsInitializing(true);
    
    try {
      console.log("Initializing ZXing barcode scanner...");
      // TRY_HARDER improves detection for smaller / lower-contrast barcodes
      const hints = new Map();
      hints.set(DecodeHintType.TRY_HARDER, true);
      const codeReader = new BrowserMultiFormatReader(hints);
      codeReaderRef.current = codeReader;
      // Prefer back camera, higher resolution to help decode smaller barcodes
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };
      console.log("Starting continuous decode with constraints:", constraints);

      await codeReader.decodeFromConstraints(
        constraints,
        videoRef.current,
        async (result, error) => {
          if (result) {
            console.log("Barcode detected:", result.getText());
            setIsLookingUp(true);
            await stopScanner();
            
            const product = await lookupBarcode(result.getText());
            
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
                description: `Barcode: ${result.getText()}. Please enter the name manually.`,
                variant: "destructive",
                duration: 5000,
              });
            }
            
            setIsLookingUp(false);
            onOpenChange(false);
          }
          
          if (error && !(error instanceof NotFoundException)) {
            console.error("Decode error:", error);
          }
        }
      );
      
      console.log("Scanner started successfully");
      setIsScanning(true);
      setIsInitializing(false);
    } catch (error: any) {
      console.error("Error starting scanner:", error);
      setIsInitializing(false);
      
      let errorMessage = "Could not access camera. Please check permissions.";
      if (error.name === "NotAllowedError") {
        errorMessage = "Camera permission denied. Please allow camera access in your browser settings.";
      } else if (error.name === "NotFoundError" || error.message === "No camera found") {
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
    if (codeReaderRef.current) {
      try {
        console.log("Stopping scanner...");
        codeReaderRef.current.reset();
      } catch (error) {
        console.error("Error stopping scanner:", error);
      }
      codeReaderRef.current = null;
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
              <div className="relative w-full h-[400px] rounded-md overflow-hidden bg-black">
                {isInitializing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/80">
                    <Loader2 className="h-8 w-8 animate-spin text-white mb-2" />
                    <p className="text-sm text-white">Starting camera...</p>
                  </div>
                )}
                <video 
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
                {isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="border-2 border-white w-4/5 h-1/3 rounded-lg shadow-lg">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />
                    </div>
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Position the barcode inside the frame
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
