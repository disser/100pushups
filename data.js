// 100 Pushups Training Program Data
// Source: https://www.100pushups.net
// Each level has an array of training days.
// Each day has: rest (seconds), sets (array), minBreakDays after this day
// Each set: { reps: number, isMax: false } or { isMax: true, minReps: number }

const PROGRAM_DATA = {
  levels: [
    {
      id: 'less-5',
      label: 'Less than 5',
      testRange: [0, 5],
      days: [
        { rest: 60,  breakDays: 1, sets: [{reps:2},{reps:3},{reps:2},{reps:2},{isMax:true,minReps:3}] },
        { rest: 90,  breakDays: 1, sets: [{reps:3},{reps:4},{reps:2},{reps:3},{isMax:true,minReps:4}] },
        { rest: 120, breakDays: 2, sets: [{reps:4},{reps:5},{reps:4},{reps:4},{isMax:true,minReps:5}] },
        { rest: 60,  breakDays: 1, sets: [{reps:5},{reps:6},{reps:4},{reps:4},{isMax:true,minReps:6}] },
        { rest: 90,  breakDays: 1, sets: [{reps:5},{reps:6},{reps:4},{reps:4},{isMax:true,minReps:7}] },
        { rest: 120, breakDays: 2, sets: [{reps:5},{reps:7},{reps:5},{reps:5},{isMax:true,minReps:7}] },
      ]
    },
    {
      id: '6-10',
      label: '6–10 Push-Ups',
      testRange: [6, 10],
      days: [
        { rest: 60,  breakDays: 1, sets: [{reps:5},{reps:6},{reps:4},{reps:4},{isMax:true,minReps:5}] },
        { rest: 90,  breakDays: 1, sets: [{reps:6},{reps:7},{reps:6},{reps:6},{isMax:true,minReps:7}] },
        { rest: 120, breakDays: 2, sets: [{reps:8},{reps:10},{reps:7},{reps:7},{isMax:true,minReps:10}] },
        { rest: 60,  breakDays: 1, sets: [{reps:9},{reps:11},{reps:8},{reps:8},{isMax:true,minReps:11}] },
        { rest: 90,  breakDays: 1, sets: [{reps:10},{reps:12},{reps:9},{reps:9},{isMax:true,minReps:13}] },
        { rest: 120, breakDays: 2, sets: [{reps:12},{reps:13},{reps:10},{reps:10},{isMax:true,minReps:15}] },
      ]
    },
    {
      id: '11-20',
      label: '11–20 Push-Ups',
      testRange: [11, 20],
      days: [
        { rest: 60,  breakDays: 1, sets: [{reps:8},{reps:9},{reps:7},{reps:7},{isMax:true,minReps:8}] },
        { rest: 90,  breakDays: 1, sets: [{reps:9},{reps:10},{reps:8},{reps:8},{isMax:true,minReps:10}] },
        { rest: 120, breakDays: 2, sets: [{reps:11},{reps:13},{reps:9},{reps:9},{isMax:true,minReps:13}] },
        { rest: 60,  breakDays: 1, sets: [{reps:12},{reps:14},{reps:10},{reps:10},{isMax:true,minReps:15}] },
        { rest: 90,  breakDays: 1, sets: [{reps:13},{reps:15},{reps:11},{reps:11},{isMax:true,minReps:17}] },
        { rest: 120, breakDays: 2, sets: [{reps:14},{reps:16},{reps:13},{reps:13},{isMax:true,minReps:19}] },
      ]
    },
    {
      id: '21-25',
      label: '21–25 Push-Ups',
      testRange: [21, 25],
      days: [
        { rest: 60,  breakDays: 1, sets: [{reps:12},{reps:17},{reps:13},{reps:13},{isMax:true,minReps:17}] },
        { rest: 90,  breakDays: 1, sets: [{reps:14},{reps:19},{reps:14},{reps:14},{isMax:true,minReps:19}] },
        { rest: 120, breakDays: 2, sets: [{reps:16},{reps:21},{reps:15},{reps:15},{isMax:true,minReps:21}] },
        { rest: 60,  breakDays: 1, sets: [{reps:18},{reps:22},{reps:16},{reps:16},{isMax:true,minReps:21}] },
        { rest: 90,  breakDays: 1, sets: [{reps:20},{reps:25},{reps:20},{reps:20},{isMax:true,minReps:23}] },
        { rest: 120, breakDays: 2, sets: [{reps:23},{reps:28},{reps:22},{reps:22},{isMax:true,minReps:25}] },
      ]
    },
    {
      id: '26-30',
      label: '26–30 Push-Ups',
      testRange: [26, 30],
      days: [
        { rest: 60,  breakDays: 1, sets: [{reps:14},{reps:18},{reps:14},{reps:14},{isMax:true,minReps:20}] },
        { rest: 90,  breakDays: 1, sets: [{reps:20},{reps:25},{reps:15},{reps:15},{isMax:true,minReps:23}] },
        { rest: 120, breakDays: 2, sets: [{reps:20},{reps:27},{reps:18},{reps:18},{isMax:true,minReps:25}] },
        { rest: 60,  breakDays: 1, sets: [{reps:21},{reps:25},{reps:21},{reps:21},{isMax:true,minReps:27}] },
        { rest: 90,  breakDays: 1, sets: [{reps:25},{reps:29},{reps:25},{reps:25},{isMax:true,minReps:30}] },
        { rest: 120, breakDays: 2, sets: [{reps:29},{reps:33},{reps:29},{reps:29},{isMax:true,minReps:33}] },
      ]
    },
    // Advanced levels (31+) switch to a 3-day cycle with more sets and shorter rest
    {
      id: '31-35',
      label: '31–35 Push-Ups',
      testRange: [31, 35],
      days: [
        { rest: 60, breakDays: 1, sets: [{reps:21},{reps:21},{reps:15},{reps:15},{isMax:true,minReps:19}] },
        { rest: 45, breakDays: 1, sets: [{reps:14},{reps:14},{reps:14},{reps:10},{reps:10},{reps:10},{reps:10},{reps:10},{isMax:true,minReps:14}] },
        { rest: 45, breakDays: 2, sets: [{reps:16},{reps:16},{reps:16},{reps:11},{reps:11},{reps:11},{reps:11},{reps:11},{isMax:true,minReps:16}] },
      ]
    },
    {
      id: '36-40',
      label: '36–40 Push-Ups',
      testRange: [36, 40],
      days: [
        { rest: 60, breakDays: 1, sets: [{reps:25},{reps:25},{reps:17},{reps:17},{isMax:true,minReps:21}] },
        { rest: 45, breakDays: 1, sets: [{reps:17},{reps:17},{reps:17},{reps:13},{reps:13},{reps:13},{reps:13},{reps:13},{isMax:true,minReps:17}] },
        { rest: 45, breakDays: 2, sets: [{reps:19},{reps:19},{reps:19},{reps:15},{reps:15},{reps:15},{reps:15},{reps:15},{isMax:true,minReps:19}] },
      ]
    },
    {
      id: '41-45',
      label: '41–45 Push-Ups',
      testRange: [41, 45],
      days: [
        { rest: 60, breakDays: 1, sets: [{reps:30},{reps:30},{reps:20},{reps:20},{isMax:true,minReps:25}] },
        { rest: 45, breakDays: 1, sets: [{reps:21},{reps:21},{reps:21},{reps:15},{reps:15},{reps:15},{reps:15},{reps:15},{isMax:true,minReps:21}] },
        { rest: 45, breakDays: 2, sets: [{reps:22},{reps:22},{reps:22},{reps:17},{reps:17},{reps:17},{reps:17},{reps:17},{isMax:true,minReps:22}] },
      ]
    },
    {
      id: '46-50',
      label: '46–50 Push-Ups',
      testRange: [46, 50],
      days: [
        { rest: 60, breakDays: 1, sets: [{reps:35},{reps:35},{reps:25},{reps:25},{isMax:true,minReps:30}] },
        { rest: 45, breakDays: 1, sets: [{reps:25},{reps:25},{reps:25},{reps:18},{reps:18},{reps:18},{reps:18},{reps:18},{isMax:true,minReps:25}] },
        { rest: 45, breakDays: 2, sets: [{reps:27},{reps:27},{reps:27},{reps:20},{reps:20},{reps:20},{reps:20},{reps:20},{isMax:true,minReps:27}] },
      ]
    },
    {
      id: '51-55',
      label: '51–55 Push-Ups',
      testRange: [51, 55],
      days: [
        { rest: 60, breakDays: 1, sets: [{reps:40},{reps:40},{reps:30},{reps:30},{isMax:true,minReps:35}] },
        { rest: 45, breakDays: 1, sets: [{reps:28},{reps:28},{reps:28},{reps:21},{reps:21},{reps:21},{reps:21},{reps:21},{isMax:true,minReps:28}] },
        { rest: 45, breakDays: 2, sets: [{reps:30},{reps:30},{reps:30},{reps:23},{reps:23},{reps:23},{reps:23},{reps:23},{isMax:true,minReps:30}] },
      ]
    },
    {
      id: '56-60',
      label: '56–60 Push-Ups',
      testRange: [56, 60],
      days: [
        { rest: 60, breakDays: 1, sets: [{reps:45},{reps:45},{reps:35},{reps:35},{isMax:true,minReps:40}] },
        { rest: 45, breakDays: 1, sets: [{reps:32},{reps:32},{reps:32},{reps:25},{reps:25},{reps:25},{reps:25},{reps:25},{isMax:true,minReps:32}] },
        { rest: 45, breakDays: 2, sets: [{reps:35},{reps:35},{reps:35},{reps:27},{reps:27},{reps:27},{reps:27},{reps:27},{isMax:true,minReps:35}] },
      ]
    },
    {
      id: 'more-60',
      label: 'More than 60',
      testRange: [61, 999],
      days: [
        { rest: 60, breakDays: 1, sets: [{reps:50},{reps:50},{reps:40},{reps:40},{isMax:true,minReps:45}] },
        { rest: 45, breakDays: 1, sets: [{reps:36},{reps:36},{reps:36},{reps:29},{reps:29},{reps:29},{reps:29},{reps:29},{isMax:true,minReps:36}] },
        { rest: 45, breakDays: 2, sets: [{reps:40},{reps:40},{reps:40},{reps:32},{reps:32},{reps:32},{reps:32},{reps:32},{isMax:true,minReps:40}] },
      ]
    },
  ]
};

/**
 * Find the level that corresponds to a given test result.
 */
function getLevelForTestResult(pushupCount) {
  return PROGRAM_DATA.levels.find(
    l => pushupCount >= l.testRange[0] && pushupCount <= l.testRange[1]
  ) || PROGRAM_DATA.levels[0];
}
