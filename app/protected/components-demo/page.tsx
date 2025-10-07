"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  Trash2,
  Download,
  Upload,
  Star,
  Heart,
  Share2,
  Settings,
  User,
  Bell,
  Search
} from "lucide-react";
import { toast } from "sonner";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function ComponentsDemo() {
  const [progress, setProgress] = useState(33);
  const [sliderValue, setSliderValue] = useState([50]);

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Сравнение: Tailwind vs Radix UI</h1>
        <p className="text-muted-foreground">
          Директно сравнение на компоненти - чист Tailwind CSS срещу Radix UI + shadcn/ui
        </p>
      </div>

      <Tabs defaultValue="tailwind-buttons" className="w-full">
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">🎨 Tailwind CSS (чист CSS, само визия)</h3>
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7 mb-4">
            <TabsTrigger value="tailwind-buttons">Бутони</TabsTrigger>
            <TabsTrigger value="tailwind-inputs">Inputs & Forms</TabsTrigger>
            <TabsTrigger value="tailwind-cards">Карти</TabsTrigger>
            <TabsTrigger value="tailwind-modals">Modals & Menus</TabsTrigger>
            <TabsTrigger value="tailwind-navigation">Navigation</TabsTrigger>
            <TabsTrigger value="tailwind-progress">Progress & Alerts</TabsTrigger>
            <TabsTrigger value="tailwind-badges">Badges & Avatar</TabsTrigger>
          </TabsList>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">⚡ Radix UI & shadcn/ui (с функционалност и достъпност)</h3>
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
            <TabsTrigger value="radix-buttons">Бутони</TabsTrigger>
            <TabsTrigger value="radix-inputs">Inputs & Forms</TabsTrigger>
            <TabsTrigger value="radix-cards">Карти</TabsTrigger>
            <TabsTrigger value="radix-modals">Modals & Menus</TabsTrigger>
            <TabsTrigger value="radix-navigation">Navigation</TabsTrigger>
            <TabsTrigger value="radix-progress">Progress & Alerts</TabsTrigger>
            <TabsTrigger value="radix-badges">Badges & Avatar</TabsTrigger>
          </TabsList>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">🎨 Цветови палитри</h3>
          <TabsList className="w-full">
            <TabsTrigger value="color-palettes">Цветови палитри</TabsTrigger>
          </TabsList>
        </div>

        {/* ============ TAILWIND CSS TABS ============ */}

        {/* Tailwind Buttons */}
        <TabsContent value="tailwind-buttons" className="space-y-6">
          <div className="rounded-xl border bg-gradient-to-r from-blue-500/10 to-cyan-500/10 p-6">
            <h2 className="text-2xl font-bold mb-2">Бутони - Tailwind CSS</h2>
            <p className="text-muted-foreground">Чисто визуални бутони само с Tailwind класове</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-semibold mb-4">Основни варианти</h3>
              <div className="flex flex-wrap gap-3">
                <button className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors">
                  Primary
                </button>
                <button className="px-6 py-2 rounded-lg bg-secondary text-secondary-foreground font-semibold hover:bg-secondary/80 transition-colors">
                  Secondary
                </button>
                <button className="px-6 py-2 rounded-lg border border-input bg-background font-semibold hover:bg-accent hover:text-accent-foreground transition-colors">
                  Outline
                </button>
                <button className="px-6 py-2 rounded-lg bg-destructive text-destructive-foreground font-semibold hover:bg-destructive/90 transition-colors">
                  Destructive
                </button>
                <button className="px-6 py-2 rounded-lg font-semibold hover:bg-accent hover:text-accent-foreground transition-colors">
                  Ghost
                </button>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-semibold mb-4">Gradient бутони</h3>
              <div className="flex flex-wrap gap-3">
                <button className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all hover:scale-105 shadow-lg shadow-purple-500/50">
                  Purple → Pink
                </button>
                <button className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all hover:scale-105 shadow-lg shadow-blue-500/50">
                  Blue → Cyan
                </button>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-semibold mb-4">Размери</h3>
              <div className="flex flex-wrap items-center gap-3">
                <button className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90">
                  Small
                </button>
                <button className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90">
                  Default
                </button>
                <button className="px-8 py-3 rounded-lg bg-primary text-primary-foreground text-lg font-semibold hover:bg-primary/90">
                  Large
                </button>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-semibold mb-4">С икони</h3>
              <div className="flex flex-wrap gap-3">
                <button className="group px-6 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all inline-flex items-center gap-2">
                  <Download className="h-4 w-4 group-hover:translate-y-1 transition-transform" />
                  Download
                </button>
                <button className="group px-6 py-2 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 transition-all inline-flex items-center gap-2">
                  <Upload className="h-4 w-4 group-hover:-translate-y-1 transition-transform" />
                  Upload
                </button>
                <button className="px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
                  <Star className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tailwind Inputs */}
        <TabsContent value="tailwind-inputs" className="space-y-6">
          <div className="rounded-xl border bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-6">
            <h2 className="text-2xl font-bold mb-2">Inputs & Forms - Tailwind CSS</h2>
            <p className="text-muted-foreground">Форми стилизирани само с Tailwind</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border bg-card p-6 space-y-4">
              <h3 className="font-semibold mb-4">Текстови полета</h3>
              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <input
                  type="email"
                  placeholder="example@email.com"
                  className="w-full rounded-lg border border-input bg-background px-4 py-2 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">С икона</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Търси..."
                    className="w-full rounded-lg border bg-background pl-10 pr-4 py-2 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Textarea</label>
                <textarea
                  rows={3}
                  placeholder="Напиши съобщение..."
                  className="w-full rounded-lg border border-input bg-background px-4 py-2 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>
            </div>

            <div className="rounded-xl border bg-card p-6 space-y-6">
              <div>
                <h3 className="font-semibold mb-4">Checkbox (визуален)</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="h-4 w-4 rounded border-primary text-primary focus:ring-2 focus:ring-primary" />
                    <span className="text-sm">Опция 1</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="h-4 w-4 rounded border-primary text-primary focus:ring-2 focus:ring-primary" defaultChecked />
                    <span className="text-sm">Опция 2 (избрана)</span>
                  </label>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Radio (визуален)</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="level" className="h-4 w-4 border-primary text-primary focus:ring-2 focus:ring-primary" />
                    <span className="text-sm">Начинаещ</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="level" className="h-4 w-4 border-primary text-primary focus:ring-2 focus:ring-primary" defaultChecked />
                    <span className="text-sm">Напреднал</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tailwind Cards */}
        <TabsContent value="tailwind-cards" className="space-y-6">
          <div className="rounded-xl border bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-6">
            <h2 className="text-2xl font-bold mb-2">Карти - Tailwind CSS</h2>
            <p className="text-muted-foreground">Различни стилове на карти</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Standard Card */}
            <div className="rounded-xl border bg-card overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Стандартна карта</h3>
                <p className="text-sm text-muted-foreground mb-4">Описание на картата с текст</p>
                <div className="flex gap-2">
                  <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">Tag 1</span>
                  <span className="px-2 py-1 rounded-full bg-secondary/10 text-secondary-foreground text-xs font-semibold">Tag 2</span>
                </div>
              </div>
              <div className="px-6 py-3 bg-muted/50 border-t">
                <button className="w-full py-2 text-sm font-medium hover:text-primary transition-colors">
                  Виж повече →
                </button>
              </div>
            </div>

            {/* Glassmorphism Card */}
            <div className="relative overflow-hidden rounded-xl border border-white/20 bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl p-6 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent"></div>
              <div className="relative">
                <div className="mb-4 inline-flex rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 p-3">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Glassmorphism</h3>
                <p className="text-sm text-muted-foreground mb-4">Стъклен ефект с backdrop-blur</p>
                <div className="rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 p-3 text-center">
                  <div className="text-2xl font-bold">156</div>
                  <div className="text-xs text-muted-foreground">Тренировки</div>
                </div>
              </div>
            </div>

            {/* Hover Card */}
            <div className="group cursor-pointer">
              <div className="rounded-xl border-2 bg-card p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-primary">
                <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3 group-hover:bg-primary transition-colors">
                  <Heart className="h-6 w-6 text-primary group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-bold mb-2">Hover ефект</h3>
                <p className="text-sm text-muted-foreground">Увеличава се при hover</p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tailwind Modals & Menus */}
        <TabsContent value="tailwind-modals" className="space-y-6">
          <div className="rounded-xl border bg-gradient-to-r from-orange-500/10 to-red-500/10 p-6">
            <h2 className="text-2xl font-bold mb-2">Modals & Menus - Tailwind CSS</h2>
            <p className="text-muted-foreground">Визуални modal прозорци и dropdown менюта (БЕЗ функционалност)</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-semibold mb-4">Modal (статичен пример)</h3>
              <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 text-center">
                <p className="text-sm text-muted-foreground mb-4">Tailwind може да стилизира modals, но трябва да напишеш JavaScript за:</p>
                <ul className="text-xs text-muted-foreground space-y-1 text-left max-w-xs mx-auto">
                  <li>• Показване/скриване</li>
                  <li>• Затваряне с ESC</li>
                  <li>• Focus management</li>
                  <li>• Scroll locking</li>
                  <li>• Backdrop clicks</li>
                </ul>
              </div>

              <div className="mt-4 p-4 rounded-lg bg-background border">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">Заглавие на Modal</h4>
                  <button className="text-muted-foreground hover:text-foreground">✕</button>
                </div>
                <p className="text-sm text-muted-foreground mb-4">Това е пример как изглежда modal</p>
                <div className="flex gap-2 justify-end">
                  <button className="px-4 py-2 rounded-lg border hover:bg-accent">Отказ</button>
                  <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground">ОК</button>
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-semibold mb-4">Dropdown Menu (статичен)</h3>
              <div className="space-y-4">
                <button className="px-6 py-2 rounded-lg bg-primary text-primary-foreground inline-flex items-center gap-2">
                  Отвори меню
                  <span className="text-xs">▼</span>
                </button>

                <div className="mt-2 rounded-lg border bg-background shadow-lg p-2 w-56">
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">Мой Профил</div>
                  <hr className="my-1" />
                  <button className="w-full text-left px-3 py-2 rounded-md hover:bg-accent text-sm flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Профил
                  </button>
                  <button className="w-full text-left px-3 py-2 rounded-md hover:bg-accent text-sm flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Настройки
                  </button>
                  <button className="w-full text-left px-3 py-2 rounded-md hover:bg-accent text-sm flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Известия
                  </button>
                  <hr className="my-1" />
                  <button className="w-full text-left px-3 py-2 rounded-md hover:bg-destructive/10 text-sm flex items-center gap-2 text-destructive">
                    <Trash2 className="h-4 w-4" />
                    Изтрий акаунт
                  </button>
                </div>

                <p className="text-xs text-muted-foreground mt-4">⚠️ Без Radix няма: positioning, keyboard nav, focus trap, ESC затваряне</p>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-semibold mb-4">Tooltip (с CSS only)</h3>
              <div className="space-y-4">
                <div className="group relative inline-block">
                  <button className="px-6 py-2 rounded-lg bg-primary text-primary-foreground">
                    Hover за tooltip
                  </button>
                  <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-foreground text-background text-xs rounded shadow-lg whitespace-nowrap">
                    Това е CSS tooltip
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground"></div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">⚠️ CSS tooltips нямат: positioning logic, delays, aria-labels</p>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-semibold mb-4">Popover (статичен)</h3>
              <div className="space-y-4">
                <button className="px-6 py-2 rounded-lg border bg-background">
                  Click за popover
                </button>

                <div className="mt-2 rounded-lg border bg-background shadow-xl p-4 w-64">
                  <h4 className="font-semibold mb-2">Информация</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Това е статичен popover. Без JavaScript няма интерактивност.
                  </p>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs">Tag 1</span>
                    <span className="px-2 py-1 rounded-full bg-secondary/10 text-xs">Tag 2</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tailwind Navigation */}
        <TabsContent value="tailwind-navigation" className="space-y-6">
          <div className="rounded-xl border bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-6">
            <h2 className="text-2xl font-bold mb-2">Navigation - Tailwind CSS</h2>
            <p className="text-muted-foreground">Tabs, Breadcrumbs, Pagination</p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-semibold mb-4">Tabs навигация (статична)</h3>
              <div className="border-b">
                <div className="flex gap-2">
                  <button className="px-4 py-2 border-b-2 border-primary font-medium text-primary">Таб 1</button>
                  <button className="px-4 py-2 border-b-2 border-transparent hover:border-muted-foreground/25 text-muted-foreground">Таб 2</button>
                  <button className="px-4 py-2 border-b-2 border-transparent hover:border-muted-foreground/25 text-muted-foreground">Таб 3</button>
                </div>
              </div>
              <div className="p-4 mt-4 rounded-lg bg-muted/20">
                <p className="text-sm">Съдържание на Таб 1</p>
              </div>
              <p className="text-xs text-muted-foreground mt-4">⚠️ Трябва да напишеш JS за смяна на табовете</p>
            </div>

            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-semibold mb-4">Breadcrumbs</h3>
              <nav className="flex items-center gap-2 text-sm">
                <a href="#" className="text-muted-foreground hover:text-foreground">Начало</a>
                <span className="text-muted-foreground">/</span>
                <a href="#" className="text-muted-foreground hover:text-foreground">Клиенти</a>
                <span className="text-muted-foreground">/</span>
                <span className="font-medium">Иван Петров</span>
              </nav>
            </div>

            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-semibold mb-4">Pagination</h3>
              <div className="flex items-center justify-center gap-1">
                <button className="px-3 py-2 rounded-lg border hover:bg-accent">
                  ←
                </button>
                <button className="px-3 py-2 rounded-lg bg-primary text-primary-foreground font-medium">
                  1
                </button>
                <button className="px-3 py-2 rounded-lg border hover:bg-accent">
                  2
                </button>
                <button className="px-3 py-2 rounded-lg border hover:bg-accent">
                  3
                </button>
                <span className="px-2">...</span>
                <button className="px-3 py-2 rounded-lg border hover:bg-accent">
                  10
                </button>
                <button className="px-3 py-2 rounded-lg border hover:bg-accent">
                  →
                </button>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-semibold mb-4">Accordion (статичен)</h3>
              <div className="space-y-2">
                <div className="rounded-lg border">
                  <button className="w-full px-4 py-3 flex items-center justify-between hover:bg-accent">
                    <span className="font-medium">Секция 1</span>
                    <span>▼</span>
                  </button>
                  <div className="px-4 py-3 border-t bg-muted/20">
                    <p className="text-sm text-muted-foreground">Съдържание на секция 1</p>
                  </div>
                </div>
                <div className="rounded-lg border">
                  <button className="w-full px-4 py-3 flex items-center justify-between hover:bg-accent">
                    <span className="font-medium">Секция 2</span>
                    <span>▶</span>
                  </button>
                </div>
                <div className="rounded-lg border">
                  <button className="w-full px-4 py-3 flex items-center justify-between hover:bg-accent">
                    <span className="font-medium">Секция 3</span>
                    <span>▶</span>
                  </button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">⚠️ Без JS няма отваряне/затваряне и анимации</p>
            </div>
          </div>
        </TabsContent>

        {/* Tailwind Progress & Alerts */}
        <TabsContent value="tailwind-progress" className="space-y-6">
          <div className="rounded-xl border bg-gradient-to-r from-cyan-500/10 to-blue-500/10 p-6">
            <h2 className="text-2xl font-bold mb-2">Progress & Alerts - Tailwind CSS</h2>
            <p className="text-muted-foreground">Визуализация на напредък и съобщения</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-semibold mb-4">Progress Bars</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Напредък</span>
                    <span className="font-semibold">75%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full w-[75%] rounded-full bg-primary"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Gradient</span>
                    <span className="font-semibold">60%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full w-[60%] rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-semibold mb-4">Spinners</h3>
              <div className="flex flex-wrap gap-6 items-center">
                <div className="h-12 w-12 rounded-full border-4 border-muted border-t-primary animate-spin"></div>
                <div className="h-12 w-12 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin"></div>
                <div className="flex gap-1">
                  <div className="h-3 w-3 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="h-3 w-3 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="h-3 w-3 rounded-full bg-primary animate-bounce"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Alert съобщения</h3>
            <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800 p-4 flex gap-3">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-100">Информация</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">Това е информационно съобщение</p>
              </div>
            </div>

            <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800 p-4 flex gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-green-900 dark:text-green-100">Успех</h4>
                <p className="text-sm text-green-700 dark:text-green-300">Операцията завърши успешно</p>
              </div>
            </div>

            <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800 p-4 flex gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-red-900 dark:text-red-100">Грешка</h4>
                <p className="text-sm text-red-700 dark:text-red-300">Възникна грешка</p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tailwind Badges & Avatar */}
        <TabsContent value="tailwind-badges" className="space-y-6">
          <div className="rounded-xl border bg-gradient-to-r from-pink-500/10 to-orange-500/10 p-6">
            <h2 className="text-2xl font-bold mb-2">Badges & Avatar - Tailwind CSS</h2>
            <p className="text-muted-foreground">Етикети и профилни снимки</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-semibold mb-4">Badges</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 rounded-md bg-primary text-primary-foreground text-sm font-semibold">Primary</span>
                <span className="px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-sm font-semibold">Secondary</span>
                <span className="px-2 py-1 rounded-md bg-destructive text-destructive-foreground text-sm font-semibold">Destructive</span>
                <span className="px-2 py-1 rounded-md border border-input text-sm font-semibold">Outline</span>
                <span className="px-2 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold">Gradient</span>
                <span className="px-2 py-1 rounded-full bg-green-500 text-white text-sm font-semibold shadow-lg shadow-green-500/50">Glow</span>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-semibold mb-4">Avatar</h3>
              <div className="flex flex-wrap gap-4 items-center">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                  JD
                </div>
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-lg">
                  AB
                </div>
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-semibold text-xl">
                  MT
                </div>
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-semibold ring-2 ring-primary ring-offset-2">
                  Pro
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ============ RADIX UI TABS ============ */}

        {/* Radix Buttons */}
        <TabsContent value="radix-buttons" className="space-y-6">
          <div className="rounded-xl border bg-gradient-to-r from-blue-500/10 to-cyan-500/10 p-6">
            <h2 className="text-2xl font-bold mb-2">Бутони - Radix UI & shadcn/ui</h2>
            <p className="text-muted-foreground">Достъпни бутони с клавиатурна навигация и screen reader поддръжка</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Основни варианти</CardTitle>
                <CardDescription>Всички варианти от shadcn/ui</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="ghost">Ghost</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Размери</CardTitle>
                <CardDescription>Различни размери на бутони</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>С икони</CardTitle>
                <CardDescription>Бутони с икони и анимации</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button variant="secondary">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </Button>
                <Button size="icon">
                  <Star className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Състояния</CardTitle>
                <CardDescription>Disabled и loading</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button disabled>Disabled</Button>
                <Button>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                  Loading...
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Radix Inputs */}
        <TabsContent value="radix-inputs" className="space-y-6">
          <div className="rounded-xl border bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-6">
            <h2 className="text-2xl font-bold mb-2">Inputs & Forms - Radix UI & shadcn/ui</h2>
            <p className="text-muted-foreground">Форми с валидация и достъпност</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Текстови полета</CardTitle>
                <CardDescription>shadcn/ui Input компоненти</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="example@email.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="search">С икона</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="search" placeholder="Търси..." className="pl-9" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Textarea</Label>
                  <Textarea id="message" placeholder="Напиши съобщение..." rows={3} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Form Controls</CardTitle>
                <CardDescription>Radix UI компоненти</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Checkbox</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="opt1" />
                    <label htmlFor="opt1" className="text-sm">Опция 1</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="opt2" defaultChecked />
                    <label htmlFor="opt2" className="text-sm">Опция 2 (избрана)</label>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Radio Group</Label>
                  <RadioGroup defaultValue="advanced">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="beginner" id="r1" />
                      <Label htmlFor="r1">Начинаещ</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="advanced" id="r2" />
                      <Label htmlFor="r2">Напреднал</Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Switch & Slider</CardTitle>
                <CardDescription>Интерактивни контроли</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notif">Известия</Label>
                  <Switch id="notif" />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Интензитет: {sliderValue[0]}%</Label>
                  <Slider
                    value={sliderValue}
                    onValueChange={setSliderValue}
                    max={100}
                    step={5}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Select</CardTitle>
                <CardDescription>Падащо меню</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Subscription план</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Избери план" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                      <SelectItem value="beast">Beast</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Radix Cards */}
        <TabsContent value="radix-cards" className="space-y-6">
          <div className="rounded-xl border bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-6">
            <h2 className="text-2xl font-bold mb-2">Карти - Radix UI & shadcn/ui</h2>
            <p className="text-muted-foreground">shadcn/ui Card компоненти</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Стандартна карта</CardTitle>
                <CardDescription>Описание на картата с текст</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Badge>Tag 1</Badge>
                  <Badge variant="secondary">Tag 2</Badge>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full">Виж повече →</Button>
              </CardFooter>
            </Card>

            <Card className="backdrop-blur-lg bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Star className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Glassmorphism</CardTitle>
                    <CardDescription>С градиент фон</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg bg-background/50 backdrop-blur p-3 text-center">
                  <div className="text-2xl font-bold">156</div>
                  <div className="text-xs text-muted-foreground">Тренировки</div>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer border-2 hover:border-primary">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary transition-colors">
                    <Heart className="h-5 w-5 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <CardTitle>Hover ефект</CardTitle>
                    <CardDescription>Интерактивна карта</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Увеличава се при hover</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Radix Modals & Menus */}
        <TabsContent value="radix-modals" className="space-y-6">
          <div className="rounded-xl border bg-gradient-to-r from-orange-500/10 to-red-500/10 p-6">
            <h2 className="text-2xl font-bold mb-2">Modals & Menus - Radix UI & shadcn/ui</h2>
            <p className="text-muted-foreground">Напълно функционални компоненти с достъпност</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Dialog (Modal)</CardTitle>
                <CardDescription>Radix UI Dialog с пълна функционалност</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full">Отвори Dialog</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Създай нова програма</DialogTitle>
                      <DialogDescription>
                        Попълни детайлите за новата тренировъчна програма
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Име на програмата</Label>
                        <Input id="name" placeholder="напр. Напреднал план" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="desc">Описание</Label>
                        <Textarea id="desc" placeholder="Кратко описание..." />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline">Отказ</Button>
                      <Button>Създай</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <div className="text-xs text-green-600 dark:text-green-400 space-y-1">
                  <p>✓ ESC затваряне</p>
                  <p>✓ Focus trap</p>
                  <p>✓ Scroll lock</p>
                  <p>✓ Backdrop click</p>
                  <p>✓ ARIA labels</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dropdown Menu</CardTitle>
                <CardDescription>С keyboard navigation и positioning</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full">
                      Отвори меню
                      <Settings className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>Моят профил</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      Профил
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      Настройки
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Bell className="mr-2 h-4 w-4" />
                      Известия
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Изтрий акаунт
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="text-xs text-green-600 dark:text-green-400 space-y-1">
                  <p>✓ Auto positioning</p>
                  <p>✓ Arrow key navigation</p>
                  <p>✓ Type-ahead search</p>
                  <p>✓ Focus management</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tooltip</CardTitle>
                <CardDescription>С delays и positioning</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-3">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button>Hover me</Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Това е Radix tooltip</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Изтрий елемент</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div className="text-xs text-green-600 dark:text-green-400 space-y-1">
                  <p>✓ Smart positioning</p>
                  <p>✓ Hover delays</p>
                  <p>✓ ARIA описания</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Select</CardTitle>
                <CardDescription>Dropdown с keyboard support</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label>Избери план</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Subscription план" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free - Безплатен</SelectItem>
                      <SelectItem value="pro">Pro - $19.99/месец</SelectItem>
                      <SelectItem value="beast">Beast - $49.99/месец</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-xs text-green-600 dark:text-green-400 space-y-1">
                  <p>✓ Type-ahead search</p>
                  <p>✓ Arrow navigation</p>
                  <p>✓ Auto positioning</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Radix Navigation */}
        <TabsContent value="radix-navigation" className="space-y-6">
          <div className="rounded-xl border bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-6">
            <h2 className="text-2xl font-bold mb-2">Navigation - Radix UI & shadcn/ui</h2>
            <p className="text-muted-foreground">Функционални навигационни компоненти</p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tabs (вложени)</CardTitle>
                <CardDescription>Radix UI Tabs с keyboard navigation</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="tab1">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="tab1">Тренировка</TabsTrigger>
                    <TabsTrigger value="tab2">Храна</TabsTrigger>
                    <TabsTrigger value="tab3">Статистика</TabsTrigger>
                  </TabsList>
                  <TabsContent value="tab1" className="mt-4">
                    <div className="rounded-lg border p-4">
                      <h4 className="font-semibold mb-2">Днешна тренировка</h4>
                      <p className="text-sm text-muted-foreground">5 упражнения, 45 минути</p>
                    </div>
                  </TabsContent>
                  <TabsContent value="tab2" className="mt-4">
                    <div className="rounded-lg border p-4">
                      <h4 className="font-semibold mb-2">Хранителен план</h4>
                      <p className="text-sm text-muted-foreground">2500 калории дневно</p>
                    </div>
                  </TabsContent>
                  <TabsContent value="tab3" className="mt-4">
                    <div className="rounded-lg border p-4">
                      <h4 className="font-semibold mb-2">Прогрес</h4>
                      <p className="text-sm text-muted-foreground">24 завършени тренировки</p>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="text-xs text-green-600 dark:text-green-400 space-y-1 mt-4">
                  <p>✓ Arrow key navigation</p>
                  <p>✓ ARIA роли</p>
                  <p>✓ Auto scroll до активен</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Breadcrumbs (с навигация)</CardTitle>
                <CardDescription>Семантична breadcrumb навигация</CardDescription>
              </CardHeader>
              <CardContent>
                <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Начало
                  </a>
                  <Separator orientation="vertical" className="h-4" />
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Клиенти
                  </a>
                  <Separator orientation="vertical" className="h-4" />
                  <span className="font-medium" aria-current="page">
                    Иван Петров
                  </span>
                </nav>

                <div className="text-xs text-green-600 dark:text-green-400 space-y-1 mt-4">
                  <p>✓ ARIA labels</p>
                  <p>✓ Семантична структура</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Accordion</CardTitle>
                <CardDescription>Radix UI Accordion с анимации</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Какво е тази програма?</AccordionTrigger>
                    <AccordionContent>
                      Това е напреднала тренировъчна програма за развитие на сила и мускулна маса.
                      Включва 4 тренировки седмично с фокус върху базови упражнения.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>За кого е подходяща?</AccordionTrigger>
                    <AccordionContent>
                      Програмата е подходяща за атлети с минимум 6 месеца опит в силовите тренировки.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger>Колко дълго трае?</AccordionTrigger>
                    <AccordionContent>
                      Програмата е проектирана за 12 седмици с възможност за удължаване.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="text-xs text-green-600 dark:text-green-400 space-y-1 mt-4">
                  <p>✓ Smooth анимации</p>
                  <p>✓ Keyboard navigation</p>
                  <p>✓ ARIA атрибути</p>
                  <p>✓ Single/Multiple mode</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pagination (пример)</CardTitle>
                <CardDescription>Pagination navigation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center gap-1">
                  <Button variant="outline" size="icon">
                    ←
                  </Button>
                  <Button variant="default" size="icon">
                    1
                  </Button>
                  <Button variant="outline" size="icon">
                    2
                  </Button>
                  <Button variant="outline" size="icon">
                    3
                  </Button>
                  <span className="px-2">...</span>
                  <Button variant="outline" size="icon">
                    10
                  </Button>
                  <Button variant="outline" size="icon">
                    →
                  </Button>
                </div>

                <div className="text-xs text-green-600 dark:text-green-400 space-y-1 mt-4">
                  <p>✓ Достъпни бутони</p>
                  <p>✓ Keyboard support</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Radix Progress & Alerts */}
        <TabsContent value="radix-progress" className="space-y-6">
          <div className="rounded-xl border bg-gradient-to-r from-cyan-500/10 to-blue-500/10 p-6">
            <h2 className="text-2xl font-bold mb-2">Progress & Alerts - Radix UI & shadcn/ui</h2>
            <p className="text-muted-foreground">Radix Progress с анимации</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Progress Bars</CardTitle>
                <CardDescription>Radix UI Progress компонент</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Интерактивен</span>
                    <span className="font-semibold">{progress}%</span>
                  </div>
                  <Progress value={progress} />
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" onClick={() => setProgress(Math.max(0, progress - 10))}>
                      -10%
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setProgress(Math.min(100, progress + 10))}>
                      +10%
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Фиксиран</span>
                    <span className="font-semibold">75%</span>
                  </div>
                  <Progress value={75} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Loading estados</CardTitle>
                <CardDescription>Toast notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={() => toast.success("Успешно действие!")} className="w-full">
                  Success Toast
                </Button>
                <Button onClick={() => toast.error("Грешка при действието")} variant="destructive" className="w-full">
                  Error Toast
                </Button>
                <Button onClick={() => toast.info("Информация")} variant="outline" className="w-full">
                  Info Toast
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Alert компоненти</h3>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Информация</AlertTitle>
              <AlertDescription>
                Това е информационно съобщение с Radix UI
              </AlertDescription>
            </Alert>

            <Alert className="border-green-500/50 text-green-700 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Успех</AlertTitle>
              <AlertDescription>
                Операцията завърши успешно
              </AlertDescription>
            </Alert>

            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Грешка</AlertTitle>
              <AlertDescription>
                Възникна грешка при обработката
              </AlertDescription>
            </Alert>
          </div>
        </TabsContent>

        {/* Radix Badges & Avatar */}
        <TabsContent value="radix-badges" className="space-y-6">
          <div className="rounded-xl border bg-gradient-to-r from-pink-500/10 to-orange-500/10 p-6">
            <h2 className="text-2xl font-bold mb-2">Badges & Avatar - Radix UI & shadcn/ui</h2>
            <p className="text-muted-foreground">shadcn/ui компоненти</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Badge варианти</CardTitle>
                <CardDescription>shadcn/ui Badge</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Badge>Primary</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">Gradient</Badge>
                <Badge className="bg-green-500 shadow-lg shadow-green-500/50">Glow</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Avatar компонент</CardTitle>
                <CardDescription>Radix UI Avatar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 items-center">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                      JD
                    </AvatarFallback>
                  </Avatar>
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-lg">
                      AB
                    </AvatarFallback>
                  </Avatar>
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-500 text-white text-xl">
                      MT
                    </AvatarFallback>
                  </Avatar>
                  <Avatar className="h-12 w-12 ring-2 ring-primary ring-offset-2">
                    <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white">
                      Pro
                    </AvatarFallback>
                  </Avatar>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Color Palettes */}
        <TabsContent value="color-palettes" className="space-y-6">
          <div className="rounded-xl border bg-gradient-to-r from-violet-500/10 to-purple-500/10 p-6">
            <h2 className="text-2xl font-bold mb-2">🎨 Цветови палитри за Fitness App</h2>
            <p className="text-muted-foreground">Различни цветови схеми за визуализация и избор</p>
          </div>

          {/* Palette 1: Energetic Orange/Red */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-gradient-to-r from-orange-500 to-red-500"></div>
                Палитра 1: Енергична (Оранжево-Червена)
              </CardTitle>
              <CardDescription>Динамична и мотивираща - подходяща за fitness приложения</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-orange-500 shadow-lg shadow-orange-500/30"></div>
                  <p className="text-xs font-mono">orange-500</p>
                  <p className="text-xs text-muted-foreground">Primary</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-red-500 shadow-lg shadow-red-500/30"></div>
                  <p className="text-xs font-mono">red-500</p>
                  <p className="text-xs text-muted-foreground">Accent</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-amber-400"></div>
                  <p className="text-xs font-mono">amber-400</p>
                  <p className="text-xs text-muted-foreground">Highlight</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-slate-800 border"></div>
                  <p className="text-xs font-mono">slate-800</p>
                  <p className="text-xs text-muted-foreground">Dark BG</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-slate-50 border"></div>
                  <p className="text-xs font-mono">slate-50</p>
                  <p className="text-xs text-muted-foreground">Light BG</p>
                </div>
              </div>
              <div className="p-6 rounded-lg bg-gradient-to-br from-orange-500 to-red-500">
                <h4 className="text-white font-bold mb-2">Примерен UI елемент</h4>
                <p className="text-white/90 text-sm mb-4">Добре дошли в твоята фитнес трансформация!</p>
                <div className="flex gap-2">
                  <button className="px-4 py-2 rounded-lg bg-white text-orange-600 font-semibold hover:bg-white/90">Започни</button>
                  <button className="px-4 py-2 rounded-lg bg-amber-400 text-slate-900 font-semibold hover:bg-amber-500">Научи повече</button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Palette 2: Professional Blue/Cyan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                Палитра 2: Професионална (Синьо-Циан)
              </CardTitle>
              <CardDescription>Чиста и модерна - вдъхва доверие и професионализъм</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-blue-600 shadow-lg shadow-blue-600/30"></div>
                  <p className="text-xs font-mono">blue-600</p>
                  <p className="text-xs text-muted-foreground">Primary</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-cyan-500 shadow-lg shadow-cyan-500/30"></div>
                  <p className="text-xs font-mono">cyan-500</p>
                  <p className="text-xs text-muted-foreground">Accent</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-sky-400"></div>
                  <p className="text-xs font-mono">sky-400</p>
                  <p className="text-xs text-muted-foreground">Highlight</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-slate-900 border"></div>
                  <p className="text-xs font-mono">slate-900</p>
                  <p className="text-xs text-muted-foreground">Dark BG</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-slate-50 border"></div>
                  <p className="text-xs font-mono">slate-50</p>
                  <p className="text-xs text-muted-foreground">Light BG</p>
                </div>
              </div>
              <div className="p-6 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500">
                <h4 className="text-white font-bold mb-2">Примерен UI елемент</h4>
                <p className="text-white/90 text-sm mb-4">Професионален подход към твоя прогрес</p>
                <div className="flex gap-2">
                  <button className="px-4 py-2 rounded-lg bg-white text-blue-600 font-semibold hover:bg-white/90">Започни</button>
                  <button className="px-4 py-2 rounded-lg bg-cyan-400 text-slate-900 font-semibold hover:bg-cyan-500">Научи повече</button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Palette 3: Natural Green */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"></div>
                Палитра 3: Естествена (Зелена)
              </CardTitle>
              <CardDescription>Балансирана и здравословна - идеална за wellness и nutrition</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-green-600 shadow-lg shadow-green-600/30"></div>
                  <p className="text-xs font-mono">green-600</p>
                  <p className="text-xs text-muted-foreground">Primary</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-emerald-500 shadow-lg shadow-emerald-500/30"></div>
                  <p className="text-xs font-mono">emerald-500</p>
                  <p className="text-xs text-muted-foreground">Accent</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-lime-400"></div>
                  <p className="text-xs font-mono">lime-400</p>
                  <p className="text-xs text-muted-foreground">Highlight</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-slate-800 border"></div>
                  <p className="text-xs font-mono">slate-800</p>
                  <p className="text-xs text-muted-foreground">Dark BG</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-stone-50 border"></div>
                  <p className="text-xs font-mono">stone-50</p>
                  <p className="text-xs text-muted-foreground">Light BG</p>
                </div>
              </div>
              <div className="p-6 rounded-lg bg-gradient-to-br from-green-600 to-emerald-500">
                <h4 className="text-white font-bold mb-2">Примерен UI елемент</h4>
                <p className="text-white/90 text-sm mb-4">Здравословни навици за по-добър живот</p>
                <div className="flex gap-2">
                  <button className="px-4 py-2 rounded-lg bg-white text-green-600 font-semibold hover:bg-white/90">Започни</button>
                  <button className="px-4 py-2 rounded-lg bg-lime-400 text-slate-900 font-semibold hover:bg-lime-500">Научи повече</button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Palette 4: Modern Purple/Violet */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-gradient-to-r from-purple-500 to-violet-500"></div>
                Палитра 4: Модерна (Лилаво-Виолетова)
              </CardTitle>
              <CardDescription>Premium и иновативна - за луксозни fitness услуги</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-purple-600 shadow-lg shadow-purple-600/30"></div>
                  <p className="text-xs font-mono">purple-600</p>
                  <p className="text-xs text-muted-foreground">Primary</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-violet-500 shadow-lg shadow-violet-500/30"></div>
                  <p className="text-xs font-mono">violet-500</p>
                  <p className="text-xs text-muted-foreground">Accent</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-fuchsia-400"></div>
                  <p className="text-xs font-mono">fuchsia-400</p>
                  <p className="text-xs text-muted-foreground">Highlight</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-slate-900 border"></div>
                  <p className="text-xs font-mono">slate-900</p>
                  <p className="text-xs text-muted-foreground">Dark BG</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-slate-50 border"></div>
                  <p className="text-xs font-mono">slate-50</p>
                  <p className="text-xs text-muted-foreground">Light BG</p>
                </div>
              </div>
              <div className="p-6 rounded-lg bg-gradient-to-br from-purple-600 to-violet-500">
                <h4 className="text-white font-bold mb-2">Примерен UI елемент</h4>
                <p className="text-white/90 text-sm mb-4">Premium fitness опит на ново ниво</p>
                <div className="flex gap-2">
                  <button className="px-4 py-2 rounded-lg bg-white text-purple-600 font-semibold hover:bg-white/90">Започни</button>
                  <button className="px-4 py-2 rounded-lg bg-fuchsia-400 text-white font-semibold hover:bg-fuchsia-500">Научи повече</button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Palette 5: Bold Dark Mode */}
          <Card className="bg-slate-950 text-white border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <div className="h-6 w-6 rounded-full bg-gradient-to-r from-slate-700 to-zinc-600"></div>
                Палитра 5: Тъмна (Dark Mode Focused)
              </CardTitle>
              <CardDescription className="text-slate-400">Минималистична и елегантна - за нощни тренировки</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-slate-50 border border-slate-700"></div>
                  <p className="text-xs font-mono text-slate-300">slate-50</p>
                  <p className="text-xs text-slate-500">Primary Text</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-zinc-700 border border-slate-700"></div>
                  <p className="text-xs font-mono text-slate-300">zinc-700</p>
                  <p className="text-xs text-slate-500">Cards</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-blue-500 shadow-lg shadow-blue-500/30"></div>
                  <p className="text-xs font-mono text-slate-300">blue-500</p>
                  <p className="text-xs text-slate-500">Accent</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-slate-900 border border-slate-700"></div>
                  <p className="text-xs font-mono text-slate-300">slate-900</p>
                  <p className="text-xs text-slate-500">BG</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-slate-950 border border-slate-700"></div>
                  <p className="text-xs font-mono text-slate-300">slate-950</p>
                  <p className="text-xs text-slate-500">Deep BG</p>
                </div>
              </div>
              <div className="p-6 rounded-lg bg-zinc-800/50 border border-slate-700">
                <h4 className="text-white font-bold mb-2">Примерен UI елемент</h4>
                <p className="text-slate-300 text-sm mb-4">Елегантен тъмен дизайн за всяка тренировка</p>
                <div className="flex gap-2">
                  <button className="px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600">Започни</button>
                  <button className="px-4 py-2 rounded-lg bg-slate-700 text-white font-semibold hover:bg-slate-600">Научи повече</button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Palette 6: Vibrant Gradient Mix */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"></div>
                Палитра 6: Динамична (Multi-Gradient)
              </CardTitle>
              <CardDescription>Креативна и жизнена - за youth-focused fitness брандове</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-pink-500 shadow-lg shadow-pink-500/30"></div>
                  <p className="text-xs font-mono">pink-500</p>
                  <p className="text-xs text-muted-foreground">Primary</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-purple-500 shadow-lg shadow-purple-500/30"></div>
                  <p className="text-xs font-mono">purple-500</p>
                  <p className="text-xs text-muted-foreground">Mid</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-indigo-500 shadow-lg shadow-indigo-500/30"></div>
                  <p className="text-xs font-mono">indigo-500</p>
                  <p className="text-xs text-muted-foreground">Accent</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-slate-900 border"></div>
                  <p className="text-xs font-mono">slate-900</p>
                  <p className="text-xs text-muted-foreground">Dark BG</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-white border"></div>
                  <p className="text-xs font-mono">white</p>
                  <p className="text-xs text-muted-foreground">Light BG</p>
                </div>
              </div>
              <div className="p-6 rounded-lg bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
                <h4 className="text-white font-bold mb-2">Примерен UI елемент</h4>
                <p className="text-white/90 text-sm mb-4">Ярък и креативен подход към фитнеса</p>
                <div className="flex gap-2">
                  <button className="px-4 py-2 rounded-lg bg-white text-pink-600 font-semibold hover:bg-white/90">Започни</button>
                  <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700">Научи повече</button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comparison Section */}
          <Card>
            <CardHeader>
              <CardTitle>📊 Сравнителна визуализация</CardTitle>
              <CardDescription>Всички палитри в едно място за лесно сравнение</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="space-y-2">
                  <div className="h-24 rounded-lg bg-gradient-to-br from-orange-500 to-red-500"></div>
                  <p className="text-xs font-semibold text-center">Енергична</p>
                </div>
                <div className="space-y-2">
                  <div className="h-24 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500"></div>
                  <p className="text-xs font-semibold text-center">Професионална</p>
                </div>
                <div className="space-y-2">
                  <div className="h-24 rounded-lg bg-gradient-to-br from-green-600 to-emerald-500"></div>
                  <p className="text-xs font-semibold text-center">Естествена</p>
                </div>
                <div className="space-y-2">
                  <div className="h-24 rounded-lg bg-gradient-to-br from-purple-600 to-violet-500"></div>
                  <p className="text-xs font-semibold text-center">Модерна</p>
                </div>
                <div className="space-y-2">
                  <div className="h-24 rounded-lg bg-slate-950 border"></div>
                  <p className="text-xs font-semibold text-center">Тъмна</p>
                </div>
                <div className="space-y-2">
                  <div className="h-24 rounded-lg bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"></div>
                  <p className="text-xs font-semibold text-center">Динамична</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
