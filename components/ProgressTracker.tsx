import React, { useMemo } from 'react';
import { HistoryItem } from '../types';
import { BarChartIcon } from './icons';

interface ProgressTrackerProps {
  history: HistoryItem[];
}

interface TopicMastery {
  [topic: string]: {
    scores: number[];
    count: number;
    lastAttempt: string;
  };
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ history }) => {

  const topicMastery = useMemo(() => {
    if (!history || history.length === 0) return {};

    const masteryData = history.reduce((acc: TopicMastery, item) => {
      const title = item.title;
      if (!acc[title]) {
        acc[title] = { scores: [], count: 0, lastAttempt: item.timestamp };
      }
      
      acc[title].scores.push((item.score / item.totalQuestions) * 100);
      acc[title].count++;
      if (new Date(item.timestamp) > new Date(acc[title].lastAttempt)) {
          acc[title].lastAttempt = item.timestamp;
      }
      return acc;
    }, {} as TopicMastery);
    
    // Sort by last attempt date, newest first
    return Object.entries(masteryData)
      .sort(([, a], [, b]) => new Date(b.lastAttempt).getTime() - new Date(a.lastAttempt).getTime())
      // FIX: The result of this reduce was being inferred as a generic object, losing type information.
      // By casting the initial value to `TopicMastery`, we ensure the resulting object has the correct type.
      .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {} as TopicMastery);

  }, [history]);

  const getBarColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  return (
    <div className="bg-slate-800 p-6 md:p-8 rounded-2xl shadow-2xl border border-slate-700">
      <h3 className="text-2xl md:text-3xl font-bold mb-4 flex items-center gap-2 text-white">
        <BarChartIcon className="w-8 h-8" />
        Topic Mastery
      </h3>
      {Object.keys(topicMastery).length > 0 ? (
        <ul className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {Object.entries(topicMastery).map(([title, data]) => {
            const averageScore = Math.round(data.scores.reduce((a, b) => a + b, 0) / data.count);
            return (
              <li key={title}>
                <div className="flex justify-between items-center mb-1">
                  <p className="font-semibold text-slate-300 truncate pr-4">{title}</p>
                  <p className={`font-bold text-lg ${getBarColor(averageScore).replace('bg-', 'text-')}`}>{averageScore}%</p>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2.5">
                  <div className={`${getBarColor(averageScore)} h-2.5 rounded-full`} style={{ width: `${averageScore}%` }}></div>
                </div>
                <p className="text-xs text-slate-500 mt-1 text-right">{data.count} attempt{data.count > 1 ? 's' : ''}</p>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="text-center py-12">
          <p className="text-slate-500">Your progress on different topics will appear here.</p>
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;