"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createSupabaseClient } from "@/utils/supabase/client";
import { Target, TrendingUp, User, Image as ImageIcon } from "lucide-react";

export default function ClientProgressPage() {
  const { clientId } = useParams();
  const supabase = createSupabaseClient();

  const [client, setClient] = useState<any>(null);
  const [goals, setGoals] = useState<any[]>([]);
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState<{ name: string; url: string }[]>([]);

  useEffect(() => {
    fetchData();
  }, [clientId]);

  const fetchData = async () => {
    if (!clientId) return;
    setLoading(true);
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
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  const measurementsSorted = useMemo(() => {
    return [...measurements].sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [measurements]);

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
                      <td className="py-2">{m.weight_kg ?? '—'}</td>
                      <td className="py-2">{m.notes || ''}</td>
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
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><ImageIcon className="h-5 w-5" /> Снимки на прогреса</h3>
        {photos.length ? (
          <div className="grid grid-cols-4 gap-2">
            {photos.slice(0, 16).map((p) => (
              <div key={p.name} className="aspect-square overflow-hidden rounded border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt={p.name} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">Няма качени снимки</div>
        )}
      </Card>
    </div>
  );
}


