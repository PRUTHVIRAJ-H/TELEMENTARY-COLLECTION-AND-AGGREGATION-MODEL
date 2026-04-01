export const calculateAdvancedStats = (history) => {
  if (!history || history.length === 0) return { avg: 0, stdev: 0, variance: 0 };
  
  const n = history.length;
  const avg = history.reduce((a, b) => a + b, 0) / n;
  
  // Standard Deviation Formula: sqrt( sum( (x - avg)^2 ) / n )
  const squareDiffs = history.map(value => Math.pow(value - avg, 2));
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / n;
  const stdev = Math.sqrt(avgSquareDiff).toFixed(2);

  return {
    avg: avg.toFixed(2),
    stdev: stdev,
    variance: avgSquareDiff.toFixed(2),
    isStable: stdev < 50 // If stdev is low, the sensor reading is stable
  };
};