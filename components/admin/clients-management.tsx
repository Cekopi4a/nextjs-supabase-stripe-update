"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  UserCheck,
  UserX,
  Search,
  MoreHorizontal,
  Calendar,
  Mail,
  Link
} from "lucide-react";

interface ClientsManagementProps {
  clients: Array<{
    id: string;
    full_name: string | null;
    email: string;
    created_at: string;
    trainer_info: {
      trainer_id: string;
      trainer_name: string | null;
      trainer_email: string | null;
      relationship_created: string;
    } | null;
  }>;
  stats: {
    total: number;
    withTrainers: number;
    withoutTrainers: number;
  };
}

export default function ClientsManagement({ clients, stats }: ClientsManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.trainer_info?.trainer_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "all" ||
                         (filterStatus === "with_trainer" && client.trainer_info) ||
                         (filterStatus === "without_trainer" && !client.trainer_info);

    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("bg-BG");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Клиенти</h1>
        <p className="text-muted-foreground">
          Управление на всички клиенти в системата
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-md bg-blue-100 text-blue-700">
                  <Users className="h-4 w-4" />
                </div>
                <CardTitle className="text-sm">Общо клиенти</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-md bg-green-100 text-green-700">
                  <UserCheck className="h-4 w-4" />
                </div>
                <CardTitle className="text-sm">С треньори</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.withTrainers}</div>
            <div className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.withTrainers / stats.total) * 100) : 0}% от всички
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-md bg-orange-100 text-orange-700">
                  <UserX className="h-4 w-4" />
                </div>
                <CardTitle className="text-sm">Без треньори</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.withoutTrainers}</div>
            <div className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.withoutTrainers / stats.total) * 100) : 0}% от всички
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Всички клиенти ({clients.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Търсене по име, имейл или треньор..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Статус: {
                    filterStatus === "all" ? "Всички" :
                    filterStatus === "with_trainer" ? "С треньор" :
                    "Без треньор"
                  }
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterStatus("all")}>
                  Всички клиенти
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilterStatus("with_trainer")}>
                  С треньор
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("without_trainer")}>
                  Без треньор
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Клиент</TableHead>
                  <TableHead>Треньор</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Регистриран</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">
                          {client.full_name || "Без име"}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {client.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {client.trainer_info ? (
                        <div className="space-y-1">
                          <div className="font-medium text-sm">
                            {client.trainer_info.trainer_name || "Без име"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {client.trainer_info.trainer_email}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center">
                            <Link className="h-3 w-3 mr-1" />
                            от {formatDate(client.trainer_info.relationship_created)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Без треньор</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {client.trainer_info ? (
                        <Badge variant="default" className="flex items-center gap-1 w-fit">
                          <UserCheck className="h-3 w-3" />
                          Активен
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                          <UserX className="h-3 w-3" />
                          Без треньор
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(client.created_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Действия</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            Преглед на профил
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            История на тренировки
                          </DropdownMenuItem>
                          {!client.trainer_info && (
                            <DropdownMenuItem>
                              Присвояване на треньор
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            Деактивиране
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredClients.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Няма намерени клиенти за показване.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}