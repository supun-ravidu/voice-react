import { db, auth, createUserWithEmailAndPassword } from './config';
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
  orderBy
} from 'firebase/firestore';

const USERS_COLLECTION = 'users';

// Add a new user with Firebase Authentication
export const addUser = async (userData) => {
  try {
    // Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      userData.email, 
      userData.password
    );
    
    // Store additional user data in Firestore
    const userWithTimestamp = {
      uid: userCredential.user.uid,
      username: userData.username,
      email: userData.email,
      classId: userData.classId || null,
      className: userData.className || null,
      role: userData.role || 'student',
      status: 'active',
      enrolledCourses: userData.enrolledCourses || [],
      enrolledLiveClasses: userData.enrolledLiveClasses || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: null,
      profilePicture: userData.profilePicture || null
    };
    
    const docRef = await addDoc(collection(db, USERS_COLLECTION), userWithTimestamp);
    return { id: docRef.id, ...userWithTimestamp };
  } catch (error) {
    console.error("Error adding user: ", error);
    throw error;
  }
};

// Get all users
export const getAllUsers = async () => {
  try {
    const q = query(collection(db, USERS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    return users;
  } catch (error) {
    console.error("Error getting users: ", error);
    return [];
  }
};

// Get users by class
export const getUsersByClass = async (classId) => {
  try {
    const q = query(
      collection(db, USERS_COLLECTION),
      where('classId', '==', classId),
      orderBy('username', 'asc')
    );
    const querySnapshot = await getDocs(q);
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    return users;
  } catch (error) {
    console.error("Error getting users by class: ", error);
    return [];
  }
};

// Get users by role
export const getUsersByRole = async (role) => {
  try {
    const q = query(
      collection(db, USERS_COLLECTION),
      where('role', '==', role),
      orderBy('username', 'asc')
    );
    const querySnapshot = await getDocs(q);
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    return users;
  } catch (error) {
    console.error("Error getting users by role: ", error);
    return [];
  }
};

// Get single user by ID
export const getUserById = async (userId) => {
  try {
    const docRef = doc(db, USERS_COLLECTION, userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("Error getting user: ", error);
    throw error;
  }
};

// Get user by UID
export const getUserByUid = async (uid) => {
  try {
    const q = query(collection(db, USERS_COLLECTION), where('uid', '==', uid));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    return null;
  } catch (error) {
    console.error("Error getting user by UID: ", error);
    throw error;
  }
};

// Update user
export const updateUser = async (userId, userData) => {
  try {
    const updateData = {
      ...userData,
      updatedAt: new Date().toISOString()
    };
    
    const docRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(docRef, updateData);
    return { id: userId, ...updateData };
  } catch (error) {
    console.error("Error updating user: ", error);
    throw error;
  }
};

// Delete user
export const deleteUser = async (userId) => {
  try {
    const docRef = doc(db, USERS_COLLECTION, userId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error deleting user: ", error);
    throw error;
  }
};

// Update user status (active/inactive)
export const toggleUserStatus = async (userId, currentStatus) => {
  try {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const docRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(docRef, { 
      status: newStatus,
      updatedAt: new Date().toISOString()
    });
    return newStatus;
  } catch (error) {
    console.error("Error toggling user status: ", error);
    throw error;
  }
};

// Enroll user in a course
export const enrollUserInCourse = async (userId, courseId, courseTitle) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const currentEnrolled = userSnap.data().enrolledCourses || [];
      if (!currentEnrolled.some(c => c.courseId === courseId)) {
        currentEnrolled.push({
          courseId,
          courseTitle,
          enrolledAt: new Date().toISOString(),
          progress: 0
        });
        await updateDoc(userRef, { 
          enrolledCourses: currentEnrolled,
          updatedAt: new Date().toISOString()
        });
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error("Error enrolling user in course: ", error);
    throw error;
  }
};

// Get user statistics
export const getUserStatistics = async () => {
  try {
    const allUsers = await getAllUsers();
    const activeUsers = allUsers.filter(u => u.status === 'active');
    const inactiveUsers = allUsers.filter(u => u.status === 'inactive');
    const adminUsers = allUsers.filter(u => u.role === 'admin');
    const studentUsers = allUsers.filter(u => u.role === 'student');
    const instructorUsers = allUsers.filter(u => u.role === 'instructor');
    
    // Count by class
    const usersByClass = {};
    allUsers.forEach(user => {
      const className = user.className || 'Unassigned';
      if (!usersByClass[className]) {
        usersByClass[className] = 0;
      }
      usersByClass[className]++;
    });
    
    return {
      totalUsers: allUsers.length,
      activeUsers: activeUsers.length,
      inactiveUsers: inactiveUsers.length,
      adminUsers: adminUsers.length,
      studentUsers: studentUsers.length,
      instructorUsers: instructorUsers.length,
      usersByClass
    };
  } catch (error) {
    console.error("Error getting user statistics: ", error);
    return {
      totalUsers: 0,
      activeUsers: 0,
      inactiveUsers: 0,
      adminUsers: 0,
      studentUsers: 0,
      instructorUsers: 0,
      usersByClass: {}
    };
  }
};

// Bulk delete users
export const bulkDeleteUsers = async (userIds) => {
  try {
    const promises = userIds.map(async (userId) => {
      const docRef = doc(db, USERS_COLLECTION, userId);
      await deleteDoc(docRef);
    });
    await Promise.all(promises);
    return true;
  } catch (error) {
    console.error("Error bulk deleting users: ", error);
    throw error;
  }
};