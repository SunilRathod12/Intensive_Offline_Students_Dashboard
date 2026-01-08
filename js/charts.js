let overallScoreChartInstance = null;
let communicationRatingChartInstance = null;

const renderCharts = (exams) => {
  const examLabels = exams.map(exam => `${exam.week} ${exam.type === 'weekly' ? 'Weekly' : 'Fortnight'}`);
  const overallScores = exams.map(exam => exam.overall);
  const communicationRatings = exams.map(exam => exam.comm);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 180 // Max overall score
      }
    }
  };

  const commChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100 // Max communication rating
      }
    }
  };

  // Destroy existing chart instances if they exist
  if (overallScoreChartInstance) {
    overallScoreChartInstance.destroy();
  }
  if (communicationRatingChartInstance) {
    communicationRatingChartInstance.destroy();
  }

  // Overall Score Chart
  const overallScoreCtx = document.getElementById('overallScoreChart');
  if (overallScoreCtx) {
    overallScoreChartInstance = new Chart(overallScoreCtx, {
      type: 'bar',
      data: {
        labels: examLabels,
        datasets: [{
          label: 'Overall Score',
          data: overallScores,
          backgroundColor: '#2563EB', // Blue-600
          borderColor: '#2563EB',
          borderWidth: 1
        }]
      },
      options: chartOptions
    });
  }

  // Communication Rating Chart
  const communicationRatingCtx = document.getElementById('communicationRatingChart');
  if (communicationRatingCtx) {
    communicationRatingChartInstance = new Chart(communicationRatingCtx, {
      type: 'line',
      data: {
        labels: examLabels,
        datasets: [{
          label: 'Communication Rating',
          data: communicationRatings,
          backgroundColor: '#10B981', // Emerald-500
          borderColor: '#10B981',
          borderWidth: 1,
          fill: false
        }]
      },
      options: commChartOptions
    });
  }
};

