// Authentication system
class AuthManager {
  static ADMIN_PASSWORD = 'admin123'; // Default admin password
  static STORAGE_KEY = 'student_dashboard_auth';
  static SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

  static isAuthenticated() {
    const authData = localStorage.getItem(this.STORAGE_KEY);
    if (!authData) return false;

    try {
      const { timestamp } = JSON.parse(authData);
      const now = Date.now();
      if (now - timestamp > this.SESSION_TIMEOUT) {
        localStorage.removeItem(this.STORAGE_KEY);
        return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  static login(password) {
    console.log('Attempting login with password length:', password.length);
    if (password === this.ADMIN_PASSWORD) {
      console.log('Login successful');
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
        authenticated: true,
        timestamp: Date.now()
      }));
      return true;
    }
    console.log('Login failed: Incorrect password');
    return false;
  }

  static logout() {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  static requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = 'index.html';
      return false;
    }
    return true;
  }
}
