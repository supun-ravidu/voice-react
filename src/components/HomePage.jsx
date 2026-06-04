import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import FeaturedCourses from "./FeaturedCourses";
import DashboardPreview from "./DashboardPreview";

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Stats counter animation - Sinhala labels
  const stats = [
    { label: "ක්‍රියාකාරී සිසුන්", value: 5000, suffix: "+", icon: "👨‍🎓", color: "cyan" },
    { label: "ප්‍රවීණ උපදේශකවරු", value: 50, suffix: "+", icon: "👩‍🏫", color: "purple" },
    { label: "සජීවී පන්ති", value: 200, suffix: "+", icon: "🎥", color: "orange" },
    { label: "සාර්ථකත්ව අනුපාතය", value: 94, suffix: "%", icon: "📈", color: "green" },
  ];

  const features = [
    {
      icon: "🎤",
      title: "හඬ-ප්‍රථම ඉගෙනීම",
      description: "අන්තර්ක්‍රියාකාරී ශ්‍රව්‍ය පාඩම් සහ තත්‍ය කාලීන ප්‍රතිචාර මගින් ඉගෙන ගන්න",
      color: "cyan",
    },
    {
      icon: "🤖",
      title: "AI උච්චාරණ පුහුණුකරු",
      description: "ඔබගේ උච්චාරණය සහ ස්වරය පිළිබඳ ක්ෂණික ප්‍රතිචාර ලබා ගන්න",
      color: "purple",
    },
    {
      icon: "📚",
      title: "ප්‍රවීණ මඟ පෙන්වීම",
      description: "වසර ගණනාවක පළපුරුද්ද ඇති කර්මාන්තයේ ප්‍රවීණයන්ගෙන් ඉගෙන ගන්න",
      color: "orange",
    },
    {
      icon: "🎯",
      title: "පුද්ගලාරෝපිත මාර්ගය",
      description: "ඔබගේ ඉලක්ක සඳහා සකස් කරන ලද පුද්ගලාරෝපිත ඉගෙනුම් ගමනක්",
      color: "green",
    },
    {
      icon: "🏆",
      title: "සහතිකපත්",
      description: "පාඨමාලා සම්පූර්ණ කිරීමෙන් පසු පිළිගත් සහතික ලබා ගන්න",
      color: "yellow",
    },
    {
      icon: "💬",
      title: "ප්‍රජා සහාය",
      description: "සෙසු ඉගෙන ගන්නන් සහ උපදේශකයින් සමඟ සම්බන්ධ වන්න",
      color: "pink",
    },
  ];

  const testimonials = [
    {
      name: "කුමාරි සිල්වා",
      nameEn: "Kumari Silva",
      role: "හඬ කලාකාරිනිය",
      roleEn: "Voice Artist",
      content: "මෙම වේදිකාව මගේ හඬ පුහුණුව සම්පූර්ණයෙන්ම වෙනස් කළා! ඉතාමත් වටිනා අත්දැකීමක්. සෑම කෙනෙකුටම නිර්දේශ කරනවා.",
      contentEn: "This platform completely transformed my voice training! A very valuable experience. I recommend it to everyone.",
      rating: 5,
      avatar: "🎭",
      location: "කොළඹ",
    },
    {
      name: "දිනේෂ් පෙරේරා",
      nameEn: "Dinesh Perera",
      role: "පොඩ්කාස්ට් නිෂ්පාදක",
      roleEn: "Podcast Producer",
      content: "මගේ පොඩ්කාස්ට් වෘත්තිය සඳහා කළ හොඳම ආයෝජනය මෙයයි. අතිවිශිෂ්ට වේදිකාවක්! අනිවාර්යෙන්ම උත්සාහ කරන්න.",
      contentEn: "The best investment I've made for my podcasting career. An amazing platform! Definitely try it.",
      rating: 5,
      avatar: "🎙️",
      location: "ගාල්ල",
    },
    {
      name: "අමරා වීරසිංහ",
      nameEn: "Amara Weerasinghe",
      role: "මහජන කථිකාචාර්ය",
      roleEn: "Public Speaker",
      content: "VoiceLMS එකට සම්බන්ධ වුණාට පස්සේ මගේ ආත්ම විශ්වාසය අහස උසට ගියා. ස්තුතියි මෙවැනි වටිනා වේදිකාවක් නිර්මාණය කළාට.",
      contentEn: "My confidence has skyrocketed since joining VoiceLMS. Thank you for creating such a valuable platform.",
      rating: 5,
      avatar: "🗣️",
      location: "මහනුවර",
    },
    {
      name: "චමින්ද ජයවර්ධන",
      nameEn: "Chaminda Jayawardhana",
      role: "ගුරුවරයා",
      roleEn: "Teacher",
      content: "සිසුන්ට හඬ පුහුණුව ලබාදීමට මෙම වේදිකාව ඉතාමත් ප්‍රයෝජනවත්. පාසල් සිසුන්ටත් සුදුසුයි. ස්තුතියි!",
      contentEn: "This platform is very useful for teaching voice training to students. Suitable for school students too. Thank you!",
      rating: 5,
      avatar: "👨‍🏫",
      location: "රත්නපුර",
    },
    {
      name: "නිශාන්ත හේරත්",
      nameEn: "Nishantha Herath",
      role: "ගායක",
      roleEn: "Singer",
      content: "මගේ ගායන දක්ෂතාවය වැඩි දියුණු කර ගැනීමට මෙය ඉතාමත් උපකාරී වුණා. හඬ පුහුණුවට ලංකාවේ හොඳම වේදිකාව!",
      contentEn: "This was very helpful in improving my singing skills. The best platform for voice training in Sri Lanka!",
      rating: 5,
      avatar: "🎤",
      location: "නුවරඑළිය",
    },
    {
      name: "දමයන්ති රණසිංහ",
      nameEn: "Damayanthi Ranasinghe",
      role: "විකාශිකාව",
      roleEn: "Broadcaster",
      content: "වෘත්තීය මට්ටමේ හඬ පුහුණුවක් මෙතැනින් ලබා ගන්න පුළුවන්. ගුණාත්මක අත්දැකීමක්! දිගටම ඉගෙන ගන්න ආස හිතෙනවා.",
      contentEn: "You can get professional level voice training here. A quality experience! Makes you want to keep learning.",
      rating: 5,
      avatar: "📻",
      location: "යාපනය",
    },
  ];

  const firstRowTestimonials = testimonials.slice(0, 3);
  const secondRowTestimonials = testimonials.slice(3, 6);

  return (
    <div ref={targetRef} className="bg-slate-950">
      {/* Hero Section with Parallax */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background with Sri Lankan patterns */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-500" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent" />
        </div>

        <motion.div 
          style={{ opacity, scale, y }}
          className="relative max-w-7xl mx-auto px-6 text-center z-10"
        >
          {/* Floating Badge - Sinhala */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-semibold mb-6"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
            </span>
            හඬ-බලගැන්වූ ඉගෙනුම් වේදිකාව
          </motion.div>

          {/* Main Title - Sinhala + English mix */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-7xl lg:text-8xl font-bold mb-6"
          >
            ඔබේ හඬ ප්‍රගුණ කරන්න,
            <span className="block bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent mt-2">
              ඔබේ අනාගතය පරිවර්තනය කරන්න
            </span>
          </motion.h1>

          {/* Subtitle - Sinhala */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-slate-300 max-w-2xl mx-auto mb-10"
          >
            AI බලගැන්වූ පාඩම් සහ සජීවී අන්තර්ක්‍රියාකාරී සැසි මගින් හඬ කුසලතා ප්‍රගුණ කරන දහස් ගණන් ඉගෙන ගන්නන් හා එක්වන්න
          </motion.p>

          {/* CTA Buttons - Sinhala */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <a
              href="#courses"
              className="group px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-400 text-slate-950 font-bold text-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              ඉගෙනීම ආරම්භ කරන්න
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
            <button className="px-8 py-4 rounded-xl border border-slate-600 text-slate-200 font-bold text-lg hover:border-cyan-400 hover:text-cyan-400 transition-all flex items-center justify-center gap-2">
              <span>🎥</span>
              නිරූපණය බලන්න
            </button>
          </motion.div>

          {/* Stats Section - Sinhala */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          >
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold text-white">
                  {stat.value}{stat.suffix}
                </div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-slate-400 flex justify-center">
            <div className="w-1 h-2 bg-slate-400 rounded-full mt-2 animate-bounce" />
          </div>
        </motion.div>
      </section>

      {/* Features Section - Sinhala */}
      <section className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-flex px-4 py-2 rounded-full bg-purple-500/10 text-purple-400 text-sm font-semibold mb-4">
              අප තෝරා ගන්නේ ඇයි?
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              සාර්ථකත්වය සඳහා අවශ්‍ය සියල්ල
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              ඔබගේ හඬ කුසලතා ප්‍රගුණ කිරීමට අවශ්‍ය සියලු මෙවලම් සහ සම්පත් අප සපයන්නෙමු
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800 p-6 hover:border-cyan-500/50 transition-all hover:transform hover:-translate-y-2"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className={`w-14 h-14 rounded-xl bg-${feature.color}-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <span className="text-3xl">{feature.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-400">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <FeaturedCourses />

      {/* Dashboard Preview */}
      <DashboardPreview />

      {/* Testimonials Section - Full Sinhala */}
      <section className="py-20 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-flex px-4 py-2 rounded-full bg-yellow-500/10 text-yellow-400 text-sm font-semibold mb-4">
              සිසු ප්‍රශංසා
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              අපගේ සිසුන් පවසන දේ
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              ඔවුන්ගේ කටහඬ කුසලතා පරිවර්තනය කළ දහස් ගණන් සතුටු සිසුන් සමඟ එක්වන්න
            </p>
          </motion.div>

          {/* Traditional Sri Lankan decorative element */}
          <div className="flex justify-center mb-8">
            <div className="flex gap-2">
              <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-yellow-500/50"></div>
              <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
              <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-yellow-500/50"></div>
            </div>
          </div>

          {/* First Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {firstRowTestimonials.map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6 hover:border-yellow-500/50 hover:transform hover:-translate-y-2 transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center justify-center text-2xl shadow-lg">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg">{testimonial.name}</h4>
                    <p className="text-xs text-yellow-400/80">{testimonial.role}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs text-slate-500">📍</span>
                      <p className="text-xs text-slate-500">{testimonial.location}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-lg">★</span>
                  ))}
                </div>
                <p className="text-slate-300 italic leading-relaxed text-base">"{testimonial.content}"</p>
                <div className="mt-4 pt-3 border-t border-slate-700">
                  <p className="text-slate-500 text-xs italic">“{testimonial.contentEn}”</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {secondRowTestimonials.map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 + 0.3 }}
                className="group bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6 hover:border-yellow-500/50 hover:transform hover:-translate-y-2 transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center justify-center text-2xl shadow-lg">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg">{testimonial.name}</h4>
                    <p className="text-xs text-yellow-400/80">{testimonial.role}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs text-slate-500">📍</span>
                      <p className="text-xs text-slate-500">{testimonial.location}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-lg">★</span>
                  ))}
                </div>
                <p className="text-slate-300 italic leading-relaxed text-base">"{testimonial.content}"</p>
                <div className="mt-4 pt-3 border-t border-slate-700">
                  <p className="text-slate-500 text-xs italic">“{testimonial.contentEn}”</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Sri Lanka Cultural Trust Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="text-center mt-12 pt-8 border-t border-slate-800"
          >
            <div className="inline-flex flex-col items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/30">
              <div className="flex items-center gap-2">
                <span className="text-3xl">🇱🇰</span>
                <span className="text-2xl">⭐</span>
                <span className="text-3xl">🎤</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <span className="text-white font-bold text-lg">4.9/5</span>
                <span className="text-slate-400">සමස්ත ශ්‍රේණිගත කිරීම</span>
                <span className="text-amber-400">•</span>
                <span className="text-slate-400">5000+ සතුටු සිසුන්</span>
                <span className="text-amber-400">•</span>
                <span className="text-slate-400">ශ්‍රී ලංකාව පුරා</span>
              </div>
              <div className="flex gap-2 mt-2">
                <span className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-400">#VoiceLMSLK</span>
                <span className="text-xs px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-400">#හඬපුහුණුව</span>
                <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-400">#LearnSinhala</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section - Full Sinhala */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-purple-500/10 rounded-3xl border border-cyan-500/30 p-12 backdrop-blur-sm"
          >
            <div className="text-5xl mb-4">🎤✨</div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              ඔබේ හඬ පරිවර්තනය කිරීමට සූදානම්ද?
            </h2>
            <p className="text-slate-300 text-lg mb-8">
              අදම අප හා එක්වන්න සහ ඔබේ ගමන ආරම්භ කරන්න
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#courses"
                className="group px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-400 text-slate-950 font-semibold hover:shadow-lg transition-all flex items-center gap-2 justify-center"
              >
                <span>🚀</span>
                නොමිලේ ආරම්භ කරන්න
              </a>
              <button className="px-8 py-3 rounded-xl border border-slate-600 text-slate-300 font-semibold hover:border-cyan-400 hover:text-cyan-400 transition-all flex items-center gap-2 justify-center">
                <span>💰</span>
                මිල ගණන් බලන්න
              </button>
            </div>
            <div className="flex items-center justify-center gap-2 mt-6">
              <span className="text-green-400">✓</span>
              <p className="text-xs text-slate-500">ක්‍රෙඩිට් කාඩ් අවශ්‍ය නොවේ</p>
              <span className="text-slate-600">•</span>
              <span className="text-green-400">✓</span>
              <p className="text-xs text-slate-500">දින 7ක නොමිලේ අත්හදා බැලීම</p>
              <span className="text-slate-600">•</span>
              <span className="text-green-400">✓</span>
              <p className="text-xs text-slate-500">ඕනෑම වේලාවක අවලංගු කළ හැක</p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}