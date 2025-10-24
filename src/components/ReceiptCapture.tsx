import { useState, useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface ReceiptCaptureProps {
  onImageCapture: (file: File) => void;
  isProcessing: boolean;
}

export function ReceiptCapture({ onImageCapture, isProcessing }: ReceiptCaptureProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onImageCapture(file);
    }
  };

  const clearPreview = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h2>Capture Receipt</h2>
        
        {preview ? (
          <div className="relative">
            <img 
              src={preview} 
              alt="Receipt preview" 
              className="w-full h-auto rounded-lg border border-border"
            />
            {!isProcessing && (
              <Button
                size="icon"
                variant="destructive"
                className="absolute top-2 right-2"
                onClick={clearPreview}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            {isProcessing && (
              <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-2"></div>
                  <p>Processing receipt...</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-32 flex flex-col gap-2"
              onClick={() => cameraInputRef.current?.click()}
            >
              <Camera className="h-8 w-8" />
              <span>Take Photo</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-32 flex flex-col gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-8 w-8" />
              <span>Upload Image</span>
            </Button>
          </div>
        )}

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileSelect}
        />
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>
    </Card>
  );
}
