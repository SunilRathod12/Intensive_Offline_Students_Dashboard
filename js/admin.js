document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const loginPage = document.getElementById('login-page');
    const dashboardContent = document.getElementById('dashboard-content');
    const loginForm = document.getElementById('login-form');
    const adminPasswordInput = document.getElementById('admin-password');
    const loginError = document.getElementById('login-error');
    const logoutBtn = document.getElementById('logout-btn');
    const csvFileInput = document.getElementById('csv-file-input');
    const uploadCsvBtn = document.getElementById('upload-csv-btn');
    const uploadBtnText = document.getElementById('upload-btn-text');
    const uploadBtnLoading = document.getElementById('upload-btn-loading');
    const uploadStatus = document.getElementById('upload-status');

    // Initialization
    checkAuth();

    // Event Listeners
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    if (csvFileInput) {
        csvFileInput.addEventListener('change', () => {
            if (csvFileInput.files.length > 0) {
                uploadCsvBtn.removeAttribute('disabled');
            } else {
                uploadCsvBtn.setAttribute('disabled', 'true');
            }
        });
    }

    if (uploadCsvBtn) {
        uploadCsvBtn.addEventListener('click', handleCsvUpload);
    }

    // Functions
    function checkAuth() {
        if (AuthManager.isAuthenticated()) {
            showDashboard();
        } else {
            showLogin();
        }
    }

    function showDashboard() {
        loginPage.style.display = 'none';
        dashboardContent.style.display = 'block';

        // Initialize Dashboard if StudentDashboard class is available
        if (typeof StudentDashboard !== 'undefined') {
            // Assuming StudentDashboard is initialized in app.js or specific page script.
            // For Admin page, we might need to load stats.
            // app.js seems to be designed for individual student page based on generate.js template?
            // But index.html also loads app.js. 
            // Let's check app.js content to see if it handles admin dashboard.
            // For now, we trust app.js will pick up.
            new StudentDashboard();
        }
    }

    function showLogin() {
        loginPage.style.display = 'flex';
        dashboardContent.style.display = 'none';
        if (loginForm) loginForm.reset();
        if (loginError) loginError.style.display = 'none';
    }

    function handleLogin(e) {
        e.preventDefault();
        const password = adminPasswordInput.value;

        if (AuthManager.login(password)) {
            showDashboard();
        } else {
            showError('Invalid password');
        }
    }

    function handleLogout() {
        AuthManager.logout();
        showLogin();
    }

    function showError(message) {
        if (loginError) {
            loginError.textContent = message;
            loginError.style.display = 'block';
        }
    }

    async function handleCsvUpload() {
        const file = csvFileInput.files[0];
        if (!file) return;

        setUploading(true);
        uploadStatus.textContent = '';
        uploadStatus.className = 'mt-2';

        try {
            const text = await readFileAsText(file);
            const response = await fetch('/api/upload-csv', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ csv: text })
            });

            const result = await response.json();

            if (result.success) {
                uploadStatus.textContent = 'Upload and regeneration successful!';
                uploadStatus.className = 'mt-2 text-success';
                csvFileInput.value = '';
                uploadCsvBtn.setAttribute('disabled', 'true');
                // Optionally reload to update stats
                setTimeout(() => location.reload(), 1500);
            } else {
                throw new Error(result.message || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload Error:', error);
            uploadStatus.textContent = 'Error: ' + error.message;
            uploadStatus.className = 'mt-2 text-danger';
        } finally {
            setUploading(false);
        }
    }

    function setUploading(isUploading) {
        if (isUploading) {
            uploadCsvBtn.setAttribute('disabled', 'true');
            uploadBtnText.style.display = 'none';
            uploadBtnLoading.style.display = 'inline-block';
        } else {
            // Only enable if file selected, otherwise keep off?
            // Actually usually we keep disabled until file change.
            if (csvFileInput.files.length > 0) {
                uploadCsvBtn.removeAttribute('disabled');
            }
            uploadBtnText.style.display = 'inline';
            uploadBtnLoading.style.display = 'none';
        }
    }

    function readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    }
});
