"use client";

import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const supabase = createSupabaseClient();
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
        setFullName(data.user.user_metadata?.full_name || "");
        setEmail(data.user.email || "");
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
    // Обновяване на името
    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName }
    });
    if (error) {
      setMessage("Грешка при обновяване на профила.");
    } else {
      setMessage("Профилът е обновен успешно!");
    }
    setSaving(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    if (password !== password2) {
      setMessage("Паролите не съвпадат.");
      setSaving(false);
      return;
    }
    const supabase = createSupabaseClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setMessage("Грешка при смяна на паролата.");
    } else {
      setMessage("Паролата е сменена успешно!");
      setPassword("");
      setPassword2("");
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    const supabase = createSupabaseClient();
    await supabase.auth.signOut();
    router.push("/sign-in");
  };

  if (loading) return <div>Зареждане...</div>;
  if (!user) return <div>Не сте влезли в системата.</div>;

  return (
    <div className="max-w-xl mx-auto mt-8">
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Моят профил</h2>
        <form onSubmit={handleSave} className="space-y-4 mb-6">
          <div>
            <Label htmlFor="fullName">Име</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Имейл</Label>
            <Input id="email" value={email} disabled />
          </div>
          <Button type="submit" disabled={saving}>Запази промените</Button>
        </form>

        <form onSubmit={handlePasswordChange} className="space-y-4 mb-6">
          <h3 className="font-semibold">Смяна на парола</h3>
          <div>
            <Label htmlFor="password">Нова парола</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>
          <div>
            <Label htmlFor="password2">Повтори новата парола</Label>
            <Input
              id="password2"
              type="password"
              value={password2}
              onChange={e => setPassword2(e.target.value)}
              minLength={6}
              required
            />
          </div>
          <Button type="submit" variant="secondary" disabled={saving}>Смени паролата</Button>
        </form>

        {message && <div className="mb-4 text-center text-sm text-blue-600">{message}</div>}

        <Button variant="destructive" onClick={handleSignOut}>Изход</Button>
      </Card>
    </div>
  );
}