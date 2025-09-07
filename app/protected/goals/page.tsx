"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createSupabaseClient } from "@/utils/supabase/client";
import { dateToLocalDateString } from "@/utils/date-utils";
import { CheckCircle2, UploadCloud, Target, Image as ImageIcon, TrendingUp } from "lucide-react";

interface ClientGoal {
  id: string;
  client_id: string;
  title: string;
  description?: string;
  target_value?: number;
  unit?: string;
  target_date?: string;
  is_achieved: boolean;
  priority?: number;
}

interface BodyMeasurement {
  id: string;
  client_id: string;
  date: string;
  weight_kg?: number;
  notes?: string;
}

export default function GoalsPage() {
  const supabase = createSupabaseClient();

  const [goals, setGoals] = useState<ClientGoal[]>([]);
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");
  const [photos, setPhotos] = useState<{ name: string; url: string }[]>([]);

  // Forms
  const [goalForm, setGoalForm] = useState({
    title: "",
    description: "",
    target_value: "",
    unit: "kg",
    target_date: dateToLocalDateString(new Date()),
    priority: 1
  });
  const [weightForm, setWeightForm] = useState({
    date: dateToLocalDateString(new Date()),
    weight_kg: "",
    notes: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [{ data: userData }, { data: goalsData }, { data: measData }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from("client_goals").select("*").order("priority", { ascending: false }),
        supabase
          .from("body_measurements")
          .select("*")
          .order("date", { ascending: false })
          .limit(30)
      ]);

      if (!userData?.user) return;

      setUserId(userData.user.id);
      setGoals((goalsData || []) as ClientGoal[]);
      setMeasurements((measData || []) as BodyMeasurement[]);
      await loadPhotos(userData.user.id);
  async function loadPhotos(ownerId: string) {
    try {
      const { data: files } = await supabase.storage
        .from("progress-photos")
        .list(ownerId, { limit: 100, sortBy: { column: "name", order: "desc" } });
      const list = (files || []).map((f) => {
        const { data } = supabase.storage.from("progress-photos").getPublicUrl(`${ownerId}/${f.name}`);
        return { name: f.name, url: data.publicUrl };
      });
      setPhotos(list);
    } catch {}
  }
    } finally {
      setLoading(false);
    }
  };

  const addGoal = async () => {
    if (!goalForm.title.trim()) return;
    const { error, data } = await supabase.from("client_goals").insert({
      title: goalForm.title.trim(),
      description: goalForm.description.trim() || null,
      target_value: goalForm.target_value ? Number(goalForm.target_value) : null,
      unit: goalForm.unit || null,
      target_date: goalForm.target_date || null,
      priority: goalForm.priority || 1,
      is_achieved: false
    }).select("*").single();
    if (!error && data) {
      setGoals(prev => [data as ClientGoal, ...prev]);
      setGoalForm({ title: "", description: "", target_value: "", unit: "kg", target_date: dateToLocalDateString(new Date()), priority: 1 });
    }
  };

  const toggleGoalAchieved = async (goalId: string, value: boolean) => {
    const { error } = await supabase.from("client_goals").update({ is_achieved: value }).eq("id", goalId);
    if (!error) {
      setGoals(prev => prev.map(g => g.id === goalId ? { ...g, is_achieved: value } : g));
    }
  };

  const addWeight = async () => {
    if (!weightForm.weight_kg) return;
    const { error, data } = await supabase.from("body_measurements").insert({
      date: weightForm.date,
      weight_kg: Number(weightForm.weight_kg),
      notes: weightForm.notes || null
    }).select("*").single();
    if (!error && data) {
      setMeasurements(prev => [data as BodyMeasurement, ...prev].sort((a, b) => (a.date < b.date ? 1 : -1)));
      setWeightForm({ date: dateToLocalDateString(new Date()), weight_kg: "", notes: "" });
    }
  };

  const uploadPhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) return;

      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop();
        const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
        await supabase.storage.from("progress-photos").upload(fileName, file, { upsert: false });
      }
      await loadPhotos(userId);
    } finally {
      setUploading(false);
    }
  };

  const measurementsSorted = useMemo(() => {
    return [...measurements].sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [measurements]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Target className="h-6 w-6" /> Моите цели</h1>
          <p className="text-muted-foreground">Задай цели, следи теглото си и качвай снимки на напредъка</p>
        </div>
      </div>

      {/* Create Goal */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Нова цел</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Заглавие *</Label>
            <Input value={goalForm.title} onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })} placeholder="Напр. - Сваляне на 5 кг" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Стойност</Label>
              <Input type="number" value={goalForm.target_value} onChange={(e) => setGoalForm({ ...goalForm, target_value: e.target.value })} placeholder="5" />
            </div>
            <div>
              <Label>Единица</Label>
              <Input value={goalForm.unit} onChange={(e) => setGoalForm({ ...goalForm, unit: e.target.value })} placeholder="kg" />
            </div>
            <div>
              <Label>Краен срок</Label>
              <Input type="date" value={goalForm.target_date} onChange={(e) => setGoalForm({ ...goalForm, target_date: e.target.value })} />
            </div>
          </div>
          <div className="md:col-span-2">
            <Label>Описание</Label>
            <Textarea value={goalForm.description} onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })} placeholder="Какво искаш да постигнеш и защо" rows={3} />
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Button onClick={addGoal}>Добави цел</Button>
        </div>
      </Card>

      {/* Goals List and Progress Photos */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Моите цели</h3>
          </div>
          {goals.length ? (
            <div className="space-y-3">
              {goals.map(goal => (
                <div key={goal.id} className={`border rounded-lg p-3 ${goal.is_achieved ? 'bg-green-50 border-green-200' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {goal.is_achieved && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                        <h4 className="font-medium truncate">{goal.title}</h4>
                        {goal.target_value && (
                          <Badge variant="secondary">{goal.target_value} {goal.unit || ''}</Badge>
                        )}
                      </div>
                      {goal.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{goal.description}</p>
                      )}
                      {goal.target_date && (
                        <p className="text-xs text-muted-foreground mt-1">Краен срок: {goal.target_date}</p>
                      )}
                    </div>
                    <div className="shrink-0">
                      <Button size="sm" variant={goal.is_achieved ? "outline" : "default"} onClick={() => toggleGoalAchieved(goal.id, !goal.is_achieved)}>
                        {goal.is_achieved ? "Отмени" : "Завършена"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">Няма добавени цели</div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><ImageIcon className="h-5 w-5" /> Снимки на прогреса</h3>
          <div className="space-y-3">
            <Label htmlFor="photos" className="flex items-center gap-2">
              <UploadCloud className="h-4 w-4" /> Качи снимки
            </Label>
            <Input id="photos" type="file" multiple accept="image/*" onChange={uploadPhotos} disabled={uploading} />
            <p className="text-xs text-muted-foreground">Снимките се съхраняват в Supabase Storage bucket "progress-photos"</p>
            {photos.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {photos.slice(0, 12).map((p) => (
                  <div key={p.name} className="aspect-square overflow-hidden rounded border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.url} alt={p.name} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">Няма качени снимки</div>
            )}
          </div>
        </Card>
      </div>

      {/* Weight Log */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Дневно тегло</h3>
        </div>
        <WeightChart data={measurementsSorted} />
        <div className="grid gap-3 md:grid-cols-4">
          <div>
            <Label>Дата</Label>
            <Input type="date" value={weightForm.date} onChange={(e) => setWeightForm({ ...weightForm, date: e.target.value })} />
          </div>
          <div>
            <Label>Килограми</Label>
            <Input type="number" value={weightForm.weight_kg} onChange={(e) => setWeightForm({ ...weightForm, weight_kg: e.target.value })} placeholder="70.5" />
          </div>
          <div className="md:col-span-2">
            <Label>Бележки</Label>
            <Input value={weightForm.notes} onChange={(e) => setWeightForm({ ...weightForm, notes: e.target.value })} placeholder="По избор" />
          </div>
        </div>
        <div className="flex justify-end mt-3">
          <Button onClick={addWeight}>Запази тегло</Button>
        </div>

        <div className="mt-6">
          {measurementsSorted.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="py-2">Дата</th>
                    <th className="py-2">Кг</th>
                    <th className="py-2">Бележки</th>
                  </tr>
                </thead>
                <tbody>
                  {measurementsSorted.map(m => (
                    <tr key={m.id} className="border-t">
                      <td className="py-2">{m.date}</td>
                      <td className="py-2">{m.weight_kg ?? "—"}</td>
                      <td className="py-2">{m.notes || ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">Няма записи</div>
          )}
        </div>
      </Card>
    </div>
  );
}

function WeightChart({ data }: { data: BodyMeasurement[] }) {
  if (!data || data.length === 0) {
    return <div className="text-sm text-muted-foreground mb-2">Няма графика (без данни)</div>;
  }
  const width = 600;
  const height = 180;
  const padding = 24;
  const values = data
    .slice()
    .reverse()
    .filter((d) => typeof d.weight_kg === "number");
  const minVal = Math.min(...values.map((d) => d.weight_kg as number));
  const maxVal = Math.max(...values.map((d) => d.weight_kg as number));
  const range = Math.max(1, maxVal - minVal);
  const stepX = (width - padding * 2) / Math.max(1, values.length - 1);
  const points = values.map((d, i) => {
    const x = padding + i * stepX;
    const y = padding + (1 - ((d.weight_kg as number) - minVal) / range) * (height - padding * 2);
    return `${x},${y}`;
  });
  const minLabel = `${minVal.toFixed(1)}kg`;
  const maxLabel = `${maxVal.toFixed(1)}kg`;

  return (
    <div className="overflow-x-auto">
      <svg width={width} height={height} className="w-full max-w-full">
        <rect x={0} y={0} width={width} height={height} fill="transparent" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#e5e7eb" />
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e5e7eb" />
        <polyline fill="none" stroke="#16a34a" strokeWidth={2} points={points.join(" ")} />
        <text x={padding + 4} y={padding + 12} fontSize="10" fill="#6b7280">{maxLabel}</text>
        <text x={padding + 4} y={height - padding - 4} fontSize="10" fill="#6b7280">{minLabel}</text>
      </svg>
    </div>
  );
}


