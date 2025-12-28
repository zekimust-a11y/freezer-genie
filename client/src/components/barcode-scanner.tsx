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
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    const data = await response.json();
    
    if (data.status === 1 && data.product) {
      return {
        name: data.product.product_name || data.product.product_name_en || "Unknown Product",
        brand: data.product.brands,
      };
    }
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
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && !isScanning) {
      startScanner();
    }
    
    return () => {
      stopScanner();
    };
  }, [open]);

  const startScanner = async () => {
    if (!containerRef.current) return;
    
    try {
      const scanner = new Html5Qrcode("barcode-scanner-container");
      scannerRef.current = scanner;
      
      // Request camera permissions first
      const cameras = await Html5Qrcode.getCameras();
      if (!cameras || cameras.length === 0) {
        throw new Error("No cameras found");
      }
      
      // Get the back camera if available
      const backCamera = cameras.find(camera => 
        camera.label.toLowerCase().includes('back') || 
        camera.label.toLowerCase().includes('rear')
      ) || cameras[0];
      
      await scanner.start(
        backCamera.id || { facingMode: "environment" },
        {
          fps: 10,
          qrbox: function(viewfinderWidth, viewfinderHeight) {
            // Make the scanning box responsive to viewport
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const qrboxSize = Math.floor(minEdge * 0.7);
            return {
              width: qrboxSize,
              height: Math.floor(qrboxSize * 0.6)
            };
          },
          aspectRatio: 16/9,
        },
        async (decodedText) => {
          setIsLookingUp(true);
          await stopScanner();
          
          const product = await lookupBarcode(decodedText);
          
          if (product) {
            const productName = product.brand 
              ? `${product.brand} ${product.name}` 
              : product.name;
            onBarcodeScanned(productName);
            toast({
              title: "Product found",
              description: productName,
            });
          } else {
            toast({
              title: "Product not found",
              description: `Barcode: ${decodedText}. You can enter the name manually.`,
            });
          }
          
          setIsLookingUp(false);
          onOpenChange(false);
        },
        () => {}
      );
      
      setIsScanning(true);
    } catch (error) {
      console.error("Error starting scanner:", error);
      toast({
        title: "Camera error",
        description: "Could not access camera. Please check permissions.",
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
      <DialogContent className="sm:max-w-md max-w-[95vw]">
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
              <div 
                id="barcode-scanner-container" 
                ref={containerRef}
                className="w-full min-h-[300px] bg-black rounded-md overflow-hidden"
                style={{ aspectRatio: '16/9' }}
              />
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
