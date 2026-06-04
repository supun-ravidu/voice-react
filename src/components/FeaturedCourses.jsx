import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { getPublishedCourses } from "../firebase/courseService";
import { getActiveClasses } from "../firebase/classService";

export default function FeaturedCourses() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [classNames, setClassNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Extract unique categories and levels from courses
  const categories = ["all", ...new Set(courses.map(course => course.category))];
  const levels = ["all", "Beginner", "Intermediate", "Advanced", "All Levels"];

  // Load courses and classes from Firebase
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [fetchedCourses, fetchedClasses] = await Promise.all([
          getPublishedCourses(),
          getActiveClasses()
        ]);
        setCourses(fetchedCourses);
        setClassNames(fetchedClasses);
        setError(null);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load courses. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Apply filters whenever filter states change
  useEffect(() => {
    let filtered = [...courses];
    
    // Filter by class name
    if (selectedClass !== "all") {
      filtered = filtered.filter(course => course.classId === selectedClass);
    }
    
    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }
    
    // Filter by level
    if (selectedLevel !== "all") {
      filtered = filtered.filter(course => course.level === selectedLevel);
    }
    
    // Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(course => 
        course.title?.toLowerCase().includes(query) ||
        course.description?.toLowerCase().includes(query) ||
        course.instructor?.toLowerCase().includes(query) ||
        course.category?.toLowerCase().includes(query)
      );
    }
    
    setFilteredCourses(filtered);
  }, [courses, selectedClass, selectedCategory, selectedLevel, searchQuery]);

  const resetFilters = () => {
    setSelectedClass("all");
    setSelectedCategory("all");
    setSelectedLevel("all");
    setSearchQuery("");
  };

  // Helper function to get class icon
  const getClassIcon = (classId) => {
    const found = classNames.find(c => c.id === classId);
    return found?.icon || '📁';
  };

  // Helper function to get class name
  const getClassName = (classId) => {
    const found = classNames.find(c => c.id === classId);
    return found?.className || 'Uncategorized';
  };

  if (loading) {
    return (
      <section id="courses" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="px-4 py-2 rounded-full bg-cyan-500/10 text-cyan-400 text-sm font-semibold inline-block mb-4">
              CURRICULUM
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Premium voice-first programs</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Curated by industry pros — learn audio, voice, and storytelling with practical projects.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800 p-6 animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-slate-700 rounded-full"></div>
                  <div className="w-20 h-6 bg-slate-700 rounded-full"></div>
                </div>
                <div className="h-6 bg-slate-700 rounded mb-2"></div>
                <div className="h-4 bg-slate-700 rounded w-2/3 mb-4"></div>
                <div className="h-16 bg-slate-700 rounded mb-4"></div>
                <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                  <div className="flex gap-3">
                    <div className="h-4 bg-slate-700 rounded w-16"></div>
                    <div className="h-4 bg-slate-700 rounded w-16"></div>
                  </div>
                  <div className="h-8 bg-slate-700 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="courses" className="py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-6">
            <p className="text-red-400">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="courses" className="py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="px-4 py-2 rounded-full bg-cyan-500/10 text-cyan-400 text-sm font-semibold inline-block mb-4">
            CURRICULUM
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">Premium voice-first programs</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Curated by industry pros — learn audio, voice, and storytelling with practical projects.
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-10">
          {/* Search Input */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search courses by title, description, instructor, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
            {(selectedClass !== "all" || selectedCategory !== "all" || selectedLevel !== "all" || searchQuery) && (
              <span className="px-1.5 py-0.5 text-xs rounded-full bg-cyan-500 text-white">
                {[
                  selectedClass !== "all" ? 1 : 0,
                  selectedCategory !== "all" ? 1 : 0,
                  selectedLevel !== "all" ? 1 : 0,
                  searchQuery ? 1 : 0
                ].reduce((a, b) => a + b, 0)}
              </span>
            )}
          </button>

          {/* Filter Panel */}
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mt-4"
              >
                <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Class Name Filter */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-3">📁 Class Name</label>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setSelectedClass("all")}
                          className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                            selectedClass === "all"
                              ? "bg-gradient-to-r from-cyan-400 to-indigo-400 text-slate-950 font-semibold shadow-lg"
                              : "bg-slate-800/50 text-slate-300 hover:bg-slate-800"
                          }`}
                        >
                          All Classes
                        </button>
                        {classNames.map(cls => (
                          <button
                            key={cls.id}
                            onClick={() => setSelectedClass(cls.id)}
                            className={`px-3 py-1.5 rounded-full text-sm transition-all flex items-center gap-1 ${
                              selectedClass === cls.id
                                ? "bg-gradient-to-r from-cyan-400 to-indigo-400 text-slate-950 font-semibold shadow-lg"
                                : "bg-slate-800/50 text-slate-300 hover:bg-slate-800"
                            }`}
                          >
                            <span>{cls.icon || '📁'}</span>
                            <span>{cls.className}</span>
                          </button>
                        ))}
                      </div>
                      {classNames.length === 0 && (
                        <p className="text-xs text-slate-400 mt-2">No classes available yet</p>
                      )}
                    </div>

                    {/* Category Filter */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-3">🏷️ Category</label>
                      <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (
                          <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-3 py-1.5 rounded-full text-sm capitalize transition-all ${
                              selectedCategory === category
                                ? "bg-gradient-to-r from-cyan-400 to-indigo-400 text-slate-950 font-semibold shadow-lg"
                                : "bg-slate-800/50 text-slate-300 hover:bg-slate-800"
                            }`}
                          >
                            {category === "all" ? "All Categories" : category}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Level Filter */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-3">📊 Level</label>
                      <div className="flex flex-wrap gap-2">
                        {levels.map((level) => (
                          <button
                            key={level}
                            onClick={() => setSelectedLevel(level)}
                            className={`px-3 py-1.5 rounded-full text-sm capitalize transition-all ${
                              selectedLevel === level
                                ? "bg-gradient-to-r from-cyan-400 to-indigo-400 text-slate-950 font-semibold shadow-lg"
                                : "bg-slate-800/50 text-slate-300 hover:bg-slate-800"
                            }`}
                          >
                            {level === "all" ? "All Levels" : level}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Reset Filters Button */}
                  {(selectedClass !== "all" || selectedCategory !== "all" || selectedLevel !== "all" || searchQuery) && (
                    <div className="mt-6 pt-4 border-t border-slate-700 text-center">
                      <button
                        onClick={resetFilters}
                        className="px-4 py-2 rounded-lg text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        Clear All Filters
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results Count */}
          <div className="mt-4 text-sm text-slate-400">
            Found {filteredCourses.length} course{filteredCourses.length !== 1 ? "s" : ""}
            {selectedClass !== "all" && classNames.find(c => c.id === selectedClass) && (
              <span className="text-cyan-400"> in {classNames.find(c => c.id === selectedClass)?.className}</span>
            )}
            {selectedCategory !== "all" && ` in ${selectedCategory}`}
            {selectedLevel !== "all" && ` at ${selectedLevel} level`}
            {searchQuery && ` matching "${searchQuery}"`}
          </div>
        </div>

        {/* No Results Message */}
        {filteredCourses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-white mb-2">No courses found</h3>
            <p className="text-slate-400 mb-6">
              {searchQuery 
                ? `No results matching "${searchQuery}"`
                : "Try adjusting your filters to find what you're looking for"}
            </p>
            <button
              onClick={resetFilters}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-indigo-400 text-slate-950 font-semibold hover:shadow-lg transition-all"
            >
              Clear Filters
            </button>
          </motion.div>
        ) : (
          /* Courses Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course, index) => {
              const courseClass = classNames.find(c => c.id === course.classId);
              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group relative bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800 p-6 hover:border-cyan-500/50 transition-all duration-300 hover:transform hover:-translate-y-2"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-4xl">{course.icon || '📚'}</span>
                        {courseClass && (
                          <span className="text-xs px-2 py-1 rounded-full bg-slate-800/80 text-slate-300">
                            {courseClass.icon} {courseClass.className}
                          </span>
                        )}
                      </div>
                      <span className="px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-white text-xs font-semibold">
                        {course.category}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{course.title}</h3>
                    <p className="text-slate-400 text-sm mb-2">by {course.instructor || 'Admin'}</p>
                    <p className="text-slate-300 mb-4 line-clamp-2">{course.description}</p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                      <div className="flex gap-3 text-xs text-slate-400">
                        <span>⏱️ {course.duration || '6 weeks'}</span>
                        <span>📊 {course.level || 'Intermediate'}</span>
                      </div>
                      <button className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors group">
                        Start Learning
                        <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}