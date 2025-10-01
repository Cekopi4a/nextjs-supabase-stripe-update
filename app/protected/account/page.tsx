"use client";

import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, User as UserIcon, Mail, Key, CheckCircle, XCircle, Camera } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { AvatarUpload } from "@/components/ui/avatar-upload";


export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const supabase = createSupabaseClient();
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
        setEmail(data.user.email || "");

        // Fetch profile data from profiles table
        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", data.user.id)
          .single();

        if (profileData) {
          setFullName(profileData.full_name || "");
          setAvatarUrl(profileData.avatar_url || null);
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const supabase = createSupabaseClient();

    if (!user) {
      setMessage({ type: 'error', text: 'Потребителят не е намерен.' });
      setSaving(false);
      return;
    }

    // Update profile in profiles table
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", user.id);

    if (error) {
      setMessage({ type: 'error', text: 'Грешка при обновяване на профила.' });
    } else {
      setMessage({ type: 'success', text: 'Профилът е обновен успешно!' });

      // Also update auth metadata for consistency
      await supabase.auth.updateUser({
        data: { full_name: fullName }
      });
    }
    setSaving(false);
  };

  const handleAvatarChange = (url: string | null) => {
    setAvatarUrl(url);
    setMessage({ type: 'success', text: 'Профилната снимка е обновена успешно!' });
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Новите пароли не съвпадат.' });
      setSaving(false);
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Новата парола трябва да е поне 6 символа.' });
      setSaving(false);
      return;
    }

    const supabase = createSupabaseClient();

    // Първо проверяваме текущата парола чрез повторно влизане
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user?.email || '',
      password: currentPassword
    });

    if (signInError) {
      setMessage({ type: 'error', text: 'Текущата парола е невалидна.' });
      setSaving(false);
      return;
    }

    // Ако текущата парола е правилна, обновяваме паролата
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      setMessage({ type: 'error', text: 'Грешка при смяна на паролата.' });
    } else {
      setMessage({ type: 'success', text: 'Паролата е сменена успешно!' });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    const supabase = createSupabaseClient();
    await supabase.auth.signOut();
    router.push("/sign-in");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Зареждане...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-muted-foreground">Не сте влезли в системата.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center mb-6">
        <UserIcon className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full p-2 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900">Моят профил</h1>
        <p className="text-gray-600">Управлявайте вашия акаунт и настройки</p>
      </div>

      {message && (
        <Alert className={message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
          <div className="flex items-center">
            {message.type === 'error' ?
              <XCircle className="h-4 w-4 text-red-600" /> :
              <CheckCircle className="h-4 w-4 text-green-600" />
            }
            <AlertDescription className={`ml-2 ${message.type === 'error' ? 'text-red-800' : 'text-green-800'}`}>
              {message.text}
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* Profile Picture */}
      <Card className="p-6">
        <div className="flex items-center mb-4">
          <Camera className="h-5 w-5 text-gray-500 mr-2" />
          <h2 className="text-xl font-semibold">Профилна снимка</h2>
        </div>
        <div className="flex justify-center">
          <AvatarUpload
            currentAvatarUrl={avatarUrl}
            onAvatarChange={handleAvatarChange}
            size="lg"
          />
        </div>
      </Card>

      {/* Profile Information */}
      <Card className="p-6">
        <div className="flex items-center mb-4">
          <Mail className="h-5 w-5 text-gray-500 mr-2" />
          <h2 className="text-xl font-semibold">Профилна информация</h2>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
              Име
            </Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
              className="mt-1"
              placeholder="Въведете вашето име"
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Имейл адрес
            </Label>
            <Input
              id="email"
              value={email}
              disabled
              className="mt-1 bg-gray-50 text-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Имейл адресът не може да бъде променен
            </p>
          </div>

          <Button type="submit" disabled={saving} className="w-full">
            {saving ? 'Запазва...' : 'Запази промените'}
          </Button>
        </form>
      </Card>

      {/* Password Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Key className="h-5 w-5 text-gray-500 mr-2" />
            <h2 className="text-xl font-semibold">Сигурност</h2>
          </div>
          {!showPasswordForm && (
            <Button
              variant="outline"
              onClick={() => setShowPasswordForm(true)}
              className="text-sm"
            >
              Смени парола
            </Button>
          )}
        </div>

        {showPasswordForm && (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword" className="text-sm font-medium text-gray-700">
                Текуща парола
              </Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                required
                className="mt-1"
                placeholder="Въведете текущата си парола"
                autoComplete="current-password"
              />
            </div>

            <div>
              <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                Нова парола
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                minLength={6}
                required
                className="mt-1"
                placeholder="Въведете нова парола"
                autoComplete="new-password"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Потвърдете новата парола
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                minLength={6}
                required
                className="mt-1"
                placeholder="Потвърдете новата парола"
                autoComplete="new-password"
              />
            </div>

            <div className="text-xs text-gray-500">
              <ul className="list-disc list-inside space-y-1">
                <li>Паролата трябва да е поне 6 символа</li>
                <li>Използвайте комбинация от букви, числа и символи</li>
              </ul>
            </div>

            <div className="flex space-x-3">
              <Button type="submit" disabled={saving} className="flex-1">
                {saving ? 'Сменя...' : 'Смени паролата'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowPasswordForm(false);
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setMessage(null);
                }}
                className="flex-1"
              >
                Отказ
              </Button>
            </div>
          </form>
        )}

        {!showPasswordForm && (
          <p className="text-sm text-gray-500">
            Последна промяна: Неизвестно
          </p>
        )}
      </Card>

      <Separator />

      {/* Sign Out Section */}
      <div className="flex justify-center">
        <Button variant="destructive" onClick={handleSignOut} className="w-40">
          <Shield className="h-4 w-4 mr-2" />
          Изход
        </Button>
      </div>
    </div>
  );
}