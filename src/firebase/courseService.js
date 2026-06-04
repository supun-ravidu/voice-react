import { db } from './config';
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';

const COURSES_COLLECTION = 'courses';

// Add a new course
export const addCourse = async (courseData) => {
  try {
    const courseWithTimestamp = {
      ...courseData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      students: 0,
      rating: 0,
      status: courseData.status || 'Draft',
      isActive: true
    };
    
    const docRef = await addDoc(collection(db, COURSES_COLLECTION), courseWithTimestamp);
    return { id: docRef.id, ...courseWithTimestamp };
  } catch (error) {
    console.error("Error adding course: ", error);
    throw error;
  }
};

// Get all courses
export const getCourses = async () => {
  try {
    const q = query(collection(db, COURSES_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const courses = [];
    querySnapshot.forEach((doc) => {
      courses.push({ id: doc.id, ...doc.data() });
    });
    return courses;
  } catch (error) {
    console.error("Error getting courses: ", error);
    throw error;
  }
};

// Get published courses (for public view)
export const getPublishedCourses = async () => {
  try {
    const q = query(
      collection(db, COURSES_COLLECTION), 
      where('status', '==', 'Published'),
      where('isActive', '==', true)
    );
    const querySnapshot = await getDocs(q);
    const courses = [];
    querySnapshot.forEach((doc) => {
      courses.push({ id: doc.id, ...doc.data() });
    });
    return courses.sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return 0;
    });
  } catch (error) {
    console.error("Error getting published courses: ", error);
    throw error;
  }
};

// Get published courses by class
export const getPublishedCoursesByClass = async (classId) => {
  try {
    const q = query(
      collection(db, COURSES_COLLECTION),
      where('classId', '==', classId),
      where('status', '==', 'Published'),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const courses = [];
    querySnapshot.forEach((doc) => {
      courses.push({ id: doc.id, ...doc.data() });
    });
    return courses;
  } catch (error) {
    console.error("Error getting courses by class: ", error);
    const allCourses = await getPublishedCourses();
    return allCourses.filter(course => course.classId === classId);
  }
};

// Get published courses by category
export const getPublishedCoursesByCategory = async (category) => {
  try {
    const q = query(
      collection(db, COURSES_COLLECTION),
      where('category', '==', category),
      where('status', '==', 'Published'),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const courses = [];
    querySnapshot.forEach((doc) => {
      courses.push({ id: doc.id, ...doc.data() });
    });
    return courses;
  } catch (error) {
    console.error("Error getting courses by category: ", error);
    const allCourses = await getPublishedCourses();
    return allCourses.filter(course => course.category === category);
  }
};

// Get courses by category (for admin)
export const getCoursesByCategory = async (category) => {
  try {
    const q = query(
      collection(db, COURSES_COLLECTION),
      where('category', '==', category),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const courses = [];
    querySnapshot.forEach((doc) => {
      courses.push({ id: doc.id, ...doc.data() });
    });
    return courses;
  } catch (error) {
    console.error("Error getting courses by category: ", error);
    throw error;
  }
};

// Get courses by class (for admin)
export const getCoursesByClass = async (classId) => {
  try {
    const q = query(
      collection(db, COURSES_COLLECTION),
      where('classId', '==', classId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const courses = [];
    querySnapshot.forEach((doc) => {
      courses.push({ id: doc.id, ...doc.data() });
    });
    return courses;
  } catch (error) {
    console.error("Error getting courses by class: ", error);
    throw error;
  }
};

// Get published courses by level
export const getPublishedCoursesByLevel = async (level) => {
  try {
    const q = query(
      collection(db, COURSES_COLLECTION),
      where('level', '==', level),
      where('status', '==', 'Published'),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const courses = [];
    querySnapshot.forEach((doc) => {
      courses.push({ id: doc.id, ...doc.data() });
    });
    return courses;
  } catch (error) {
    console.error("Error getting courses by level: ", error);
    const allCourses = await getPublishedCourses();
    return allCourses.filter(course => course.level === level);
  }
};

// Get distinct categories from all courses
export const getDistinctCategories = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, COURSES_COLLECTION));
    const categories = new Set();
    querySnapshot.forEach((doc) => {
      const category = doc.data().category;
      if (category) categories.add(category);
    });
    return Array.from(categories).sort();
  } catch (error) {
    console.error("Error getting categories: ", error);
    return [];
  }
};

// Get distinct levels from all courses
export const getDistinctLevels = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, COURSES_COLLECTION));
    const levels = new Set();
    querySnapshot.forEach((doc) => {
      const level = doc.data().level;
      if (level) levels.add(level);
    });
    return Array.from(levels).sort();
  } catch (error) {
    console.error("Error getting levels: ", error);
    return ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];
  }
};

// Get courses by instructor
export const getCoursesByInstructor = async (instructor) => {
  try {
    const q = query(
      collection(db, COURSES_COLLECTION),
      where('instructor', '==', instructor),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const courses = [];
    querySnapshot.forEach((doc) => {
      courses.push({ id: doc.id, ...doc.data() });
    });
    return courses;
  } catch (error) {
    console.error("Error getting courses by instructor: ", error);
    throw error;
  }
};

// Get popular courses (by number of students)
export const getPopularCourses = async (limitCount = 6) => {
  try {
    const q = query(
      collection(db, COURSES_COLLECTION),
      where('status', '==', 'Published'),
      orderBy('students', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    const courses = [];
    querySnapshot.forEach((doc) => {
      courses.push({ id: doc.id, ...doc.data() });
    });
    return courses;
  } catch (error) {
    console.error("Error getting popular courses: ", error);
    const allCourses = await getPublishedCourses();
    return allCourses.sort((a, b) => (b.students || 0) - (a.students || 0)).slice(0, limitCount);
  }
};

// Get recent courses
export const getRecentCourses = async (limitCount = 6) => {
  try {
    const q = query(
      collection(db, COURSES_COLLECTION),
      where('status', '==', 'Published'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    const courses = [];
    querySnapshot.forEach((doc) => {
      courses.push({ id: doc.id, ...doc.data() });
    });
    return courses;
  } catch (error) {
    console.error("Error getting recent courses: ", error);
    const allCourses = await getPublishedCourses();
    return allCourses.slice(0, limitCount);
  }
};

// Search courses by title or description
export const searchCourses = async (searchTerm) => {
  try {
    const allCourses = await getPublishedCourses();
    const term = searchTerm.toLowerCase();
    return allCourses.filter(course => 
      course.title?.toLowerCase().includes(term) ||
      course.description?.toLowerCase().includes(term) ||
      course.instructor?.toLowerCase().includes(term) ||
      course.category?.toLowerCase().includes(term)
    );
  } catch (error) {
    console.error("Error searching courses: ", error);
    throw error;
  }
};

// Get single course by ID
export const getCourseById = async (courseId) => {
  try {
    const docRef = doc(db, COURSES_COLLECTION, courseId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting course: ", error);
    throw error;
  }
};

// Update course
export const updateCourse = async (courseId, courseData) => {
  try {
    const updateData = {
      ...courseData,
      updatedAt: new Date().toISOString()
    };
    
    const docRef = doc(db, COURSES_COLLECTION, courseId);
    await updateDoc(docRef, updateData);
    return { id: courseId, ...updateData };
  } catch (error) {
    console.error("Error updating course: ", error);
    throw error;
  }
};

// Delete course
export const deleteCourse = async (courseId) => {
  try {
    const docRef = doc(db, COURSES_COLLECTION, courseId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error deleting course: ", error);
    throw error;
  }
};

// Toggle course status (Publish/Unpublish)
export const toggleCourseStatus = async (courseId, currentStatus) => {
  try {
    const newStatus = currentStatus === 'Published' ? 'Draft' : 'Published';
    const docRef = doc(db, COURSES_COLLECTION, courseId);
    await updateDoc(docRef, { 
      status: newStatus,
      updatedAt: new Date().toISOString()
    });
    return newStatus;
  } catch (error) {
    console.error("Error toggling course status: ", error);
    throw error;
  }
};

// Increment student count for a course
export const incrementStudentCount = async (courseId) => {
  try {
    const docRef = doc(db, COURSES_COLLECTION, courseId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const currentStudents = docSnap.data().students || 0;
      await updateDoc(docRef, { 
        students: currentStudents + 1,
        updatedAt: new Date().toISOString()
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error incrementing student count: ", error);
    return false;
  }
};

// Update course rating
export const updateCourseRating = async (courseId, newRating) => {
  try {
    const docRef = doc(db, COURSES_COLLECTION, courseId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const currentRating = docSnap.data().rating || 0;
      const ratingCount = docSnap.data().ratingCount || 0;
      const newAverageRating = (currentRating * ratingCount + newRating) / (ratingCount + 1);
      
      await updateDoc(docRef, { 
        rating: newAverageRating,
        ratingCount: ratingCount + 1,
        updatedAt: new Date().toISOString()
      });
      return newAverageRating;
    }
    return null;
  } catch (error) {
    console.error("Error updating course rating: ", error);
    throw error;
  }
};

// Get course statistics
export const getCourseStatistics = async () => {
  try {
    const allCourses = await getCourses();
    const publishedCourses = allCourses.filter(c => c.status === 'Published');
    const draftCourses = allCourses.filter(c => c.status === 'Draft');
    
    const totalStudents = allCourses.reduce((sum, course) => sum + (course.students || 0), 0);
    const averageRating = allCourses.reduce((sum, course) => sum + (course.rating || 0), 0) / (allCourses.length || 1);
    
    const categoryCount = {};
    allCourses.forEach(course => {
      const category = course.category || 'Uncategorized';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });
    
    const levelCount = {};
    allCourses.forEach(course => {
      const level = course.level || 'Not Specified';
      levelCount[level] = (levelCount[level] || 0) + 1;
    });
    
    return {
      totalCourses: allCourses.length,
      publishedCourses: publishedCourses.length,
      draftCourses: draftCourses.length,
      totalStudents,
      averageRating: averageRating.toFixed(1),
      categoryCount,
      levelCount
    };
  } catch (error) {
    console.error("Error getting course statistics: ", error);
    throw error;
  }
};

// Bulk update course status
export const bulkUpdateCourseStatus = async (courseIds, newStatus) => {
  try {
    const promises = courseIds.map(async (courseId) => {
      const docRef = doc(db, COURSES_COLLECTION, courseId);
      await updateDoc(docRef, { 
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
    });
    await Promise.all(promises);
    return true;
  } catch (error) {
    console.error("Error bulk updating courses: ", error);
    throw error;
  }
};

// Archive course (soft delete)
export const archiveCourse = async (courseId) => {
  try {
    const docRef = doc(db, COURSES_COLLECTION, courseId);
    await updateDoc(docRef, { 
      isActive: false,
      status: 'Archived',
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error("Error archiving course: ", error);
    throw error;
  }
};

// Restore archived course
export const restoreCourse = async (courseId) => {
  try {
    const docRef = doc(db, COURSES_COLLECTION, courseId);
    await updateDoc(docRef, { 
      isActive: true,
      status: 'Draft',
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error("Error restoring course: ", error);
    throw error;
  }
};