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
  const [pinMode, setPinMode] = useState('add'); // 'add' or 'manage'
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

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center px-4 py-8">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-500"></div>
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

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-900/80 text-slate-500">Free Live Class Management</span>
              </div>
            </div>

            {/* Add Free Live Class Button */}
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

            {/* Manage Free Live Classes Button */}
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
                // PIN Verification Screen
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
                      <p className="text-xs text-slate-500 mt-2 text-center">Enter 8-digit PIN: 12345678</p>
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
                // Add Free Live Class Form
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
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Class Name <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            value={freeClassData.className}
                            onChange={(e) => setFreeClassData({ ...freeClassData, className: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-green-400 transition-colors"
                            placeholder="e.g., Free Vocal Warm-up Session"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Class Link <span className="text-red-400">*</span>
                          </label>
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
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                              Class Date <span className="text-red-400">*</span>
                            </label>
                            <input
                              type="date"
                              value={freeClassData.classDate}
                              onChange={(e) => setFreeClassData({ ...freeClassData, classDate: e.target.value })}
                              className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-green-400 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                              Class Time <span className="text-red-400">*</span>
                            </label>
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
                // Manage Free Live Classes
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
                            // Edit Mode
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
                            // View Mode
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
    </div>
  );
}