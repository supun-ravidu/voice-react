import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllRecordings, incrementRecordingPlays, getRecordingsByClass } from '../firebase/recordingService';
import { getActiveClasses } from '../firebase/classService';

export default function UserRecordings({ user }) {
  const [recordings, setRecordings] = useState([]);
  const [filteredRecordings, setFilteredRecordings] = useState([]);
  const [classNames, setClassNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState(user.classId || 'all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [audioPlayer, setAudioPlayer] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterRecordings();
  }, [recordings, selectedClass, searchTerm]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fetchedRecordings, fetchedClasses] = await Promise.all([
        getAllRecordings(),
        getActiveClasses()
      ]);
      
      // Filter recordings based on user's class or all if admin
      let userRecordings = fetchedRecordings;
      if (user.role !== 'admin') {
        userRecordings = fetchedRecordings.filter(rec => rec.classId === user.classId);
      }
      
      setRecordings(userRecordings);
      setFilteredRecordings(userRecordings);
      setClassNames(fetchedClasses);
    } catch (error) {
      console.error("Error loading recordings:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterRecordings = () => {
    let filtered = [...recordings];
    
    if (selectedClass !== 'all') {
      filtered = filtered.filter(rec => rec.classId === selectedClass);
    }
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(rec => 
        rec.title?.toLowerCase().includes(term) ||
        rec.description?.toLowerCase().includes(term) ||
        rec.className?.toLowerCase().includes(term)
      );
    }
    
    setFilteredRecordings(filtered);
  };

  const handlePlayRecording = async (recording) => {
    setSelectedRecording(recording);
    setShowAudioModal(true);
    await incrementRecordingPlays(recording.id);
    await loadData();
  };

  const getClassIcon = (classId) => {
    const found = classNames.find(c => c.id === classId);
    return found?.icon || '🎙️';
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
    return colors[found?.color] || 'from-purple-500 to-pink-600';
  };

  const userClass = classNames.find(c => c.id === user.classId);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
            <p className="text-slate-400 mt-4">Loading audio recordings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 pt-20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-gradient-to-r ${getClassColor(user.classId)} rounded-2xl p-6 mb-8 shadow-lg`}
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                {userClass?.className || 'Audio Recordings'}
              </h2>
              <p className="text-white/80">
                Access exclusive audio lessons, exercises, and practice materials
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-4xl">🎙️</span>
            </div>
          </div>
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
                <span className="text-slate-400 text-sm">Filter by Class:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedClass('all')}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      selectedClass === 'all'
                        ? 'bg-gradient-to-r from-purple-400 to-pink-400 text-white font-semibold'
                        : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    All Classes
                  </button>
                  {user.role === 'admin' && classNames.map(cls => (
                    <button
                      key={cls.id}
                      onClick={() => setSelectedClass(cls.id)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-all flex items-center gap-1 ${
                        selectedClass === cls.id
                          ? `bg-gradient-to-r ${getClassColor(cls.id)} text-white font-semibold`
                          : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span>{cls.icon}</span>
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
                    viewMode === 'grid' ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-800/50 text-slate-400'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'list' ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-800/50 text-slate-400'
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
                placeholder="Search recordings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 transition-colors"
              />
            </div>

            {/* Results Count */}
            <div className="mt-3 text-sm text-slate-400">
              Found {filteredRecordings.length} recording{filteredRecordings.length !== 1 ? 's' : ''}
            </div>
          </div>
        </motion.div>

        {/* No Results */}
        {filteredRecordings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800"
          >
            <div className="text-6xl mb-4">🎙️</div>
            <h3 className="text-2xl font-bold text-white mb-2">No Recordings Found</h3>
            <p className="text-slate-400">
              {selectedClass !== 'all' 
                ? `No recordings available for this class yet.`
                : 'No audio recordings available at the moment.'}
            </p>
          </motion.div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRecordings.map((recording, index) => {
              const classInfo = classNames.find(c => c.id === recording.classId);
              return (
                <motion.div
                  key={recording.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm rounded-2xl border border-slate-700 overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:transform hover:-translate-y-2"
                >
                  <div className="absolute top-4 left-4 z-10">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${getClassColor(recording.classId)} text-white text-xs font-semibold`}>
                      <span>{classInfo?.icon || '🎙️'}</span>
                      <span>{classInfo?.className || 'Audio'}</span>
                    </div>
                  </div>

                  <div className="p-6 pt-16">
                    <div className="text-5xl mb-4 text-center">🎙️</div>
                    <h3 className="text-xl font-bold text-white mb-2 text-center line-clamp-2">{recording.title}</h3>
                    
                    {recording.description && (
                      <p className="text-slate-300 text-sm text-center mb-4 line-clamp-2">
                        {recording.description}
                      </p>
                    )}
                    
                    <div className="space-y-2 mb-6 bg-slate-800/30 rounded-xl p-4">
                      {recording.duration && (
                        <div className="flex items-center gap-3 text-slate-300 justify-center">
                          <span className="text-purple-400">⏱️</span>
                          <span>{recording.duration}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-slate-300 justify-center">
                        <span className="text-purple-400">▶️</span>
                        <span>{recording.plays || 0} plays</span>
                      </div>
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handlePlayRecording(recording)}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-2"
                    >
                      <span>🎧</span>
                      Listen Now
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
            {filteredRecordings.map((recording, index) => {
              const classInfo = classNames.find(c => c.id === recording.classId);
              return (
                <motion.div
                  key={recording.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800 p-4 hover:border-purple-500/50 transition-all"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${getClassColor(recording.classId)} flex items-center justify-center text-2xl`}>
                        {classInfo?.icon || '🎙️'}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white">{recording.title}</h3>
                        <p className="text-purple-400 text-xs">{classInfo?.className}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-slate-400 mt-1">
                          {recording.duration && <span>⏱️ {recording.duration}</span>}
                          <span>▶️ {recording.plays || 0} plays</span>
                        </div>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePlayRecording(recording)}
                      className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:shadow-lg transition-all"
                    >
                      Listen Now →
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Audio Player Modal */}
      <AnimatePresence>
        {showAudioModal && selectedRecording && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={() => setShowAudioModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 p-8 w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="text-5xl mb-3">🎧</div>
                <h3 className="text-2xl font-bold text-white mb-2">{selectedRecording.title}</h3>
                <p className="text-slate-400">{selectedRecording.description}</p>
              </div>
              
              <div className="bg-slate-800/50 rounded-xl p-6 mb-6">
                <audio
                  controls
                  autoPlay
                  className="w-full"
                  src={selectedRecording.audioUrl}
                >
                  Your browser does not support the audio element.
                </audio>
              </div>
              
              <button
                onClick={() => setShowAudioModal(false)}
                className="w-full mt-3 py-2 text-slate-400 hover:text-slate-300 transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}