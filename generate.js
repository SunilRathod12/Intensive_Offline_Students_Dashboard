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
    <title>Student Profile: ${studentData.Name}</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../css/styles.css">
</head>
<body>
    <div class="container mt-5">
        <div class="contact-header text-center mb-4 p-3 rounded shadow-sm">
            <h2>${studentData.Name}</h2>
            <p>📱 ${studentData.Mobile} | ✉ ${studentData.Email} | Rank #<span id="student-rank"></span></p>
        </div>

        <div class="exam-type-tabs d-flex justify-content-center gap-2 mb-4">
            <button class="btn btn-success active" data-exam-type="weekly">🟢 Weekly</button>
            <button class="btn btn-secondary" data-exam-type="fortnight">🟣 Fortnight</button>
            <button class="btn btn-primary" data-exam-type="all">📊 All</button>
        </div>

        <div class="charts-section mb-4">
            <div class="chart-container">
                <div class="chart-title">📊 Overall Score Performance</div>
                <canvas id="overallScoreChart"></canvas>
            </div>
            <div class="chart-container">
                <div class="chart-title">💬 Communication Rating Trend</div>
                <canvas id="communicationRatingChart"></canvas>
            </div>
        </div>

        <div class="detailed-table mb-4">
            <table class="table table-striped table-hover">
                <thead>
                    <tr>
                        <th>Week</th>
                        <th>Type</th>
                        <th>Communication</th>
                        <th>MCQ</th>
                        <th>Coding</th>
                        <th>Assignment</th>
                        <th>Visual</th>
                        <th>Overall</th>
                    </tr>
                </thead>
                <tbody id="student-exams-table-body">
                    <!-- Exam data will be rendered here -->
                </tbody>
            </table>
        </div>

        <div class="totals-breakdown mb-4 p-3 rounded shadow-sm">
            <h5>Totals Breakdown</h5>
            <p>Weekly Only: <span id="weekly-total"></span></p>
            <p>Fortnight Only: <span id="fortnight-total"></span></p>
            <p>Combined: <span id="combined-total"></span></p>
        </div>

        <div class="trend-analysis mb-4 p-3 rounded shadow-sm">
            <h5>Trend Analysis</h5>
            <p id="student-trend"></p>
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