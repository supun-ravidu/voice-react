import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Home", href: "#", icon: "🏠" },
  { label: "Courses", href: "#courses", icon: "📚" },
  { label: "Live Classes", href: "/live-classes", icon: "🎥", premium: true },
  { label: "Free Classes", href: "/free-classes", icon: "✨", free: true },
];

export default function Navbar({ onNavigate, isUserLoggedIn = false, userName = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavigation = (href, label, e) => {
    e.preventDefault();
    setActiveLink(label);
    
    if (href === "/live-classes") {
      onNavigate('live-classes');
    } else if (href === "/free-classes") {
      onNavigate('free-classes');
    } else if (href === "#") {
      // Scroll to top of page when Home is clicked
      window.scrollTo({ top: 0, behavior: "smooth" });
      onNavigate('home');
    } else if (href.startsWith("#")) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleLogout = () => {
    onNavigate('logout');
  };

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? "bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/50 shadow-2xl"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        {/* Logo with animation */}
        <motion.a
          href="#"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          onClick={(e) => handleNavigation("#", "Home", e)}
          className="group relative cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-indigo-400 rounded-full blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative w-10 h-10 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-400 flex items-center justify-center">
                <span className="text-white text-xl">🎤</span>
              </div>
            </div>
            <div>
              <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-cyan-300 via-indigo-300 to-purple-300 bg-clip-text text-transparent">
                VOICE
              </span>
              <span className="text-2xl font-black text-cyan-400">LMS</span>
            </div>
          </div>
          <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-indigo-400 group-hover:w-full transition-all duration-500"></div>
        </motion.a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-900/40 backdrop-blur-sm border border-slate-700/50 shadow-lg">
            {navLinks.map((link, index) => (
              <motion.a
                key={link.label}
                href={link.href}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                onClick={(e) => handleNavigation(link.href, link.label, e)}
                className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 group overflow-hidden ${
                  activeLink === link.label
                    ? "text-white"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span className="text-base">{link.icon}</span>
                  <span>{link.label}</span>
                  {link.premium && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                      PRO
                    </span>
                  )}
                  {link.free && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                      FREE
                    </span>
                  )}
                </span>
                {activeLink === link.label && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 rounded-full"
                    transition={{ type: "spring", duration: 0.5 }}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 to-indigo-500/0 group-hover:from-cyan-500/10 group-hover:to-indigo-500/10 rounded-full transition-all duration-300"></div>
              </motion.a>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3 ml-4">
            {isUserLoggedIn ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3"
              >
                {/* User Avatar */}
                <div className="group relative">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 cursor-pointer hover:scale-105 transition-all duration-300">
                    <div className="relative">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {userName?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse"></div>
                    </div>
                    <span className="text-sm font-medium text-green-400">{userName}</span>
                  </div>
                </div>

                {/* Logout Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="relative overflow-hidden rounded-full px-5 py-1.5 text-sm font-semibold text-red-400 transition-all duration-300 group"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <span>🚪</span>
                    <span>Logout</span>
                  </span>
                  <div className="absolute inset-0 bg-red-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 border border-red-500/50 rounded-full"></div>
                </motion.button>
              </motion.div>
            ) : (
              <>
                {/* Student Login Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onNavigate('user-login')}
                  className="relative overflow-hidden rounded-full px-5 py-1.5 text-sm font-semibold text-green-400 transition-all duration-300 group"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <span>🎓</span>
                    <span>Student Login</span>
                  </span>
                  <div className="absolute inset-0 bg-green-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 border border-green-500/50 rounded-full"></div>
                </motion.button>

                {/* Admin Login Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onNavigate('admin')}
                  className="relative overflow-hidden rounded-full px-5 py-1.5 text-sm font-semibold text-cyan-400 transition-all duration-300 group"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <span>👑</span>
                    <span>Admin</span>
                  </span>
                  <div className="absolute inset-0 bg-cyan-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 border border-cyan-500/50 rounded-full"></div>
                </motion.button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setIsOpen(!isOpen)}
          className="relative md:hidden w-10 h-10 rounded-lg bg-slate-800/50 border border-slate-700 flex items-center justify-center group"
        >
          <div className="relative w-5 h-5">
            <span
              className={`absolute h-0.5 w-5 bg-white rounded-full transition-all duration-300 ${
                isOpen ? "rotate-45 top-2" : "top-0"
              }`}
            />
            <span
              className={`absolute h-0.5 w-5 bg-white rounded-full transition-all duration-300 top-2 ${
                isOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute h-0.5 w-5 bg-white rounded-full transition-all duration-300 ${
                isOpen ? "-rotate-45 top-2" : "top-4"
              }`}
            />
          </div>
        </motion.button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden border-t border-slate-800/60 bg-slate-950/95 backdrop-blur-xl"
          >
            <div className="flex flex-col space-y-2 px-6 py-5">
              {navLinks.map((link, index) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={(e) => {
                    handleNavigation(link.href, link.label, e);
                    setIsOpen(false);
                  }}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-800/30 border border-slate-700 hover:border-cyan-500/50 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{link.icon}</span>
                    <span className="text-slate-200 font-medium">{link.label}</span>
                    {link.premium && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                        PRO
                      </span>
                    )}
                    {link.free && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                        FREE
                      </span>
                    )}
                  </div>
                  <svg
                    className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </motion.a>
              ))}

              <div className="pt-4 mt-2 border-t border-slate-800 space-y-3">
                {isUserLoggedIn ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/30">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 flex items-center justify-center">
                        <span className="text-white font-bold">
                          {userName?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-400">{userName}</p>
                        <p className="text-xs text-slate-400">Logged in</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        handleLogout();
                      }}
                      className="w-full px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/50 text-red-400 font-semibold hover:bg-red-500/20 transition-all duration-300"
                    >
                      🚪 Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        onNavigate('user-login');
                      }}
                      className="w-full px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/50 text-green-400 font-semibold hover:bg-green-500/20 transition-all duration-300"
                    >
                      🎓 Student Login
                    </button>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        onNavigate('admin');
                      }}
                      className="w-full px-4 py-3 rounded-xl bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 font-semibold hover:bg-cyan-500/20 transition-all duration-300"
                    >
                      👑 Admin Login
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}