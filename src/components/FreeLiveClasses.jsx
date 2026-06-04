import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';

export default function FreeLiveClasses() {
  const [freeClasses, setFreeClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    loadFreeClasses();
  }, []);

  useEffect(() => {
    filterClasses();
  }, [freeClasses, searchTerm]);

  const loadFreeClasses = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'freeLiveClasses'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const classes = [];
      querySnapshot.forEach((doc) => {
        classes.push({ id: doc.id, ...doc.data() });
      });
      setFreeClasses(classes);
      setFilteredClasses(classes);
    } catch (error) {
      console.error("Error loading free classes:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterClasses = () => {
    let filtered = [...freeClasses];
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(cls => 
        cls.className?.toLowerCase().includes(term) ||
        cls.description?.toLowerCase().includes(term)
      );
    }
    
    setFilteredClasses(filtered);
  };

  const handleJoinClass = (classItem) => {
    setSelectedClass(classItem);
    setShowJoinModal(true);
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto"></div>
            <p className="text-slate-400 mt-4">Loading free classes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-semibold mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
            </span>
            FREE LIVE CLASSES
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
            Free Interactive Sessions
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Join our free live classes and start your learning journey today. No payment required!
          </p>
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-sm">🎥 Free Classes</span>
                <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">
                  {filteredClasses.length} Available
                </span>
              </div>
              
              {/* View Toggle */}
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'grid' ? 'bg-green-500/20 text-green-400' : 'bg-slate-800/50 text-slate-400'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'list' ? 'bg-green-500/20 text-green-400' : 'bg-slate-800/50 text-slate-400'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search free classes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-green-400 transition-colors"
              />
            </div>

            {/* Results Count */}
            <div className="mt-3 text-sm text-slate-400">
              Found {filteredClasses.length} free class{filteredClasses.length !== 1 ? 'es' : ''}
              {searchTerm && ` matching "${searchTerm}"`}
            </div>
          </div>
        </motion.div>

        {/* No Results */}
        {filteredClasses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800"
          >
            <div className="text-6xl mb-4">🎥</div>
            <h3 className="text-2xl font-bold text-white mb-2">No Free Classes Found</h3>
            <p className="text-slate-400">
              {searchTerm 
                ? `No results matching "${searchTerm}"`
                : 'No free live classes available at the moment. Check back later!'}
            </p>
          </motion.div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredClasses.map((classItem, index) => (
              <motion.div
                key={classItem.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm rounded-2xl border border-slate-700 overflow-hidden hover:border-green-500/50 transition-all duration-300 hover:transform hover:-translate-y-2"
              >
                {/* Free Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/50">
                    <span className="text-xs font-semibold text-green-400">✨ FREE</span>
                  </div>
                </div>

                {/* Live Badge */}
                <div className="absolute top-4 right-4 z-10">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/50">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-400"></span>
                    </span>
                    <span className="text-xs font-semibold text-red-400">LIVE</span>
                  </div>
                </div>

                <div className="p-6 pt-16">
                  <div className="text-5xl mb-4 text-center">🎬</div>
                  
                  <h3 className="text-2xl font-bold text-white mb-2 text-center">
                    {classItem.className}
                  </h3>
                  
                  {classItem.description && (
                    <p className="text-slate-300 text-sm text-center mb-4 line-clamp-2">
                      {classItem.description}
                    </p>
                  )}
                  
                  <div className="space-y-3 mb-6 bg-slate-800/30 rounded-xl p-4">
                    <div className="flex items-center gap-3 text-slate-300">
                      <span className="text-green-400">📅</span>
                      <span>{formatDate(classItem.classDate)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-300">
                      <span className="text-green-400">⏰</span>
                      <span>{classItem.classTime}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-300">
                      <span className="text-green-400">👥</span>
                      <span>Open to all</span>
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleJoinClass(classItem)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all flex items-center justify-center gap-2"
                  >
                    <span>🎥</span>
                    Join Free Class
                    <span>→</span>
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-4">
            {filteredClasses.map((classItem, index) => (
              <motion.div
                key={classItem.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800 p-4 hover:border-green-500/50 transition-all"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-2xl">
                      🎬
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-white">{classItem.className}</h3>
                        <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs">
                          FREE
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-400 mt-1">
                        <span className="flex items-center gap-1">📅 {classItem.classDate}</span>
                        <span className="flex items-center gap-1">⏰ {classItem.classTime}</span>
                      </div>
                      {classItem.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{classItem.description}</p>
                      )}
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleJoinClass(classItem)}
                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:shadow-lg transition-all"
                  >
                    Join Now →
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Join Modal */}
      <AnimatePresence>
        {showJoinModal && selectedClass && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={() => setShowJoinModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 p-8 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="text-6xl mb-3">🎉</div>
                <h3 className="text-2xl font-bold text-white mb-2">Join Free Class</h3>
                <p className="text-slate-400">You're about to join this free live class</p>
              </div>
              
              <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
                <p className="text-green-400 font-semibold mb-1">{selectedClass.className}</p>
                <p className="text-slate-300 text-sm">
                  {formatDate(selectedClass.classDate)} at {selectedClass.classTime}
                </p>
                {selectedClass.description && (
                  <p className="text-slate-400 text-xs mt-2">{selectedClass.description}</p>
                )}
              </div>
              
              <a
                href={selectedClass.classLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowJoinModal(false)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold text-center block hover:shadow-lg transition-all"
              >
                Join Class Now
              </a>
              
              <button
                onClick={() => setShowJoinModal(false)}
                className="w-full mt-3 py-2 text-slate-400 hover:text-slate-300 transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}