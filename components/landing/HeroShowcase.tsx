"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import CountUp from "react-countup";
import { Zap, Smartphone, TrendingUp, Shield } from "lucide-react";

export default function HeroShowcase() {
  return (
    <div className="relative hidden lg:block h-[700px]">
      {/* Central 3D Phone Mockup */}
      <motion.div
        initial={{ opacity: 0, y: 50, rotateY: -15 }}
        animate={{ opacity: 1, y: 0, rotateY: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
        style={{ perspective: "1000px" }}
      >
        <motion.div
          animate={{
            rotateY: [0, 5, 0, -5, 0],
            rotateX: [0, 2, 0, -2, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative w-[320px] h-[640px]"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Phone Frame */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 rounded-[3rem] shadow-2xl p-3">
            <div className="relative w-full h-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] overflow-hidden">
              {/* Phone Screen Content */}
              <Image
                src="https://images.unsplash.com/photo-1611078489935-0cb964de46d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                alt="Fitness App Interface"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

              {/* App UI Elements */}
              <div className="absolute top-4 left-4 right-4">
                <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl"></div>
                    <div>
                      <div className="text-white font-bold text-sm">Today&apos;s Workout</div>
                      <div className="text-gray-200 text-xs">Upper Body Focus</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-white/10 rounded-lg p-2 text-center">
                      <div className="text-white font-bold text-lg">45</div>
                      <div className="text-gray-300 text-xs">min</div>
                    </div>
                    <div className="flex-1 bg-white/10 rounded-lg p-2 text-center">
                      <div className="text-white font-bold text-lg">12</div>
                      <div className="text-gray-300 text-xs">exercises</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl"></div>
            </div>
          </div>

          {/* Phone Shadow */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-64 h-8 bg-blue-500/30 blur-2xl rounded-full"></div>
        </motion.div>
      </motion.div>

      {/* Laptop Preview - Top Left */}
      <motion.div
        initial={{ opacity: 0, x: -50, y: -50 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="absolute top-0 left-0 w-[400px] h-[240px] group cursor-pointer"
      >
        <div className="relative w-full h-full">
          {/* Laptop Screen */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 rounded-t-2xl p-2 shadow-2xl">
            <div className="relative w-full h-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Dashboard Interface"
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 to-cyan-900/40"></div>

              {/* Dashboard Stats */}
              <div className="absolute top-4 left-4 right-4">
                <div className="bg-white/20 backdrop-blur-md rounded-xl p-3 border border-white/30">
                  <div className="text-white text-xs font-semibold mb-2">Performance Overview</div>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-gradient-to-br from-green-500/30 to-emerald-500/30 rounded-lg p-2">
                      <div className="text-white font-bold text-sm">+24%</div>
                      <div className="text-gray-200 text-xs">Growth</div>
                    </div>
                    <div className="flex-1 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded-lg p-2">
                      <div className="text-white font-bold text-sm">98%</div>
                      <div className="text-gray-200 text-xs">Success</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Laptop Base */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[105%] h-3 bg-gradient-to-b from-gray-800 to-gray-900 rounded-b-xl"></div>
        </div>
      </motion.div>

      {/* Animated Stats Grid - Bottom Right */}
      <motion.div
        initial={{ opacity: 0, x: 50, y: 50 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="absolute bottom-8 right-0 w-[340px]"
      >
        <div className="grid grid-cols-2 gap-3">
          {/* Stat Card 1 */}
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="text-3xl font-black text-white mb-1">
              <CountUp end={872} duration={2.5} separator="," />+
            </div>
            <div className="text-xs text-gray-200 font-semibold">Active Clients</div>
          </motion.div>

          {/* Stat Card 2 */}
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="text-3xl font-black text-white mb-1">
              <CountUp end={120} duration={2.5} />+
            </div>
            <div className="text-xs text-gray-200 font-semibold">Pro Trainers</div>
          </motion.div>

          {/* Stat Card 3 */}
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="text-3xl font-black text-white mb-1">
              <CountUp end={15} duration={2.5} />K+
            </div>
            <div className="text-xs text-gray-200 font-semibold">Workouts</div>
          </motion.div>

          {/* Stat Card 4 */}
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                <Smartphone className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="text-3xl font-black text-white mb-1">
              <CountUp end={98} duration={2.5} />%
            </div>
            <div className="text-xs text-gray-200 font-semibold">Satisfaction</div>
          </motion.div>
        </div>
      </motion.div>

      {/* Floating Feature Pills */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="absolute top-32 right-12"
      >
        <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-md border border-white/30 rounded-full px-4 py-2 shadow-lg">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 bg-green-400 rounded-full"
            ></motion.div>
            <span className="text-white text-xs font-semibold">Real-time Sync</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="absolute top-[400px] left-8"
      >
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md border border-white/30 rounded-full px-4 py-2 shadow-lg">
          <div className="flex items-center gap-2">
            <Zap className="h-3 w-3 text-yellow-400" />
            <span className="text-white text-xs font-semibold">AI Powered</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1 }}
        className="absolute bottom-[280px] left-20"
      >
        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-md border border-white/30 rounded-full px-4 py-2 shadow-lg">
          <div className="flex items-center gap-2">
            <Smartphone className="h-3 w-3 text-cyan-400" />
            <span className="text-white text-xs font-semibold">Mobile First</span>
          </div>
        </div>
      </motion.div>

      {/* Decorative Gradient Blobs */}
      <div className="absolute top-32 right-32 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-32 left-32 w-96 h-96 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
    </div>
  );
}
