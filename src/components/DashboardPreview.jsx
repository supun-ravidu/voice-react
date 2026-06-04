import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function DashboardPreview() {
  const [activeStat, setActiveStat] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Animated stats cycling
  const stats = [
    { label: "Active Students", value: "2,847", icon: "👨‍🎓", change: "+12%", trend: "up", color: "cyan" },
    { label: "Courses Completed", value: "1,234", icon: "📚", change: "+8%", trend: "up", color: "purple" },
    { label: "Practice Hours", value: "8,492", icon: "⏰", change: "+23%", trend: "up", color: "orange" },
    { label: "Avg. Score", value: "94%", icon: "🎯", change: "+5%", trend: "up", color: "green" },
  ];

  // Real-time clock update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Cycle through stats
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStat((prev) => (prev + 1) % stats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <section id="dashboard" className="py-20 scroll-mt-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 text-cyan-400 text-sm font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
            </span>
            SMART DASHBOARD
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mt-4 bg-gradient-to-r from-white via-cyan-100 to-indigo-200 bg-clip-text text-transparent">
            Your Learning Command Center
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto mt-4">
            Track progress, monitor streaks, and get personalized insights all in one place
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Side - Interactive Dashboard Widget */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {/* Floating Stats Cards */}
            <div className="relative z-10">
              {/* Main Dashboard Card */}
              <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-6 shadow-2xl">
                {/* Header with time */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700/50">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
                      <div className="h-3 w-3 rounded-full bg-yellow-500" />
                      <div className="h-3 w-3 rounded-full bg-green-500" />
                    </div>
                    <span className="text-xs text-slate-400 ml-2">Dashboard Live</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">{formatDate(currentTime)}</p>
                    <p className="text-sm font-mono text-cyan-400">{formatTime(currentTime)}</p>
                  </div>
                </div>

                {/* Animated Stats Ticker */}
                <div className="mb-6">
                  <div className="bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 rounded-2xl p-4 border border-cyan-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-400">Live Stats</span>
                      <span className="text-xs text-green-400 animate-pulse">● LIVE</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold text-white">{stats[activeStat].value}</p>
                        <p className="text-sm text-slate-400">{stats[activeStat].label}</p>
                      </div>
                      <div className="text-center">
                        <div className="text-4xl">{stats[activeStat].icon}</div>
                        <span className="text-xs text-green-400">{stats[activeStat].change}</span>
                      </div>
                    </div>
                    <div className="mt-3 h-1 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-400 to-indigo-400 rounded-full transition-all duration-1000"
                        style={{ width: `${(activeStat + 1) * 25}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Progress Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-800/50 rounded-xl p-4 hover:bg-slate-800 transition-all group cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">🎯</span>
                      <span className="text-xs text-green-400">+15%</span>
                    </div>
                    <p className="text-2xl font-bold text-white">87%</p>
                    <p className="text-xs text-slate-400">Pronunciation Accuracy</p>
                    <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full w-[87%] bg-gradient-to-r from-green-400 to-emerald-400 rounded-full" />
                    </div>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-4 hover:bg-slate-800 transition-all group cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">⏱️</span>
                      <span className="text-xs text-green-400">+8h</span>
                    </div>
                    <p className="text-2xl font-bold text-white">124</p>
                    <p className="text-xs text-slate-400">Hours Practiced</p>
                    <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full w-[72%] bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Streak Section */}
                <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-xl p-4 border border-orange-500/20">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">🔥</span>
                      <div>
                        <p className="text-2xl font-bold text-white">7 Day Streak</p>
                        <p className="text-xs text-slate-400">Keep going! You're on fire!</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-400 text-sm">+2 today</span>
                      <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                        <span className="text-orange-400 text-sm">✓</span>
                      </div>
                    </div>
                  </div>
                  {/* Streak Dots */}
                  <div className="flex gap-1 mt-3">
                    {[...Array(7)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all ${
                          i < 7 ? 'bg-gradient-to-r from-orange-400 to-amber-400' : 'bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="mt-6">
                  <p className="text-xs text-slate-400 mb-2">RECENT ACTIVITY</p>
                  <div className="space-y-2">
                    {[
                      { action: "Completed lesson: Vocal Warm-ups", time: "2 hours ago", icon: "✅" },
                      { action: "Earned badge: Consistency King", time: "Yesterday", icon: "🏆" },
                      { action: "Joined live class: Advanced Techniques", time: "2 days ago", icon: "🎤" },
                    ].map((activity, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/50 transition-all">
                        <span className="text-lg">{activity.icon}</span>
                        <div className="flex-1">
                          <p className="text-sm text-slate-200">{activity.action}</p>
                          <p className="text-xs text-slate-500">{activity.time}</p>
                        </div>
                        <span className="text-xs text-cyan-400 cursor-pointer hover:underline">View</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-5 -right-5 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl -z-10" />
              <div className="absolute -bottom-5 -left-5 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl -z-10" />
            </div>
          </motion.div>

          {/* Right Side - Features & Benefits */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* AI Features */}
            <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-400 flex items-center justify-center">
                  <span className="text-xl">🤖</span>
                </div>
                <h3 className="text-xl font-bold text-white">AI-Powered Insights</h3>
              </div>
              <p className="text-slate-400 mb-4">
                Get real-time feedback on your pronunciation, tone, and delivery with our advanced AI coach.
              </p>
              <div className="flex items-center gap-2 text-sm text-cyan-400">
                <span>✨</span>
                <span>Available for all premium courses</span>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: "🎯", title: "Personalized Learning", desc: "Adaptive curriculum tailored to your pace", color: "cyan" },
                { icon: "🏆", title: "Achievements", desc: "Earn badges and certificates", color: "purple" },
                { icon: "🎙️", title: "Voice Studio", desc: "Professional recording tools", color: "orange" },
                { icon: "📊", title: "Progress Analytics", desc: "Detailed performance metrics", color: "green" },
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`bg-slate-900/50 rounded-xl p-4 border border-slate-700/50 hover:border-${feature.color}-500/50 transition-all group cursor-pointer`}
                >
                  <div className={`w-10 h-10 rounded-lg bg-${feature.color}-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <span className="text-xl">{feature.icon}</span>
                  </div>
                  <h4 className="text-white font-semibold mb-1">{feature.title}</h4>
                  <p className="text-xs text-slate-400">{feature.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* CTA Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-400 text-slate-950 font-bold text-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center justify-center gap-2 group"
            >
              <span>🚀</span>
              Start Your Journey Today
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </motion.button>

            {/* Trust Badges */}
            <div className="flex justify-center gap-6 pt-4">
              {[
                { label: "Trusted by 5k+ learners", icon: "👥" },
                { label: "4.8/5 Average Rating", icon: "⭐" },
                { label: "24/7 Support", icon: "💬" },
              ].map((badge, idx) => (
                <div key={idx} className="flex items-center gap-1 text-xs text-slate-500">
                  <span>{badge.icon}</span>
                  <span>{badge.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}