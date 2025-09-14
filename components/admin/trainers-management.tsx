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
  UserCheck,
  Crown,
  Star,
  Settings,
  Search,
  MoreHorizontal,
  Users,
  Calendar,
  Mail
} from "lucide-react";

interface TrainersManagementProps {
  trainers: Array<{
    id: string;
    full_name: string | null;
    email: string;
    created_at: string;
    active_clients_count: number;
    current_subscription: {
      plan_type: string;
      status: string;
      created_at: string;
    } | null;
  }>;
  topTrainers: Array<{
    trainer_id: string;
    trainer_name: string;
    trainer_email: string;
    client_count: number;
    plan_type: string;
    subscription_status: string;
  }>;
}

export default function TrainersManagement({ trainers, topTrainers }: TrainersManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlan, setFilterPlan] = useState<string>("all");

  const getPlanBadgeVariant = (planType: string) => {
    switch (planType) {
      case "beast": return "default";
      case "pro": return "secondary";
      case "free": return "outline";
      default: return "outline";
    }
  };

  const getPlanIcon = (planType: string) => {
    switch (planType) {
      case "beast": return Crown;
      case "pro": return Star;
      default: return Settings;
    }
  };

  const filteredTrainers = trainers.filter(trainer => {
    const matchesSearch = trainer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trainer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = filterPlan === "all" ||
                       trainer.current_subscription?.plan_type === filterPlan ||
                       (filterPlan === "free" && !trainer.current_subscription);
    return matchesSearch && matchesPlan;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("bg-BG");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Треньори</h1>
        <p className="text-muted-foreground">
          Управление на всички треньори в системата
        </p>
      </div>

      {/* Top Trainers Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {topTrainers.slice(0, 3).map((trainer, index) => {
          const PlanIcon = getPlanIcon(trainer.plan_type);
          return (
            <Card key={trainer.trainer_id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-md ${
                      index === 0 ? "bg-yellow-100 text-yellow-700" :
                      index === 1 ? "bg-gray-100 text-gray-700" :
                      "bg-orange-100 text-orange-700"
                    }`}>
                      <PlanIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-sm">
                        #{index + 1} Топ треньор
                      </CardTitle>
                    </div>
                  </div>
                  <Badge variant={getPlanBadgeVariant(trainer.plan_type)}>
                    {trainer.plan_type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="font-medium">{trainer.trainer_name}</p>
                  <p className="text-sm text-muted-foreground">{trainer.trainer_email}</p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="h-3 w-3 mr-1" />
                    {trainer.client_count} клиенти
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Всички треньори ({trainers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Търсене по име или имейл..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Филтър по план: {filterPlan === "all" ? "Всички" : filterPlan}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterPlan("all")}>
                  Всички планове
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilterPlan("free")}>
                  Free
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterPlan("pro")}>
                  Pro
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterPlan("beast")}>
                  Beast
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Trainers Table */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Треньор</TableHead>
                  <TableHead>План</TableHead>
                  <TableHead className="text-center">Клиенти</TableHead>
                  <TableHead>Регистриран</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrainers.map((trainer) => {
                  const planType = trainer.current_subscription?.plan_type || "free";
                  const PlanIcon = getPlanIcon(planType);

                  return (
                    <TableRow key={trainer.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {trainer.full_name || "Без име"}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {trainer.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPlanBadgeVariant(planType)} className="flex items-center gap-1 w-fit">
                          <PlanIcon className="h-3 w-3" />
                          {planType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center">
                          <Users className="h-3 w-3 mr-1 text-muted-foreground" />
                          {trainer.active_clients_count}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(trainer.created_at)}
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
                              Преглед на клиенти
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              История на абонаменти
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              Деактивиране
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {filteredTrainers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Няма намерени треньори за показване.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}