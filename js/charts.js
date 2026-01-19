let overallScoreChartInstance = null;
let communicationRatingChartInstance = null;

const renderCharts = (exams) => {
  console.log('renderCharts called with exams:', exams);
  
  if (!exams || exams.length === 0) {
    console.error('No exams data to render charts');
    return;
  }

  const examLabels = exams.map(exam => exam.week);
  const overallScores = exams.map(exam => exam.overall);
  const communicationRatings = exams.map(exam => exam.comm);

  console.log('Chart labels:', examLabels);
  console.log('Overall scores:', overallScores);
  console.log('Communication ratings:', communicationRatings);

  // Destroy existing chart instances if they exist
  if (overallScoreChartInstance) {
    overallScoreChartInstance.destroy();
    overallScoreChartInstance = null;
  }
  if (communicationRatingChartInstance) {
    communicationRatingChartInstance.destroy();
    communicationRatingChartInstance = null;
  }

  // Overall Score Chart
  const overallScoreCanvas = document.getElementById('overallScoreChart');
  if (overallScoreCanvas) {
    const overallScoreCtx = overallScoreCanvas.getContext('2d');
    overallScoreChartInstance = new Chart(overallScoreCtx, {
      type: 'bar',
      data: {
        labels: examLabels,
        datasets: [{
          label: 'Overall Score',
          data: overallScores,
          backgroundColor: '#4f46e5',
          borderColor: '#4f46e5',
          borderWidth: 0,
          borderRadius: 6,
          barThickness: 32
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { display: false }
          },
          y: {
            beginAtZero: true,
            max: 180,
            grid: { color: 'rgba(0,0,0,0.05)' }
          }
        }
      }
    });
    console.log('Overall Score chart created');
  } else {
    console.error('overallScoreChart canvas not found');
  }

  // Communication Rating Chart
  const communicationRatingCanvas = document.getElementById('communicationRatingChart');
  if (communicationRatingCanvas) {
    const communicationRatingCtx = communicationRatingCanvas.getContext('2d');
    communicationRatingChartInstance = new Chart(communicationRatingCtx, {
      type: 'line',
      data: {
        labels: examLabels,
        datasets: [{
          label: 'Communication Rating',
          data: communicationRatings,
          backgroundColor: 'rgba(5, 150, 105, 0.1)',
          borderColor: '#059669',
          borderWidth: 2,
          fill: true,
          tension: 0.3,
          pointBackgroundColor: '#059669',
          pointRadius: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { display: false }
          },
          y: {
            beginAtZero: true,
            max: 100,
            grid: { color: 'rgba(0,0,0,0.05)' }
          }
        }
      }
    });
    console.log('Communication Rating chart created');
  } else {
    console.error('communicationRatingChart canvas not found');
  }
};