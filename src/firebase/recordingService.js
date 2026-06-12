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

const RECORDINGS_COLLECTION = 'recordings';

// Add a new recording
export const addRecording = async (recordingData) => {
  try {
    const recordingWithTimestamp = {
      ...recordingData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      plays: 0,
      isActive: true,
      duration: recordingData.duration || '00:00'
    };
    
    const docRef = await addDoc(collection(db, RECORDINGS_COLLECTION), recordingWithTimestamp);
    return { id: docRef.id, ...recordingWithTimestamp };
  } catch (error) {
    console.error("Error adding recording: ", error);
    throw error;
  }
};

// Get all recordings
export const getAllRecordings = async () => {
  try {
    const q = query(collection(db, RECORDINGS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const recordings = [];
    querySnapshot.forEach((doc) => {
      recordings.push({ id: doc.id, ...doc.data() });
    });
    return recordings;
  } catch (error) {
    console.error("Error getting recordings: ", error);
    return [];
  }
};

// Get recordings by class
export const getRecordingsByClass = async (classId) => {
  try {
    const q = query(
      collection(db, RECORDINGS_COLLECTION),
      where('classId', '==', classId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const recordings = [];
    querySnapshot.forEach((doc) => {
      recordings.push({ id: doc.id, ...doc.data() });
    });
    return recordings;
  } catch (error) {
    console.error("Error getting recordings by class: ", error);
    const allRecordings = await getAllRecordings();
    return allRecordings.filter(r => r.classId === classId);
  }
};

// Get recordings by course
export const getRecordingsByCourse = async (courseId) => {
  try {
    const q = query(
      collection(db, RECORDINGS_COLLECTION),
      where('courseId', '==', courseId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const recordings = [];
    querySnapshot.forEach((doc) => {
      recordings.push({ id: doc.id, ...doc.data() });
    });
    return recordings;
  } catch (error) {
    console.error("Error getting recordings by course: ", error);
    const allRecordings = await getAllRecordings();
    return allRecordings.filter(r => r.courseId === courseId);
  }
};

// Get single recording by ID
export const getRecordingById = async (recordingId) => {
  try {
    const docRef = doc(db, RECORDINGS_COLLECTION, recordingId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("Error getting recording: ", error);
    throw error;
  }
};

// Update recording
export const updateRecording = async (recordingId, recordingData) => {
  try {
    const updateData = {
      ...recordingData,
      updatedAt: new Date().toISOString()
    };
    
    const docRef = doc(db, RECORDINGS_COLLECTION, recordingId);
    await updateDoc(docRef, updateData);
    return { id: recordingId, ...updateData };
  } catch (error) {
    console.error("Error updating recording: ", error);
    throw error;
  }
};

// Delete recording
export const deleteRecording = async (recordingId) => {
  try {
    const docRef = doc(db, RECORDINGS_COLLECTION, recordingId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error deleting recording: ", error);
    throw error;
  }
};

// Increment play count
export const incrementRecordingPlays = async (recordingId) => {
  try {
    const docRef = doc(db, RECORDINGS_COLLECTION, recordingId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const currentPlays = docSnap.data().plays || 0;
      await updateDoc(docRef, { 
        plays: currentPlays + 1,
        updatedAt: new Date().toISOString()
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error incrementing plays: ", error);
    return false;
  }
};

// Get featured recordings
export const getFeaturedRecordings = async (limitCount = 6) => {
  try {
    const q = query(
      collection(db, RECORDINGS_COLLECTION),
      where('featured', '==', true),
      orderBy('plays', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    const recordings = [];
    querySnapshot.forEach((doc) => {
      recordings.push({ id: doc.id, ...doc.data() });
    });
    return recordings;
  } catch (error) {
    console.error("Error getting featured recordings: ", error);
    const allRecordings = await getAllRecordings();
    return allRecordings.filter(r => r.featured).slice(0, limitCount);
  }
};

// Get recording statistics
export const getRecordingStatistics = async () => {
  try {
    const allRecordings = await getAllRecordings();
    const totalPlays = allRecordings.reduce((sum, rec) => sum + (rec.plays || 0), 0);
    
    const recordingsByClass = {};
    allRecordings.forEach(rec => {
      const className = rec.className || 'Uncategorized';
      if (!recordingsByClass[className]) {
        recordingsByClass[className] = 0;
      }
      recordingsByClass[className]++;
    });
    
    return {
      totalRecordings: allRecordings.length,
      totalPlays,
      averagePlays: allRecordings.length ? (totalPlays / allRecordings.length).toFixed(1) : 0,
      recordingsByClass
    };
  } catch (error) {
    console.error("Error getting recording statistics: ", error);
    return {
      totalRecordings: 0,
      totalPlays: 0,
      averagePlays: 0,
      recordingsByClass: {}
    };
  }
};

// Bulk delete recordings
export const bulkDeleteRecordings = async (recordingIds) => {
  try {
    const promises = recordingIds.map(async (recordingId) => {
      const docRef = doc(db, RECORDINGS_COLLECTION, recordingId);
      await deleteDoc(docRef);
    });
    await Promise.all(promises);
    return true;
  } catch (error) {
    console.error("Error bulk deleting recordings: ", error);
    throw error;
  }
};