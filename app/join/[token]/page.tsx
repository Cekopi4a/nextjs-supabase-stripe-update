// app/join/[token]/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { 
  User,
  Mail,
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Dumbbell,
  Target,
  Calendar,
  TrendingUp
} from "lucide-react";
import { createSupabaseClient } from "@/utils/supabase/client";
import { acceptInvitationAction, validateInvitationAction } from "@/utils/actions/invitation-actions";
import { useParams, useRouter } from "next/navigation";

interface InvitationData {
  id: string;
  email: string;
  first_name?: string;
  personal_message?: string;
  trainer_id: string;
  trainer_name: string;
  trainer_email: string;
  status: string;
  expires_at: string;
}

interface ValidationResult {
  valid: boolean;
  error?: string;
  invitation?: InvitationData;
}

// Type guard за резултата от validateInvitationAction
function hasInvitation(result: ValidationResult): result is { valid: true; invitation: InvitationData } {
  return result && result.valid && "invitation" in result && !!result.invitation;
}

export default function JoinPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Registration form
  const [formData, setFormData] = useState({
    full_name: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });

  const supabase = createSupabaseClient();

  useEffect(() => {
    if (token) {
      validateInvitation();
    }
  }, [token, validateInvitation]);

  const validateInvitation = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Use server action to validate invitation
      const result = await validateInvitationAction(token);

      if (!hasInvitation(result)) {
        setError(result.error || "Грешка при валидиране на поканата");
        return;
      }

      // Set invitation data
      const invitationData = result.invitation;
      setInvitation({
        id: invitationData.id,
        email: invitationData.email,
        first_name: invitationData.first_name,
        personal_message: invitationData.personal_message,
        trainer_id: invitationData.trainer_id,
        trainer_name: invitationData.trainer_name,
        trainer_email: invitationData.trainer_email,
        status: invitationData.status,
        expires_at: invitationData.expires_at
      });

      // Pre-fill form with invitation data
      setFormData(prev => ({
        ...prev,
        full_name: invitationData.first_name || ''
      }));

    } catch (error) {
      console.error("Error validating invitation:", error);
      setError("Грешка при валидиране на поканата");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const handleRegistration = async () => {
    if (!invitation) return;

    // Validation
    if (!formData.full_name.trim()) {
      alert("Моля въведете вашето име");
      return;
    }

    if (formData.password.length < 6) {
      alert("Паролата трябва да бъде поне 6 символа");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Паролите не съвпадат");
      return;
    }

    setCreating(true);

    try {
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: invitation.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name.trim(),
            phone: formData.phone.trim() || null,
            role: 'client'
          }
        }
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error("Грешка при създаване на акаунт");
      }

      console.log('User created successfully:', authData.user.id);

      // Wait for the user profile to be created by the trigger
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Accept the invitation using server action
      const acceptResult = await acceptInvitationAction(
        token,
        authData.user.id,
        {
          full_name: formData.full_name.trim(),
          email: invitation.email,
          phone: formData.phone.trim() || undefined
        }
      );

      console.log('Accept invitation result:', acceptResult);

      if (!acceptResult.success) {
        console.error("Failed to accept invitation:", acceptResult.error);
        setError(acceptResult.error || "Грешка при приемане на поканата");
        return;
      }

      // Success! Redirect to protected area
      console.log('Registration and invitation acceptance successful');
      router.push("/protected");

    } catch (error: unknown) {
      console.error("Registration error:", error);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes("already registered")) {
        setError("Този имейл адрес вече е регистриран. Моля влезте в акаунта си.");
      } else if (errorMessage.includes("Email not confirmed")) {
        setError("Моля проверете имейла си и потвърдете акаунта.");
      } else {
        setError(errorMessage || "Грешка при създаване на акаунт");
      }
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Проверявам поканата...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">Проблем с поканата</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/sign-in">
                  Влез в акаунт
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/">
                  Начална страница
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">Поканата не е намерена</h1>
            <p className="text-muted-foreground mb-6">
              Възможно е линкът да е невалиден или изтекъл.
            </p>
            <Button asChild className="w-full">
              <Link href="/">
                Начална страница
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const expiresAt = new Date(invitation.expires_at);
  const daysUntilExpiry = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="grid gap-8 lg:grid-cols-2">
          
          {/* Welcome Section */}
          <Card className="p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Dumbbell className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold mb-2">
                Добре дошли в екипа!
              </h1>
              <p className="text-muted-foreground">
                Поканени сте да започнете фитнес пътуването си
              </p>
            </div>

            {/* Trainer Info */}
            <div className="border rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {invitation.trainer_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold">{invitation.trainer_name}</p>
                  <p className="text-sm text-muted-foreground">Вашия персонален треньор</p>
                </div>
              </div>
              
              {invitation.personal_message && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <p className="text-sm italic text-blue-800">
                    &ldquo;{invitation.personal_message}&rdquo;
                  </p>
                </div>
              )}
            </div>

            {/* What to expect */}
            <div className="space-y-4">
              <h3 className="font-semibold">Какво ви очаква:</h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Target className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Персонализирани програми</p>
                    <p className="text-sm text-muted-foreground">Тренировки адаптирани към вашите цели</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Календар с тренировки</p>
                    <p className="text-sm text-muted-foreground">Организирайте тренировките си</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">Проследяване на прогрес</p>
                    <p className="text-sm text-muted-foreground">Виждайте резултатите си в реално време</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Expiry notice */}
            <div className="mt-6 p-3 bg-orange-50 border border-orange-200 rounded">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <p className="text-sm text-orange-800">
                  Поканата изтича след {daysUntilExpiry} дни
                </p>
              </div>
            </div>
          </Card>

          {/* Registration Form */}
          <Card className="p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2">Създайте вашия акаунт</h2>
              <p className="text-muted-foreground">
                Попълнете данните си за да започнете
              </p>
            </div>

            <div className="space-y-4">
              {/* Email (read-only) */}
              <div>
                <Label htmlFor="email">Имейл адрес</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={invitation.email}
                    readOnly
                    className="pl-9 bg-gray-50"
                  />
                </div>
              </div>

              {/* Full Name */}
              <div>
                <Label htmlFor="full_name">Пълно име *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    placeholder="Георги Петров"
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Phone (optional) */}
              <div>
                <Label htmlFor="phone">Телефон (опционално)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+359 888 123 456"
                />
              </div>

              {/* Password */}
              <div>
                <Label htmlFor="password">Парола *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="Минимум 6 символа"
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <Label htmlFor="confirmPassword">Потвърди парола *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    placeholder="Повторете паролата"
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Password match indicator */}
              {formData.password && formData.confirmPassword && (
                <div className="flex items-center gap-2">
                  {formData.password === formData.confirmPassword ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">Паролите съвпадат</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-red-600">Паролите не съвпадат</span>
                    </>
                  )}
                </div>
              )}

              {/* Terms notice */}
              <div className="bg-gray-50 border rounded p-3">
                <p className="text-xs text-muted-foreground">
                  Създавайки акаунт, вие се съгласявате с нашите условия за ползване и политика за поверителност.
                </p>
              </div>

              {/* Submit Button */}
              <Button 
                onClick={handleRegistration}
                disabled={creating}
                className="w-full"
                size="lg"
              >
                {creating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Създавам акаунт...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Създай акаунт и започни
                  </>
                )}
              </Button>

              {/* Login link */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Вече имате акаунт?{' '}
                  <Link href="/sign-in" className="text-blue-600 hover:underline">
                    Влезте тук
                  </Link>
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}