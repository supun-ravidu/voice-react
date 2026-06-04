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

const LIVE_CLASSES_COLLECTION = 'liveClasses';

// Add a new live class
export const addLiveClass = async (classData) => {
  try {
    const classWithTimestamp = {
      ...classData,
      title: classData.title || classData.className, // Ensure title is set
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: classData.status || 'upcoming',
      isActive: true,
      attendees: 0
    };
    
    const docRef = await addDoc(collection(db, LIVE_CLASSES_COLLECTION), classWithTimestamp);
    return { id: docRef.id, ...classWithTimestamp };
  } catch (error) {
    console.error("Error adding live class: ", error);
    throw error;
  }
};

// Get all live classes (for admin)
export const getAllLiveClasses = async () => {
  try {
    const q = query(collection(db, LIVE_CLASSES_COLLECTION), orderBy('classDate', 'desc'));
    const querySnapshot = await getDocs(q);
    const classes = [];
    querySnapshot.forEach((doc) => {
      classes.push({ id: doc.id, ...doc.data() });
    });
    return classes;
  } catch (error) {
    console.error("Error getting all live classes: ", error);
    return [];
  }
};

// Get upcoming live classes by class name
export const getUpcomingLiveClassesByClass = async (classId) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const q = query(
      collection(db, LIVE_CLASSES_COLLECTION),
      where('classId', '==', classId),
      where('status', '==', 'upcoming'),
      where('classDate', '>=', today),
      orderBy('classDate', 'asc')
    );
    const querySnapshot = await getDocs(q);
    const classes = [];
    querySnapshot.forEach((doc) => {
      classes.push({ id: doc.id, ...doc.data() });
    });
    return classes;
  } catch (error) {
    console.error("Error getting live classes by class: ", error);
    const allClasses = await getAllLiveClasses();
    const todayDate = new Date().toISOString().split('T')[0];
    return allClasses.filter(c => 
      c.classId === classId && 
      c.status === 'upcoming' && 
      c.classDate >= todayDate
    ).sort((a, b) => a.classDate.localeCompare(b.classDate));
  }
};

// Get upcoming live classes (for user dashboard)
export const getUpcomingLiveClasses = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const q = query(
      collection(db, LIVE_CLASSES_COLLECTION),
      where('status', '==', 'upcoming'),
      where('classDate', '>=', today),
      orderBy('classDate', 'asc')
    );
    const querySnapshot = await getDocs(q);
    const classes = [];
    querySnapshot.forEach((doc) => {
      classes.push({ id: doc.id, ...doc.data() });
    });
    return classes;
  } catch (error) {
    console.error("Error getting upcoming classes: ", error);
    const allClasses = await getAllLiveClasses();
    const todayDate = new Date().toISOString().split('T')[0];
    return allClasses.filter(c => 
      c.status === 'upcoming' && 
      c.classDate >= todayDate
    ).sort((a, b) => a.classDate.localeCompare(b.classDate));
  }
};

// Get live classes by class ID (all statuses)
export const getLiveClassesByClass = async (classId) => {
  try {
    const q = query(
      collection(db, LIVE_CLASSES_COLLECTION),
      where('classId', '==', classId),
      orderBy('classDate', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const classes = [];
    querySnapshot.forEach((doc) => {
      classes.push({ id: doc.id, ...doc.data() });
    });
    return classes;
  } catch (error) {
    console.error("Error getting live classes by class: ", error);
    return [];
  }
};

// Get limited upcoming live classes
export const getLimitedUpcomingLiveClasses = async (limitCount = 6) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const q = query(
      collection(db, LIVE_CLASSES_COLLECTION),
      where('status', '==', 'upcoming'),
      where('classDate', '>=', today),
      orderBy('classDate', 'asc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    const classes = [];
    querySnapshot.forEach((doc) => {
      classes.push({ id: doc.id, ...doc.data() });
    });
    return classes;
  } catch (error) {
    console.error("Error getting limited upcoming classes: ", error);
    const allUpcoming = await getUpcomingLiveClasses();
    return allUpcoming.slice(0, limitCount);
  }
};

// Get single live class by ID
export const getLiveClassById = async (classId) => {
  try {
    const docRef = doc(db, LIVE_CLASSES_COLLECTION, classId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting live class: ", error);
    throw error;
  }
};

// Update live class
export const updateLiveClass = async (classId, classData) => {
  try {
    const updateData = {
      ...classData,
      title: classData.title || classData.className,
      updatedAt: new Date().toISOString()
    };
    
    const docRef = doc(db, LIVE_CLASSES_COLLECTION, classId);
    await updateDoc(docRef, updateData);
    return { id: classId, ...updateData };
  } catch (error) {
    console.error("Error updating live class: ", error);
    throw error;
  }
};

// Delete live class
export const deleteLiveClass = async (classId) => {
  try {
    const docRef = doc(db, LIVE_CLASSES_COLLECTION, classId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error deleting live class: ", error);
    throw error;
  }
};

// Update class status (upcoming, ongoing, completed)
export const updateClassStatus = async (classId, status) => {
  try {
    const docRef = doc(db, LIVE_CLASSES_COLLECTION, classId);
    await updateDoc(docRef, { 
      status: status,
      updatedAt: new Date().toISOString()
    });
    return status;
  } catch (error) {
    console.error("Error updating class status: ", error);
    throw error;
  }
};

// Increment attendee count
export const incrementAttendees = async (classId) => {
  try {
    const docRef = doc(db, LIVE_CLASSES_COLLECTION, classId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const currentAttendees = docSnap.data().attendees || 0;
      await updateDoc(docRef, { 
        attendees: currentAttendees + 1,
        updatedAt: new Date().toISOString()
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error incrementing attendees: ", error);
    return false;
  }
};

// Get live classes by date range
export const getLiveClassesByDateRange = async (startDate, endDate) => {
  try {
    const q = query(
      collection(db, LIVE_CLASSES_COLLECTION),
      where('classDate', '>=', startDate),
      where('classDate', '<=', endDate),
      orderBy('classDate', 'asc')
    );
    const querySnapshot = await getDocs(q);
    const classes = [];
    querySnapshot.forEach((doc) => {
      classes.push({ id: doc.id, ...doc.data() });
    });
    return classes;
  } catch (error) {
    console.error("Error getting classes by date range: ", error);
    return [];
  }
};

// Get live classes by month
export const getLiveClassesByMonth = async (year, month) => {
  try {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
    return await getLiveClassesByDateRange(startDate, endDate);
  } catch (error) {
    console.error("Error getting classes by month: ", error);
    return [];
  }
};

// Get live classes statistics
export const getLiveClassesStatistics = async () => {
  try {
    const allClasses = await getAllLiveClasses();
    const upcomingClasses = allClasses.filter(c => c.status === 'upcoming');
    const ongoingClasses = allClasses.filter(c => c.status === 'ongoing');
    const completedClasses = allClasses.filter(c => c.status === 'completed');
    
    const totalAttendees = allClasses.reduce((sum, cls) => sum + (cls.attendees || 0), 0);
    
    const classesByClassName = {};
    allClasses.forEach(cls => {
      const className = cls.className || 'Uncategorized';
      if (!classesByClassName[className]) {
        classesByClassName[className] = 0;
      }
      classesByClassName[className]++;
    });
    
    return {
      totalClasses: allClasses.length,
      upcomingClasses: upcomingClasses.length,
      ongoingClasses: ongoingClasses.length,
      completedClasses: completedClasses.length,
      totalAttendees,
      classesByClassName
    };
  } catch (error) {
    console.error("Error getting live classes statistics: ", error);
    return {
      totalClasses: 0,
      upcomingClasses: 0,
      ongoingClasses: 0,
      completedClasses: 0,
      totalAttendees: 0,
      classesByClassName: {}
    };
  }
};

// Bulk delete live classes
export const bulkDeleteLiveClasses = async (classIds) => {
  try {
    const promises = classIds.map(async (classId) => {
      const docRef = doc(db, LIVE_CLASSES_COLLECTION, classId);
      await deleteDoc(docRef);
    });
    await Promise.all(promises);
    return true;
  } catch (error) {
    console.error("Error bulk deleting live classes: ", error);
    throw error;
  }
};

// Bulk update live classes status
export const bulkUpdateLiveClassesStatus = async (classIds, newStatus) => {
  try {
    const promises = classIds.map(async (classId) => {
      const docRef = doc(db, LIVE_CLASSES_COLLECTION, classId);
      await updateDoc(docRef, { 
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
    });
    await Promise.all(promises);
    return true;
  } catch (error) {
    console.error("Error bulk updating live classes status: ", error);
    throw error;
  }
};

// Search live classes by title or description
export const searchLiveClasses = async (searchTerm) => {
  try {
    const allClasses = await getAllLiveClasses();
    const term = searchTerm.toLowerCase();
    return allClasses.filter(cls => 
      cls.title?.toLowerCase().includes(term) ||
      cls.className?.toLowerCase().includes(term) ||
      cls.description?.toLowerCase().includes(term)
    );
  } catch (error) {
    console.error("Error searching live classes: ", error);
    return [];
  }
};

// Get live classes by status
export const getLiveClassesByStatus = async (status) => {
  try {
    const q = query(
      collection(db, LIVE_CLASSES_COLLECTION),
      where('status', '==', status),
      orderBy('classDate', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const classes = [];
    querySnapshot.forEach((doc) => {
      classes.push({ id: doc.id, ...doc.data() });
    });
    return classes;
  } catch (error) {
    console.error("Error getting live classes by status: ", error);
    const allClasses = await getAllLiveClasses();
    return allClasses.filter(cls => cls.status === status);
  }
};