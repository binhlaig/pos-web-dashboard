"use client";

import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import UploadImage from "../customUI/UploadImage";
import { Eye, EyeOff, Mail, Lock, User2, MapPin } from "lucide-react";

// Schemas
const registerSchema = z.object({
  username: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  address: z.string().min(2),
  image: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export default function AuthPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: "", email: "", password: "", address: "", image: "" },
  });

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  return (
    <div
      className="
        relative mx-auto flex min-h-[100vh] w-full max-w-5xl items-center justify-center px-6 py-12
        text-foreground
      "
    >
      {/* Theme-aware soft background */}
      <div
        aria-hidden
        className="
          absolute inset-0 -z-10
          bg-[radial-gradient(ellipse_at_top,_theme(colors.slate.100),transparent_60%),radial-gradient(ellipse_at_bottom,_theme(colors.sky.100),transparent_60%)]
          dark:bg-[radial-gradient(ellipse_at_top,_rgba(56,189,248,0.08),transparent_60%),radial-gradient(ellipse_at_bottom,_rgba(99,102,241,0.10),transparent_60%)]
        "
      />

      <Card
        className="
          w-full rounded-2xl border border-border
          bg-card/70 backdrop-blur-md shadow-xl
          dark:bg-card/60
        "
      >
        <CardHeader className="text-center">
          <CardTitle
            className="
              text-3xl font-bold
              text-foreground
              [text-wrap:balance]
            "
          >
            Welcome to Bin Hlaig Group
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList
              className="
                grid w-full grid-cols-2
                bg-muted/60
                dark:bg-muted/50
              "
            >
              <TabsTrigger
                value="login"
                className="
                  data-[state=active]:bg-background data-[state=active]:text-foreground
                  data-[state=inactive]:text-muted-foreground
                "
              >
                Login
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="
                  data-[state=active]:bg-background data-[state=active]:text-foreground
                  data-[state=inactive]:text-muted-foreground
                "
              >
                Register
              </TabsTrigger>
            </TabsList>

            {/* LOGIN FORM */}
            <TabsContent value="login">
              <Form {...loginForm}>
                <form className="mt-6 space-y-6">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              type="email"
                              placeholder="you@example.com"
                              {...field}
                              className="
                                pl-9
                                bg-background/70
                                border-border
                                placeholder:text-muted-foreground
                                focus-visible:ring-ring
                              "
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              {...field}
                              className="
                                pl-9 pr-10
                                bg-background/70
                                border-border
                                placeholder:text-muted-foreground
                                focus-visible:ring-ring
                              "
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:opacity-100 opacity-80"
                              onClick={() => setShowPassword((p) => !p)}
                              aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="
                      w-full
                      bg-blue-600 hover:bg-blue-700 text-white
                      dark:bg-blue-500 dark:hover:bg-blue-400
                    "
                    disabled={loading}
                  >
                    {loading ? "Loading..." : "Login"}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            {/* REGISTER FORM */}
            <TabsContent value="register">
              <Form {...registerForm}>
                <form className="mt-6 space-y-6">
                  <FormField
                    control={registerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              placeholder="Username"
                              {...field}
                              className="
                                pl-9
                                bg-background/70
                                border-border
                                placeholder:text-muted-foreground
                                focus-visible:ring-ring
                              "
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              type="email"
                              placeholder="you@example.com"
                              {...field}
                              className="
                                pl-9
                                bg-background/70
                                border-border
                                placeholder:text-muted-foreground
                                focus-visible:ring-ring
                              "
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              {...field}
                              className="
                                pl-9 pr-10
                                bg-background/70
                                border-border
                                placeholder:text-muted-foreground
                                focus-visible:ring-ring
                              "
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:opacity-100 opacity-80"
                              onClick={() => setShowPassword((p) => !p)}
                              aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              placeholder="Address"
                              {...field}
                              className="
                                pl-9
                                bg-background/70
                                border-border
                                placeholder:text-muted-foreground
                                focus-visible:ring-ring
                              "
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profile Image</FormLabel>
                        <FormControl>
                          <UploadImage
                            value={field.value ? [field.value] : []}
                            onChange={(url) => field.onChange(url)}
                            onRemove={() => field.onChange("")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="
                      w-full
                      bg-blue-600 hover:bg-blue-700 text-white
                      dark:bg-blue-500 dark:hover:bg-blue-400
                    "
                    disabled={loading}
                  >
                    {loading ? "Loading..." : "Register"}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
