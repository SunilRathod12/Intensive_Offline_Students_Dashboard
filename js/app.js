// 🔥 DYNAMIC EXAM PARSING
class StudentDashboard {
  constructor() {
    this.students = [];
    this.weeks = [];
    this.filteredStudents = [];
    this.sortKey = 'overall-best-desc'; // Default sort
    this.init();
  }

  async init() {
    try {
      // Check authentication for dashboard (not for student pages)
      if (document.getElementById('dashboard-content') && typeof AuthManager !== 'undefined') {
        if (!AuthManager.isAuthenticated()) {
          return; // Don't load data, admin.js will handle login
        }
        // Show loading skeleton while loading
        if (document.getElementById('loading-skeleton')) {
          document.getElementById('loading-skeleton').style.display = 'block';
        }
      }

      await this.loadCSV();
      this.students = DataUtils.calculateRankings(this.students); // Calculate rankings after loading data
      if (document.getElementById('dashboard-content')) {
        this.setupMainDashboardListeners();
        this.filterAndSortStudents('', this.sortKey); // Initial render with all students, sorted
      } else {
        this.renderStudentProfileFromURL();
      }
    } catch (error) {
      console.error('Error initializing dashboard:', error);
      if (document.getElementById('loading-skeleton')) {
        document.getElementById('loading-skeleton').style.display = 'none';
      }
    }
  }

  async loadCSV() {
    try {
      // Check for uploaded CSV in localStorage first
      const uploadedCSV = localStorage.getItem('csv_data');
      if (uploadedCSV && document.getElementById('dashboard-content')) {
        this.parseExamsFromCSV(uploadedCSV);
        return;
      }

      const response = await fetch(document.getElementById('dashboard-content') ? 'data.csv' : '../data.csv'); // Adjusted path for student pages
      const csv = await response.text();
      this.parseExamsFromCSV(csv);
    } catch (error) {
      console.error('Error loading CSV:', error);
      // Hide loading skeleton even on error
      if (document.getElementById('loading-skeleton')) {
        document.getElementById('loading-skeleton').style.display = 'none';
      }
      if (document.getElementById('dashboard-content')) {
        document.getElementById('dashboard-content').style.display = 'block';
        document.getElementById('student-cards').innerHTML = '<div class="col-12"><p class="text-danger">Error loading data. Please check the console.</p></div>';
      }
    }
  }

  loadCSVFromString(csvString) {
    localStorage.setItem('csv_data', csvString);
    this.parseExamsFromCSV(csvString);
    return Promise.resolve();
  }

  parseExamsFromCSV(csvString) {
    const parsed = Papa.parse(csvString, { header: false }).data;
    this.parseExams(parsed);
  }

  parseExams(data) {
    try {
      const headerRow1 = data[0];
      const studentDataRows = data.slice(2).filter(row => row[0] && row[0] !== 'NOT_ATTEMPTED'); // Filter out empty rows and NOT_ATTEMPTED

      let examColumnInfo = []; // This will store the type, week, and the starting column index for actual data

      // Find week positions from headerRow1 (week-1, week-2, week-3)
      const weekPositions = [];
      for (let i = 0; i < headerRow1.length; i++) {
          const cell = headerRow1[i];
          if (cell && cell.includes('week-')) {
              const weekMatch = cell.match(/week-(\d+)/);
              if (weekMatch) {
                  const weekNum = parseInt(weekMatch[1]);
                  // Determine exam type: odd weeks = weekly, even weeks = fortnight
                  const examType = weekNum % 2 === 1 ? 'weekly' : 'fortnight';
                  weekPositions.push({ 
                      week: weekNum, 
                      startCol: i, 
                      type: examType 
                  });
              }
          }
      }

      // Each week block has 6 columns: Comm Rating, MCQs, Coding, Assignment, Visual%, Overall
      // Data columns are at: startCol (Comm), startCol+1 (MCQ), startCol+2 (Coding), startCol+3 (Assignment), startCol+4 (Visual), startCol+5 (Overall)
      weekPositions.forEach(weekInfo => {
          examColumnInfo.push({
              type: weekInfo.type,
              week: `W${weekInfo.week}`,
              startDataCol: weekInfo.startCol
          });
      });

      console.log('Exam column info:', examColumnInfo);
      console.log('Student data rows count:', studentDataRows.length);

      this.students = studentDataRows.map(row => {
          const student = { exams: [] };
          student.Name = row[0];
          student.Mobile = row[1];
          student.Email = row[2];

          examColumnInfo.forEach(examInfo => {
              const exam = {};
              exam.type = examInfo.type;
              exam.week = examInfo.week;
              
              // Handle NOT_ATTEMPTED values
              // CSV order: Comm Rating, MCQs, Coding, Assignment, Visual%, Overall
              const commVal = row[examInfo.startDataCol];
              const mcqVal = row[examInfo.startDataCol + 1];
              const codingVal = row[examInfo.startDataCol + 2];
              const assignVal = row[examInfo.startDataCol + 3];
              const visualVal = row[examInfo.startDataCol + 4];
              const overallVal = row[examInfo.startDataCol + 5];
              
              exam.comm = (commVal && commVal !== 'NOT_ATTEMPTED') ? parseInt(commVal) || 0 : 0;
              exam.mcq = (mcqVal && mcqVal !== 'NOT_ATTEMPTED') ? parseInt(mcqVal) || 0 : 0;
              exam.coding = (codingVal && codingVal !== 'NOT_ATTEMPTED') ? parseInt(codingVal) || 0 : 0;
              exam.assignment = (assignVal && assignVal !== 'NOT_ATTEMPTED') ? parseInt(assignVal) || 0 : 0;
              exam.visual = (visualVal && visualVal !== 'NOT_ATTEMPTED') ? parseInt(visualVal) || 0 : 0;
              exam.overall = (overallVal && overallVal !== 'NOT_ATTEMPTED') ? parseInt(overallVal) || 0 : 0;
              
              student.exams.push(exam);
          });
          return student;
      });

      console.log('Parsed students:', this.students);
    } catch (error) {
      console.error('Error parsing exams:', error);
      throw error;
    }
  }

  setupMainDashboardListeners() {
    document.getElementById('search-input').addEventListener('input', (e) => {
      this.filterAndSortStudents(e.target.value, this.sortKey);
    });
    document.getElementById('sort-select').addEventListener('change', (e) => {
      this.sortKey = e.target.value;
      this.filterAndSortStudents(document.getElementById('search-input').value, this.sortKey);
    });
  }

  filterAndSortStudents(searchTerm, sortKey) {
    let tempStudents = [...this.students];

    // Filter
    if (searchTerm) {
      tempStudents = tempStudents.filter(student => 
        student.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.exams.some(exam => 
          exam.overall.toString().includes(searchTerm) ||
          (exam.type === 'weekly' && searchTerm.toLowerCase().includes('weekly')) ||
          (exam.type === 'fortnight' && searchTerm.toLowerCase().includes('fortnight'))
        )
      );
    }

    // Sort
    tempStudents.sort((a, b) => {
      switch (sortKey) {
        case 'name-asc': return a.Name.localeCompare(b.Name);
        case 'name-desc': return b.Name.localeCompare(a.Name);
        case 'overall-best-desc': return DataUtils.calculateOverallBest(b) - DataUtils.calculateOverallBest(a);
        case 'overall-best-asc': return DataUtils.calculateOverallBest(a) - DataUtils.calculateOverallBest(b);
        case 'weekly-best-desc': return DataUtils.calculateWeeklyBest(b) - DataUtils.calculateWeeklyBest(a);
        case 'weekly-best-asc': return DataUtils.calculateWeeklyBest(a) - DataUtils.calculateWeeklyBest(b);
        case 'fortnight-best-desc': return DataUtils.calculateFortnightBest(b) - DataUtils.calculateFortnightBest(a);
        case 'fortnight-best-asc': return DataUtils.calculateFortnightBest(a) - DataUtils.calculateFortnightBest(b);
        default: return 0;
      }
    });

    this.filteredStudents = tempStudents;
    this.renderMainDashboard(true); // Re-render with filtered/sorted data
  }

  renderMainDashboard(isFiltered = false) {
    // Always hide skeleton and show dashboard on first render
    if (document.getElementById('loading-skeleton') && document.getElementById('loading-skeleton').style.display !== 'none') {
        document.getElementById('loading-skeleton').style.display = 'none';
        document.getElementById('dashboard-content').style.display = 'block';
    }

    const studentCardsContainer = document.getElementById('student-cards');
    studentCardsContainer.innerHTML = ''; // Clear previous cards

    const studentsToRender = isFiltered ? this.filteredStudents : this.students;
    
    console.log('Rendering students, count:', studentsToRender.length);

    studentsToRender.forEach(student => {
        const studentCard = document.createElement('div');
        studentCard.classList.add('col-12', 'col-md-6', 'col-lg-4', 'mb-4');
        
        const weeklyScores = student.exams.filter(e => e.type === 'weekly').map(e => e.overall);
        const fortnightScores = student.exams.filter(e => e.type === 'fortnight').map(e => e.overall);
        const bestOverall = DataUtils.calculateOverallBest(student);
        const trend = DataUtils.analyzeTrend(student);
        const trendIcon = trend === 'Improving' ? '📈' : trend === 'Declining' ? '📉' : '➡️';
        
        studentCard.innerHTML = `
            <div class="card h-100">
                <div class="card-body">
                    <h5 class="card-title">${student.Name} <span class="rank-badge">#${student.rank}</span></h5>
                    <p class="card-text"><span class="score-pill weekly">Weekly</span> ${weeklyScores.join(' • ') || 'N/A'}</p>
                    <p class="card-text"><span class="score-pill fortnight">Fortnight</span> ${fortnightScores.join(' • ') || 'N/A'}</p>
                    <p class="card-text"><strong>Best Score:</strong> ${bestOverall}/180 &nbsp;${trendIcon} ${trend}</p>
                    <p class="card-text">📱 ${student.Mobile}</p>
                    <a href="students/student-${student.Name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')}.html" class="btn btn-primary btn-sm mt-2">View Profile →</a>
                </div>
            </div>
        `;
        studentCardsContainer.appendChild(studentCard);
    });

    // Update stats header
    document.getElementById('total-students').textContent = this.students.length;
    document.getElementById('avg-overall').textContent = DataUtils.calculateAvgOverall(this.students);
    document.getElementById('top-performer').textContent = DataUtils.calculateTopPerformer(this.students);
  }

  renderStudentProfileFromURL() {
    const urlPath = window.location.pathname;
    const studentNameSlug = urlPath.split('/').pop().replace('student-', '').replace('.html', '');
    const student = this.students.find(s => s.Name.toLowerCase().replace(/[^a-z0-9]/g, '-') === studentNameSlug);

    if (student) {
        document.querySelector('.contact-header h2').textContent = student.Name;
        document.querySelector('.contact-header p').innerHTML = `📱 ${student.Mobile} | ✉ ${student.Email} | Rank #${student.rank}`;

        // Render tabs, charts, table, totals, trend
        this.renderStudentExamsTable(student, 'all'); // Default to 'all' exams

        const examTypeTabs = document.querySelectorAll('.exam-type-tabs .btn');
        examTypeTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                examTypeTabs.forEach(t => t.classList.remove('active', 'btn-success', 'btn-primary', 'btn-secondary'));
                const type = e.target.dataset.examType;
                if (type === 'weekly') e.target.classList.add('btn-success', 'active');
                else if (type === 'fortnight') e.target.classList.add('btn-secondary', 'active');
                else e.target.classList.add('btn-primary', 'active');
                this.renderStudentExamsTable(student, type);
            });
        });

        const totals = DataUtils.getStudentTotals(student);
        document.getElementById('weekly-total').textContent = totals.weekly;
        document.getElementById('fortnight-total').textContent = totals.fortnight;
        document.getElementById('combined-total').textContent = totals.combined;
        document.getElementById('student-trend').textContent = `"${DataUtils.analyzeTrend(student)}"`;

        // Charts will be rendered here by charts.js
        renderCharts(student.exams);

    } else {
        console.error('Student not found');
    }
  }

  renderStudentExamsTable(student, filterType) {
    const tableBody = document.getElementById('student-exams-table-body');
    tableBody.innerHTML = '';

    const examsToRender = filterType === 'all' ? student.exams : student.exams.filter(e => e.type === filterType);

    examsToRender.forEach(exam => {
        const row = document.createElement('tr');
        const typeColorClass = exam.type === 'weekly' ? 'text-success' : 'text-purple'; // Assuming text-purple for fortnight
        row.innerHTML = `
            <td>${exam.week}</td>
            <td class="${typeColorClass}">${exam.type === 'weekly' ? '🟢 Weekly' : '🟣 Fortnight'}</td>
            <td>${exam.comm}</td>
            <td>${exam.mcq}</td>
            <td>${exam.coding}</td>
            <td>${exam.assignment}</td>
            <td>${exam.visual}</td>
            <td>${exam.overall}</td>
        `;
        tableBody.appendChild(row);
    });
  }
}

// Initialize dashboard only if authenticated or on student pages
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if on student page or if authenticated
    if (!document.getElementById('dashboard-content') || (typeof AuthManager !== 'undefined' && AuthManager.isAuthenticated())) {
        window.studentDashboard = new StudentDashboard();
    }
});