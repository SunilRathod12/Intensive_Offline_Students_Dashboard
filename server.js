const http = require('http');
const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

const PORT = 3000;

// MIME types for serving static files
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.csv': 'text/csv'
};

// Generate student HTML template
const generateStudentTemplate = (studentData) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${studentData.Name} - Performance Profile</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../css/styles.css">
</head>
<body>
    <div class="container py-4">
        <div class="contact-header">
            <h2>${studentData.Name}</h2>
            <p>${studentData.Mobile} • ${studentData.Email}</p>
        </div>

        <div class="d-flex justify-content-center mb-4">
            <div class="exam-type-tabs">
                <button class="btn active" data-exam-type="all">All</button>
                <button class="btn" data-exam-type="weekly">Weekly</button>
                <button class="btn" data-exam-type="fortnight">Fortnight</button>
            </div>
        </div>

        <div class="charts-section">
            <div class="chart-container">
                <div class="chart-title">Overall Score</div>
                <canvas id="overallScoreChart"></canvas>
            </div>
            <div class="chart-container">
                <div class="chart-title">Communication Rating</div>
                <canvas id="communicationRatingChart"></canvas>
            </div>
        </div>

        <div class="detailed-table">
            <table class="table">
                <thead>
                    <tr>
                        <th>Week</th>
                        <th>Type</th>
                        <th>Communication</th>
                        <th>MCQ</th>
                        <th>Coding</th>
                        <th>Assignment</th>
                        <th>Visual %</th>
                        <th>Overall</th>
                    </tr>
                </thead>
                <tbody id="student-exams-table-body">
                </tbody>
            </table>
        </div>

        <div class="row g-3">
            <div class="col-md-6">
                <div class="summary-card">
                    <h5>Score Summary</h5>
                    <div class="summary-item">
                        <span>Weekly Total</span>
                        <span id="weekly-total">--</span>
                    </div>
                    <div class="summary-item">
                        <span>Fortnight Total</span>
                        <span id="fortnight-total">--</span>
                    </div>
                    <div class="summary-item">
                        <span>Combined Total</span>
                        <span id="combined-total">--</span>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="summary-card">
                    <h5>Performance Trend</h5>
                    <p id="student-trend" class="trend-text">--</p>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js"></script>
    <script src="../js/utils.js"></script>
    <script src="../js/charts.js"></script>
    <script src="../js/app.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const studentDashboard = new StudentDashboard();
        });
    </script>
</body>
</html>`;
};

// Delete all existing student-*.html files
function deleteOldStudentFiles() {
    const studentsDir = path.join(__dirname, 'students');

    if (!fs.existsSync(studentsDir)) {
        fs.mkdirSync(studentsDir);
        return [];
    }

    const files = fs.readdirSync(studentsDir);
    const deletedFiles = [];

    files.forEach(file => {
        if (file.startsWith('student-') && file.endsWith('.html') && file !== 'student.html') {
            const filePath = path.join(studentsDir, file);
            fs.unlinkSync(filePath);
            deletedFiles.push(file);
        }
    });

    return deletedFiles;
}

// Generate new student files from CSV data
function generateStudentFiles(csvContent) {
    const parsed = Papa.parse(csvContent, { header: false }).data;
    const studentDataRows = parsed.slice(2).filter(row => row[0] && row[0] !== 'NOT_ATTEMPTED');

    const generatedFiles = [];
    const studentsDir = path.join(__dirname, 'students');

    if (!fs.existsSync(studentsDir)) {
        fs.mkdirSync(studentsDir);
    }

    studentDataRows.forEach((row) => {
        const studentData = {
            Name: row[0],
            Mobile: row[1],
            Email: row[2]
        };

        if (studentData.Name) {
            const sanitizedName = studentData.Name.toLowerCase()
                .replace(/[^a-z0-9]/g, '-')
                .replace(/-+/g, '-');

            const fileName = `student-${sanitizedName}.html`;
            const studentHTML = generateStudentTemplate(studentData);
            fs.writeFileSync(path.join(studentsDir, fileName), studentHTML);
            generatedFiles.push(fileName);
        }
    });

    return generatedFiles;
}

// Handle API requests
function handleAPI(req, res, body) {
    if (req.url === '/api/upload-csv' && req.method === 'POST') {
        try {
            const data = JSON.parse(body);
            const csvContent = data.csv;

            // Save to data.csv
            fs.writeFileSync(path.join(__dirname, 'data.csv'), csvContent);

            // Delete old student files
            const deletedFiles = deleteOldStudentFiles();

            // Generate new student files
            const generatedFiles = generateStudentFiles(csvContent);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                message: 'CSV uploaded and student files regenerated',
                deletedFiles: deletedFiles,
                generatedFiles: generatedFiles
            }));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                message: error.message
            }));
        }
    } else if (req.url === '/api/regenerate' && req.method === 'POST') {
        try {
            // Read existing data.csv
            const csvContent = fs.readFileSync(path.join(__dirname, 'data.csv'), 'utf8');

            // Delete old student files
            const deletedFiles = deleteOldStudentFiles();

            // Generate new student files
            const generatedFiles = generateStudentFiles(csvContent);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                message: 'Student files regenerated from data.csv',
                deletedFiles: deletedFiles,
                generatedFiles: generatedFiles
            }));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                message: error.message
            }));
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
    }
}

// Serve static files
function serveStaticFile(req, res) {
    let filePath = req.url === '/' ? '/index.html' : req.url;

    // Remove query string
    filePath = filePath.split('?')[0];

    const fullPath = path.join(__dirname, filePath);
    const ext = path.extname(fullPath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(fullPath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT' || err.code === 'EISDIR') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - File Not Found</h1>');
            } else {
                console.error(`Error serving file ${fullPath}:`, err);
                res.writeHead(500);
                res.end('Server Error: ' + err.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
}

// Create server
const server = http.createServer((req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Check if it's an API request
    if (req.url.startsWith('/api/')) {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            handleAPI(req, res, body);
        });
    } else {
        serveStaticFile(req, res);
    }
});

server.listen(PORT, () => {
    console.log('');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║     STUDENT DASHBOARD SERVER RUNNING                       ║');
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log(`║  🌐 Dashboard: http://localhost:${PORT}                       ║`);
    console.log('║  📤 Upload CSV to auto-regenerate student files            ║');
    console.log('║      Press Ctrl+C to stop the server                       ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('');
});
