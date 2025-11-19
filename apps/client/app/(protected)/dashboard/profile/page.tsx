"use client";

import React, { useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useSWR, { useSWRConfig } from "swr";
import { isAxiosError } from "axios";
import { toast } from "sonner";

import { getSelf } from "@/lib/auth.service";
import { updateSelf } from "@/lib/user.service";
import {
  updateProfileSchema,
  UpdateProfileInputs,
} from "@/lib/validators/user.schema";
import { User } from "@/types/index";
import { logger } from "@/lib/logger";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { User as UserIcon, Mail, Shield } from "lucide-react";

const fetcher = () => getSelf();

export default function ProfilePage() {
  const { mutate } = useSWRConfig();
  const { data: user, error, isLoading } = useSWR<User>("/auth/me", fetcher);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateProfileInputs>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: "",
    },
  });

  // Reset form when user data loads
  useEffect(() => {
    if (user) {
      reset({ name: user.name || "" });
    }
  }, [user, reset]);

  const onSubmit: SubmitHandler<UpdateProfileInputs> = async (data) => {
    try {
      const updatedUser = await updateSelf(data);
      // Optimistically update the cache
      mutate("/auth/me", updatedUser, false);
      
      toast.success("Profile updated successfully!");
      logger.log("Profile updated successfully.");
      // Reset form state to clean 'isDirty'
      reset({ name: updatedUser.name || "" });
    } catch (err: unknown) {
      let errorMsg = "An unknown error occured";
      if (isAxiosError(err)) {
        errorMsg = err.response?.data?.message || err.message;
      }
      logger.error("Profile update failed", err);
      toast.error(errorMsg);
    }
  };

  // Helper for avatar initials
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-muted-foreground animate-pulse">Loading profile details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-destructive/10 text-destructive">
        Failed to load profile. Please check your connection.
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <Separator />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Card */}
        <Card className="glass-effect border-border/50">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your personal information displayed on your profile.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              
              {/* Avatar Display (Read Only for now) */}
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-16 w-16 border-2 border-primary/20">
                  <AvatarImage src={(user as any)?.image} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary text-xl font-bold">
                    {getInitials(user?.name || "User")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    {user?.roles.map(r => r.name).join(", ")}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    value={user?.email || ""} 
                    disabled 
                    className="pl-9 bg-muted/50" 
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Email addresses cannot be changed once registered.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="name" 
                    className="pl-9 bg-background/50" 
                    {...register("name")} 
                  />
                </div>
                {errors.name && (
                  <p className="text-sm text-destructive font-medium">
                    {errors.name.message}
                  </p>
                )}
              </div>

            </CardContent>
            <CardFooter className="flex justify-end border-t border-border/50 pt-6">
              <Button 
                type="submit" 
                disabled={isSubmitting || !isDirty}
                className="bg-gradient-to-r from-primary to-accent"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Security Card (Static for now, can expand later) */}
        <Card className="glass-effect border-border/50 h-fit">
            <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>Manage your password and security preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>Password</Label>
                    <Input type="password" value="********" disabled className="bg-muted/50"/>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg bg-card/50">
                    <div className="space-y-0.5">
                        <Label className="text-base">Two-Factor Authentication</Label>
                        <p className="text-xs text-muted-foreground">
                            Secure your account with 2FA.
                        </p>
                    </div>
                    {/* Placeholder for future Toggle */}
                    <Button variant="outline" size="sm" disabled>Coming Soon</Button>
                </div>
            </CardContent>
             <CardFooter className="flex justify-end border-t border-border/50 pt-6">
               <Button variant="outline" disabled>Change Password</Button>
             </CardFooter>
        </Card>
      </div>
    </div>
  );
}