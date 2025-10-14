"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function HeroShowcase() {
  return (
    <div className="relative hidden lg:block h-[700px]">
      {/* Central 3D Phone Mockup */}
      <motion.div
        initial={{ opacity: 0, y: 50, rotateY: -15 }}
        animate={{ opacity: 1, y: 0, rotateY: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
        style={{ perspective: "1200px" }}
      >
        <motion.div
          animate={{
            rotateY: [0, 3, 0, -3, 0],
            rotateX: [0, 1, 0, -1, 0],
            y: [0, -10, 0, -10, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative w-[340px] h-[680px]"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Phone Frame */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-gray-950 rounded-[3.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.9)] p-3 border border-white/10">
            <div className="relative w-full h-full bg-gradient-to-br from-white/[0.15] to-white/[0.05] backdrop-blur-2xl border-2 border-white/20 rounded-[3rem] overflow-hidden shadow-inner">
              {/* Phone Screen Content */}
              <Image
                src="https://images.unsplash.com/photo-1611078489935-0cb964de46d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                alt="Fitness App Interface"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

              {/* App UI Elements */}
              <div className="absolute top-6 left-4 right-4">
                <div className="bg-white/25 backdrop-blur-xl rounded-2xl p-5 border border-white/40 shadow-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500 rounded-xl shadow-lg flex items-center justify-center">
                      <span className="text-white text-xl font-black">💪</span>
                    </div>
                    <div>
                      <div className="text-white font-black text-base drop-shadow-md">Today&apos;s Workout</div>
                      <div className="text-gray-100 text-xs font-semibold">Upper Body Focus</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center border border-white/30">
                      <div className="text-white font-black text-xl drop-shadow-md">45</div>
                      <div className="text-gray-200 text-xs font-semibold">minutes</div>
                    </div>
                    <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center border border-white/30">
                      <div className="text-white font-black text-xl drop-shadow-md">12</div>
                      <div className="text-gray-200 text-xs font-semibold">exercises</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-7 bg-gray-950 rounded-b-3xl shadow-lg"></div>
            </div>
          </div>

          {/* Enhanced Phone Shadow */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-80 h-12 bg-blue-600/40 blur-3xl rounded-full"></div>
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-64 h-8 bg-cyan-500/30 blur-2xl rounded-full"></div>
        </motion.div>
      </motion.div>

      {/* Decorative Gradient Blobs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }}></div>

      {/* Central glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl"></div>
    </div>
  );
}
