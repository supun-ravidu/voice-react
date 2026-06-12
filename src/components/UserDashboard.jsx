import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getUpcomingLiveClasses, incrementAttendees } from '../firebase/liveClassService';
import { getActiveClasses } from '../firebase/classService';
import { getAllRecordings, incrementRecordingPlays } from '../firebase/recordingService';

export default function UserDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('live-classes');
  const [liveClasses, setLiveClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [recordings, setRecordings] = useState([]);
  const [filteredRecordings, setFilteredRecordings] = useState([]);
  const [classNames, setClassNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState(user.classId || 'all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassItem, setSelectedClassItem] = useState(null);
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showWatchModal, setShowWatchModal] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  // Function to extract YouTube video ID from URL
  const getYouTubeId = (url) => {
    if (!url) return null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
      /youtube\.com\/shorts\/([^&\n?#]+)/
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  // Function to get YouTube thumbnail URL
  const getYouTubeThumbnail = (url) => {
    const videoId = getYouTubeId(url);
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    return null;
  };

  // Function to get embed URL
  const getEmbedUrl = (url) => {
    const videoId = getYouTubeId(url);
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    return url;
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === 'live-classes') {
      filterClasses();
    } else {
      filterRecordings();
    }
  }, [liveClasses, recordings, selectedClass, searchTerm, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fetchedClasses, fetchedClassNames, fetchedRecordings] = await Promise.all([
        getUpcomingLiveClasses(),
        getActiveClasses(),
        getAllRecordings()
      ]);
      
      const userRecordings = fetchedRecordings.filter(rec => rec.classId === user.classId);
      
      setLiveClasses(fetchedClasses);
      setRecordings(userRecordings);
      setFilteredRecordings(userRecordings);
      setClassNames(fetchedClassNames);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterClasses = () => {
    let filtered = [...liveClasses];
    if (selectedClass !== 'all') {
      filtered = filtered.filter(cls => cls.classId === selectedClass);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(cls => 
        cls.title?.toLowerCase().includes(term) ||
        cls.className?.toLowerCase().includes(term) ||
        cls.description?.toLowerCase().includes(term)
      );
    }
    setFilteredClasses(filtered);
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

  const handleJoinClass = async (classItem) => {
    setSelectedClassItem(classItem);
    setShowJoinModal(true);
    await incrementAttendees(classItem.id);
    await loadData();
  };

  const handleWatchRecording = async (recording) => {
    setSelectedRecording(recording);
    setShowWatchModal(true);
    await incrementRecordingPlays(recording.id);
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

  const userClass = classNames.find(c => c.id === user.classId);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
            <p className="text-slate-400 mt-4">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-slate-800/40 bg-slate-950/70 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-400 flex items-center justify-center text-white font-bold">
                {user.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Welcome, {user.username}!</h1>
                <p className="text-xs text-slate-400">{userClass?.className || 'Student'} Class</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 rounded-lg border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

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
                {userClass?.className} Learning Center
              </h2>
              <p className="text-white/80">
                Access live sessions and video library for your class
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-4xl">{userClass?.icon || '🎓'}</span>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="border-b border-slate-800">
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setActiveTab('live-classes');
                  setSearchTerm('');
                  setSelectedClass(user.classId || 'all');
                }}
                className={`px-6 py-3 text-sm font-semibold transition-all relative ${
                  activeTab === 'live-classes'
                    ? 'text-cyan-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>🎥</span>
                  Live Classes
                </span>
                {activeTab === 'live-classes' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-indigo-400"
                    transition={{ type: "spring", duration: 0.5 }}
                  />
                )}
              </button>
              <button
                onClick={() => {
                  setActiveTab('recordings');
                  setSearchTerm('');
                  setSelectedClass(user.classId || 'all');
                }}
                className={`px-6 py-3 text-sm font-semibold transition-all relative ${
                  activeTab === 'recordings'
                    ? 'text-purple-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>🎬</span>
                  Video Library
                  {recordings.length > 0 && (
                    <span className="px-1.5 py-0.5 text-xs rounded-full bg-purple-500/20 text-purple-400">
                      {recordings.length}
                    </span>
                  )}
                </span>
                {activeTab === 'recordings' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400"
                    transition={{ type: "spring", duration: 0.5 }}
                  />
                )}
              </button>
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
                        ? activeTab === 'live-classes'
                          ? 'bg-gradient-to-r from-cyan-400 to-indigo-400 text-slate-950 font-semibold'
                          : 'bg-gradient-to-r from-purple-400 to-pink-400 text-white font-semibold'
                        : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    All Classes
                  </button>
                  <button
                    onClick={() => setSelectedClass(user.classId)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all flex items-center gap-1 ${
                      selectedClass === user.classId
                        ? activeTab === 'live-classes'
                          ? `bg-gradient-to-r ${getClassColor(user.classId)} text-white font-semibold`
                          : `bg-gradient-to-r ${getClassColor(user.classId)} text-white font-semibold`
                        : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{userClass?.icon || '📁'}</span>
                    <span>My Class Only</span>
                  </button>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'grid' 
                      ? activeTab === 'live-classes' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-purple-500/20 text-purple-400'
                      : 'bg-slate-800/50 text-slate-400'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'list' 
                      ? activeTab === 'live-classes' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-purple-500/20 text-purple-400'
                      : 'bg-slate-800/50 text-slate-400'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder={activeTab === 'live-classes' ? "Search live classes..." : "Search videos..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            <div className="mt-3 text-sm text-slate-400">
              Found {activeTab === 'live-classes' ? filteredClasses.length : filteredRecordings.length}{' '}
              {activeTab === 'live-classes' ? 'live class' : 'video'}
              {(activeTab === 'live-classes' ? filteredClasses.length : filteredRecordings.length) !== 1 ? 's' : ''}
              {selectedClass === user.classId && ' for your class'}
            </div>
          </div>
        </motion.div>

        {/* Live Classes Content */}
        {activeTab === 'live-classes' && (
          <>
            {filteredClasses.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16 bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800"
              >
                <div className="text-6xl mb-4">🎥</div>
                <h3 className="text-2xl font-bold text-white mb-2">No Live Classes Found</h3>
                <p className="text-slate-400">
                  {selectedClass === user.classId 
                    ? `No upcoming live classes for your ${userClass?.className} class yet. Check back later!`
                    : 'No upcoming live classes scheduled. Check back later!'}
                </p>
              </motion.div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {filteredClasses.map((classItem, index) => {
                  const classInfo = classNames.find(c => c.id === classItem.classId);
                  const isUserClass = classItem.classId === user.classId;
                  return (
                    <motion.div
                      key={classItem.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className={`group relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm rounded-2xl border overflow-hidden transition-all duration-300 hover:transform hover:-translate-y-2 ${
                        isUserClass ? 'border-cyan-500/50 shadow-lg shadow-cyan-500/20' : 'border-slate-700 hover:border-red-500/50'
                      }`}
                    >
                      {/* Existing live class card content - same as before */}
                      <div className="absolute top-4 left-4 z-10">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${getClassColor(classItem.classId)} text-white text-xs font-semibold`}>
                          <span>{classInfo?.icon || '🎥'}</span>
                          <span>{classInfo?.className || 'Live Class'}</span>
                        </div>
                      </div>
                      <div className="absolute top-4 right-4 z-10">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/50">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-400"></span>
                          </span>
                          <span className="text-xs font-semibold text-red-400">LIVE</span>
                        </div>
                      </div>
                      {isUserClass && (
                        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
                          <div className="bg-cyan-500/80 text-white text-xs px-3 py-1 rounded-full">Recommended for you</div>
                        </div>
                      )}
                      <div className="p-6 pt-16">
                        <div className="text-5xl mb-4 text-center">{classInfo?.icon || '🎬'}</div>
                        <h3 className="text-2xl font-bold text-white mb-2 text-center">{classItem.title || classItem.className}</h3>
                        {classItem.description && <p className="text-slate-300 text-sm text-center mb-4">{classItem.description}</p>}
                        <div className="space-y-3 mb-6 bg-slate-800/30 rounded-xl p-4">
                          <div className="flex items-center gap-3 text-slate-300"><span className="text-cyan-400">📅</span><span>{formatDate(classItem.classDate)}</span></div>
                          <div className="flex items-center gap-3 text-slate-300"><span className="text-cyan-400">⏰</span><span>{classItem.classTime}</span></div>
                          <div className="flex items-center gap-3 text-slate-300"><span className="text-cyan-400">👥</span><span>{classItem.attendees || 0} attendees registered</span></div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleJoinClass(classItem)}
                          className="w-full py-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold hover:shadow-lg hover:shadow-red-500/50 transition-all flex items-center justify-center gap-2"
                        >
                          <span>🎥</span> Join Live Class <span>→</span>
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredClasses.map((classItem, index) => {
                  const classInfo = classNames.find(c => c.id === classItem.classId);
                  const isUserClass = classItem.classId === user.classId;
                  return (
                    <motion.div
                      key={classItem.id}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`bg-slate-900/50 backdrop-blur-sm rounded-2xl border p-4 transition-all ${isUserClass ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-slate-800 hover:border-red-500/50'}`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${getClassColor(classItem.classId)} flex items-center justify-center text-2xl`}>
                            {classInfo?.icon || '🎥'}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-white">{classItem.title || classItem.className}</h3>
                            <p className="text-cyan-400 text-xs">{classInfo?.className} Class</p>
                            <div className="flex flex-wrap gap-4 text-sm text-slate-400 mt-1">
                              <span className="flex items-center gap-1">📅 {classItem.classDate}</span>
                              <span className="flex items-center gap-1">⏰ {classItem.classTime}</span>
                              <span className="flex items-center gap-1">👥 {classItem.attendees || 0} attendees</span>
                            </div>
                          </div>
                        </div>
                        {isUserClass && <span className="px-2 py-1 rounded-full text-xs bg-cyan-500/20 text-cyan-400">Your Class</span>}
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
          </>
        )}

        {/* Video Library Content with YouTube Thumbnails */}
        {activeTab === 'recordings' && (
          <>
            {filteredRecordings.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16 bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800"
              >
                <div className="text-6xl mb-4">🎬</div>
                <h3 className="text-2xl font-bold text-white mb-2">No Videos Found</h3>
                <p className="text-slate-400">
                  {selectedClass === user.classId 
                    ? `No videos available for your ${userClass?.className} class yet.`
                    : 'No videos available at the moment.'}
                </p>
              </motion.div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredRecordings.map((recording, index) => {
                  const classInfo = classNames.find(c => c.id === recording.classId);
                  const thumbnailUrl = getYouTubeThumbnail(recording.audioUrl);
                  const isYouTube = getYouTubeId(recording.audioUrl) !== null;
                  
                  return (
                    <motion.div
                      key={recording.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="group relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm rounded-2xl border border-slate-700 overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:transform hover:-translate-y-2 cursor-pointer"
                      onClick={() => handleWatchRecording(recording)}
                    >
                      {/* Thumbnail Image */}
                      <div className="relative aspect-video bg-gradient-to-br from-purple-900/50 to-pink-900/50 overflow-hidden">
                        {thumbnailUrl ? (
                          <>
                            <img 
                              src={thumbnailUrl} 
                              alt={recording.title}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/640x360?text=Video+Thumbnail';
                              }}
                            />
                            {/* Play Button Overlay */}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z"/>
                                </svg>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-6xl">🎬</div>
                          </div>
                        )}
                        
                        {/* Duration Badge */}
                        {recording.duration && (
                          <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-black/70 text-white text-xs font-semibold">
                            {recording.duration}
                          </div>
                        )}
                      </div>
                      
                      {/* Class Badge */}
                      <div className="absolute top-3 left-3 z-10">
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r ${getClassColor(recording.classId)} text-white text-xs font-semibold shadow-lg`}>
                          <span>{classInfo?.icon || '📁'}</span>
                          <span>{classInfo?.className || 'Video'}</span>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-white mb-1 line-clamp-1 group-hover:text-purple-400 transition-colors">
                          {recording.title}
                        </h3>
                        
                        {recording.description && (
                          <p className="text-slate-400 text-sm mb-2 line-clamp-2">
                            {recording.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700">
                          <div className="flex items-center gap-3 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <span>▶️</span>
                              <span>{recording.plays || 0} views</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-purple-400 text-xs group-hover:translate-x-1 transition-transform">
                            <span>Watch Now</span>
                            <span>→</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRecordings.map((recording, index) => {
                  const classInfo = classNames.find(c => c.id === recording.classId);
                  const thumbnailUrl = getYouTubeThumbnail(recording.audioUrl);
                  
                  return (
                    <motion.div
                      key={recording.id}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800 p-3 hover:border-purple-500/50 transition-all cursor-pointer group"
                      onClick={() => handleWatchRecording(recording)}
                    >
                      <div className="flex gap-4">
                        {/* Thumbnail */}
                        <div className="relative w-40 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-r from-purple-900/50 to-pink-900/50">
                          {thumbnailUrl ? (
                            <img 
                              src={thumbnailUrl} 
                              alt={recording.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/160x90?text=Video';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl">🎬</div>
                          )}
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                              <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-purple-400">{classInfo?.className}</span>
                            {recording.duration && (
                              <span className="text-xs text-slate-500">• {recording.duration}</span>
                            )}
                          </div>
                          <h3 className="text-base font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">
                            {recording.title}
                          </h3>
                          {recording.description && (
                            <p className="text-slate-400 text-xs line-clamp-1">{recording.description}</p>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                            <span>▶️ {recording.plays || 0} views</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            Watch Now →
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Join Live Class Modal */}
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
                <p className="text-cyan-400 font-semibold mb-1">{selectedClassItem.title || selectedClassItem.className}</p>
                <p className="text-slate-300 text-sm">{formatDate(selectedClassItem.classDate)} at {selectedClassItem.classTime}</p>
              </div>
              <a href={selectedClassItem.classUrl} target="_blank" rel="noopener noreferrer" onClick={() => setShowJoinModal(false)} className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-400 text-slate-950 font-semibold text-center block hover:shadow-lg transition-all">
                Join Class Now
              </a>
              <button onClick={() => setShowJoinModal(false)} className="w-full mt-3 py-2 text-slate-400 hover:text-slate-300 transition-colors">Cancel</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Watch Video Modal with YouTube Embed */}
      <AnimatePresence>
        {showWatchModal && selectedRecording && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={() => setShowWatchModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 p-6 w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">{selectedRecording.title}</h3>
                <button
                  onClick={() => setShowWatchModal(false)}
                  className="text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Video Player */}
              <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden mb-4">
                {getYouTubeId(selectedRecording.audioUrl) ? (
                  <iframe
                    src={getEmbedUrl(selectedRecording.audioUrl)}
                    title={selectedRecording.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <div className="text-6xl mb-4">🎬</div>
                    <a
                      href={selectedRecording.audioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:shadow-lg transition-all"
                    >
                      Watch Video
                    </a>
                  </div>
                )}
              </div>
              
              {selectedRecording.description && (
                <p className="text-slate-400 text-sm mb-4">{selectedRecording.description}</p>
              )}
              
              <div className="flex gap-3">
                <a
                  href={selectedRecording.audioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-center hover:bg-slate-700 transition-all"
                >
                  Open in New Tab
                </a>
                <button
                  onClick={() => setShowWatchModal(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800 transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}