import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getCourses, 
  addCourse, 
  updateCourse, 
  deleteCourse, 
  toggleCourseStatus,
  getDistinctCategories,
  getCoursesByCategory
} from '../firebase/courseService';
import { 
  getAllLiveClasses, 
  addLiveClass, 
  updateLiveClass, 
  deleteLiveClass 
} from '../firebase/liveClassService';
import { 
  getAllClasses, 
  addClass, 
  updateClass, 
  deleteClass, 
  toggleClassStatus,
  getActiveClasses
} from '../firebase/classService';
import { 
  getAllUsers, 
  addUser, 
  updateUser, 
  deleteUser, 
  toggleUserStatus,
  getUserStatistics
} from '../firebase/userService';

export default function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [liveClasses, setLiveClasses] = useState([]);
  const [classNames, setClassNames] = useState([]);
  const [users, setUsers] = useState([]);
  const [userStats, setUserStats] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [showAddLiveClass, setShowAddLiveClass] = useState(false);
  const [showAddClass, setShowAddClass] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [editingLiveClass, setEditingLiveClass] = useState(null);
  const [editingClass, setEditingClass] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  
  // Filter states
  const [selectedClassFilter, setSelectedClassFilter] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form states
  const [newCourse, setNewCourse] = useState({
    title: '',
    category: '',
    classId: '',
    className: '',
    instructor: '',
    description: '',
    duration: '6 weeks',
    level: 'Beginner',
    icon: '📚',
    status: 'Draft'
  });
  
  const [newClass, setNewClass] = useState({
    className: '',
    description: '',
    icon: '📁',
    color: 'cyan',
    status: 'Active'
  });
  
  const [newLiveClass, setNewLiveClass] = useState({
    classId: '',
    className: '',
    title: '',
    description: '',
    classDate: '',
    classTime: '',
    classUrl: '',
    status: 'upcoming'
  });
  
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    classId: '',
    className: '',
    role: 'student',
    status: 'active'
  });
  
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Predefined categories for dropdown with icons
  const courseCategories = [
    { value: "Audio Production", label: "🎧 Audio Production", icon: "🎧", color: "cyan", description: "Learn music production, mixing, and mastering" },
    { value: "Vocal Training", label: "🎤 Vocal Training", icon: "🎤", color: "purple", description: "Improve singing techniques and vocal control" },
    { value: "Podcasting", label: "🎙️ Podcasting", icon: "🎙️", color: "orange", description: "Start and grow your podcast" },
    { value: "Speech Communication", label: "🗣️ Speech Communication", icon: "🗣️", color: "emerald", description: "Master public speaking and communication" },
    { value: "Voice Acting", label: "🎭 Voice Acting", icon: "🎭", color: "pink", description: "Become a professional voice actor" },
    { value: "Sound Design", label: "🌀 Sound Design", icon: "🌀", color: "blue", description: "Create immersive soundscapes" },
    { value: "Music Production", label: "🎹 Music Production", icon: "🎹", color: "indigo", description: "Produce professional-quality music" },
    { value: "Public Speaking", label: "📢 Public Speaking", icon: "📢", color: "yellow", description: "Confident public speaking techniques" },
    { value: "Accent Training", label: "🗺️ Accent Training", icon: "🗺️", color: "green", description: "Reduce accent and improve clarity" },
    { value: "Audio Engineering", label: "⚡ Audio Engineering", icon: "⚡", color: "red", description: "Professional audio engineering skills" },
    { value: "Business Communication", label: "💼 Business Communication", icon: "💼", color: "slate", description: "Effective business communication" },
    { value: "Language Learning", label: "🌐 Language Learning", icon: "🌐", color: "teal", description: "Learn new languages effectively" }
  ];

  const classColors = [
    { value: "cyan", label: "Cyan", class: "from-cyan-500 to-cyan-600" },
    { value: "purple", label: "Purple", class: "from-purple-500 to-purple-600" },
    { value: "orange", label: "Orange", class: "from-orange-500 to-orange-600" },
    { value: "emerald", label: "Emerald", class: "from-emerald-500 to-emerald-600" },
    { value: "pink", label: "Pink", class: "from-pink-500 to-pink-600" },
    { value: "blue", label: "Blue", class: "from-blue-500 to-blue-600" },
    { value: "indigo", label: "Indigo", class: "from-indigo-500 to-indigo-600" },
    { value: "yellow", label: "Yellow", class: "from-yellow-500 to-yellow-600" },
    { value: "green", label: "Green", class: "from-green-500 to-green-600" },
    { value: "red", label: "Red", class: "from-red-500 to-red-600" }
  ];

  const courseLevels = [
    { value: "Beginner", label: "🌱 Beginner", color: "green" },
    { value: "Intermediate", label: "📘 Intermediate", color: "blue" },
    { value: "Advanced", label: "🚀 Advanced", color: "purple" },
    { value: "All Levels", label: "🌟 All Levels", color: "gold" }
  ];

  const courseDurations = [
    "4 weeks", "6 weeks", "8 weeks", "10 weeks", "12 weeks", "16 weeks", "24 weeks"
  ];

  const stats = {
    totalStudents: userStats.studentUsers || 0,
    totalCourses: courses.length,
    totalClasses: classNames.length,
    totalRevenue: 125430,
    avgRating: 4.7,
  };

  // Load data based on active tab
  useEffect(() => {
    if (activeTab === 'courses') {
      loadCourses();
      loadCategories();
      loadClassNames();
    } else if (activeTab === 'live-classes') {
      loadLiveClasses();
      loadClassNames();
    } else if (activeTab === 'classes') {
      loadClassNames();
    } else if (activeTab === 'users') {
      loadUsers();
      loadClassNames();
    }
  }, [activeTab]);

  useEffect(() => {
    filterCourses();
  }, [courses, selectedClassFilter, selectedCategory, searchTerm]);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const fetchedCourses = await getCourses();
      setCourses(fetchedCourses);
      setFilteredCourses(fetchedCourses);
    } catch (error) {
      showNotification('Error loading courses: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadClassNames = async () => {
    try {
      const fetchedClasses = await getAllClasses();
      setClassNames(fetchedClasses);
    } catch (error) {
      console.error("Error loading classes:", error);
    }
  };

  const loadCategories = async () => {
    try {
      const fetchedCategories = await getDistinctCategories();
      setCategories(fetchedCategories);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const fetchedUsers = await getAllUsers();
      setUsers(fetchedUsers);
      const stats = await getUserStatistics();
      setUserStats(stats);
    } catch (error) {
      showNotification('Error loading users: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = [...courses];
    
    if (selectedClassFilter !== 'all') {
      filtered = filtered.filter(course => course.classId === selectedClassFilter);
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(course => 
        course.title?.toLowerCase().includes(term) ||
        course.instructor?.toLowerCase().includes(term) ||
        course.category?.toLowerCase().includes(term) ||
        course.className?.toLowerCase().includes(term)
      );
    }
    
    setFilteredCourses(filtered);
  };

  const loadLiveClasses = async () => {
    setLoading(true);
    try {
      const fetchedClasses = await getAllLiveClasses();
      setLiveClasses(fetchedClasses);
    } catch (error) {
      showNotification('Error loading live classes: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  // Course Handlers
  const handleAddCourse = async () => {
    if (!newCourse.title || !newCourse.category || !newCourse.classId) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const selectedClass = classNames.find(c => c.id === newCourse.classId);
      const courseToAdd = {
        ...newCourse,
        className: selectedClass?.className || ''
      };
      await addCourse(courseToAdd);
      await loadCourses();
      await loadClassNames();
      setNewCourse({
        title: '',
        category: '',
        classId: '',
        className: '',
        instructor: '',
        description: '',
        duration: '6 weeks',
        level: 'Beginner',
        icon: '📚',
        status: 'Draft'
      });
      setShowAddCourse(false);
      showNotification('Course added successfully!', 'success');
    } catch (error) {
      showNotification('Error adding course: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCourse = async () => {
    if (!editingCourse.title || !editingCourse.category) {
      showNotification('Please fill in required fields', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const selectedClass = classNames.find(c => c.id === editingCourse.classId);
      const courseToUpdate = {
        ...editingCourse,
        className: selectedClass?.className || ''
      };
      await updateCourse(editingCourse.id, courseToUpdate);
      await loadCourses();
      await loadClassNames();
      setEditingCourse(null);
      showNotification('Course updated successfully!', 'success');
    } catch (error) {
      showNotification('Error updating course: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      setLoading(true);
      try {
        await deleteCourse(courseId);
        await loadCourses();
        await loadClassNames();
        showNotification('Course deleted successfully!', 'success');
      } catch (error) {
        showNotification('Error deleting course: ' + error.message, 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleStatus = async (courseId, currentStatus) => {
    setLoading(true);
    try {
      await toggleCourseStatus(courseId, currentStatus);
      await loadCourses();
      showNotification(`Course ${currentStatus === 'Published' ? 'unpublished' : 'published'}!`, 'success');
    } catch (error) {
      showNotification('Error toggling status: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Class Name Handlers
  const handleAddClass = async () => {
    if (!newClass.className) {
      showNotification('Please enter a class name', 'error');
      return;
    }
    
    setLoading(true);
    try {
      await addClass(newClass);
      await loadClassNames();
      setNewClass({
        className: '',
        description: '',
        icon: '📁',
        color: 'cyan',
        status: 'Active'
      });
      setShowAddClass(false);
      showNotification('Class added successfully!', 'success');
    } catch (error) {
      showNotification('Error adding class: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClass = async () => {
    if (!editingClass.className) {
      showNotification('Please enter a class name', 'error');
      return;
    }
    
    setLoading(true);
    try {
      await updateClass(editingClass.id, editingClass);
      await loadClassNames();
      setEditingClass(null);
      showNotification('Class updated successfully!', 'success');
    } catch (error) {
      showNotification('Error updating class: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (classId) => {
    const coursesInClass = courses.filter(c => c.classId === classId);
    const liveClassesInClass = liveClasses.filter(lc => lc.classId === classId);
    
    if (coursesInClass.length > 0 || liveClassesInClass.length > 0) {
      showNotification(`Cannot delete class with ${coursesInClass.length} courses and ${liveClassesInClass.length} live classes.`, 'error');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this class?')) {
      setLoading(true);
      try {
        await deleteClass(classId);
        await loadClassNames();
        showNotification('Class deleted successfully!', 'success');
      } catch (error) {
        showNotification('Error deleting class: ' + error.message, 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleClassStatus = async (classId, currentStatus) => {
    setLoading(true);
    try {
      await toggleClassStatus(classId, currentStatus);
      await loadClassNames();
      showNotification(`Class ${currentStatus === 'Active' ? 'deactivated' : 'activated'}!`, 'success');
    } catch (error) {
      showNotification('Error toggling class status: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Live Class Handlers
  const handleAddLiveClass = async () => {
    if (!newLiveClass.title || !newLiveClass.classDate || !newLiveClass.classTime || !newLiveClass.classUrl || !newLiveClass.classId) {
      showNotification('Please fill in all fields (Title, Date, Time, URL, and Class)', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const selectedClass = classNames.find(c => c.id === newLiveClass.classId);
      const liveClassToAdd = {
        ...newLiveClass,
        className: selectedClass?.className || newLiveClass.className,
        classIcon: selectedClass?.icon || '🎥'
      };
      await addLiveClass(liveClassToAdd);
      await loadLiveClasses();
      setNewLiveClass({
        classId: '',
        className: '',
        title: '',
        description: '',
        classDate: '',
        classTime: '',
        classUrl: '',
        status: 'upcoming'
      });
      setShowAddLiveClass(false);
      showNotification('Live class scheduled successfully!', 'success');
    } catch (error) {
      showNotification('Error adding live class: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLiveClass = async () => {
    if (!editingLiveClass.title || !editingLiveClass.classDate || !editingLiveClass.classTime || !editingLiveClass.classUrl) {
      showNotification('Please fill in all fields', 'error');
      return;
    }
    
    setLoading(true);
    try {
      await updateLiveClass(editingLiveClass.id, editingLiveClass);
      await loadLiveClasses();
      setEditingLiveClass(null);
      showNotification('Live class updated successfully!', 'success');
    } catch (error) {
      showNotification('Error updating live class: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLiveClass = async (classId) => {
    if (window.confirm('Are you sure you want to delete this live class?')) {
      setLoading(true);
      try {
        await deleteLiveClass(classId);
        await loadLiveClasses();
        showNotification('Live class deleted successfully!', 'success');
      } catch (error) {
        showNotification('Error deleting live class: ' + error.message, 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  // User Handlers
  const handleAddUser = async () => {
    if (!newUser.username || !newUser.email || !newUser.password || !newUser.classId) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const selectedClass = classNames.find(c => c.id === newUser.classId);
      const userToAdd = {
        ...newUser,
        className: selectedClass?.className || ''
      };
      await addUser(userToAdd);
      await loadUsers();
      setNewUser({
        username: '',
        email: '',
        password: '',
        classId: '',
        className: '',
        role: 'student',
        status: 'active'
      });
      setShowAddUser(false);
      showNotification('User added successfully!', 'success');
    } catch (error) {
      showNotification('Error adding user: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser.username || !editingUser.email) {
      showNotification('Please fill in required fields', 'error');
      return;
    }
    
    setLoading(true);
    try {
      await updateUser(editingUser.id, editingUser);
      await loadUsers();
      setEditingUser(null);
      showNotification('User updated successfully!', 'success');
    } catch (error) {
      showNotification('Error updating user: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setLoading(true);
      try {
        await deleteUser(userId);
        await loadUsers();
        showNotification('User deleted successfully!', 'success');
      } catch (error) {
        showNotification('Error deleting user: ' + error.message, 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    setLoading(true);
    try {
      await toggleUserStatus(userId, currentStatus);
      await loadUsers();
      showNotification(`User ${currentStatus === 'active' ? 'deactivated' : 'activated'}!`, 'success');
    } catch (error) {
      showNotification('Error toggling user status: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const getCategoryIcon = (category) => {
    const found = courseCategories.find(c => c.value === category);
    return found ? found.icon : '📚';
  };

  const getCategoryColor = (category) => {
    const found = courseCategories.find(c => c.value === category);
    const colors = {
      cyan: 'from-cyan-500/20 to-cyan-600/20 border-cyan-500/30',
      purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
      orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30',
      emerald: 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/30',
      pink: 'from-pink-500/20 to-pink-600/20 border-pink-500/30',
      blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
      indigo: 'from-indigo-500/20 to-indigo-600/20 border-indigo-500/30',
      yellow: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30',
      green: 'from-green-500/20 to-green-600/20 border-green-500/30',
      red: 'from-red-500/20 to-red-600/20 border-red-500/30',
      slate: 'from-slate-500/20 to-slate-600/20 border-slate-500/30',
      teal: 'from-teal-500/20 to-teal-600/20 border-teal-500/30',
    };
    return colors[found?.color] || 'from-slate-500/20 to-slate-600/20 border-slate-500/30';
  };

  const getClassColorClass = (color) => {
    const found = classColors.find(c => c.value === color);
    return found?.class || 'from-cyan-500 to-cyan-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      {/* Notification */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-20 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
              notification.type === 'success' ? 'bg-green-500/90' : 'bg-red-500/90'
            } text-white font-semibold`}
          >
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 z-20">
        <div className="p-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
            VoiceLMS Admin
          </h2>
        </div>
        
        <nav className="mt-8">
          {[
            { id: 'overview', label: '📊 Overview' },
            { id: 'classes', label: '🏷️ Class Names' },
            { id: 'courses', label: '📚 Courses' },
            { id: 'live-classes', label: '🎥 Live Classes' },
            { id: 'users', label: '👥 Users' },
            { id: 'analytics', label: '📈 Analytics' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-left px-6 py-3 transition-all duration-300 ${
                activeTab === item.id 
                  ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 border-r-4 border-cyan-400 text-cyan-400' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
        
        <div className="absolute bottom-8 left-0 right-0 px-6">
          <button
            onClick={onLogout}
            className="w-full py-2 rounded-lg border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-all"
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white capitalize">{activeTab}</h1>
            <div className="flex items-center gap-4">
              <span className="text-slate-300">👋 Welcome, Admin</span>
            </div>
          </div>

          {loading && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
            </div>
          )}

          {/* Overview Tab */}
          {!loading && activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Total Students', value: stats.totalStudents, icon: '👨‍🎓', color: 'from-cyan-500 to-blue-500' },
                  { label: 'Total Courses', value: stats.totalCourses, icon: '📚', color: 'from-purple-500 to-pink-500' },
                  { label: 'Class Names', value: stats.totalClasses, icon: '🏷️', color: 'from-indigo-500 to-purple-500' },
                  { label: 'Avg Rating', value: `${stats.avgRating}/5`, icon: '⭐', color: 'from-orange-500 to-red-500' },
                ].map((stat, idx) => (
                  <motion.div key={idx} whileHover={{ scale: 1.02 }} className={`bg-gradient-to-br ${stat.color} p-6 rounded-2xl shadow-lg`}>
                    <div className="text-3xl mb-2">{stat.icon}</div>
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm opacity-90">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Class Names Tab */}
          {!loading && activeTab === 'classes' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Class Name Management</h2>
                <button 
                  onClick={() => setShowAddClass(true)} 
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-400 to-purple-400 text-slate-950 font-semibold hover:shadow-lg transition-all"
                >
                  + Add New Class
                </button>
              </div>
              
              <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800 overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-slate-800/50 border-b border-slate-700">
                    <tr>
                      <th className="text-left p-4 text-slate-300">Icon</th>
                      <th className="text-left p-4 text-slate-300">Class Name</th>
                      <th className="text-left p-4 text-slate-300">Description</th>
                      <th className="text-left p-4 text-slate-300">Courses</th>
                      <th className="text-left p-4 text-slate-300">Live Classes</th>
                      <th className="text-left p-4 text-slate-300">Users</th>
                      <th className="text-left p-4 text-slate-300">Status</th>
                      <th className="text-left p-4 text-slate-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classNames.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center p-8 text-slate-400">
                          No classes yet. Click "Add New Class" to get started!
                        </td>
                      </tr>
                    ) : (
                      classNames.map(cls => {
                        const courseCount = courses.filter(c => c.classId === cls.id).length;
                        const liveClassCount = liveClasses.filter(lc => lc.classId === cls.id).length;
                        const userCount = users.filter(u => u.classId === cls.id).length;
                        return (
                          <tr key={cls.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                            <td className="p-4">
                              <span className="text-2xl">{cls.icon || '📁'}</span>
                            </td>
                            <td className="p-4">
                              <span className="text-white font-medium">{cls.className}</span>
                            </td>
                            <td className="p-4 text-slate-300">{cls.description || '-'} </td>
                            <td className="p-4">
                              <span className="px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-xs">
                                {courseCount} courses
                              </span>
                            </td>
                            <td className="p-4">
                              <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs">
                                {liveClassCount} live
                              </span>
                            </td>
                            <td className="p-4">
                              <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">
                                {userCount} users
                              </span>
                            </td>
                            <td className="p-4">
                              <button
                                onClick={() => handleToggleClassStatus(cls.id, cls.isActive ? 'Active' : 'Inactive')}
                                className={`px-2 py-1 rounded-full text-xs transition-all ${
                                  cls.isActive 
                                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                                    : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                }`}
                              >
                                {cls.isActive ? '✓ Active' : '✗ Inactive'}
                              </button>
                            </td>
                            <td className="p-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setEditingClass(cls)}
                                  className="text-blue-400 hover:text-blue-300 transition-colors"
                                  title="Edit"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => handleDeleteClass(cls.id)}
                                  className={`text-red-400 hover:text-red-300 transition-colors ${(courseCount > 0 || liveClassCount > 0 || userCount > 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  title={(courseCount > 0 || liveClassCount > 0 || userCount > 0) ? `Has ${courseCount} courses, ${liveClassCount} live classes, and ${userCount} users - cannot delete` : "Delete"}
                                  disabled={courseCount > 0 || liveClassCount > 0 || userCount > 0}
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Courses Tab */}
          {!loading && activeTab === 'courses' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <h2 className="text-2xl font-bold text-white">Course Management</h2>
                <button 
                  onClick={() => setShowAddCourse(true)} 
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-indigo-400 text-slate-950 font-semibold hover:shadow-lg transition-all"
                >
                  + Add New Course
                </button>
              </div>

              {/* Filter Bar */}
              <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800 p-4">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs text-slate-400 mb-1">Filter by Class</label>
                    <select
                      value={selectedClassFilter}
                      onChange={(e) => setSelectedClassFilter(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-400"
                    >
                      <option value="all">All Classes</option>
                      {classNames.map(cls => (
                        <option key={cls.id} value={cls.id}>
                          {cls.icon} {cls.className}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs text-slate-400 mb-1">Filter by Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-400"
                    >
                      <option value="all">All Categories</option>
                      {courseCategories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex-[2]">
                    <label className="block text-xs text-slate-400 mb-1">Search</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        placeholder="Search by title, instructor, or class..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-sm text-slate-400">
                  Found {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
                </div>
              </div>
              
              {/* Courses Table */}
              <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800 overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                  <thead className="bg-slate-800/50 border-b border-slate-700">
                    <tr>
                      <th className="text-left p-4 text-slate-300">Title</th>
                      <th className="text-left p-4 text-slate-300">Class Name</th>
                      <th className="text-left p-4 text-slate-300">Category</th>
                      <th className="text-left p-4 text-slate-300">Instructor</th>
                      <th className="text-left p-4 text-slate-300">Duration</th>
                      <th className="text-left p-4 text-slate-300">Level</th>
                      <th className="text-left p-4 text-slate-300">Status</th>
                      <th className="text-left p-4 text-slate-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCourses.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center p-8 text-slate-400">
                          {courses.length === 0 
                            ? 'No courses yet. Click "Add New Course" to get started!'
                            : 'No courses match the selected filters.'}
                        </td>
                      </tr>
                    ) : (
                      filteredCourses.map(course => {
                        const classInfo = classNames.find(c => c.id === course.classId);
                        return (
                          <tr key={course.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{course.icon || getCategoryIcon(course.category)}</span>
                                <span className="text-white font-medium">{course.title}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              {classInfo ? (
                                <span className="flex items-center gap-2">
                                  <span>{classInfo.icon || '📁'}</span>
                                  <span className="text-slate-300">{classInfo.className}</span>
                                </span>
                              ) : (
                                <span className="text-slate-500">-</span>
                              )}
                            </td>
                            <td className="p-4">
                              <span className="flex items-center gap-2">
                                <span>{getCategoryIcon(course.category)}</span>
                                <span className="text-slate-300">{course.category}</span>
                              </span>
                            </td>
                            <td className="p-4 text-slate-300">{course.instructor || 'Admin'}</td>
                            <td className="p-4 text-slate-300">{course.duration || '6 weeks'}</td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                course.level === 'Beginner' ? 'bg-green-500/20 text-green-400' :
                                course.level === 'Intermediate' ? 'bg-blue-500/20 text-blue-400' :
                                course.level === 'Advanced' ? 'bg-purple-500/20 text-purple-400' :
                                'bg-gold-500/20 text-gold-400'
                              }`}>
                                {course.level || 'Beginner'}
                              </span>
                            </td>
                            <td className="p-4">
                              <button
                                onClick={() => handleToggleStatus(course.id, course.status)}
                                className={`px-2 py-1 rounded-full text-xs transition-all ${
                                  course.status === 'Published' 
                                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                                    : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                                }`}
                              >
                                {course.status === 'Published' ? '✓ Published' : '📝 Draft'}
                              </button>
                            </td>
                            <td className="p-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setEditingCourse(course)}
                                  className="text-blue-400 hover:text-blue-300 transition-colors"
                                  title="Edit"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => handleDeleteCourse(course.id)}
                                  className="text-red-400 hover:text-red-300 transition-colors"
                                  title="Delete"
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Live Classes Tab */}
          {!loading && activeTab === 'live-classes' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Live Class Management</h2>
                <button 
                  onClick={() => setShowAddLiveClass(true)} 
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-400 to-pink-400 text-slate-950 font-semibold hover:shadow-lg transition-all"
                >
                  + Schedule Live Class
                </button>
              </div>
              
              <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800 overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead className="bg-slate-800/50 border-b border-slate-700">
                    <tr>
                      <th className="text-left p-4 text-slate-300">Icon</th>
                      <th className="text-left p-4 text-slate-300">Title</th>
                      <th className="text-left p-4 text-slate-300">Category</th>
                      <th className="text-left p-4 text-slate-300">Date</th>
                      <th className="text-left p-4 text-slate-300">Time</th>
                      <th className="text-left p-4 text-slate-300">Attendees</th>
                      <th className="text-left p-4 text-slate-300">Status</th>
                      <th className="text-left p-4 text-slate-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liveClasses.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center p-8 text-slate-400">
                          No live classes scheduled. Click "Schedule Live Class" to get started!
                        </td>
                      </tr>
                    ) : (
                      liveClasses.map(classItem => {
                        const classInfo = classNames.find(c => c.id === classItem.classId);
                        return (
                          <tr key={classItem.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                            <td className="p-4">
                              <span className="text-2xl">{classInfo?.icon || '🎥'}</span>
                            </td>
                            <td className="p-4">
                              <div>
                                <p className="text-white font-medium">{classItem.title || classItem.className}</p>
                                {classItem.title && classItem.title !== classItem.className && (
                                  <p className="text-xs text-slate-400">{classItem.className}</p>
                                )}
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="text-slate-300">{classInfo?.className || '-'}</span>
                            </td>
                            <td className="p-4 text-slate-300">{classItem.classDate}</td>
                            <td className="p-4 text-slate-300">{classItem.classTime}</td>
                            <td className="p-4 text-slate-300">{classItem.attendees || 0}</td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                classItem.status === 'upcoming' 
                                  ? 'bg-green-500/20 text-green-400' 
                                  : classItem.status === 'ongoing'
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : 'bg-slate-500/20 text-slate-400'
                              }`}>
                                {classItem.status || 'upcoming'}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setEditingLiveClass(classItem)}
                                  className="text-blue-400 hover:text-blue-300 transition-colors"
                                  title="Edit"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => handleDeleteLiveClass(classItem.id)}
                                  className="text-red-400 hover:text-red-300 transition-colors"
                                  title="Delete"
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Users Tab */}
          {!loading && activeTab === 'users' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {[
                  { label: 'Total Users', value: userStats.totalUsers || 0, icon: '👥', color: 'from-blue-500 to-cyan-500' },
                  { label: 'Active', value: userStats.activeUsers || 0, icon: '✅', color: 'from-green-500 to-emerald-500' },
                  { label: 'Students', value: userStats.studentUsers || 0, icon: '🎓', color: 'from-purple-500 to-pink-500' },
                  { label: 'Instructors', value: userStats.instructorUsers || 0, icon: '👨‍🏫', color: 'from-orange-500 to-red-500' },
                  { label: 'Admins', value: userStats.adminUsers || 0, icon: '👑', color: 'from-indigo-500 to-purple-500' },
                ].map((stat, idx) => (
                  <div key={idx} className={`bg-gradient-to-r ${stat.color} p-4 rounded-xl shadow-lg`}>
                    <div className="text-2xl mb-1">{stat.icon}</div>
                    <div className="text-xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs opacity-90">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">User Management</h2>
                <button 
                  onClick={() => setShowAddUser(true)} 
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-400 to-emerald-400 text-slate-950 font-semibold hover:shadow-lg transition-all"
                >
                  + Add New User
                </button>
              </div>
              
              <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800 overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead className="bg-slate-800/50 border-b border-slate-700">
                    <tr>
                      <th className="text-left p-4 text-slate-300">User</th>
                      <th className="text-left p-4 text-slate-300">Email</th>
                      <th className="text-left p-4 text-slate-300">Class</th>
                      <th className="text-left p-4 text-slate-300">Role</th>
                      <th className="text-left p-4 text-slate-300">Enrolled</th>
                      <th className="text-left p-4 text-slate-300">Status</th>
                      <th className="text-left p-4 text-slate-300">Joined</th>
                      <th className="text-left p-4 text-slate-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center p-8 text-slate-400">
                          No users yet. Click "Add New User" to get started!
                        </td>
                      </tr>
                    ) : (
                      users.map(user => {
                        const classInfo = classNames.find(c => c.id === user.classId);
                        return (
                          <tr key={user.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-400 flex items-center justify-center text-white font-bold">
                                  {user.username?.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-white font-medium">{user.username}</span>
                              </div>
                            </td>
                            <td className="p-4 text-slate-300">{user.email}</td>
                            <td className="p-4">
                              {classInfo ? (
                                <span className="flex items-center gap-1">
                                  <span>{classInfo.icon}</span>
                                  <span className="text-slate-300">{classInfo.className}</span>
                                </span>
                              ) : (
                                <span className="text-slate-500">-</span>
                              )}
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' :
                                user.role === 'instructor' ? 'bg-orange-500/20 text-orange-400' :
                                'bg-blue-500/20 text-blue-400'
                              }`}>
                                {user.role || 'student'}
                              </span>
                            </td>
                            <td className="p-4 text-slate-300">{user.enrolledCourses?.length || 0}</td>
                            <td className="p-4">
                              <button
                                onClick={() => handleToggleUserStatus(user.id, user.status)}
                                className={`px-2 py-1 rounded-full text-xs transition-all ${
                                  user.status === 'active' 
                                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                                    : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                }`}
                              >
                                {user.status === 'active' ? '✓ Active' : '✗ Inactive'}
                              </button>
                            </td>
                            <td className="p-4 text-slate-400 text-sm">
                              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                            </td>
                            <td className="p-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setEditingUser(user)}
                                  className="text-blue-400 hover:text-blue-300 transition-colors"
                                  title="Edit"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="text-red-400 hover:text-red-300 transition-colors"
                                  title="Delete"
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

{/* Analytics Tab */}
{!loading && activeTab === 'analytics' && (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
    {/* Header Stats */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        { 
          label: 'Total Revenue', 
          value: `$${stats.totalRevenue.toLocaleString()}`, 
          icon: '💰', 
          change: '+23%', 
          trend: 'up',
          color: 'from-green-500 to-emerald-500',
          bgColor: 'from-green-500/20 to-emerald-500/20'
        },
        { 
          label: 'Monthly Active', 
          value: '1,284', 
          icon: '👥', 
          change: '+12%', 
          trend: 'up',
          color: 'from-blue-500 to-cyan-500',
          bgColor: 'from-blue-500/20 to-cyan-500/20'
        },
        { 
          label: 'Conversion Rate', 
          value: '68%', 
          icon: '📊', 
          change: '+5%', 
          trend: 'up',
          color: 'from-purple-500 to-pink-500',
          bgColor: 'from-purple-500/20 to-pink-500/20'
        },
        { 
          label: 'Avg Session', 
          value: '24min', 
          icon: '⏱️', 
          change: '+8%', 
          trend: 'up',
          color: 'from-orange-500 to-red-500',
          bgColor: 'from-orange-500/20 to-red-500/20'
        },
      ].map((stat, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className={`bg-gradient-to-br ${stat.bgColor} backdrop-blur-sm rounded-2xl border border-slate-700 p-6 hover:scale-105 transition-all duration-300`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-3xl">{stat.icon}</span>
            <span className={`text-sm font-semibold ${stat.trend === 'up' ? 'text-green-400' : 'text-red-400'} bg-slate-800/50 px-2 py-1 rounded-full`}>
              {stat.change} ↑
            </span>
          </div>
          <div className={`text-3xl font-bold text-white bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
            {stat.value}
          </div>
          <div className="text-sm text-slate-400 mt-1">{stat.label}</div>
          <div className="mt-3 h-1 bg-slate-700 rounded-full overflow-hidden">
            <div className={`h-full w-${Math.floor(Math.random() * 30) + 60}% bg-gradient-to-r ${stat.color} rounded-full`} />
          </div>
        </motion.div>
      ))}
    </div>

    {/* Charts Row */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Revenue Overview</h3>
            <p className="text-xs text-slate-400">Monthly revenue breakdown</p>
          </div>
          <select className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1 text-sm text-slate-300">
            <option>Last 6 months</option>
            <option>Last year</option>
            <option>All time</option>
          </select>
        </div>
        <div className="space-y-3">
          {[
            { month: 'Jan', revenue: 12500, color: 'from-cyan-400 to-indigo-400' },
            { month: 'Feb', revenue: 18200, color: 'from-cyan-400 to-indigo-400' },
            { month: 'Mar', revenue: 15800, color: 'from-cyan-400 to-indigo-400' },
            { month: 'Apr', revenue: 21400, color: 'from-cyan-400 to-indigo-400' },
            { month: 'May', revenue: 24800, color: 'from-cyan-400 to-indigo-400' },
            { month: 'Jun', revenue: 29400, color: 'from-cyan-400 to-indigo-400' },
          ].map((item, idx) => (
            <div key={idx} className="group">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-400">{item.month}</span>
                <span className="text-white font-semibold">${item.revenue.toLocaleString()}</span>
              </div>
              <div className="h-8 bg-slate-800 rounded-lg overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.revenue / 30000) * 100}%` }}
                  transition={{ duration: 1, delay: idx * 0.1 }}
                  className={`h-full bg-gradient-to-r ${item.color} rounded-lg flex items-center justify-end px-2 text-xs text-slate-950 font-semibold`}
                >
                  {Math.round((item.revenue / 30000) * 100)}%
                </motion.div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Course Distribution */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Popular Categories</h3>
            <p className="text-xs text-slate-400">Course distribution by category</p>
          </div>
        </div>
        <div className="space-y-4">
          {courseCategories.slice(0, 5).map((cat, idx) => {
            const count = courses.filter(c => c.category === cat.value).length;
            const percentage = courses.length ? (count / courses.length) * 100 : 0;
            return (
              <div key={idx} className="group">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{cat.icon}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300">{cat.label}</span>
                      <span className="text-cyan-400 font-semibold">{count} courses</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                        className={`h-full bg-gradient-to-r from-${cat.color}-500 to-${cat.color}-600 rounded-full`}
                      />
                    </div>
                  </div>
                  <span className="text-sm text-slate-400">{Math.round(percentage)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>

    {/* Second Row */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* User Growth */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800 p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">User Growth</h3>
        <div className="relative h-32">
          <div className="absolute inset-0 flex items-end gap-2">
            {[65, 78, 82, 88, 92, 95, 98].map((height, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className={`w-full bg-gradient-to-t from-cyan-500 to-indigo-500 rounded-t-lg`}
                  style={{ height: `${height}%` }}
                />
                <span className="text-xs text-slate-500">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][idx]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-slate-700">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Total Users</span>
            <span className="text-2xl font-bold text-white">{userStats.totalUsers || 0}</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-slate-400 text-sm">Growth rate</span>
            <span className="text-green-400 text-sm">+23% this month</span>
          </div>
        </div>
      </motion.div>

      {/* Live Class Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800 p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Live Classes Overview</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-slate-800/30 rounded-xl">
            <div className="text-3xl mb-1">🎥</div>
            <div className="text-2xl font-bold text-white">{liveClasses.length}</div>
            <div className="text-xs text-slate-400">Total Classes</div>
          </div>
          <div className="text-center p-3 bg-slate-800/30 rounded-xl">
            <div className="text-3xl mb-1">👥</div>
            <div className="text-2xl font-bold text-white">{liveClasses.reduce((sum, cls) => sum + (cls.attendees || 0), 0)}</div>
            <div className="text-xs text-slate-400">Total Attendees</div>
          </div>
        </div>
        <div className="space-y-2">
          {liveClasses.slice(0, 3).map((cls, idx) => (
            <div key={idx} className="flex justify-between items-center text-sm">
              <span className="text-slate-300 truncate max-w-[150px]">{cls.title || cls.className}</span>
              <span className="text-cyan-400">{cls.attendees || 0} joined</span>
            </div>
          ))}
          {liveClasses.length === 0 && (
            <div className="text-center text-slate-400 py-4">No live classes yet</div>
          )}
        </div>
      </motion.div>

      {/* Top Performers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800 p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Top Performing Courses</h3>
        <div className="space-y-4">
          {courses.filter(c => c.status === 'Published').slice(0, 4).map((course, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="w-8 text-center">
                <span className="text-lg">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}th`}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-white font-medium truncate">{course.title}</p>
                <div className="flex gap-3 text-xs text-slate-400 mt-1">
                  <span>⭐ {course.rating || 4.5}</span>
                  <span>👥 {course.students || 0}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm text-cyan-400">{course.duration || '6w'}</span>
              </div>
            </div>
          ))}
          {courses.filter(c => c.status === 'Published').length === 0 && (
            <div className="text-center text-slate-400 py-4">No published courses yet</div>
          )}
        </div>
      </motion.div>
    </div>

    {/* Additional Stats */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { label: 'Course Completion Rate', value: '76%', icon: '✅', change: '+8%' },
        { label: 'Student Satisfaction', value: '4.8/5', icon: '⭐', change: '+0.3' },
        { label: 'Active Students', value: userStats.activeUsers || 0, icon: '🎓', change: '+15%' },
        { label: 'Certificates Issued', value: '342', icon: '📜', change: '+28%' },
      ].map((stat, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 + idx * 0.1 }}
          className="bg-slate-800/30 rounded-xl p-4 text-center hover:bg-slate-800/50 transition-all"
        >
          <div className="text-2xl mb-2">{stat.icon}</div>
          <div className="text-xl font-bold text-white">{stat.value}</div>
          <div className="text-xs text-slate-400">{stat.label}</div>
          <div className="text-xs text-green-400 mt-1">{stat.change}</div>
        </motion.div>
      ))}
    </div>
  </motion.div>
)}
        </div>
      </div>

      {/* Add/Edit Class Modal */}
      <AnimatePresence>
        {(showAddClass || editingClass) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowAddClass(false);
              setEditingClass(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="bg-slate-900 rounded-2xl border border-slate-700 p-8 w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-white mb-4">
                {editingClass ? 'Edit Class' : 'Add New Class'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Class Name *</label>
                  <input
                    type="text"
                    value={editingClass ? editingClass.className : newClass.className}
                    onChange={(e) => editingClass
                      ? setEditingClass({ ...editingClass, className: e.target.value })
                      : setNewClass({ ...newClass, className: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-400 transition-colors"
                    placeholder="e.g., Vocal Mastery, Audio Production Pro"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                  <textarea
                    value={editingClass ? editingClass.description : newClass.description}
                    onChange={(e) => editingClass
                      ? setEditingClass({ ...editingClass, description: e.target.value })
                      : setNewClass({ ...newClass, description: e.target.value })
                    }
                    rows="2"
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-400 transition-colors"
                    placeholder="Brief description of this class category"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Icon</label>
                    <input
                      type="text"
                      value={editingClass ? editingClass.icon : newClass.icon}
                      onChange={(e) => editingClass
                        ? setEditingClass({ ...editingClass, icon: e.target.value })
                        : setNewClass({ ...newClass, icon: e.target.value })
                      }
                      className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-400 transition-colors"
                      placeholder="e.g., 🎤, 🎧, 📚"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Color Theme</label>
                    <select
                      value={editingClass ? editingClass.color : newClass.color}
                      onChange={(e) => editingClass
                        ? setEditingClass({ ...editingClass, color: e.target.value })
                        : setNewClass({ ...newClass, color: e.target.value })
                      }
                      className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-400 transition-colors"
                    >
                      {classColors.map(color => (
                        <option key={color.value} value={color.value}>{color.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={editingClass ? handleUpdateClass : handleAddClass}
                    disabled={loading}
                    className="flex-1 py-2 rounded-lg bg-gradient-to-r from-indigo-400 to-purple-400 text-slate-950 font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : (editingClass ? 'Update Class' : 'Add Class')}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddClass(false);
                      setEditingClass(null);
                    }}
                    className="flex-1 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Course Modal */}
      <AnimatePresence>
        {(showAddCourse || editingCourse) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowAddCourse(false);
              setEditingCourse(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="bg-slate-900 rounded-2xl border border-slate-700 p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-white mb-4">
                {editingCourse ? 'Edit Course' : 'Add New Course'}
              </h3>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Course Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingCourse ? editingCourse.title : newCourse.title}
                    onChange={(e) => editingCourse 
                      ? setEditingCourse({ ...editingCourse, title: e.target.value })
                      : setNewCourse({ ...newCourse, title: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                    placeholder="Enter course title (e.g., Advanced Vocal Techniques)"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Class Name <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={editingCourse ? editingCourse.classId : newCourse.classId}
                    onChange={(e) => {
                      const selectedClass = classNames.find(c => c.id === e.target.value);
                      if (editingCourse) {
                        setEditingCourse({ 
                          ...editingCourse, 
                          classId: e.target.value,
                          className: selectedClass?.className || ''
                        });
                      } else {
                        setNewCourse({ 
                          ...newCourse, 
                          classId: e.target.value,
                          className: selectedClass?.className || ''
                        });
                      }
                    }}
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                  >
                    <option value="">Select a class</option>
                    {classNames.map(cls => (
                      <option key={cls.id} value={cls.id}>
                        {cls.icon} {cls.className} {!cls.isActive ? '(Inactive)' : ''}
                      </option>
                    ))}
                  </select>
                  {classNames.length === 0 && (
                    <p className="text-xs text-yellow-400 mt-1">
                      No classes available. Please create a class first in the "Class Names" tab.
                    </p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Category <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={editingCourse ? editingCourse.category : newCourse.category}
                      onChange={(e) => {
                        const selectedCategory = courseCategories.find(cat => cat.value === e.target.value);
                        if (editingCourse) {
                          setEditingCourse({ 
                            ...editingCourse, 
                            category: e.target.value,
                            icon: selectedCategory?.icon || '📚'
                          });
                        } else {
                          setNewCourse({ 
                            ...newCourse, 
                            category: e.target.value,
                            icon: selectedCategory?.icon || '📚'
                          });
                        }
                      }}
                      className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                    >
                      <option value="">Select a category</option>
                      {courseCategories.map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                    {newCourse.category && (
                      <p className="text-xs text-slate-400 mt-1">
                        {courseCategories.find(c => c.value === newCourse.category)?.description}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Instructor</label>
                    <input
                      type="text"
                      value={editingCourse ? editingCourse.instructor : newCourse.instructor}
                      onChange={(e) => editingCourse
                        ? setEditingCourse({ ...editingCourse, instructor: e.target.value })
                        : setNewCourse({ ...newCourse, instructor: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                      placeholder="Instructor name"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                  <textarea
                    value={editingCourse ? editingCourse.description : newCourse.description}
                    onChange={(e) => editingCourse
                      ? setEditingCourse({ ...editingCourse, description: e.target.value })
                      : setNewCourse({ ...newCourse, description: e.target.value })
                    }
                    rows="3"
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                    placeholder="Describe what students will learn in this course..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Duration</label>
                    <select
                      value={editingCourse ? editingCourse.duration : newCourse.duration}
                      onChange={(e) => editingCourse
                        ? setEditingCourse({ ...editingCourse, duration: e.target.value })
                        : setNewCourse({ ...newCourse, duration: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                    >
                      {courseDurations.map(duration => (
                        <option key={duration} value={duration}>{duration}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Level</label>
                    <select
                      value={editingCourse ? editingCourse.level : newCourse.level}
                      onChange={(e) => editingCourse
                        ? setEditingCourse({ ...editingCourse, level: e.target.value })
                        : setNewCourse({ ...newCourse, level: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                    >
                      {courseLevels.map(level => (
                        <option key={level.value} value={level.value}>{level.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Course Icon</label>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl">
                      {editingCourse ? editingCourse.icon : newCourse.icon || '📚'}
                    </div>
                    <input
                      type="text"
                      value={editingCourse ? editingCourse.icon : newCourse.icon}
                      onChange={(e) => editingCourse
                        ? setEditingCourse({ ...editingCourse, icon: e.target.value })
                        : setNewCourse({ ...newCourse, icon: e.target.value })
                      }
                      className="flex-1 px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                      placeholder="e.g., 🎧, 🎤, 🎙️"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Tip: Icon will be automatically set based on selected category
                  </p>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={editingCourse ? handleUpdateCourse : handleAddCourse}
                    disabled={loading || classNames.length === 0}
                    className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-cyan-400 to-indigo-400 text-slate-950 font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Saving...' : (editingCourse ? 'Update Course' : 'Add Course')}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddCourse(false);
                      setEditingCourse(null);
                    }}
                    className="flex-1 py-2.5 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 transition-all"
                  >
                    Cancel
                  </button>
                </div>
                {classNames.length === 0 && (
                  <p className="text-center text-xs text-yellow-400">
                    Please create a class first in the "Class Names" tab before adding courses.
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Live Class Modal */}
      <AnimatePresence>
        {(showAddLiveClass || editingLiveClass) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowAddLiveClass(false);
              setEditingLiveClass(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="bg-slate-900 rounded-2xl border border-slate-700 p-8 w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-white mb-4">
                {editingLiveClass ? 'Edit Live Class' : 'Schedule New Live Class'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Select Category <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={editingLiveClass ? editingLiveClass.classId : newLiveClass.classId}
                    onChange={(e) => {
                      const selectedClass = classNames.find(c => c.id === e.target.value);
                      if (editingLiveClass) {
                        setEditingLiveClass({ 
                          ...editingLiveClass, 
                          classId: e.target.value,
                          className: selectedClass?.className || ''
                        });
                      } else {
                        setNewLiveClass({ 
                          ...newLiveClass, 
                          classId: e.target.value,
                          className: selectedClass?.className || ''
                        });
                      }
                    }}
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-red-400 transition-colors"
                  >
                    <option value="">Select a category</option>
                    {classNames.map(cls => (
                      <option key={cls.id} value={cls.id}>
                        {cls.icon} {cls.className} {!cls.isActive ? '(Inactive)' : ''}
                      </option>
                    ))}
                  </select>
                  {classNames.length === 0 && (
                    <p className="text-xs text-yellow-400 mt-1">
                      No categories available. Please create a class first in the "Class Names" tab.
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Live Class Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingLiveClass ? editingLiveClass.title : newLiveClass.title}
                    onChange={(e) => editingLiveClass
                      ? setEditingLiveClass({ ...editingLiveClass, title: e.target.value })
                      : setNewLiveClass({ ...newLiveClass, title: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-red-400 transition-colors"
                    placeholder="e.g., Advanced Vocal Techniques - Week 1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Description (Optional)</label>
                  <textarea
                    value={editingLiveClass ? editingLiveClass.description : newLiveClass.description}
                    onChange={(e) => editingLiveClass
                      ? setEditingLiveClass({ ...editingLiveClass, description: e.target.value })
                      : setNewLiveClass({ ...newLiveClass, description: e.target.value })
                    }
                    rows="2"
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-red-400 transition-colors"
                    placeholder="Brief description of this live session..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Class Date *</label>
                    <input
                      type="date"
                      value={editingLiveClass ? editingLiveClass.classDate : newLiveClass.classDate}
                      onChange={(e) => editingLiveClass
                        ? setEditingLiveClass({ ...editingLiveClass, classDate: e.target.value })
                        : setNewLiveClass({ ...newLiveClass, classDate: e.target.value })
                      }
                      className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-red-400 transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Class Time *</label>
                    <input
                      type="time"
                      value={editingLiveClass ? editingLiveClass.classTime : newLiveClass.classTime}
                      onChange={(e) => editingLiveClass
                        ? setEditingLiveClass({ ...editingLiveClass, classTime: e.target.value })
                        : setNewLiveClass({ ...newLiveClass, classTime: e.target.value })
                      }
                      className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-red-400 transition-colors"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Meeting URL *</label>
                  <input
                    type="url"
                    value={editingLiveClass ? editingLiveClass.classUrl : newLiveClass.classUrl}
                    onChange={(e) => editingLiveClass
                      ? setEditingLiveClass({ ...editingLiveClass, classUrl: e.target.value })
                      : setNewLiveClass({ ...newLiveClass, classUrl: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-red-400 transition-colors"
                    placeholder="https://zoom.us/... or https://meet.google.com/..."
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={editingLiveClass ? handleUpdateLiveClass : handleAddLiveClass}
                    disabled={loading || classNames.length === 0}
                    className="flex-1 py-2 rounded-lg bg-gradient-to-r from-red-400 to-pink-400 text-slate-950 font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Saving...' : (editingLiveClass ? 'Update Class' : 'Schedule Class')}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddLiveClass(false);
                      setEditingLiveClass(null);
                    }}
                    className="flex-1 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 transition-all"
                  >
                    Cancel
                  </button>
                </div>
                {classNames.length === 0 && (
                  <p className="text-center text-xs text-yellow-400">
                    Please create a class first in the "Class Names" tab before scheduling live classes.
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit User Modal */}
      <AnimatePresence>
        {(showAddUser || editingUser) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowAddUser(false);
              setEditingUser(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="bg-slate-900 rounded-2xl border border-slate-700 p-8 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-white mb-4">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Username <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingUser ? editingUser.username : newUser.username}
                    onChange={(e) => editingUser
                      ? setEditingUser({ ...editingUser, username: e.target.value })
                      : setNewUser({ ...newUser, username: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-green-400 transition-colors"
                    placeholder="Enter username"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={editingUser ? editingUser.email : newUser.email}
                    onChange={(e) => editingUser
                      ? setEditingUser({ ...editingUser, email: e.target.value })
                      : setNewUser({ ...newUser, email: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-green-400 transition-colors"
                    placeholder="user@example.com"
                  />
                </div>
                
                {!editingUser && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Password <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-green-400 transition-colors"
                      placeholder="Enter password (min 6 characters)"
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Assign Class <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={editingUser ? editingUser.classId : newUser.classId}
                    onChange={(e) => {
                      const selectedClass = classNames.find(c => c.id === e.target.value);
                      if (editingUser) {
                        setEditingUser({ 
                          ...editingUser, 
                          classId: e.target.value,
                          className: selectedClass?.className || ''
                        });
                      } else {
                        setNewUser({ 
                          ...newUser, 
                          classId: e.target.value,
                          className: selectedClass?.className || ''
                        });
                      }
                    }}
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-green-400 transition-colors"
                  >
                    <option value="">Select a class</option>
                    {classNames.map(cls => (
                      <option key={cls.id} value={cls.id}>
                        {cls.icon} {cls.className} {!cls.isActive ? '(Inactive)' : ''}
                      </option>
                    ))}
                  </select>
                  {classNames.length === 0 && (
                    <p className="text-xs text-yellow-400 mt-1">
                      No classes available. Please create a class first in the "Class Names" tab.
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Role</label>
                  <select
                    value={editingUser ? editingUser.role : newUser.role}
                    onChange={(e) => editingUser
                      ? setEditingUser({ ...editingUser, role: e.target.value })
                      : setNewUser({ ...newUser, role: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-green-400 transition-colors"
                  >
                    <option value="student">🎓 Student</option>
                    <option value="instructor">👨‍🏫 Instructor</option>
                    <option value="admin">👑 Admin</option>
                  </select>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={editingUser ? handleUpdateUser : handleAddUser}
                    disabled={loading || classNames.length === 0}
                    className="flex-1 py-2 rounded-lg bg-gradient-to-r from-green-400 to-emerald-400 text-slate-950 font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Saving...' : (editingUser ? 'Update User' : 'Add User')}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddUser(false);
                      setEditingUser(null);
                    }}
                    className="flex-1 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 transition-all"
                  >
                    Cancel
                  </button>
                </div>
                {classNames.length === 0 && (
                  <p className="text-center text-xs text-yellow-400">
                    Please create a class first in the "Class Names" tab before adding users.
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}