import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const currentYear = new Date().getFullYear();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 3000);
      setEmail("");
    }
  };

  const footerLinks = {
    Platform: [
      { name: "Features", href: "#features" },
      { name: "Courses", href: "#courses" },
      { name: "Live Classes", href: "/live-classes" },
      { name: "Free Classes", href: "/free-classes" },
      { name: "Pricing", href: "#pricing" },
    ],
    Company: [
      { name: "About Us", href: "#about" },
      { name: "Blog", href: "#blog" },
      { name: "Careers", href: "#careers" },
      { name: "Press", href: "#press" },
      { name: "Contact", href: "#contact" },
    ],
    Resources: [
      { name: "Help Center", href: "#help" },
      { name: "Community", href: "#community" },
      { name: "Webinars", href: "#webinars" },
      { name: "Affiliate Program", href: "#affiliate" },
      { name: "Become an Instructor", href: "#instructor" },
    ],
    Legal: [
      { name: "Privacy Policy", href: "#privacy" },
      { name: "Terms of Service", href: "#terms" },
      { name: "Cookie Policy", href: "#cookies" },
      { name: "GDPR", href: "#gdpr" },
      { name: "Security", href: "#security" },
    ],
  };

  const socialLinks = [
    { name: "Twitter", icon: "🐦", url: "#", color: "hover:text-cyan-400" },
    { name: "LinkedIn", icon: "💼", url: "#", color: "hover:text-blue-400" },
    { name: "Instagram", icon: "📸", url: "#", color: "hover:text-pink-400" },
    { name: "YouTube", icon: "▶️", url: "#", color: "hover:text-red-400" },
    { name: "Facebook", icon: "📘", url: "#", color: "hover:text-blue-500" },
    { name: "Discord", icon: "🎮", url: "#", color: "hover:text-indigo-400" },
  ];

  const paymentMethods = [
    "💳 Visa", "💳 Mastercard", "💳 Amex", "💳 PayPal", "💳 Stripe"
  ];

  return (
    <footer className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 border-t border-slate-800/50 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Newsletter Section */}
      <div className="relative border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-purple-500/10 rounded-2xl p-8 backdrop-blur-sm border border-slate-700/50">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-3 mb-3"
                >
                  <span className="text-3xl">📧</span>
                  <span className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">Newsletter</span>
                </motion.div>
                <motion.h3
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  viewport={{ once: true }}
                  className="text-2xl md:text-3xl font-bold text-white mb-2"
                >
                  Stay in the Loop
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  viewport={{ once: true }}
                  className="text-slate-400"
                >
                  Get the latest updates on new courses, live classes, and exclusive offers
                </motion.p>
              </div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                viewport={{ once: true }}
              >
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-slate-400">📧</span>
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition-all"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-400 text-slate-950 font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all transform hover:-translate-y-0.5"
                  >
                    {subscribed ? "✅ Subscribed!" : "Subscribe Now →"}
                  </button>
                </form>
                <p className="text-xs text-slate-500 mt-3">
                  No spam, unsubscribe anytime. We respect your privacy.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="relative max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="col-span-2 md:col-span-3 lg:col-span-1"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-indigo-400 rounded-full blur-xl opacity-75" />
                <div className="relative w-10 h-10 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-400 flex items-center justify-center">
                  <span className="text-white text-xl">🎤</span>
                </div>
              </div>
              <div>
                <span className="text-xl font-black tracking-tighter bg-gradient-to-r from-cyan-300 via-indigo-300 to-purple-300 bg-clip-text text-transparent">
                  VOICE
                </span>
                <span className="text-xl font-black text-cyan-400">LMS</span>
              </div>
            </div>
            <p className="text-slate-400 text-sm mb-4 leading-relaxed">
              Empowering voices worldwide through innovative, AI-powered learning experiences.
            </p>
            <div className="flex gap-2 flex-wrap">
              {socialLinks.map((social, idx) => (
                <motion.a
                  key={idx}
                  href={social.url}
                  whileHover={{ scale: 1.1, y: -2 }}
                  className={`w-9 h-9 rounded-full bg-slate-800/50 border border-slate-700 flex items-center justify-center text-lg transition-all duration-300 ${social.color}`}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([category, links], idx) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
            >
              <h4 className="text-white font-semibold mb-4">{category}</h4>
              <ul className="space-y-2">
                {links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <a
                      href={link.href}
                      className="text-slate-400 hover:text-cyan-400 transition-colors text-sm group flex items-center gap-1"
                    >
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Payment Methods & Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          viewport={{ once: true }}
          className="border-t border-slate-800/50 pt-8 mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex gap-3 flex-wrap justify-center">
              {paymentMethods.map((method, idx) => (
                <span key={idx} className="text-xs text-slate-500 bg-slate-800/30 px-3 py-1 rounded-full">
                  {method}
                </span>
              ))}
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span className="text-xs text-slate-400">SSL Secure</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span className="text-xs text-slate-400">Money-back Guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span className="text-xs text-slate-400">24/7 Support</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          viewport={{ once: true }}
          className="border-t border-slate-800/50 pt-8 text-center"
        >
          <p className="text-slate-500 text-sm">
            © {currentYear} VoiceLMS. All rights reserved. Made with 
            <span className="text-red-400 mx-1">❤️</span> 
            for voice learners worldwide
          </p>
          <p className="text-xs text-slate-600 mt-2">
            Empowering voices, transforming futures
          </p>
        </motion.div>
      </div>

      {/* Scroll to Top Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-400 text-slate-950 flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110 z-50 group"
      >
        <svg className="w-5 h-5 group-hover:-translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </motion.button>
    </footer>
  );
}