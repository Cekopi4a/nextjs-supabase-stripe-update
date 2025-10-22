"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, Calendar, Target, History, Download, FileText, FileSpreadsheet, FileJson, Dumbbell, TrendingUp, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { DeleteProgramButton } from "@/components/delete-program-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface WorkoutProgram {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  difficulty_level?: string;
  program_type: string;
  estimated_duration_weeks?: number;
  workouts_per_week?: number;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

interface ProgramsClientProps {
  activePrograms: WorkoutProgram[];
  inactivePrograms: WorkoutProgram[];
  userRole: string;
}

export function ProgramsClient({
  activePrograms,
  inactivePrograms,
  userRole,
}: ProgramsClientProps) {
  const [showHistory, setShowHistory] = useState(false);

  const programsToShow = showHistory ? [...activePrograms, ...inactivePrograms] : activePrograms;
  const hasHistory = inactivePrograms.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">
            {userRole === "trainer" ? "Моите Програми" : "Моите Тренировъчни Програми"}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            {userRole === "trainer"
              ? "Управление на тренировъчни програми за вашите клиенти"
              : "Вижте и следвайте вашите тренировъчни програми"
            }
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {userRole === "trainer" && hasHistory && (
            <Button
              variant="outline"
              onClick={() => setShowHistory(!showHistory)}
              className="flex-1 sm:flex-none"
            >
              <History className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">
                {showHistory ? "Скрий история" : "Покажи история"}
              </span>
            </Button>
          )}
          {userRole === "trainer" && (
            <Button asChild className="flex-1 sm:flex-none">
              <Link href="/protected/programs/create">
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Създай Програма</span>
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Info Badge */}
      {userRole === "trainer" && (
        <Card className="p-3 md:p-4 bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900">
          <p className="text-xs md:text-sm text-blue-900 dark:text-blue-300">
            <strong>💡 Важно:</strong> Всеки клиент може да има само 1 активна програма.
            Когато създадете нова програма, старите автоматично стават неактивни.
          </p>
        </Card>
      )}

      {/* History Info */}
      {showHistory && hasHistory && (
        <div className="text-sm text-muted-foreground">
          Показва се: {activePrograms.length} активни + {inactivePrograms.length} неактивни програми
        </div>
      )}

      {/* Programs Grid */}
      {programsToShow.length === 0 ? (
        <Card className="p-6 md:p-12">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 text-muted-foreground">
              <Target className="h-12 w-12" />
            </div>
            <h3 className="text-base md:text-lg font-semibold mb-2">
              {userRole === "trainer"
                ? "Все още няма създадени програми"
                : "Все още няма зададени програми"
              }
            </h3>
            <p className="text-sm md:text-base text-muted-foreground mb-4">
              {userRole === "trainer"
                ? "Създайте вашата първа тренировъчна програма, за да започнете с тренирането на клиенти."
                : "Вашият треньор скоро ще ви зададе тренировъчни програми."
              }
            </p>
            {userRole === "trainer" && (
              <Button asChild>
                <Link href="/protected/programs/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Създай Първа Програма
                </Link>
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {programsToShow.map((program) => (
            <ProgramCard
              key={program.id}
              program={program}
              userRole={userRole}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ProgramCard({ program, userRole }: { program: WorkoutProgram; userRole: string }) {
  const relatedUser = program.profiles;
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: "pdf" | "excel" | "json") => {
    setIsExporting(true);
    try {
      const formatEndpoints = {
        pdf: `/api/programs/${program.id}/export/pdf`,
        excel: `/api/programs/${program.id}/export/excel`,
        json: `/api/programs/${program.id}/export/json`,
      };

      const formatLabels = {
        pdf: "PDF",
        excel: "Excel",
        json: "JSON",
      };

      toast.loading(`Генериране на ${formatLabels[format]} файл...`);

      const response = await fetch(formatEndpoints[format]);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Export error response:`, errorText);
        throw new Error(`Failed to export: ${response.statusText}. ${errorText}`);
      }

      // Get filename from Content-Disposition header or create default
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = `${program.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_program.${format === "excel" ? "xlsx" : format}`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch) {
          filename = filenameMatch[1].replace(/"/g, "");
        }
      }

      // Download file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.dismiss();
      toast.success(`${formatLabels[format]} файлът е изтеглен успешно!`);
    } catch (error) {
      console.error("Export error:", error);
      toast.dismiss();
      toast.error("Грешка при експортиране на програмата");
    } finally {
      setIsExporting(false);
    }
  };

  // Difficulty colors
  const difficultyColors = {
    beginner: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    intermediate: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    advanced: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    expert: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };

  const difficultyColor = program.difficulty_level
    ? difficultyColors[program.difficulty_level.toLowerCase() as keyof typeof difficultyColors]
    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";

  return (
    <Card className={`group relative overflow-hidden border-2 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
      program.is_active
        ? 'border-blue-200 dark:border-blue-900 hover:border-blue-400 dark:hover:border-blue-700'
        : 'border-gray-200 dark:border-gray-800 opacity-70'
    }`}>
      {/* Gradient Background Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br transition-opacity duration-300 ${
        program.is_active
          ? 'from-blue-50/50 via-cyan-50/30 to-transparent dark:from-blue-950/20 dark:via-cyan-950/10 opacity-0 group-hover:opacity-100'
          : 'from-gray-50/50 to-transparent dark:from-gray-900/20'
      }`} />

      <div className="relative p-4 md:p-6 space-y-3 md:space-y-4">
        {/* Header Section with Icon */}
        <div className="space-y-2 md:space-y-3">
          <div className="flex items-start justify-between gap-2 md:gap-3">
            {/* Icon & Title */}
            <div className="flex items-start gap-2 md:gap-3 flex-1 min-w-0">
              <div className={`p-2 md:p-2.5 rounded-xl ${
                program.is_active
                  ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}>
                <Dumbbell className="h-4 w-4 md:h-5 md:w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base md:text-lg mb-1 truncate">{program.name}</h3>
                <Badge
                  variant={program.is_active ? "default" : "secondary"}
                  className={`text-xs ${program.is_active
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-sm"
                    : ""}`}
                >
                  {program.is_active ? "Активна" : "Неактивна"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Description */}
          {program.description && (
            <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {program.description}
            </p>
          )}
        </div>

        {/* Stats Grid - More Visual */}
        <div className="grid grid-cols-2 gap-2 md:gap-3">
          <div className={`p-2 md:p-3 rounded-lg border transition-colors ${
            program.is_active
              ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900'
              : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800'
          }`}>
            <div className="flex items-center gap-1 md:gap-2 mb-1">
              <Calendar className={`h-3 w-3 md:h-4 md:w-4 ${program.is_active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`} />
              <span className="text-[10px] md:text-xs font-medium text-muted-foreground">Продължителност</span>
            </div>
            <p className="text-base md:text-lg font-bold">{program.estimated_duration_weeks || 8} <span className="text-xs md:text-sm font-normal">седм.</span></p>
          </div>

          <div className={`p-2 md:p-3 rounded-lg border transition-colors ${
            program.is_active
              ? 'bg-cyan-50/50 dark:bg-cyan-950/20 border-cyan-200 dark:border-cyan-900'
              : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800'
          }`}>
            <div className="flex items-center gap-1 md:gap-2 mb-1">
              <TrendingUp className={`h-3 w-3 md:h-4 md:w-4 ${program.is_active ? 'text-cyan-600 dark:text-cyan-400' : 'text-gray-500'}`} />
              <span className="text-[10px] md:text-xs font-medium text-muted-foreground">Тренировки</span>
            </div>
            <p className="text-base md:text-lg font-bold">{program.workouts_per_week || 3} <span className="text-xs md:text-sm font-normal">/седм.</span></p>
          </div>
        </div>

        {/* Related User - Better styling */}
        {relatedUser && (
          <div className={`flex items-center gap-2 p-2 md:p-3 rounded-lg border ${
            program.is_active
              ? 'bg-gradient-to-r from-blue-50/50 to-cyan-50/50 dark:from-blue-950/10 dark:to-cyan-950/10 border-blue-100 dark:border-blue-900/50'
              : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800'
          }`}>
            <div className={`p-1 md:p-1.5 rounded-lg ${
              program.is_active
                ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white'
                : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}>
              <Users className="h-3 w-3 md:h-3.5 md:w-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] md:text-xs text-muted-foreground">
                {userRole === "trainer" ? "Клиент" : "Треньор"}
              </p>
              <p className="text-xs md:text-sm font-semibold truncate">{relatedUser.full_name}</p>
            </div>
          </div>
        )}

        {/* Badges - Difficulty & Type */}
        <div className="flex flex-wrap gap-1.5 md:gap-2">
          {program.difficulty_level && (
            <Badge variant="outline" className={`${difficultyColor} border-0 font-medium text-xs`}>
              {program.difficulty_level}
            </Badge>
          )}
          <Badge variant="outline" className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-0 font-medium text-xs">
            {program.program_type.replace('_', ' ')}
          </Badge>
        </div>

        {/* Divider */}
        <div className="border-t" />

        {/* Action Buttons */}
        <div className="space-y-2">
          {/* Primary Actions */}
          <div className="flex gap-2">
            {userRole === "client" && program.is_active ? (
              <Button
                size="sm"
                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/20 text-xs md:text-sm"
                asChild
              >
                <Link href={`/protected/workouts?program=${program.id}`}>
                  <Dumbbell className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
                  <span className="hidden sm:inline">Започни Тренировка</span>
                  <span className="sm:hidden">Започни</span>
                </Link>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs md:text-sm"
                asChild
              >
                <Link href={`/protected/programs/${program.id}`}>
                  Детайли
                </Link>
              </Button>
            )}

            {/* Export Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isExporting}
                  className="hover:bg-blue-50 dark:hover:bg-blue-950/20 text-xs md:text-sm px-2 md:px-4"
                >
                  <Download className="h-3 w-3 md:h-4 md:w-4 md:mr-1" />
                  <span className="hidden sm:inline">Експорт</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport("pdf")}>
                  <FileText className="h-4 w-4 mr-2" />
                  Експорт като PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("excel")}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Експорт като Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("json")}>
                  <FileJson className="h-4 w-4 mr-2" />
                  Експорт като JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Trainer Actions */}
          {userRole === "trainer" && (
            <div className="flex gap-2">
              {program.is_active && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 text-xs md:text-sm"
                  asChild
                >
                  <Link href={`/protected/programs/${program.id}/edit`}>
                    <Edit className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
                    <span className="hidden sm:inline">Редактирай</span>
                    <span className="sm:hidden">Редакция</span>
                  </Link>
                </Button>
              )}
              <DeleteProgramButton programId={program.id} programName={program.name} />
            </div>
          )}
        </div>

        {/* Footer - Created Date */}
        <div className="flex items-center justify-between text-[10px] md:text-xs text-muted-foreground pt-2 border-t">
          <span className="truncate">Създадена {new Date(program.created_at).toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
          {program.is_active && (
            <div className="flex items-center gap-1 shrink-0">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-600 dark:text-green-400 font-medium">Активна</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}