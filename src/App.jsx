import { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import LiveClasses from './components/LiveClasses';
import FreeLiveClasses from './components/FreeLiveClasses';
import UserLogin from './components/UserLogin';
import UserDashboard from './components/UserDashboard';
import UserRecordings from './components/UserRecordings';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');

  const handleAdminLogin = () => {
    setIsAdminLoggedIn(true);
    setCurrentPage('admin');
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setCurrentPage('home');
  };

  const handleUserLogin = (userData) => {
    setIsUserLoggedIn(true);
    setCurrentUser(userData);
    setCurrentPage('user-dashboard');
  };

  const handleUserLogout = () => {
    setIsUserLoggedIn(false);
    setCurrentUser(null);
    setCurrentPage('home');
  };

  const handleNavigate = (page) => {
    if (page === 'user-login') {
      setCurrentPage('user-login');
    } else if (page === 'live-classes') {
      // If user is already logged in, go to dashboard, otherwise go to login
      if (isUserLoggedIn) {
        setCurrentPage('user-dashboard');
      } else {
        setCurrentPage('user-login');
      }
    } else if (page === 'free-classes') {
      // Free classes are public - no login required
      setCurrentPage('free-classes');
    } else if (page === 'recordings') {
      // Recordings require login
      if (isUserLoggedIn) {
        setCurrentPage('user-recordings');
      } else {
        setCurrentPage('user-login');
      }
    } else if (page === 'admin') {
      setCurrentPage('admin');
    } else if (page === 'home') {
      setCurrentPage('home');
    } else if (page === 'logout') {
      handleUserLogout();
    } else {
      setCurrentPage(page);
    }
  };

  // Admin routes
  if (currentPage === 'admin' && isAdminLoggedIn) {
    return <AdminDashboard onLogout={handleAdminLogout} />;
  }

  if (currentPage === 'admin') {
    return <AdminLogin onLogin={handleAdminLogin} onBack={() => setCurrentPage('home')} />;
  }

  // User routes
  if (currentPage === 'user-login') {
    return <UserLogin onLogin={handleUserLogin} onBackToHome={() => setCurrentPage('home')} />;
  }

  if (currentPage === 'user-dashboard' && isUserLoggedIn) {
    return <UserDashboard user={currentUser} onLogout={handleUserLogout} />;
  }

  if (currentPage === 'user-recordings' && isUserLoggedIn) {
    return (
      <>
        <Navbar onNavigate={handleNavigate} isUserLoggedIn={isUserLoggedIn} userName={currentUser?.username} />
        <UserRecordings user={currentUser} />
        <Footer />
      </>
    );
  }

  // Public live classes (requires login)
  if (currentPage === 'live-classes') {
    if (isUserLoggedIn) {
      return <UserDashboard user={currentUser} onLogout={handleUserLogout} />;
    } else {
      return <UserLogin onLogin={handleUserLogin} onBackToHome={() => setCurrentPage('home')} />;
    }
  }

  // Free Live Classes - Public access (no login required)
  if (currentPage === 'free-classes') {
    return (
      <>
        <Navbar onNavigate={handleNavigate} isUserLoggedIn={isUserLoggedIn} userName={currentUser?.username} />
        <FreeLiveClasses />
        <Footer />
      </>
    );
  }

  // Home page - Using the new HomePage component
  return (
    <>
      <Navbar onNavigate={handleNavigate} isUserLoggedIn={isUserLoggedIn} userName={currentUser?.username} />
      <HomePage />
      <Footer />
    </>
  );
}

export default App;