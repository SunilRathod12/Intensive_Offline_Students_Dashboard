class DataUtils {
  static calculateOverallBest(student) {
    return Math.max(...student.exams.map(e => e.overall));
  }

  static calculateWeeklyBest(student) {
    const weeklyExams = student.exams.filter(e => e.type === 'weekly');
    return weeklyExams.length > 0 ? Math.max(...weeklyExams.map(e => e.overall)) : 0;
  }

  static calculateFortnightBest(student) {
    const fortnightExams = student.exams.filter(e => e.type === 'fortnight');
    return fortnightExams.length > 0 ? Math.max(...fortnightExams.map(e => e.overall)) : 0;
  }

  static calculateRankings(students) {
    const rankedStudents = [...students].sort((a, b) => {
      const overallA = DataUtils.calculateOverallBest(a);
      const overallB = DataUtils.calculateOverallBest(b);
      return overallB - overallA;
    });
    rankedStudents.forEach((student, index) => {
      student.rank = index + 1;
    });
    return rankedStudents;
  }

  static calculateAvgOverall(students) {
    const totalOverallScores = students.reduce((sum, student) => {
      return sum + DataUtils.calculateOverallBest(student);
    }, 0);
    return (totalOverallScores / students.length).toFixed(2);
  }

  static calculateTopPerformer(students) {
    const rankedStudents = DataUtils.calculateRankings(students);
    return rankedStudents.length > 0 ? rankedStudents[0].Name : 'N/A';
  }

  static getStudentTotals(student) {
    const weeklyExams = student.exams.filter(e => e.type === 'weekly');
    const fortnightExams = student.exams.filter(e => e.type === 'fortnight');

    const weeklyTotal = weeklyExams.reduce((sum, exam) => sum + exam.overall, 0);
    const fortnightTotal = fortnightExams.reduce((sum, exam) => sum + exam.overall, 0);
    const combinedTotal = weeklyTotal + fortnightTotal;

    // Max possible scores (assuming 3 weekly exams, 180 each, and 1 fortnight exam, 180 each)
    // This needs to be dynamic based on the actual number of exams
    const maxWeeklyScore = weeklyExams.length * 180;
    const maxFortnightScore = fortnightExams.length * 180;
    const maxCombinedScore = maxWeeklyScore + maxFortnightScore;

    return {
        weekly: `${weeklyTotal}/${maxWeeklyScore}`,
        fortnight: `${fortnightTotal}/${maxFortnightScore}`,
        combined: `${combinedTotal}/${maxCombinedScore}`
    };
  }

  static analyzeTrend(student) {
    const overallScores = student.exams.map(e => e.overall);
    if (overallScores.length < 2) return 'N/A';

    const lastScore = overallScores[overallScores.length - 1];
    const secondLastScore = overallScores[overallScores.length - 2];

    if (lastScore > secondLastScore) return 'Improving';
    if (lastScore < secondLastScore) return 'Declining';
    return 'Stable';
  }
}

