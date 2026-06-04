import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getUpcomingLiveClasses, incrementAttendees } from '../firebase/liveClassService';
import { getActiveClasses } from '../firebase/classService';

export default function LiveClasses() {
  const [liveClasses, setLiveClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [classNames, setClassNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassItem, setSelectedClassItem] = useState(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterClasses();
  }, [liveClasses, selectedClass, searchTerm]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fetchedClasses, fetchedClassNames] = await Promise.all([
        getUpcomingLiveClasses(),
        getActiveClasses()
      ]);
      setLiveClasses(fetchedClasses);
      setFilteredClasses(fetchedClasses);
      setClassNames(fetchedClassNames);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterClasses = () => {
    let filtered = [...liveClasses];
    
    // Filter by class name (category)
    if (selectedClass !== 'all') {
      filtered = filtered.filter(cls => cls.classId === selectedClass);
    }
    
    // Filter by search term (searches both class name and title)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(cls => 
        cls.className?.toLowerCase().includes(term) ||
        cls.title?.toLowerCase().includes(term) ||
        cls.description?.toLowerCase().includes(term)
      );
    }
    
    setFilteredClasses(filtered);
  };

  const handleJoinClass = async (classItem) => {
    setSelectedClassItem(classItem);
    setShowJoinModal(true);
    await incrementAttendees(classItem.id);
    await loadData();
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getClassIcon = (classId) => {
    const found = classNames.find(c => c.id === classId);
    return found?.icon || '🎥';
  };

  const getClassColor = (classId) => {
    const found = classNames.find(c => c.id === classId);
    const colors = {
      cyan: 'from-cyan-500 to-cyan-600',
      purple: 'from-purple-500 to-purple-600',
      orange: 'from-orange-500 to-orange-600',
      emerald: 'from-emerald-500 to-emerald-600',
      pink: 'from-pink-500 to-pink-600',
      blue: 'from-blue-500 to-blue-600',
      indigo: 'from-indigo-500 to-indigo-600',
      yellow: 'from-yellow-500 to-yellow-600',
      green: 'from-green-500 to-green-600',
      red: 'from-red-500 to-red-600'
    };
    return colors[found?.color] || 'from-cyan-500 to-cyan-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
            <p className="text-slate-400 mt-4">Loading live classes...</p>
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
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-semibold mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-400"></span>
            </span>
            LIVE CLASSES
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
            Interactive Live Sessions
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Join real-time classes with expert instructors. Learn, interact, and grow together.
          </p>
        </motion.div>

        {/* Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-slate-400 text-sm">Filter by Category:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedClass('all')}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      selectedClass === 'all'
                        ? 'bg-gradient-to-r from-cyan-400 to-indigo-400 text-slate-950 font-semibold'
                        : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    All Categories
                  </button>
                  {classNames.map(cls => (
                    <button
                      key={cls.id}
                      onClick={() => setSelectedClass(cls.id)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-all flex items-center gap-1 ${
                        selectedClass === cls.id
                          ? `bg-gradient-to-r ${getClassColor(cls.id)} text-white font-semibold`
                          : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span>{cls.icon || '📁'}</span>
                      <span>{cls.className}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* View Toggle */}
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'grid' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800/50 text-slate-400'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'list' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800/50 text-slate-400'
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
                placeholder="Search by class title or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            {/* Results Count */}
            <div className="mt-3 text-sm text-slate-400">
              Found {filteredClasses.length} live class{filteredClasses.length !== 1 ? 'es' : ''}
              {selectedClass !== 'all' && classNames.find(c => c.id === selectedClass) && 
                ` in ${classNames.find(c => c.id === selectedClass)?.className}`}
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
            <h3 className="text-2xl font-bold text-white mb-2">No Live Classes Found</h3>
            <p className="text-slate-400">
              {selectedClass !== 'all' 
                ? `No upcoming classes in this category. Check back later!`
                : 'No upcoming live classes scheduled. Check back later!'}
            </p>
          </motion.div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredClasses.map((classItem, index) => {
              const classInfo = classNames.find(c => c.id === classItem.classId);
              return (
                <motion.div
                  key={classItem.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm rounded-2xl border border-slate-700 overflow-hidden hover:border-red-500/50 transition-all duration-300 hover:transform hover:-translate-y-2"
                >
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${getClassColor(classItem.classId)} text-white text-xs font-semibold`}>
                      <span>{classInfo?.icon || '🎥'}</span>
                      <span>{classInfo?.className || 'Live Class'}</span>
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
                    {/* Class Icon */}
                    <div className="text-5xl mb-4 text-center">{classInfo?.icon || '🎬'}</div>
                    
                    {/* Live Class Title (Admin added) */}
                    <h3 className="text-2xl font-bold text-white mb-2 text-center">
                      {classItem.title || classItem.className}
                    </h3>
                    
                    {/* Category Name */}
                    <p className="text-cyan-400 text-sm text-center mb-3">
                      {classInfo?.className} Class
                    </p>
                    
                    {/* Description if available */}
                    {classItem.description && (
                      <p className="text-slate-300 text-sm text-center mb-4">{classItem.description}</p>
                    )}
                    
                    {/* Details */}
                    <div className="space-y-3 mb-6 bg-slate-800/30 rounded-xl p-4">
                      <div className="flex items-center gap-3 text-slate-300">
                        <span className="text-cyan-400">📅</span>
                        <span>{formatDate(classItem.classDate)}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-300">
                        <span className="text-cyan-400">⏰</span>
                        <span>{classItem.classTime}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-300">
                        <span className="text-cyan-400">👥</span>
                        <span>{classItem.attendees || 0} attendees registered</span>
                      </div>
                    </div>
                    
                    {/* Join Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleJoinClass(classItem)}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold hover:shadow-lg hover:shadow-red-500/50 transition-all flex items-center justify-center gap-2"
                    >
                      <span>🎥</span>
                      Join Live Class
                      <span>→</span>
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="space-y-4">
            {filteredClasses.map((classItem, index) => {
              const classInfo = classNames.find(c => c.id === classItem.classId);
              return (
                <motion.div
                  key={classItem.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800 p-4 hover:border-red-500/50 transition-all"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${getClassColor(classItem.classId)} flex items-center justify-center text-2xl`}>
                        {classInfo?.icon || '🎥'}
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1">
                        {/* Live Class Title */}
                        <h3 className="text-lg font-bold text-white">
                          {classItem.title || classItem.className}
                        </h3>
                        {/* Category */}
                        <p className="text-cyan-400 text-xs mb-1">{classInfo?.className} Class</p>
                        {/* Details */}
                        <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                          <span className="flex items-center gap-1">📅 {classItem.classDate}</span>
                          <span className="flex items-center gap-1">⏰ {classItem.classTime}</span>
                          <span className="flex items-center gap-1">👥 {classItem.attendees || 0} attendees</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Join Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleJoinClass(classItem)}
                      className="px-6 py-2 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold hover:shadow-lg transition-all"
                    >
                      Join Now →
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Join Modal */}
      <AnimatePresence>
        {showJoinModal && selectedClassItem && (
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
                <h3 className="text-2xl font-bold text-white mb-2">Ready to Join?</h3>
                <p className="text-slate-400">You're about to join the live class</p>
              </div>
              
              <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
                {/* Live Class Title */}
                <p className="text-cyan-400 font-semibold mb-1">
                  {selectedClassItem.title || selectedClassItem.className}
                </p>
                <p className="text-slate-300 text-sm">
                  {formatDate(selectedClassItem.classDate)} at {selectedClassItem.classTime}
                </p>
              </div>
              
              <a
                href={selectedClassItem.classUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowJoinModal(false)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-400 text-slate-950 font-semibold text-center block hover:shadow-lg transition-all"
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