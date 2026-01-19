const fs = require('fs');
const Papa = require('papaparse');
const path = require('path');

const generateStudentTemplate = (studentData) => {
    const sanitizedName = studentData.Name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');

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

const csvFilePath = 'data.csv';

fs.readFile(csvFilePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading CSV file:', err);
        return;
    }

    // Parse CSV without header to handle multi-line headers
    const parsed = Papa.parse(data, { header: false }).data;
    const studentDataRows = parsed.slice(2).filter(row => row[0] && row[0] !== 'NOT_ATTEMPTED'); // Skip header rows and filter empty rows

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
            
            const studentHTML = generateStudentTemplate(studentData);
            fs.writeFileSync(`students/student-${sanitizedName}.html`, studentHTML);
            console.log(`Generated: student-${sanitizedName}.html`);
        }
    });
    
    console.log('Student pages generated successfully!');
});