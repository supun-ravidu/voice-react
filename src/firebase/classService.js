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
  orderBy,
  where
} from 'firebase/firestore';

const CLASSES_COLLECTION = 'classes';

// Add a new class name
export const addClass = async (classData) => {
  try {
    const classWithTimestamp = {
      ...classData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: classData.isActive !== undefined ? classData.isActive : true,
      courseCount: 0
    };
    
    const docRef = await addDoc(collection(db, CLASSES_COLLECTION), classWithTimestamp);
    return { id: docRef.id, ...classWithTimestamp };
  } catch (error) {
    console.error("Error adding class: ", error);
    throw error;
  }
};

// Get all classes
export const getAllClasses = async () => {
  try {
    const q = query(collection(db, CLASSES_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const classes = [];
    querySnapshot.forEach((doc) => {
      classes.push({ id: doc.id, ...doc.data() });
    });
    return classes;
  } catch (error) {
    console.error("Error getting all classes: ", error);
    return [];
  }
};

// Get active classes only
export const getActiveClasses = async () => {
  try {
    const q = query(
      collection(db, CLASSES_COLLECTION), 
      where('isActive', '==', true), 
      orderBy('className', 'asc')
    );
    const querySnapshot = await getDocs(q);
    const classes = [];
    querySnapshot.forEach((doc) => {
      classes.push({ id: doc.id, ...doc.data() });
    });
    return classes;
  } catch (error) {
    console.error("Error getting active classes: ", error);
    // Fallback: get all and filter
    const allClasses = await getAllClasses();
    return allClasses.filter(c => c.isActive === true);
  }
};

// Get single class by ID
export const getClassById = async (classId) => {
  try {
    const docRef = doc(db, CLASSES_COLLECTION, classId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("Error getting class: ", error);
    throw error;
  }
};

// Update class
export const updateClass = async (classId, classData) => {
  try {
    const updateData = {
      ...classData,
      updatedAt: new Date().toISOString()
    };
    
    const docRef = doc(db, CLASSES_COLLECTION, classId);
    await updateDoc(docRef, updateData);
    return { id: classId, ...updateData };
  } catch (error) {
    console.error("Error updating class: ", error);
    throw error;
  }
};

// Delete class
export const deleteClass = async (classId) => {
  try {
    const docRef = doc(db, CLASSES_COLLECTION, classId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error deleting class: ", error);
    throw error;
  }
};

// Toggle class status (Active/Inactive)
export const toggleClassStatus = async (classId, currentStatus) => {
  try {
    const newIsActive = currentStatus === 'Active' ? false : true;
    const newStatus = newIsActive ? 'Active' : 'Inactive';
    const docRef = doc(db, CLASSES_COLLECTION, classId);
    await updateDoc(docRef, { 
      isActive: newIsActive,
      status: newStatus,
      updatedAt: new Date().toISOString()
    });
    return newStatus;
  } catch (error) {
    console.error("Error toggling class status: ", error);
    throw error;
  }
};

// Update course count for a class
export const updateClassCourseCount = async (classId, increment) => {
  try {
    const docRef = doc(db, CLASSES_COLLECTION, classId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const currentCount = docSnap.data().courseCount || 0;
      await updateDoc(docRef, { 
        courseCount: currentCount + increment,
        updatedAt: new Date().toISOString()
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error updating class course count: ", error);
    return false;
  }
};

// Get class statistics
export const getClassStatistics = async () => {
  try {
    const allClasses = await getAllClasses();
    const activeClasses = allClasses.filter(c => c.isActive === true);
    const inactiveClasses = allClasses.filter(c => c.isActive === false);
    
    return {
      totalClasses: allClasses.length,
      activeClasses: activeClasses.length,
      inactiveClasses: inactiveClasses.length
    };
  } catch (error) {
    console.error("Error getting class statistics: ", error);
    return {
      totalClasses: 0,
      activeClasses: 0,
      inactiveClasses: 0
    };
  }
};

// Bulk delete classes
export const bulkDeleteClasses = async (classIds) => {
  try {
    const promises = classIds.map(async (classId) => {
      const docRef = doc(db, CLASSES_COLLECTION, classId);
      await deleteDoc(docRef);
    });
    await Promise.all(promises);
    return true;
  } catch (error) {
    console.error("Error bulk deleting classes: ", error);
    throw error;
  }
};

// Bulk update class status
export const bulkUpdateClassStatus = async (classIds, isActive) => {
  try {
    const promises = classIds.map(async (classId) => {
      const docRef = doc(db, CLASSES_COLLECTION, classId);
      await updateDoc(docRef, { 
        isActive: isActive,
        status: isActive ? 'Active' : 'Inactive',
        updatedAt: new Date().toISOString()
      });
    });
    await Promise.all(promises);
    return true;
  } catch (error) {
    console.error("Error bulk updating class status: ", error);
    throw error;
  }
};