import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  addDoc, 
  collection, 
  serverTimestamp, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc,
  orderBy,
  query
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { 
  getAllClasses as fetchAllClasses,
  getActiveClasses as fetchActiveClasses
} from '../firebase/classService';
import { 
  getCourses as fetchAllCourses,
  getCoursesByClass as fetchCoursesByClass
} from '../firebase/courseService';
import {
  addRecording,
  getAllRecordings,
  deleteRecording,
  updateRecording,
  getRecordingsByClass
} from '../firebase/recordingService';

export default function AdminLogin({ onLogin, onBack }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Free Live Class States
  const [showFreeClassModal, setShowFreeClassModal] = useState(false);
  const [showManageClasses, setShowManageClasses] = useState(false);
  const [freeClassPin, setFreeClassPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinVerified, setPinVerified] = useState(false);
  const [pinMode, setPinMode] = useState('add');
  const [freeClasses, setFreeClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  
  const [freeClassData, setFreeClassData] = useState({
    className: '',
    classLink: '',
    classDate: '',
    classTime: '',
    description: '',
    isFree: true
  });
  const [isAddingClass, setIsAddingClass] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [addError, setAddError] = useState('');

  // Recording States
  const [showRecordingModal, setShowRecordingModal] = useState(false);
  const [recordingPin, setRecordingPin] = useState('');
  const [recordingPinVerified, setRecordingPinVerified] = useState(false);
  const [recordingMode, setRecordingMode] = useState('add');
  const [allClasses, setAllClasses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [recordings, setRecordings] = useState([]);
  const [loadingRecordings, setLoadingRecordings] = useState(false);
  const [editingRecording, setEditingRecording] = useState(null);
  const [recordingData, setRecordingData] = useState({
    title: '',
    description: '',
    audioUrl: '',
    classId: '',
    className: '',
    courseId: '',
    courseName: '',
    duration: '',
    featured: false
  });
  const [recordingError, setRecordingError] = useState('');
  const [recordingSuccess, setRecordingSuccess] = useState('');
  const [isAddingRecording, setIsAddingRecording] = useState(false);
  const [recordingType, setRecordingType] = useState('class');

  const correctPin = '12345678';

  // Load free classes from Firebase
  const loadFreeClasses = async () => {
    setLoadingClasses(true);
    try {
      const q = query(collection(db, 'freeLiveClasses'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const classes = [];
      querySnapshot.forEach((doc) => {
        classes.push({ id: doc.id, ...doc.data() });
      });
      setFreeClasses(classes);
    } catch (error) {
      console.error('Error loading free classes:', error);
    } finally {
      setLoadingClasses(false);
    }
  };

  // Load classes and courses for recordings
  const loadClassesAndCourses = async () => {
    try {
      const classes = await fetchActiveClasses();
      setAllClasses(classes);
      const courses = await fetchAllCourses();
      setAllCourses(courses);
    } catch (error) {
      console.error("Error loading classes/courses:", error);
    }
  };

  // Load recordings
  const loadRecordings = async () => {
    setLoadingRecordings(true);
    try {
      const fetchedRecordings = await getAllRecordings();
      setRecordings(fetchedRecordings);
    } catch (error) {
      console.error("Error loading recordings:", error);
    } finally {
      setLoadingRecordings(false);
    }
  };

  // Filter courses by selected class
  const handleClassChangeForRecording = (classId) => {
    setRecordingData({ ...recordingData, classId, courseId: '', courseName: '' });
    const coursesInClass = allCourses.filter(c => c.classId === classId);
    setFilteredCourses(coursesInClass);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (email === 'admin@voicelms.com' && password === 'admin123') {
      setTimeout(() => {
        setLoading(false);
        onLogin();
      }, 1000);
    } else {
      setTimeout(() => {
        setError('Invalid email or password. Try: admin@voicelms.com / admin123');
        setLoading(false);
      }, 1000);
    }
  };

  const handlePinSubmit = () => {
    if (freeClassPin === correctPin) {
      setPinVerified(true);
      setPinError('');
      setAddError('');
      if (pinMode === 'manage') {
        loadFreeClasses();
      }
    } else {
      setPinError('Invalid PIN. Please try again.');
    }
  };

  const handleRecordingPinSubmit = () => {
    if (recordingPin === correctPin) {
      setRecordingPinVerified(true);
      setRecordingError('');
      if (recordingMode === 'manage') {
        loadRecordings();
      } else {
        loadClassesAndCourses();
      }
    } else {
      setRecordingError('Invalid PIN. Please try again.');
    }
  };

  const handleAddFreeClass = async () => {
    if (!freeClassData.className || !freeClassData.classLink || !freeClassData.classDate || !freeClassData.classTime) {
      setAddError('Please fill in all required fields');
      return;
    }

    setIsAddingClass(true);
    setAddError('');
    
    try {
      const docRef = await addDoc(collection(db, 'freeLiveClasses'), {
        ...freeClassData,
        classId: `free_${Date.now()}`,
        status: 'upcoming',
        attendees: 0,
        isFree: true,
        createdAt: new Date().toISOString(),
        timestamp: serverTimestamp()
      });
      
      setSuccessMessage('Free Live Class added successfully!');
      
      setTimeout(() => {
        setSuccessMessage('');
        setShowFreeClassModal(false);
        setFreeClassData({
          className: '',
          classLink: '',
          classDate: '',
          classTime: '',
          description: '',
          isFree: true
        });
        setFreeClassPin('');
        setPinVerified(false);
        setAddError('');
        if (pinMode === 'manage') {
          loadFreeClasses();
        }
      }, 2000);
    } catch (error) {
      console.error('Error adding free class:', error);
      setAddError(error.message || 'Failed to add free class. Please try again.');
    } finally {
      setIsAddingClass(false);
    }
  };

  const handleDeleteFreeClass = async (classId) => {
    if (window.confirm('Are you sure you want to delete this free live class?')) {
      try {
        await deleteDoc(doc(db, 'freeLiveClasses', classId));
        await loadFreeClasses();
        setSuccessMessage('Class deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 2000);
      } catch (error) {
        console.error('Error deleting class:', error);
        setAddError('Failed to delete class');
      }
    }
  };

  const handleUpdateFreeClass = async () => {
    if (!editingClass.className || !editingClass.classLink || !editingClass.classDate || !editingClass.classTime) {
      setAddError('Please fill in all required fields');
      return;
    }

    setIsAddingClass(true);
    try {
      const classRef = doc(db, 'freeLiveClasses', editingClass.id);
      await updateDoc(classRef, {
        className: editingClass.className,
        classLink: editingClass.classLink,
        classDate: editingClass.classDate,
        classTime: editingClass.classTime,
        description: editingClass.description,
        updatedAt: new Date().toISOString()
      });
      await loadFreeClasses();
      setEditingClass(null);
      setSuccessMessage('Class updated successfully!');
      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (error) {
      console.error('Error updating class:', error);
      setAddError('Failed to update class');
    } finally {
      setIsAddingClass(false);
    }
  };

  // Handle add recording
  const handleAddRecording = async () => {
    if (!recordingData.title || !recordingData.audioUrl) {
      setRecordingError('Please fill in all required fields');
      return;
    }

    setIsAddingRecording(true);
    setRecordingError('');
    
    try {
      const selectedClass = allClasses.find(c => c.id === recordingData.classId);
      const selectedCourse = allCourses.find(c => c.id === recordingData.courseId);
      
      await addRecording({
        ...recordingData,
        className: selectedClass?.className || '',
        courseName: selectedCourse?.title || '',
      });
      
      setRecordingSuccess('Recording added successfully!');
      
      setTimeout(() => {
        setRecordingSuccess('');
        setShowRecordingModal(false);
        setRecordingData({
          title: '',
          description: '',
          audioUrl: '',
          classId: '',
          className: '',
          courseId: '',
          courseName: '',
          duration: '',
          featured: false
        });
        setRecordingPin('');
        setRecordingPinVerified(false);
        setRecordingError('');
        setFilteredCourses([]);
        if (recordingMode === 'manage') {
          loadRecordings();
        }
      }, 2000);
    } catch (error) {
      console.error('Error adding recording:', error);
      setRecordingError(error.message || 'Failed to add recording. Please try again.');
    } finally {
      setIsAddingRecording(false);
    }
  };

  // Handle delete recording
  const handleDeleteRecording = async (recordingId) => {
    if (window.confirm('Are you sure you want to delete this recording?')) {
      try {
        await deleteRecording(recordingId);
        await loadRecordings();
        setRecordingSuccess('Recording deleted successfully!');
        setTimeout(() => setRecordingSuccess(''), 2000);
      } catch (error) {
        console.error('Error deleting recording:', error);
        setRecordingError('Failed to delete recording');
      }
    }
  };

  // Handle update recording
  const handleUpdateRecording = async () => {
    if (!editingRecording.title || !editingRecording.audioUrl) {
      setRecordingError('Please fill in all required fields');
      return;
    }

    setIsAddingRecording(true);
    try {
      await updateRecording(editingRecording.id, editingRecording);
      await loadRecordings();
      setEditingRecording(null);
      setRecordingSuccess('Recording updated successfully!');
      setTimeout(() => setRecordingSuccess(''), 2000);
    } catch (error) {
      console.error('Error updating recording:', error);
      setRecordingError('Failed to update recording');
    } finally {
      setIsAddingRecording(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center px-4 py-8">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-500" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Main Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700 p-8 shadow-2xl"
        >
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">🔐</div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
              Admin Login
            </h2>
            <p className="text-slate-400 mt-2">Access the admin dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition-colors"
                placeholder="admin@voicelms.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-2 rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-400 to-indigo-400 text-slate-950 font-semibold text-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Logging in...
                </span>
              ) : (
                'Login to Dashboard'
              )}
            </button>

            {/* Divider - Free Live Class */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-900/80 text-slate-500">Free Live Class Management</span>
              </div>
            </div>

            {/* Free Live Class Buttons */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => {
                setPinMode('add');
                setShowFreeClassModal(true);
              }}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold text-lg hover:shadow-lg hover:shadow-green-500/50 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              <span>➕</span>
              Add Free Live Class
              <span>✨</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => {
                setPinMode('manage');
                setShowFreeClassModal(true);
              }}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold text-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              <span>📋</span>
              Manage Free Live Classes
              <span>🎥</span>
            </motion.button>

            {/* Divider - Recordings */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-900/80 text-slate-500">Recording Management</span>
              </div>
            </div>

            {/* Recording Buttons */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => {
                setRecordingMode('add');
                setShowRecordingModal(true);
              }}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              <span>🎙️</span>
              Add Recording
              <span>📀</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => {
                setRecordingMode('manage');
                setShowRecordingModal(true);
              }}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold text-lg hover:shadow-lg hover:shadow-indigo-500/50 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              <span>📋</span>
              Manage Recordings
              <span>🎧</span>
            </motion.button>

            <button
              type="button"
              onClick={onBack}
              className="w-full py-2 text-slate-400 hover:text-slate-300 transition-colors text-sm"
            >
              ← Back to Home
            </button>

            <div className="text-center text-xs text-slate-500 mt-4">
              <p>Demo credentials:</p>
              <p>Email: admin@voicelms.com</p>
              <p>Password: admin123</p>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Free Live Class Modal */}
      <AnimatePresence>
        {showFreeClassModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={() => {
              if (!pinVerified) {
                setShowFreeClassModal(false);
                setFreeClassPin('');
                setPinError('');
                setPinMode('add');
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {!pinVerified ? (
                <div>
                  <div className="text-center mb-6">
                    <div className="text-5xl mb-3">🔒</div>
                    <h3 className="text-2xl font-bold text-white mb-2">Admin Verification</h3>
                    <p className="text-slate-400">
                      {pinMode === 'add' ? 'Enter PIN to add free live classes' : 'Enter PIN to manage free live classes'}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Security PIN</label>
                      <input
                        type="password"
                        maxLength="8"
                        value={freeClassPin}
                        onChange={(e) => setFreeClassPin(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handlePinSubmit()}
                        className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-center text-2xl tracking-widest focus:outline-none focus:border-green-400 transition-colors"
                        placeholder="********"
                        autoFocus
                      />
                    </div>

                    {pinError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-2 rounded-lg text-sm text-center"
                      >
                        {pinError}
                      </motion.div>
                    )}

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handlePinSubmit}
                        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:shadow-lg transition-all"
                      >
                        Verify PIN
                      </button>
                      <button
                        onClick={() => {
                          setShowFreeClassModal(false);
                          setFreeClassPin('');
                          setPinError('');
                          setPinMode('add');
                        }}
                        className="flex-1 py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : pinMode === 'add' ? (
                <div>
                  {successMessage ? (
                    <div className="text-center py-8">
                      <div className="text-6xl mb-4">🎉</div>
                      <h3 className="text-2xl font-bold text-green-400 mb-2">Success!</h3>
                      <p className="text-slate-300">{successMessage}</p>
                    </div>
                  ) : (
                    <>
                      <div className="text-center mb-6">
                        <div className="text-5xl mb-3">🎥✨</div>
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                          Add Free Live Class
                        </h3>
                        <p className="text-slate-400 mt-2">Create a free public live class for all users</p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Class Name *</label>
                          <input
                            type="text"
                            value={freeClassData.className}
                            onChange={(e) => setFreeClassData({ ...freeClassData, className: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-green-400 transition-colors"
                            placeholder="e.g., Free Vocal Warm-up Session"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Class Link *</label>
                          <input
                            type="url"
                            value={freeClassData.classLink}
                            onChange={(e) => setFreeClassData({ ...freeClassData, classLink: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-green-400 transition-colors"
                            placeholder="https://zoom.us/... or https://meet.google.com/..."
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Class Date *</label>
                            <input
                              type="date"
                              value={freeClassData.classDate}
                              onChange={(e) => setFreeClassData({ ...freeClassData, classDate: e.target.value })}
                              className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-green-400 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Class Time *</label>
                            <input
                              type="time"
                              value={freeClassData.classTime}
                              onChange={(e) => setFreeClassData({ ...freeClassData, classTime: e.target.value })}
                              className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-green-400 transition-colors"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Description (Optional)</label>
                          <textarea
                            value={freeClassData.description}
                            onChange={(e) => setFreeClassData({ ...freeClassData, description: e.target.value })}
                            rows="3"
                            className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-green-400 transition-colors"
                            placeholder="Brief description of this free live session..."
                          />
                        </div>

                        {addError && (
                          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-2 rounded-lg text-sm">
                            {addError}
                          </div>
                        )}

                        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-green-400 text-sm">
                            <span>✨</span>
                            <span>This will be a FREE public live class accessible to all users</span>
                          </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                          <button
                            onClick={handleAddFreeClass}
                            disabled={isAddingClass}
                            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                          >
                            {isAddingClass ? (
                              <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Adding...
                              </span>
                            ) : (
                              'Add Free Live Class'
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setShowFreeClassModal(false);
                              setFreeClassPin('');
                              setPinError('');
                              setPinVerified(false);
                              setFreeClassData({
                                className: '',
                                classLink: '',
                                classDate: '',
                                classTime: '',
                                description: '',
                                isFree: true
                              });
                              setAddError('');
                            }}
                            className="flex-1 py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div>
                  {successMessage && (
                    <div className="mb-4 bg-green-500/20 border border-green-500/50 text-green-400 px-4 py-2 rounded-lg text-sm text-center">
                      {successMessage}
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <div className="text-5xl mb-3">📋</div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                      Manage Free Live Classes
                    </h3>
                    <p className="text-slate-400 mt-2">View, edit, or delete your free live classes</p>
                  </div>

                  {loadingClasses ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
                      <p className="text-slate-400 mt-2">Loading classes...</p>
                    </div>
                  ) : freeClasses.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-6xl mb-4">📭</div>
                      <p className="text-slate-400">No free live classes found.</p>
                      <button
                        onClick={() => setPinMode('add')}
                        className="mt-4 px-4 py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                      >
                        Add Your First Free Class
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {freeClasses.map((cls) => (
                        <div
                          key={cls.id}
                          className="bg-slate-800/50 rounded-xl border border-slate-700 p-4 hover:border-blue-500/50 transition-all"
                        >
                          {editingClass?.id === cls.id ? (
                            <div className="space-y-3">
                              <input
                                type="text"
                                value={editingClass.className}
                                onChange={(e) => setEditingClass({ ...editingClass, className: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white"
                                placeholder="Class Name"
                              />
                              <input
                                type="url"
                                value={editingClass.classLink}
                                onChange={(e) => setEditingClass({ ...editingClass, classLink: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white"
                                placeholder="Class Link"
                              />
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  type="date"
                                  value={editingClass.classDate}
                                  onChange={(e) => setEditingClass({ ...editingClass, classDate: e.target.value })}
                                  className="px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white"
                                />
                                <input
                                  type="time"
                                  value={editingClass.classTime}
                                  onChange={(e) => setEditingClass({ ...editingClass, classTime: e.target.value })}
                                  className="px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white"
                                />
                              </div>
                              <textarea
                                value={editingClass.description || ''}
                                onChange={(e) => setEditingClass({ ...editingClass, description: e.target.value })}
                                rows="2"
                                className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white"
                                placeholder="Description (optional)"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={handleUpdateFreeClass}
                                  disabled={isAddingClass}
                                  className="flex-1 px-3 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingClass(null)}
                                  className="flex-1 px-3 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="text-lg font-semibold text-white">{cls.className}</h4>
                                  <p className="text-sm text-slate-400">
                                    📅 {formatDate(cls.classDate)} at {cls.classTime}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setEditingClass(cls)}
                                    className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                                    title="Edit"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    onClick={() => handleDeleteFreeClass(cls.id)}
                                    className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                                    title="Delete"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </div>
                              {cls.description && (
                                <p className="text-sm text-slate-300 mt-1">{cls.description}</p>
                              )}
                              <div className="mt-2 flex items-center gap-2">
                                <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                                  FREE
                                </span>
                                <span className="text-xs text-slate-500">
                                  {new Date(cls.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-3 pt-6 mt-4 border-t border-slate-700">
                    <button
                      onClick={() => {
                        setShowFreeClassModal(false);
                        setFreeClassPin('');
                        setPinError('');
                        setPinVerified(false);
                        setEditingClass(null);
                      }}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold hover:shadow-lg transition-all"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recording Modal */}
      <AnimatePresence>
        {showRecordingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={() => {
              if (!recordingPinVerified) {
                setShowRecordingModal(false);
                setRecordingPin('');
                setRecordingError('');
                setRecordingMode('add');
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {!recordingPinVerified ? (
                <div>
                  <div className="text-center mb-6">
                    <div className="text-5xl mb-3">🔒</div>
                    <h3 className="text-2xl font-bold text-white mb-2">Admin Verification</h3>
                    <p className="text-slate-400">
                      {recordingMode === 'add' ? 'Enter PIN to add recordings' : 'Enter PIN to manage recordings'}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Security PIN</label>
                      <input
                        type="password"
                        maxLength="8"
                        value={recordingPin}
                        onChange={(e) => setRecordingPin(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleRecordingPinSubmit()}
                        className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-center text-2xl tracking-widest focus:outline-none focus:border-purple-400 transition-colors"
                        placeholder="********"
                        autoFocus
                      />
                    </div>

                    {recordingError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-2 rounded-lg text-sm text-center"
                      >
                        {recordingError}
                      </motion.div>
                    )}

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleRecordingPinSubmit}
                        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:shadow-lg transition-all"
                      >
                        Verify PIN
                      </button>
                      <button
                        onClick={() => {
                          setShowRecordingModal(false);
                          setRecordingPin('');
                          setRecordingError('');
                          setRecordingMode('add');
                        }}
                        className="flex-1 py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : recordingMode === 'add' ? (
                <div>
                  {recordingSuccess ? (
                    <div className="text-center py-8">
                      <div className="text-6xl mb-4">🎉</div>
                      <h3 className="text-2xl font-bold text-green-400 mb-2">Success!</h3>
                      <p className="text-slate-300">{recordingSuccess}</p>
                    </div>
                  ) : (
                    <>
                      <div className="text-center mb-6">
                        <div className="text-5xl mb-3">🎙️📀</div>
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                          Add New Recording
                        </h3>
                        <p className="text-slate-400 mt-2">Upload audio recordings for your students</p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Recording Title <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            value={recordingData.title}
                            onChange={(e) => setRecordingData({ ...recordingData, title: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-400 transition-colors"
                            placeholder="e.g., Vocal Warm-up Exercises"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Audio URL <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="url"
                            value={recordingData.audioUrl}
                            onChange={(e) => setRecordingData({ ...recordingData, audioUrl: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-400 transition-colors"
                            placeholder="https://example.com/audio.mp3"
                          />
                          <p className="text-xs text-slate-500 mt-1">Supports MP3, WAV, or streaming URLs</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Select Class <span className="text-red-400">*</span>
                          </label>
                          <select
                            value={recordingData.classId}
                            onChange={(e) => handleClassChangeForRecording(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-400 transition-colors"
                          >
                            <option value="">Select a class</option>
                            {allClasses.map(cls => (
                              <option key={cls.id} value={cls.id}>
                                {cls.icon} {cls.className}
                              </option>
                            ))}
                          </select>
                        </div>

                        {recordingData.classId && (
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                              Select Course (Optional)
                            </label>
                            <select
                              value={recordingData.courseId}
                              onChange={(e) => {
                                const selectedCourse = filteredCourses.find(c => c.id === e.target.value);
                                setRecordingData({ 
                                  ...recordingData, 
                                  courseId: e.target.value,
                                  courseName: selectedCourse?.title || ''
                                });
                              }}
                              className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-400 transition-colors"
                            >
                              <option value="">All courses in this class</option>
                              {filteredCourses.map(course => (
                                <option key={course.id} value={course.id}>
                                  {course.title}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Duration</label>
                          <input
                            type="text"
                            value={recordingData.duration}
                            onChange={(e) => setRecordingData({ ...recordingData, duration: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-400 transition-colors"
                            placeholder="e.g., 05:30"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                          <textarea
                            value={recordingData.description}
                            onChange={(e) => setRecordingData({ ...recordingData, description: e.target.value })}
                            rows="3"
                            className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-400 transition-colors"
                            placeholder="Describe what this recording covers..."
                          />
                        </div>

                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id="featured"
                            checked={recordingData.featured}
                            onChange={(e) => setRecordingData({ ...recordingData, featured: e.target.checked })}
                            className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-purple-500 focus:ring-purple-500"
                          />
                          <label htmlFor="featured" className="text-sm text-slate-300">
                            Feature this recording (show on homepage)
                          </label>
                        </div>

                        {recordingError && (
                          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-2 rounded-lg text-sm">
                            {recordingError}
                          </div>
                        )}

                        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-purple-400 text-sm">
                            <span>✨</span>
                            <span>This recording will be available to all students in the selected class</span>
                          </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                          <button
                            onClick={handleAddRecording}
                            disabled={isAddingRecording}
                            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                          >
                            {isAddingRecording ? (
                              <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Adding...
                              </span>
                            ) : (
                              'Add Recording'
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setShowRecordingModal(false);
                              setRecordingPin('');
                              setRecordingError('');
                              setRecordingPinVerified(false);
                              setRecordingData({
                                title: '',
                                description: '',
                                audioUrl: '',
                                classId: '',
                                className: '',
                                courseId: '',
                                courseName: '',
                                duration: '',
                                featured: false
                              });
                              setFilteredCourses([]);
                            }}
                            className="flex-1 py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div>
                  {recordingSuccess && (
                    <div className="mb-4 bg-green-500/20 border border-green-500/50 text-green-400 px-4 py-2 rounded-lg text-sm text-center">
                      {recordingSuccess}
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <div className="text-5xl mb-3">📋🎧</div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                      Manage Recordings
                    </h3>
                    <p className="text-slate-400 mt-2">View, edit, or delete your audio recordings</p>
                  </div>

                  {loadingRecordings ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"></div>
                      <p className="text-slate-400 mt-2">Loading recordings...</p>
                    </div>
                  ) : recordings.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-6xl mb-4">📭</div>
                      <p className="text-slate-400">No recordings found.</p>
                      <button
                        onClick={() => setRecordingMode('add')}
                        className="mt-4 px-4 py-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
                      >
                        Add Your First Recording
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recordings.map((rec) => (
                        <div
                          key={rec.id}
                          className="bg-slate-800/50 rounded-xl border border-slate-700 p-4 hover:border-purple-500/50 transition-all"
                        >
                          {editingRecording?.id === rec.id ? (
                            <div className="space-y-3">
                              <input
                                type="text"
                                value={editingRecording.title}
                                onChange={(e) => setEditingRecording({ ...editingRecording, title: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white"
                                placeholder="Title"
                              />
                              <input
                                type="url"
                                value={editingRecording.audioUrl}
                                onChange={(e) => setEditingRecording({ ...editingRecording, audioUrl: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white"
                                placeholder="Audio URL"
                              />
                              <textarea
                                value={editingRecording.description || ''}
                                onChange={(e) => setEditingRecording({ ...editingRecording, description: e.target.value })}
                                rows="2"
                                className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white"
                                placeholder="Description"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={handleUpdateRecording}
                                  disabled={isAddingRecording}
                                  className="flex-1 px-3 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingRecording(null)}
                                  className="flex-1 px-3 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="text-lg font-semibold text-white">{rec.title}</h4>
                                  <p className="text-sm text-slate-400">
                                    📁 {rec.className || 'Uncategorized'} 
                                    {rec.courseName && ` • 📚 ${rec.courseName}`}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setEditingRecording(rec)}
                                    className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                                    title="Edit"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    onClick={() => handleDeleteRecording(rec.id)}
                                    className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                                    title="Delete"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </div>
                              {rec.description && (
                                <p className="text-sm text-slate-300 mt-1">{rec.description}</p>
                              )}
                              <div className="mt-2 flex items-center gap-3 flex-wrap">
                                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                                  🔊 Audio
                                </span>
                                {rec.duration && (
                                  <span className="text-xs text-slate-500">⏱️ {rec.duration}</span>
                                )}
                                <span className="text-xs text-slate-500">▶️ {rec.plays || 0} plays</span>
                                {rec.featured && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">
                                    ⭐ Featured
                                  </span>
                                )}
                                <span className="text-xs text-slate-500">
                                  📅 {new Date(rec.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-3 pt-6 mt-4 border-t border-slate-700">
                    <button
                      onClick={() => {
                        setShowRecordingModal(false);
                        setRecordingPin('');
                        setRecordingError('');
                        setRecordingPinVerified(false);
                        setEditingRecording(null);
                      }}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold hover:shadow-lg transition-all"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}