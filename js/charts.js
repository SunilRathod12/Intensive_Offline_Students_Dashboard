let overallScoreChartInstance = null;
let communicationRatingChartInstance = null;

const renderCharts = (exams) => {
  const examLabels = exams.map(exam => `${exam.week} ${exam.type === 'weekly' ? 'Weekly' : 'Fortnight'}`);
  const overallScores = exams.map(exam => exam.overall);
  const communicationRatings = exams.map(exam => exam.comm);

  // Professional chart options with animations and styling
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2.5,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: {
            family: "'Inter', sans-serif",
            size: 14,
            weight: '600'
          },
          padding: 15,
          usePointStyle: true,
          color: '#1e293b'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(30, 41, 59, 0.95)',
        padding: 12,
        titleFont: {
          family: "'Inter', sans-serif",
          size: 14,
          weight: '600'
        },
        bodyFont: {
          family: "'Inter', sans-serif",
          size: 13
        },
        borderColor: '#667eea',
        borderWidth: 2,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            return `Score: ${context.parsed.y}/180`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 12,
            weight: '500'
          },
          color: '#64748b'
        }
      },
      y: {
        beginAtZero: true,
        max: 180,
        grid: {
          color: 'rgba(226, 232, 240, 0.5)',
          lineWidth: 1
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 12,
            weight: '500'
          },
          color: '#64748b',
          stepSize: 30
        }
      }
    },
    animation: {
      duration: 1500,
      easing: 'easeInOutQuart'
    }
  };

  const commChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2.5,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: {
            family: "'Inter', sans-serif",
            size: 14,
            weight: '600'
          },
          padding: 15,
          usePointStyle: true,
          color: '#1e293b'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(30, 41, 59, 0.95)',
        padding: 12,
        titleFont: {
          family: "'Inter', sans-serif",
          size: 14,
          weight: '600'
        },
        bodyFont: {
          family: "'Inter', sans-serif",
          size: 13
        },
        borderColor: '#10b981',
        borderWidth: 2,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            return `Rating: ${context.parsed.y}/100`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 12,
            weight: '500'
          },
          color: '#64748b'
        }
      },
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(226, 232, 240, 0.5)',
          lineWidth: 1
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 12,
            weight: '500'
          },
          color: '#64748b',
          stepSize: 20
        }
      }
    },
    animation: {
      duration: 1500,
      easing: 'easeInOutQuart'
    }
  };

  // Destroy existing chart instances if they exist
  if (overallScoreChartInstance) {
    overallScoreChartInstance.destroy();
  }
  if (communicationRatingChartInstance) {
    communicationRatingChartInstance.destroy();
  }

  // Overall Score Chart with gradient
  const overallScoreCtx = document.getElementById('overallScoreChart');
  if (overallScoreCtx) {
    const gradient = overallScoreCtx.getContext('2d').createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(37, 99, 235, 0.8)');
    gradient.addColorStop(1, 'rgba(37, 99, 235, 0.2)');

    overallScoreChartInstance = new Chart(overallScoreCtx, {
      type: 'bar',
      data: {
        labels: examLabels,
        datasets: [{
          label: 'Overall Score',
          data: overallScores,
          backgroundColor: gradient,
          borderColor: '#2563EB',
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        }]
      },
      options: chartOptions
    });
  }

  // Communication Rating Chart with smooth line and gradient
  const communicationRatingCtx = document.getElementById('communicationRatingChart');
  if (communicationRatingCtx) {
    const gradient = communicationRatingCtx.getContext('2d').createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)');
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0.05)');

    communicationRatingChartInstance = new Chart(communicationRatingCtx, {
      type: 'line',
      data: {
        labels: examLabels,
        datasets: [{
          label: 'Communication Rating',
          data: communicationRatings,
          backgroundColor: gradient,
          borderColor: '#10B981',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#10B981',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointHoverBackgroundColor: '#059669',
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 3
        }]
      },
      options: commChartOptions
    });
  }
};