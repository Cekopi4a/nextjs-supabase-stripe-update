"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createSupabaseClient } from "@/utils/supabase/client";
import { Target, TrendingUp, Image as ImageIcon, X, ChevronLeft, ChevronRight } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface Client {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
}

interface Goal {
  id: string;
  title: string;
  description?: string;
  target_value?: string;
  unit?: string;
  is_achieved: boolean;
}

interface Measurement {
  id: string;
  date: string;
  weight_kg?: number;
  notes?: string;
}

export default function ClientProgressPage() {
  const { clientId } = useParams();
  const supabase = createSupabaseClient();

  const [client, setClient] = useState<Client | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [photos, setPhotos] = useState<{ name: string; url: string }[]>([]);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  const fetchData = async () => {
    if (!clientId) return;
    try {
      const [clientRes, goalsRes, measRes] = await Promise.all([
        supabase.from("profiles").select("id, full_name, email, avatar_url").eq("id", clientId as string).single(),
        supabase.from("client_goals").select("*").eq("client_id", clientId as string).order("priority", { ascending: false }),
        supabase.from("body_measurements").select("*").eq("client_id", clientId as string).order("date", { ascending: false }).limit(60),
      ]);

      setClient(clientRes.data || null);
      setGoals(goalsRes.data || []);
      setMeasurements(measRes.data || []);

      // Load progress photos from storage
      try {
        const { data: files } = await supabase.storage
          .from("progress-photos")
          .list(clientId as string, { limit: 60, sortBy: { column: "name", order: "desc" } });
        const list = (files || []).map((f) => {
          const { data } = supabase.storage.from("progress-photos").getPublicUrl(`${clientId}/${f.name}`);
          return { name: f.name, url: data.publicUrl };
        });
        setPhotos(list);
      } catch {
        // Ignore storage errors
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const measurementsSorted = useMemo(() => {
    return [...measurements].sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [measurements]);

  const chartData = useMemo(() => {
    return [...measurements]
      .filter(m => m.weight_kg != null)
      .sort((a, b) => (a.date < b.date ? -1 : 1))
      .map(m => ({
        date: m.date,
        weight: parseFloat(m.weight_kg)
      }));
  }, [measurements]);

  const handlePreviousPhoto = () => {
    if (selectedPhotoIndex !== null && selectedPhotoIndex > 0) {
      setSelectedPhotoIndex(selectedPhotoIndex - 1);
    }
  };

  const handleNextPhoto = () => {
    if (selectedPhotoIndex !== null && selectedPhotoIndex < photos.length - 1) {
      setSelectedPhotoIndex(selectedPhotoIndex + 1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
            {client?.full_name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><Target className="h-6 w-6" /> Прогрес на клиента</h1>
            {client && (<p className="text-muted-foreground">{client.full_name} — {client.email}</p>)}
          </div>
        </div>
      </div>

      {/* Weight Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" /> График на теглото
        </h3>
        {chartData.length > 0 ? (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Тегло (кг)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px' }}
                  labelStyle={{ fontWeight: 'bold' }}
                  formatter={(value: number) => [`${value} кг`, 'Тегло']}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Тегло (кг)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            Няма данни за показване. Добавете измервания за да видите графиката.
          </div>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Цели</h3>
          {goals.length ? (
            <div className="space-y-3">
              {goals.map(goal => (
                <div key={goal.id} className={`border rounded-lg p-3 ${goal.is_achieved ? 'bg-green-50 border-green-200' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium truncate">{goal.title}</h4>
                        {goal.target_value && (
                          <Badge variant="secondary">{goal.target_value} {goal.unit || ''}</Badge>
                        )}
                      </div>
                      {goal.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{goal.description}</p>
                      )}
                    </div>
                    <div className="shrink-0">
                      <Badge variant={goal.is_achieved ? 'default' : 'secondary'}>
                        {goal.is_achieved ? 'Завършена' : 'В процес'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">Няма зададени цели</div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Тегло</h3>
          {measurementsSorted.length ? (
            <div className="overflow-x-auto max-h-[400px]">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white">
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
                      <td className="py-2 font-medium">{m.weight_kg ?? '—'}</td>
                      <td className="py-2 text-xs text-muted-foreground truncate max-w-[100px]">{m.notes || ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">Няма записи</div>
          )}
        </Card>
      </div>

      {/* Progress photos grid */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <ImageIcon className="h-5 w-5" /> Снимки на прогреса
          {photos.length > 0 && (
            <Badge variant="secondary" className="ml-2">{photos.length}</Badge>
          )}
        </h3>
        {photos.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {photos.map((p, index) => (
              <div
                key={p.name}
                className="aspect-square overflow-hidden rounded-lg border border-gray-200 hover:border-blue-400 transition-all cursor-pointer hover:shadow-md"
                onClick={() => setSelectedPhotoIndex(index)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt={p.name} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Няма качени снимки за прогреса.</p>
            <p className="text-xs mt-1">Клиентът все още не е качил снимки.</p>
          </div>
        )}
      </Card>

      {/* Photo Modal */}
      {selectedPhotoIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedPhotoIndex(null)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20"
            onClick={() => setSelectedPhotoIndex(null)}
          >
            <X className="h-6 w-6" />
          </Button>

          {selectedPhotoIndex > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                handlePreviousPhoto();
              }}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
          )}

          {selectedPhotoIndex < photos.length - 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                handleNextPhoto();
              }}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          )}

          <div className="max-w-4xl max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photos[selectedPhotoIndex].url}
              alt={photos[selectedPhotoIndex].name}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            <div className="mt-4 text-white text-center">
              <p className="text-sm opacity-75">{photos[selectedPhotoIndex].name}</p>
              <p className="text-xs opacity-50 mt-1">
                Снимка {selectedPhotoIndex + 1} от {photos.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


