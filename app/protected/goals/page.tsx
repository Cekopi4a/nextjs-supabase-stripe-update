"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createSupabaseClient } from "@/utils/supabase/client";
import { dateToLocalDateString } from "@/utils/date-utils";
import { CheckCircle2, Target, Image as ImageIcon, TrendingUp, Ruler, Camera, X, Trash2 } from "lucide-react";
import { toast } from "sonner";

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
  neck_cm?: number;
  chest_cm?: number;
  waist_cm?: number;
  hips_cm?: number;
  shoulders_cm?: number;
  glutes_cm?: number;
  bicep_left_cm?: number;
  bicep_right_cm?: number;
  forearm_left_cm?: number;
  forearm_right_cm?: number;
  thigh_left_cm?: number;
  thigh_right_cm?: number;
  calf_left_cm?: number;
  calf_right_cm?: number;
  body_fat_percentage?: number;
  muscle_mass_kg?: number;
  notes?: string;
  progress_photos?: string[];
}

interface BodyPhoto {
  id: string;
  client_id: string;
  date: string;
  photo_type: "front" | "back" | "side_left" | "side_right";
  photo_url: string;
  notes?: string;
  created_at: string;
}

export default function GoalsPage() {
  const supabase = createSupabaseClient();

  const [goals, setGoals] = useState<ClientGoal[]>([]);
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [bodyPhotos, setBodyPhotos] = useState<BodyPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [showMeasurementForm, setShowMeasurementForm] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);

  // Forms
  const [goalForm, setGoalForm] = useState({
    title: "",
    description: "",
    goal_type: "general_fitness",
    target_value: "",
    unit: "kg",
    target_date: dateToLocalDateString(new Date()),
    priority: 1
  });
  const [weightForm, setWeightForm] = useState({
    date: dateToLocalDateString(new Date()),
    weight_kg: "",
    notes: "",
    photos: [] as File[]
  });

  const [measurementForm, setMeasurementForm] = useState({
    date: dateToLocalDateString(new Date()),
    weight_kg: "",
    neck_cm: "",
    chest_cm: "",
    waist_cm: "",
    hips_cm: "",
    shoulders_cm: "",
    glutes_cm: "",
    bicep_left_cm: "",
    bicep_right_cm: "",
    forearm_left_cm: "",
    forearm_right_cm: "",
    thigh_left_cm: "",
    thigh_right_cm: "",
    calf_left_cm: "",
    calf_right_cm: "",
    body_fat_percentage: "",
    muscle_mass_kg: "",
    notes: ""
  });

  const [photoUploadForm, setPhotoUploadForm] = useState({
    date: dateToLocalDateString(new Date()),
    front: null as File | null,
    back: null as File | null,
    side_left: null as File | null,
    side_right: null as File | null,
    notes: ""
  });


  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;

      setUserId(userData.user.id);

      // Fetch goals, measurements and photos
      const [goalsResponse, measResponse, photosResponse] = await Promise.all([
        fetch("/api/goals").catch(() => ({ ok: false })),
        fetch("/api/body-measurements").catch(() => ({ ok: false })),
        fetch("/api/body-photos").catch(() => ({ ok: false }))
      ]);

      // Fallback to Supabase if API fails
      if (!goalsResponse.ok) {
        const { data: goalsData } = await supabase.from("client_goals").select("*").order("priority", { ascending: false });
        setGoals((goalsData || []) as ClientGoal[]);
      } else {
        const goalsResult = await goalsResponse.json();
        setGoals(goalsResult.goals || []);
      }

      if (!measResponse.ok) {
        const { data: measData } = await supabase
          .from("body_measurements")
          .select("*")
          .order("date", { ascending: false })
          .limit(30);
        setMeasurements((measData || []) as BodyMeasurement[]);
      } else {
        const measResult = await measResponse.json();
        setMeasurements(measResult.measurements || []);
      }

      if (photosResponse.ok) {
        const photosResult = await photosResponse.json();
        setBodyPhotos(photosResult.photos || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const addGoal = async () => {
    if (!goalForm.title.trim()) return;
    if (!userId) return;
    
    try {
      const { error, data } = await supabase.from("client_goals").insert({
        client_id: userId,
        goal_type: goalForm.goal_type,
        title: goalForm.title.trim(),
        description: goalForm.description.trim() || null,
        target_value: goalForm.target_value ? Number(goalForm.target_value) : null,
        unit: goalForm.unit || null,
        target_date: goalForm.target_date || null,
        priority: goalForm.priority || 1,
        is_achieved: false
      }).select("*").single();
      
      if (error) {
        console.error('Error adding goal:', error);
        return;
      }
      
      if (data) {
        setGoals(prev => [data as ClientGoal, ...prev]);
        setGoalForm({ title: "", description: "", goal_type: "general_fitness", target_value: "", unit: "kg", target_date: dateToLocalDateString(new Date()), priority: 1 });
      }
    } catch (error) {
      console.error('Error adding goal:', error);
    }
  };

  const toggleGoalAchieved = async (goalId: string, value: boolean) => {
    try {
      const { error } = await supabase.from("client_goals").update({ is_achieved: value }).eq("id", goalId);
      
      if (error) {
        console.error('Error updating goal:', error);
        return;
      }
      
      setGoals(prev => prev.map(g => g.id === goalId ? { ...g, is_achieved: value } : g));
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  const addWeight = async () => {
    if (!weightForm.weight_kg) return;
    if (!userId) return;

    setUploading(true);
    try {
      // First upload photos if any
      const photoUrls: string[] = [];
      if (weightForm.photos.length > 0) {
        for (const file of weightForm.photos) {
          const ext = file.name.split(".").pop();
          const fileName = `${userId}/${weightForm.date}_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
          const { error: uploadError } = await supabase.storage.from("progress-photos").upload(fileName, file, { upsert: false });

          if (!uploadError) {
            const { data: urlData } = supabase.storage.from("progress-photos").getPublicUrl(fileName);
            photoUrls.push(urlData.publicUrl);
          } else {
            console.error('Error uploading photo:', uploadError);
          }
        }
      }

      // Then insert measurement record with photos
      const { error, data } = await supabase.from("body_measurements").insert({
        client_id: userId,
        date: weightForm.date,
        weight_kg: Number(weightForm.weight_kg),
        notes: weightForm.notes || null,
        progress_photos: photoUrls.length > 0 ? photoUrls : null
      }).select("*").single();

      if (error) {
        console.error('Error adding weight:', error);
        return;
      }

      if (data) {
        setMeasurements(prev => [data as BodyMeasurement, ...prev].sort((a, b) => (a.date < b.date ? 1 : -1)));
        setWeightForm({ date: dateToLocalDateString(new Date()), weight_kg: "", notes: "", photos: [] });
      }
    } catch (error) {
      console.error('Error adding weight:', error);
    } finally {
      setUploading(false);
    }
  };

  const saveMeasurement = async () => {
    if (!userId) return;

    setUploading(true);
    try {
      const response = await fetch("/api/body-measurements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: measurementForm.date,
          weight_kg: measurementForm.weight_kg || null,
          neck_cm: measurementForm.neck_cm || null,
          chest_cm: measurementForm.chest_cm || null,
          waist_cm: measurementForm.waist_cm || null,
          hips_cm: measurementForm.hips_cm || null,
          shoulders_cm: measurementForm.shoulders_cm || null,
          glutes_cm: measurementForm.glutes_cm || null,
          bicep_left_cm: measurementForm.bicep_left_cm || null,
          bicep_right_cm: measurementForm.bicep_right_cm || null,
          forearm_left_cm: measurementForm.forearm_left_cm || null,
          forearm_right_cm: measurementForm.forearm_right_cm || null,
          thigh_left_cm: measurementForm.thigh_left_cm || null,
          thigh_right_cm: measurementForm.thigh_right_cm || null,
          calf_left_cm: measurementForm.calf_left_cm || null,
          calf_right_cm: measurementForm.calf_right_cm || null,
          body_fat_percentage: measurementForm.body_fat_percentage || null,
          muscle_mass_kg: measurementForm.muscle_mass_kg || null,
          notes: measurementForm.notes || null
        })
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Измерванията са запазени");
        fetchData();
        setShowMeasurementForm(false);
        setMeasurementForm({
          date: dateToLocalDateString(new Date()),
          weight_kg: "",
          neck_cm: "",
          chest_cm: "",
          waist_cm: "",
          hips_cm: "",
          shoulders_cm: "",
          glutes_cm: "",
          bicep_left_cm: "",
          bicep_right_cm: "",
          forearm_left_cm: "",
          forearm_right_cm: "",
          thigh_left_cm: "",
          thigh_right_cm: "",
          calf_left_cm: "",
          calf_right_cm: "",
          body_fat_percentage: "",
          muscle_mass_kg: "",
          notes: ""
        });
      } else {
        toast.error("Грешка при запазване");
      }
    } catch (error) {
      console.error('Error saving measurement:', error);
      toast.error("Грешка при запазване");
    } finally {
      setUploading(false);
    }
  };

  const uploadBodyPhotos = async () => {
    if (!userId) return;

    const photos = [
      { type: "front", file: photoUploadForm.front },
      { type: "back", file: photoUploadForm.back },
      { type: "side_left", file: photoUploadForm.side_left },
      { type: "side_right", file: photoUploadForm.side_right }
    ].filter(p => p.file !== null);

    if (photos.length === 0) {
      toast.error("Моля качете поне една снимка");
      return;
    }

    setUploading(true);
    try {
      for (const { type, file } of photos) {
        const formData = new FormData();
        formData.append("file", file as File);
        formData.append("photoType", type);
        formData.append("date", photoUploadForm.date);
        formData.append("notes", photoUploadForm.notes || "");

        const response = await fetch("/api/body-photos", {
          method: "POST",
          body: formData
        });

        const result = await response.json();
        if (!result.success) {
          toast.error(`Грешка при качване на ${type} снимка`);
        }
      }

      toast.success("Снимките са качени успешно");
      fetchData();
      setShowPhotoUpload(false);
      setPhotoUploadForm({
        date: dateToLocalDateString(new Date()),
        front: null,
        back: null,
        side_left: null,
        side_right: null,
        notes: ""
      });
    } catch (error) {
      console.error('Error uploading photos:', error);
      toast.error("Грешка при качване на снимки");
    } finally {
      setUploading(false);
    }
  };

  const deleteBodyPhoto = async (photoId: string) => {
    try {
      const response = await fetch(`/api/body-photos?id=${photoId}`, {
        method: "DELETE"
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Снимката е изтрита");
        setBodyPhotos(prev => prev.filter(p => p.id !== photoId));
      } else {
        toast.error("Грешка при изтриване");
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error("Грешка при изтриване");
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
          <div>
            <Label>Вид цел</Label>
            <Select value={goalForm.goal_type} onValueChange={(value) => setGoalForm({ ...goalForm, goal_type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Избери вид цел" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weight_loss">Сваляне на тегло</SelectItem>
                <SelectItem value="weight_gain">Качване на тегло</SelectItem>
                <SelectItem value="muscle_gain">Покачване на мускулна маса</SelectItem>
                <SelectItem value="strength">Увеличаване на силата</SelectItem>
                <SelectItem value="endurance">Издръжливост</SelectItem>
                <SelectItem value="flexibility">Гъвкавост</SelectItem>
                <SelectItem value="body_fat_reduction">Намаляване на мазнините</SelectItem>
                <SelectItem value="general_fitness">Обща форма</SelectItem>
                <SelectItem value="sport_specific">Спортно-специфична</SelectItem>
              </SelectContent>
            </Select>
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

      {/* Goals List */}
      <div className="grid gap-6">
        <Card className="p-6">
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
        <div className="mt-3">
          <Label htmlFor="weight-photos" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" /> Снимки за датата
          </Label>
          <Input
            id="weight-photos"
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => {
              const files = e.target.files;
              if (files) {
                setWeightForm({ ...weightForm, photos: Array.from(files) });
              }
            }}
            disabled={uploading}
          />
          {weightForm.photos.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              Избрани {weightForm.photos.length} снимки
            </p>
          )}
        </div>
        <div className="flex justify-end mt-3">
          <Button onClick={addWeight} disabled={uploading}>
            {uploading ? "Запазване..." : "Запази тегло"}
          </Button>
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
                    <th className="py-2">Снимки</th>
                  </tr>
                </thead>
                <tbody>
                  {measurementsSorted.map(m => (
                    <tr key={m.id} className="border-t">
                      <td className="py-2">{m.date}</td>
                      <td className="py-2">{m.weight_kg ?? "—"}</td>
                      <td className="py-2">{m.notes || ""}</td>
                      <td className="py-2">
                        {m.progress_photos && m.progress_photos.length > 0 ? (
                          <div className="flex gap-1">
                            {m.progress_photos.slice(0, 3).map((photo, idx) => (
                              <div key={idx} className="w-8 h-8 rounded overflow-hidden border">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={photo}
                                  alt={`Снимка ${idx + 1}`}
                                  className="w-full h-full object-cover cursor-pointer"
                                  onClick={() => window.open(photo, '_blank')}
                                />
                              </div>
                            ))}
                            {m.progress_photos.length > 3 && (
                              <div className="w-8 h-8 rounded border flex items-center justify-center text-xs text-muted-foreground">
                                +{m.progress_photos.length - 3}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
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

      {/* Body Measurements */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Ruler className="h-5 w-5" /> Телесни измервания
          </h3>
          <Button onClick={() => setShowMeasurementForm(!showMeasurementForm)} variant="outline" size="sm">
            {showMeasurementForm ? "Затвори" : "Добави измервания"}
          </Button>
        </div>

        {showMeasurementForm && (
          <div className="border rounded-lg p-4 mb-4 bg-muted/50">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label>Дата</Label>
                <Input type="date" value={measurementForm.date} onChange={(e) => setMeasurementForm({ ...measurementForm, date: e.target.value })} />
              </div>
              <div>
                <Label>Тегло (кг)</Label>
                <Input type="number" step="0.1" value={measurementForm.weight_kg} onChange={(e) => setMeasurementForm({ ...measurementForm, weight_kg: e.target.value })} placeholder="70.5" />
              </div>
              <div>
                <Label>Мазнини (%)</Label>
                <Input type="number" step="0.1" value={measurementForm.body_fat_percentage} onChange={(e) => setMeasurementForm({ ...measurementForm, body_fat_percentage: e.target.value })} placeholder="15.5" />
              </div>
              <div>
                <Label>Врат (см)</Label>
                <Input type="number" step="0.1" value={measurementForm.neck_cm} onChange={(e) => setMeasurementForm({ ...measurementForm, neck_cm: e.target.value })} placeholder="38" />
              </div>
              <div>
                <Label>Гръдна обиколка (см)</Label>
                <Input type="number" step="0.1" value={measurementForm.chest_cm} onChange={(e) => setMeasurementForm({ ...measurementForm, chest_cm: e.target.value })} placeholder="100" />
              </div>
              <div>
                <Label>Рамене (см)</Label>
                <Input type="number" step="0.1" value={measurementForm.shoulders_cm} onChange={(e) => setMeasurementForm({ ...measurementForm, shoulders_cm: e.target.value })} placeholder="110" />
              </div>
              <div>
                <Label>Талия (см)</Label>
                <Input type="number" step="0.1" value={measurementForm.waist_cm} onChange={(e) => setMeasurementForm({ ...measurementForm, waist_cm: e.target.value })} placeholder="80" />
              </div>
              <div>
                <Label>Ханш (см)</Label>
                <Input type="number" step="0.1" value={measurementForm.hips_cm} onChange={(e) => setMeasurementForm({ ...measurementForm, hips_cm: e.target.value })} placeholder="95" />
              </div>
              <div>
                <Label>Седалище (см)</Label>
                <Input type="number" step="0.1" value={measurementForm.glutes_cm} onChange={(e) => setMeasurementForm({ ...measurementForm, glutes_cm: e.target.value })} placeholder="100" />
              </div>
              <div>
                <Label>Бицепс ляв (см)</Label>
                <Input type="number" step="0.1" value={measurementForm.bicep_left_cm} onChange={(e) => setMeasurementForm({ ...measurementForm, bicep_left_cm: e.target.value })} placeholder="35" />
              </div>
              <div>
                <Label>Бицепс десен (см)</Label>
                <Input type="number" step="0.1" value={measurementForm.bicep_right_cm} onChange={(e) => setMeasurementForm({ ...measurementForm, bicep_right_cm: e.target.value })} placeholder="35" />
              </div>
              <div>
                <Label>Предмишница лява (см)</Label>
                <Input type="number" step="0.1" value={measurementForm.forearm_left_cm} onChange={(e) => setMeasurementForm({ ...measurementForm, forearm_left_cm: e.target.value })} placeholder="28" />
              </div>
              <div>
                <Label>Предмишница дясна (см)</Label>
                <Input type="number" step="0.1" value={measurementForm.forearm_right_cm} onChange={(e) => setMeasurementForm({ ...measurementForm, forearm_right_cm: e.target.value })} placeholder="28" />
              </div>
              <div>
                <Label>Бедро ляво (см)</Label>
                <Input type="number" step="0.1" value={measurementForm.thigh_left_cm} onChange={(e) => setMeasurementForm({ ...measurementForm, thigh_left_cm: e.target.value })} placeholder="55" />
              </div>
              <div>
                <Label>Бедро дясно (см)</Label>
                <Input type="number" step="0.1" value={measurementForm.thigh_right_cm} onChange={(e) => setMeasurementForm({ ...measurementForm, thigh_right_cm: e.target.value })} placeholder="55" />
              </div>
              <div>
                <Label>Прасец ляв (см)</Label>
                <Input type="number" step="0.1" value={measurementForm.calf_left_cm} onChange={(e) => setMeasurementForm({ ...measurementForm, calf_left_cm: e.target.value })} placeholder="38" />
              </div>
              <div>
                <Label>Прасец десен (см)</Label>
                <Input type="number" step="0.1" value={measurementForm.calf_right_cm} onChange={(e) => setMeasurementForm({ ...measurementForm, calf_right_cm: e.target.value })} placeholder="38" />
              </div>
              <div>
                <Label>Мускулна маса (кг)</Label>
                <Input type="number" step="0.1" value={measurementForm.muscle_mass_kg} onChange={(e) => setMeasurementForm({ ...measurementForm, muscle_mass_kg: e.target.value })} placeholder="60" />
              </div>
              <div className="md:col-span-3">
                <Label>Бележки</Label>
                <Textarea value={measurementForm.notes} onChange={(e) => setMeasurementForm({ ...measurementForm, notes: e.target.value })} placeholder="Допълнителна информация..." rows={2} />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowMeasurementForm(false)} disabled={uploading}>
                Откажи
              </Button>
              <Button onClick={saveMeasurement} disabled={uploading}>
                {uploading ? "Запазване..." : "Запази измервания"}
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {measurementsSorted.length > 0 ? (
            measurementsSorted.slice(0, 5).map(m => (
              <div key={m.id} className="border rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium">{m.date}</div>
                  <Badge variant="secondary">{m.weight_kg ? `${m.weight_kg} кг` : "—"}</Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  {m.chest_cm && <div>Гръдна: {m.chest_cm} см</div>}
                  {m.waist_cm && <div>Талия: {m.waist_cm} см</div>}
                  {m.hips_cm && <div>Ханш: {m.hips_cm} см</div>}
                  {m.bicep_left_cm && <div>Бицепс Л: {m.bicep_left_cm} см</div>}
                  {m.bicep_right_cm && <div>Бицепс Д: {m.bicep_right_cm} см</div>}
                  {m.thigh_left_cm && <div>Бедро Л: {m.thigh_left_cm} см</div>}
                  {m.body_fat_percentage && <div>Мазнини: {m.body_fat_percentage}%</div>}
                </div>
                {m.notes && <div className="text-sm text-muted-foreground mt-2">{m.notes}</div>}
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground">Няма записани измервания</div>
          )}
        </div>
      </Card>

      {/* Body Photos */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Camera className="h-5 w-5" /> Прогресни снимки
          </h3>
          <Button onClick={() => setShowPhotoUpload(!showPhotoUpload)} variant="outline" size="sm">
            {showPhotoUpload ? "Затвори" : "Качи снимки"}
          </Button>
        </div>

        {showPhotoUpload && (
          <div className="border rounded-lg p-4 mb-4 bg-muted/50">
            <div className="space-y-4">
              <div>
                <Label>Дата</Label>
                <Input type="date" value={photoUploadForm.date} onChange={(e) => setPhotoUploadForm({ ...photoUploadForm, date: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="photo-front" className="cursor-pointer">
                    <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-muted/50 transition">
                      {photoUploadForm.front ? (
                        <div className="relative">
                          <div className="text-sm text-green-600">✓ Отпред</div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute top-0 right-0"
                            onClick={(e) => {
                              e.preventDefault();
                              setPhotoUploadForm({ ...photoUploadForm, front: null });
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Camera className="h-8 w-8 mx-auto text-muted-foreground" />
                          <div className="text-sm">Отпред</div>
                        </div>
                      )}
                    </div>
                  </Label>
                  <Input
                    id="photo-front"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setPhotoUploadForm({ ...photoUploadForm, front: file });
                    }}
                  />
                </div>

                <div>
                  <Label htmlFor="photo-back" className="cursor-pointer">
                    <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-muted/50 transition">
                      {photoUploadForm.back ? (
                        <div className="relative">
                          <div className="text-sm text-green-600">✓ Отзад</div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute top-0 right-0"
                            onClick={(e) => {
                              e.preventDefault();
                              setPhotoUploadForm({ ...photoUploadForm, back: null });
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Camera className="h-8 w-8 mx-auto text-muted-foreground" />
                          <div className="text-sm">Отзад</div>
                        </div>
                      )}
                    </div>
                  </Label>
                  <Input
                    id="photo-back"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setPhotoUploadForm({ ...photoUploadForm, back: file });
                    }}
                  />
                </div>

                <div>
                  <Label htmlFor="photo-side-left" className="cursor-pointer">
                    <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-muted/50 transition">
                      {photoUploadForm.side_left ? (
                        <div className="relative">
                          <div className="text-sm text-green-600">✓ Ляво</div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute top-0 right-0"
                            onClick={(e) => {
                              e.preventDefault();
                              setPhotoUploadForm({ ...photoUploadForm, side_left: null });
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Camera className="h-8 w-8 mx-auto text-muted-foreground" />
                          <div className="text-sm">Ляво</div>
                        </div>
                      )}
                    </div>
                  </Label>
                  <Input
                    id="photo-side-left"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setPhotoUploadForm({ ...photoUploadForm, side_left: file });
                    }}
                  />
                </div>

                <div>
                  <Label htmlFor="photo-side-right" className="cursor-pointer">
                    <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-muted/50 transition">
                      {photoUploadForm.side_right ? (
                        <div className="relative">
                          <div className="text-sm text-green-600">✓ Дясно</div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute top-0 right-0"
                            onClick={(e) => {
                              e.preventDefault();
                              setPhotoUploadForm({ ...photoUploadForm, side_right: null });
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Camera className="h-8 w-8 mx-auto text-muted-foreground" />
                          <div className="text-sm">Дясно</div>
                        </div>
                      )}
                    </div>
                  </Label>
                  <Input
                    id="photo-side-right"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setPhotoUploadForm({ ...photoUploadForm, side_right: file });
                    }}
                  />
                </div>
              </div>

              <div>
                <Label>Бележки</Label>
                <Textarea value={photoUploadForm.notes} onChange={(e) => setPhotoUploadForm({ ...photoUploadForm, notes: e.target.value })} placeholder="Допълнителна информация..." rows={2} />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowPhotoUpload(false)} disabled={uploading}>
                Откажи
              </Button>
              <Button onClick={uploadBodyPhotos} disabled={uploading}>
                {uploading ? "Качване..." : "Качи снимки"}
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {bodyPhotos.length > 0 ? (
            Object.entries(
              bodyPhotos.reduce((acc, photo) => {
                if (!acc[photo.date]) acc[photo.date] = [];
                acc[photo.date].push(photo);
                return acc;
              }, {} as Record<string, BodyPhoto[]>)
            )
              .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
              .slice(0, 5)
              .map(([date, photos]) => (
                <div key={date} className="border rounded-lg p-4">
                  <div className="font-medium mb-3">{date}</div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {photos.map(photo => (
                      <div key={photo.id} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden border">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={photo.photo_url}
                            alt={photo.photo_type}
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => window.open(photo.photo_url, '_blank')}
                          />
                        </div>
                        <div className="text-xs text-center mt-1 capitalize">
                          {photo.photo_type.replace('_', ' ')}
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition"
                          onClick={() => deleteBodyPhoto(photo.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  {photos[0]?.notes && (
                    <div className="text-sm text-muted-foreground mt-2">{photos[0].notes}</div>
                  )}
                </div>
              ))
          ) : (
            <div className="text-center py-6 text-muted-foreground">Няма качени снимки</div>
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


