// ============================================================================
// FILE: src/components/properties/property-image-uploader.tsx
// Property Image Upload and Management Component
// ============================================================================

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Upload,
  Loader2,
  Star,
  StarOff,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";

interface PropertyImage {
  id: string;
  url: string;
  caption: string | null;
  isPrimary: boolean;
  order: number;
}

interface PropertyImageUploaderProps {
  propertyId: string;
  images: PropertyImage[];
  maxImages?: number;
}

export default function PropertyImageUploader({
  propertyId,
  images: initialImages,
  maxImages = 20,
}: PropertyImageUploaderProps) {
  const [images, setImages] = useState<PropertyImage[]>(initialImages);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const router = useRouter();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be less than 10MB");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setUploadDialogOpen(true);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("caption", caption);
      formData.append("isPrimary", isPrimary.toString());

      const response = await fetch(`/api/properties/${propertyId}/images`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Image uploaded successfully");
        setImages([...images, result.data]);
        setUploadDialogOpen(false);
        resetUploadForm();
        router.refresh();
      } else {
        toast.error(result.error || "Failed to upload image");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (imageId: string) => {
    try {
      const response = await fetch(
        `/api/properties/${propertyId}/images?imageId=${imageId}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success("Image deleted successfully");
        setImages(images.filter((img) => img.id !== imageId));
        setDeleteDialogOpen(false);
        setImageToDelete(null);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete image");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("An unexpected error occurred");
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    try {
      const response = await fetch(`/api/properties/${propertyId}/images`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageId,
          isPrimary: true,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Primary image updated");
        setImages(
          images.map((img) => ({
            ...img,
            isPrimary: img.id === imageId,
          }))
        );
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update image");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("An unexpected error occurred");
    }
  };

  const resetUploadForm = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setCaption("");
    setIsPrimary(false);
  };

  const confirmDelete = (imageId: string) => {
    setImageToDelete(imageId);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Property Images</h3>
          <p className="text-sm text-muted-foreground">
            {images.length} of {maxImages} images
          </p>
        </div>
        <div>
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={images.length >= maxImages}
            className="hidden"
            id="property-image-upload"
          />
          <label htmlFor="property-image-upload">
            <Button
              type="button"
              variant="outline"
              disabled={images.length >= maxImages}
              asChild
            >
              <span className="cursor-pointer">
                <Upload className="mr-2 h-4 w-4" />
                Upload Image
              </span>
            </Button>
          </label>
        </div>
      </div>

      {/* Images Grid */}
      {images.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              No images uploaded yet
            </p>
            <label htmlFor="property-image-upload">
              <Button type="button" variant="outline" asChild>
                <span className="cursor-pointer">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload First Image
                </span>
              </Button>
            </label>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images
            .sort((a, b) => (a.isPrimary ? -1 : b.isPrimary ? 1 : a.order - b.order))
            .map((image) => (
              <Card key={image.id} className="group relative overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative aspect-video">
                    <Image
                      src={image.url}
                      alt={image.caption || "Property image"}
                      fill
                      className="object-cover"
                    />
                    {image.isPrimary && (
                      <Badge className="absolute top-2 left-2 bg-yellow-500">
                        <Star className="h-3 w-3 mr-1" />
                        Primary
                      </Badge>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {!image.isPrimary && (
                        <Button
                          size="icon"
                          variant="secondary"
                          onClick={() => handleSetPrimary(image.id)}
                          title="Set as primary"
                        >
                          <StarOff className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => confirmDelete(image.id)}
                        title="Delete image"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {image.caption && (
                    <div className="p-2">
                      <p className="text-xs text-muted-foreground truncate">
                        {image.caption}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Property Image</DialogTitle>
            <DialogDescription>
              Add a new image to your property listing
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {previewUrl && (
              <div className="relative aspect-video rounded-lg overflow-hidden">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block">
                Caption (optional)
              </label>
              <Input
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Beautiful living room with natural light..."
                maxLength={100}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is-primary"
                checked={isPrimary}
                onChange={(e) => setIsPrimary(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="is-primary" className="text-sm">
                Set as primary image
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setUploadDialogOpen(false);
                resetUploadForm();
              }}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={isUploading}>
              {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Image?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              image from your property.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => imageToDelete && handleDelete(imageToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}