/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// components/settings/profile-settings.tsx
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Upload, X, Camera } from "lucide-react";
import { updateProfile } from "@/actions/settings";
import { toast } from "sonner";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileSettingsProps {
  profile: any;
}

export function ProfileSettings({ profile }: ProfileSettingsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    profile.avatar || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile.name || "",
      phone: profile.phone || "",
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB");
      return;
    }

    setIsUploading(true);

    try {
      // Upload to server
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload/avatar", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Upload failed");
      }

      // Update preview with the new URL from server (includes cache buster)
      if (result.data?.avatar) {
        setPreviewUrl(result.data.avatar);
        toast.success("Avatar uploaded successfully");
        router.refresh();
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to upload avatar");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    try {
      setIsUploading(true);
      
      const response = await fetch("/api/upload/avatar", {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to remove avatar");
      }

      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
      toast.success("Avatar removed successfully");
      router.refresh();
    } catch (error) {
      console.error("Remove error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to remove avatar");
    } finally {
      setIsUploading(false);
    }
  };

  async function onSubmit(data: ProfileFormValues) {
    setIsLoading(true);

    try {
      const result = await updateProfile(data);

      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-lg sm:text-xl">Profile Information</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Update your personal information and profile picture
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            {/* Avatar Upload - Responsive Layout */}
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              {/* Avatar with Camera Button */}
              <div className="relative flex-shrink-0">
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                  <AvatarImage 
                    src={previewUrl || profile.avatar}
                    key={previewUrl || profile.avatar}
                  />
                  <AvatarFallback className="text-xl sm:text-2xl">
                    {profile.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                
                {/* Camera Button Overlay */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || isLoading}
                  className="
                    absolute 
                    bottom-0 
                    right-0 
                    p-1.5 
                    sm:p-2 
                    bg-primary 
                    text-primary-foreground 
                    rounded-full 
                    hover:bg-primary/90 
                    transition-colors 
                    disabled:opacity-50
                    shadow-md
                  "
                >
                  <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
              </div>

              {/* Upload Controls */}
              <div className="flex-1 w-full space-y-2">
                <div className="text-center sm:text-left">
                  <label className="text-xs sm:text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Profile Picture
                  </label>
                  
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={isUploading || isLoading}
                    />
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading || isLoading}
                      className="w-full sm:w-auto"
                      size="sm"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Choose Image
                        </>
                      )}
                    </Button>
                    
                    {previewUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleRemoveImage}
                        disabled={isUploading || isLoading}
                        className="w-full sm:w-auto"
                        size="sm"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-2">
                    Max 2MB • JPG, PNG, or GIF
                  </p>
                </div>
              </div>
            </div>

            {/* Email (read-only) */}
            <div className="space-y-2">
              <FormLabel className="text-xs sm:text-sm">Email</FormLabel>
              <Input 
                value={profile.email} 
                disabled 
                className="text-xs sm:text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>

            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs sm:text-sm">Full Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="John Doe" 
                      {...field} 
                      className="text-xs sm:text-sm"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Phone */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs sm:text-sm">Phone Number</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="+1 (555) 000-0000" 
                      {...field} 
                      className="text-xs sm:text-sm"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Role & Status (read-only) - Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <FormLabel className="text-xs sm:text-sm">Role</FormLabel>
                <Input 
                  value={profile.role} 
                  disabled 
                  className="text-xs sm:text-sm"
                />
              </div>
              <div className="space-y-2">
                <FormLabel className="text-xs sm:text-sm">Account Status</FormLabel>
                <Input 
                  value={profile.status} 
                  disabled 
                  className="text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Submit Button - Full width on mobile */}
            <div className="flex justify-end pt-2">
              <Button 
                type="submit" 
                disabled={isLoading || isUploading}
                className="w-full sm:w-auto"
                size="sm"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}