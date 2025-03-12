
import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';

interface UploadAreaProps {
  onImageUploaded: (file: File) => void;
}

export function UploadArea({ onImageUploaded }: UploadAreaProps) {
  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    if (!file.type.startsWith('image/')) {
      return;
    }
    
    onImageUploaded(file);
  };
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': []
    },
    maxFiles: 1
  });

  return (
    <div 
      {...getRootProps()} 
      className={cn(
        "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all",
        isDragActive ? "border-primary bg-primary/5" : "border-muted",
        "hover:border-primary hover:bg-primary/5"
      )}
    >
      <input {...getInputProps()} />
      <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
      <h3 className="text-lg font-medium mb-1">Upload Chess Image</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Drag and drop or click to browse
      </p>
      <Button variant="secondary" size="sm">Browse Files</Button>
    </div>
  );
}
