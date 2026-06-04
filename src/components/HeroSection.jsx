import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-700/50 bg-slate-900/40 px-6 py-20 shadow-2xl backdrop-blur-xl sm:px-10 lg:px-16 mt-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-cyan-400/25 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-indigo-400/25 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-3xl text-center">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-300" />
            </span>
            Voice-Powered Learning
          </span>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.65, delay: 0.1, ease: "easeOut" }}
          className="mt-6 text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl"
        >
          Master Skills Through
          <span className="block bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
            Immersive Voice-Driven Lessons
          </span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.65, delay: 0.22, ease: "easeOut" }}
          className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-200/90 sm:text-lg"
        >
          Voice LMS blends interactive audio lessons, real-time feedback, and progress tracking —
          learn by speaking, listening, and creating.
        </motion.p>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.65, delay: 0.34, ease: "easeOut" }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <a
            href="#courses"
            className="group inline-flex min-w-[190px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-[0_10px_35px_rgba(56,189,248,0.35)] transition-all duration-300 hover:-translate-y-1 hover:brightness-110"
          >
            Explore Courses
            <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
          <button className="inline-flex min-w-[190px] items-center justify-center gap-2 rounded-xl border border-slate-500/60 bg-slate-900/60 px-6 py-3 text-sm font-semibold text-slate-100 transition-all duration-300 hover:border-cyan-300 hover:text-cyan-200">
            <span>🎙️</span> Watch Demo
          </button>
        </motion.div>
      </div>
    </section>
  );
}