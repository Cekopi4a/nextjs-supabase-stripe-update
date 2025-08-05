// app/protected/clients/page.tsx
// ЗАМЕНЕТЕ ЦЕЛИЯ ФАЙЛ С ТОЗИ КОД

"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search,
  Calendar,
  User,
  Mail,
  Phone,
  Target,
  TrendingUp,
  Activity,
  Plus,
  Eye,
  Settings,
  BarChart3,
  MessageSquare,
  Dumbbell
} from "lucide-react";
import { createSupabaseClient } from "@/utils/supabase/client";
import Link from "next/link";

interface Client {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  status?: string;
  relationship_created?: string;
}

export default function ClientsManagementPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive'>('all');
  
  const supabase = createSupabaseClient();

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    filterClients();
  }, [clients, searchTerm, selectedStatus]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Вземаме текущия потребител
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('User error:', userError);
        setError('Грешка при зареждане на потребителя');
        return;
      }
      
      if (!user) {
        console.error('No user found');
        setError('Моля, влезте в системата');
        return;
      }

      console.log('Current user ID:', user.id);

      // МЕТОД 1: Директно вземаме trainer_clients
      const { data: trainerClients, error: tcError } = await supabase
        .from("trainer_clients")
        .select("*")
        .eq("trainer_id", user.id)
        .eq("status", "active");

      if (tcError) {
        console.error('Error fetching trainer_clients:', tcError);
        setError(`Грешка при зареждане: ${tcError.message}`);
        return;
      }

      console.log('Trainer clients found:', trainerClients);

      if (!trainerClients || trainerClients.length === 0) {
        console.log('No clients found');
        setClients([]);
        return;
      }

      // МЕТОД 2: Вземаме профилите отделно
      const clientIds = trainerClients.map(tc => tc.client_id);
      console.log('Client IDs to fetch:', clientIds);

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .in("id", clientIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        setError(`Грешка при зареждане на профили: ${profilesError.message}`);
        return;
      }

      console.log('Client profiles found:', profiles);

      // Комбинираме данните
      const clientsData = trainerClients.map(tc => {
        const profile = profiles?.find(p => p.id === tc.client_id);
        if (!profile) {
          console.warn(`No profile found for client ${tc.client_id}`);
          return null;
        }
        
        return {
          id: profile.id,
          full_name: profile.full_name || 'Без име',
          email: profile.email,
          phone: profile.phone,
          avatar_url: profile.avatar_url,
          created_at: profile.created_at,
          status: tc.status,
          relationship_created: tc.created_at
        };
      }).filter(Boolean) as Client[];

      console.log('Final clients data:', clientsData);
      setClients(clientsData);

    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Неочаквана грешка при зареждане на данните');
    } finally {
      setLoading(false);
    }
  };

  const filterClients = () => {
    let filtered = [...clients];

    if (searchTerm) {
      filtered = filtered.filter(client =>
        client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(client =>
        selectedStatus === 'active' 
          ? client.status === 'active'
          : client.status !== 'active'
      );
    }

    setFilteredClients(filtered);
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Зареждане на клиенти...</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <Card className="p-8 border-red-200 bg-red-50">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Грешка при зареждане</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchClients} variant="outline">
              Опитай отново
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Управление на клиенти</h1>
          <p className="text-muted-foreground">
            {clients.length > 0 
              ? `Имате ${clients.length} ${clients.length === 1 ? 'клиент' : 'клиента'}`
              : 'Управлявайте програмите и прогреса на вашите клиенти'
            }
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/protected/clients/programs/create">
              <Dumbbell className="h-4 w-4 mr-2" />
              Нова програма
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/protected/clients/invite">
              <Plus className="h-4 w-4 mr-2" />
              Покани клиент
            </Link>
          </Button>
        </div>
      </div>

      {/* Search and filters */}
      {clients.length > 0 && (
        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Търси клиент..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedStatus === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedStatus('all')}
            >
              Всички
            </Button>
            <Button
              variant={selectedStatus === 'active' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedStatus('active')}
            >
              Активни
            </Button>
            <Button
              variant={selectedStatus === 'inactive' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedStatus('inactive')}
            >
              Неактивни
            </Button>
          </div>
        </div>
      )}

      {/* Clients Grid */}
      {filteredClients.length === 0 && clients.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Нямате клиенти</h3>
            <p className="text-muted-foreground mb-4">
              Започнете като поканите вашия първи клиент
            </p>
            <Button asChild>
              <Link href="/protected/clients/invite">
                <Plus className="h-4 w-4 mr-2" />
                Покани клиент
              </Link>
            </Button>
          </div>
        </Card>
      ) : filteredClients.length === 0 ? (
        <Card className="p-8">
          <div className="text-center">
            <p className="text-muted-foreground">Няма намерени клиенти за "{searchTerm}"</p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map(client => (
            <Card key={client.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{client.full_name}</h3>
                    <p className="text-sm text-muted-foreground truncate">{client.email}</p>
                  </div>
                </div>
                <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                  {client.status === 'active' ? 'Активен' : 'Неактивен'}
                </Badge>
              </div>

              {client.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Phone className="h-3 w-3" />
                  <span>{client.phone}</span>
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link href={`/protected/clients/${client.id}`}>
                    <Eye className="h-4 w-4 mr-1" />
                    Преглед
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link href={`/protected/clients/${client.id}/calendar`}>
                    <Calendar className="h-4 w-4 mr-1" />
                    Календар
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Debug info - премахнете в продукция */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-8">
          <summary className="cursor-pointer text-sm text-gray-500">Debug Info</summary>
          <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">
            {JSON.stringify({ totalClients: clients.length, filteredClients: filteredClients.length, clients }, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}