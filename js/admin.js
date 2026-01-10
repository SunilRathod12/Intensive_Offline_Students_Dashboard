// Admin functionality - Login, CSV Upload, etc.
document.addEventListener('DOMContentLoaded', () => {
  // Check authentication
  if (!AuthManager.isAuthenticated()) {
    showLoginPage();
  } else {
    showDashboard();
  }

  // Login form handler
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const password = document.getElementById('admin-password').value;
      const errorDiv = document.getElementById('login-error');
      
      if (AuthManager.login(password)) {
        showDashboard();
      } else {
        errorDiv.textContent = 'Invalid password. Please try again.';
        errorDiv.style.display = 'block';
        document.getElementById('admin-password').value = '';
        document.getElementById('admin-password').focus();
      }
    });
  }

  // Logout button handler
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      AuthManager.logout();
      showLoginPage();
    });
  }

  // CSV file input handler
  const csvFileInput = document.getElementById('csv-file-input');
  const uploadBtn = document.getElementById('upload-csv-btn');
  
  if (csvFileInput && uploadBtn) {
    csvFileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        uploadBtn.disabled = false;
      } else {
        uploadBtn.disabled = true;
      }
    });

    uploadBtn.addEventListener('click', handleCSVUpload);
  }
});

function showLoginPage() {
  document.getElementById('login-page').style.display = 'flex';
  document.getElementById('dashboard-content').style.display = 'none';
  document.getElementById('loading-skeleton').style.display = 'none';
}

function showDashboard() {
  document.getElementById('login-page').style.display = 'none';
  document.getElementById('loading-skeleton').style.display = 'block';
  document.getElementById('dashboard-content').style.display = 'none';
  
  // Initialize dashboard if not already initialized
  if (!window.studentDashboard) {
    window.studentDashboard = new StudentDashboard();
  } else {
    // If already initialized, just reload
    window.studentDashboard.init();
  }
}

async function handleCSVUpload() {
  const fileInput = document.getElementById('csv-file-input');
  const uploadBtn = document.getElementById('upload-csv-btn');
  const uploadBtnText = document.getElementById('upload-btn-text');
  const uploadBtnLoading = document.getElementById('upload-btn-loading');
  const uploadStatus = document.getElementById('upload-status');

  if (!fileInput.files || fileInput.files.length === 0) {
    uploadStatus.innerHTML = '<div class="alert alert-warning">Please select a CSV file first.</div>';
    return;
  }

  const file = fileInput.files[0];
  
  // Validate file type
  if (!file.name.endsWith('.csv')) {
    uploadStatus.innerHTML = '<div class="alert alert-danger">Please select a valid CSV file.</div>';
    return;
  }

  // Show loading state
  uploadBtn.disabled = true;
  uploadBtnText.style.display = 'none';
  uploadBtnLoading.style.display = 'inline-block';
  uploadStatus.innerHTML = '<div class="alert alert-info">📤 Uploading and processing CSV file...</div>';

  try {
    const fileContent = await readFileAsText(file);
    
    // Parse CSV to validate
    const parsed = Papa.parse(fileContent, { header: false });
    if (parsed.errors.length > 0) {
      throw new Error('Invalid CSV format: ' + parsed.errors[0].message);
    }

    // Save CSV to localStorage for the dashboard to use
    localStorage.setItem('csv_data', fileContent);
    
    // Trigger dashboard reload
    if (window.studentDashboard) {
      window.studentDashboard.parseExamsFromCSV(fileContent);
      window.studentDashboard.students = DataUtils.calculateRankings(window.studentDashboard.students);
      window.studentDashboard.filterAndSortStudents('', window.studentDashboard.sortKey);
      
      uploadStatus.innerHTML = '<div class="alert alert-success">✅ CSV uploaded successfully! Dashboard updated with ' + window.studentDashboard.students.length + ' students.</div>';
    } else {
      uploadStatus.innerHTML = '<div class="alert alert-warning">⚠️ Dashboard not initialized. Please refresh the page.</div>';
    }

    fileInput.value = '';
    uploadBtn.disabled = true;
    uploadBtnText.style.display = 'inline';
    uploadBtnLoading.style.display = 'none';

    // Clear status message after 5 seconds
    setTimeout(() => {
      uploadStatus.innerHTML = '';
    }, 5000);

  } catch (error) {
    console.error('Error uploading CSV:', error);
    uploadStatus.innerHTML = `<div class="alert alert-danger">❌ Error: ${error.message}</div>`;
    uploadBtn.disabled = false;
    uploadBtnText.style.display = 'inline';
    uploadBtnLoading.style.display = 'none';
  }
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
