import { sendMessage } from './groqApi';

/**
 * AXIS Creator Mode
 * AXIS knows the user is a content creator.
 * It acts as a personal content manager in parallel with everything else.
 * 
 * - Reminds about video ideas when idle
 * - Tracks upload schedule and warns if slipping
 * - Suggests content based on trending topics
 * - Logs creative ideas said out loud
 * - Analyzes YouTube stats and gives feedback
 */

interface CreatorState {
  videoIdeas: VideoIdea[];
  uploadSchedule: UploadSchedule | null;
  lastUploadDate: string | null;
  creativeLog: CreativeLogEntry[];
  channelStats: ChannelStats | null;
}

interface VideoIdea {
  id: string;
  title: string;
  description: string;
  source: 'user_mentioned' | 'axis_suggested' | 'trending';
  createdAt: string;
  status: 'idea' | 'scripting' | 'filming' | 'editing' | 'published';
}

interface UploadSchedule {
  frequency: 'daily' | 'every_3_days' | 'weekly' | 'biweekly';
  targetDay?: string; // e.g., 'Monday', 'Friday'
  videosPerWeek: number;
}

interface CreativeLogEntry {
  id: string;
  content: string;
  source: 'conversation' | 'auto_detected';
  timestamp: string;
  turnedIntoIdea: boolean;
}

interface ChannelStats {
  subscribers: number;
  totalViews: number;
  lastVideoViews: number;
  averageViews: number;
  uploadCount: number;
  lastUpdated: string;
}

let creatorState: CreatorState = {
  videoIdeas: [],
  uploadSchedule: null,
  lastUploadDate: null,
  creativeLog: [],
  channelStats: null,
};

export function getCreatorState(): CreatorState {
  return { ...creatorState };
}

// Set upload schedule
export function setUploadSchedule(schedule: UploadSchedule): void {
  creatorState.uploadSchedule = schedule;
}

// Log a video idea
export function addVideoIdea(
  title: string,
  description: string,
  source: VideoIdea['source'] = 'user_mentioned'
): void {
  creatorState.videoIdeas.push({
    id: `idea-${Date.now()}`,
    title,
    description,
    source,
    createdAt: new Date().toISOString(),
    status: 'idea',
  });
}

// Log creative ideas detected in conversation
export function logCreativeIdea(content: string): void {
  creatorState.creativeLog.push({
    id: `log-${Date.now()}`,
    content,
    source: 'auto_detected',
    timestamp: new Date().toISOString(),
    turnedIntoIdea: false,
  });
}

// Check if user is behind on uploads
export function getUploadStatus(): {
  isBehind: boolean;
  daysSinceLastUpload: number;
  message: string;
} {
  if (!creatorState.uploadSchedule || !creatorState.lastUploadDate) {
    return {
      isBehind: false,
      daysSinceLastUpload: 0,
      message: "You haven't set an upload schedule yet.",
    };
  }

  const lastUpload = new Date(creatorState.lastUploadDate);
  const now = new Date();
  const daysSince = Math.floor(
    (now.getTime() - lastUpload.getTime()) / (1000 * 60 * 60 * 24)
  );

  const expectedGap = creatorState.uploadSchedule.videosPerWeek > 0
    ? 7 / creatorState.uploadSchedule.videosPerWeek
    : 7;

  const isBehind = daysSince > expectedGap + 2; // 2 days grace

  let message: string;
  if (isBehind) {
    message = `You haven't uploaded in ${daysSince} days. Your schedule says ${creatorState.uploadSchedule.videosPerWeek} videos per week. What's going on?`;
  } else if (daysSince >= expectedGap - 1) {
    message = `Upload window approaching. ${Math.max(0, Math.round(expectedGap - daysSince))} days until you're behind schedule.`;
  } else {
    message = `On track. ${Math.round(expectedGap - daysSince)} days until next upload is due.`;
  }

  return { isBehind, daysSinceLastUpload: daysSince, message };
}

// Generate content suggestions based on what's trending
export async function suggestContent(
  existingIdeas: string[],
  niche: string
): Promise<string[]> {
  try {
    const prompt = `You are AXIS, a content creation assistant. The user makes ${niche} content.
Their existing video ideas: ${existingIdeas.join(', ')}

Suggest 3 video ideas that would perform well. Be specific and creative.
Format: Just the titles, one per line. No numbers, no explanations.`;

    const response = await sendMessage(
      [{ role: 'user', content: prompt }],
      'You are a creative content strategist. Suggest specific, clickable video titles.'
    );

    return response
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 5)
      .slice(0, 3);
  } catch {
    return [];
  }
}

// Analyze channel stats and give feedback
export function analyzeChannelStats(): string {
  const stats = creatorState.channelStats;
  if (!stats) return "I don't have your channel stats yet. Connect YouTube and I'll analyze everything.";

  const feedback: string[] = [];

  // Subscriber growth analysis
  if (stats.subscribers > 1000) {
    feedback.push(`${stats.subscribers.toLocaleString()} subs. Growing.`);
  }

  // View performance
  if (stats.lastVideoViews > stats.averageViews * 1.5) {
    feedback.push(`Your last video is outperforming your average by ${Math.round((stats.lastVideoViews / stats.averageViews - 1) * 100)}%. Whatever you did, do it again.`);
  } else if (stats.lastVideoViews < stats.averageViews * 0.5) {
    feedback.push(`Last video underperformed. ${stats.lastVideoViews} views vs ${stats.averageViews} average. Something was off.`);
  }

  // Upload frequency
  const status = getUploadStatus();
  if (status.isBehind) {
    feedback.push(status.message);
  }

  return feedback.length > 0
    ? feedback.join(' ')
    : "Everything looks steady. No red flags.";
}

// Update channel stats
export function updateChannelStats(stats: Partial<ChannelStats>): void {
  creatorState.channelStats = {
    ...creatorState.channelStats,
    ...stats,
    lastUpdated: new Date().toISOString(),
  } as ChannelStats;
}

// Record a video upload
export function recordUpload(videoTitle: string): void {
  creatorState.lastUploadDate = new Date().toISOString();

  // Update idea status if it exists
  const idea = creatorState.videoIdeas.find(
    (i) => i.title.toLowerCase() === videoTitle.toLowerCase()
  );
  if (idea) {
    idea.status = 'published';
  }
}

export function getVideoIdeas(status?: VideoIdea['status']): VideoIdea[] {
  if (status) {
    return creatorState.videoIdeas.filter((i) => i.status === status);
  }
  return [...creatorState.videoIdeas];
}
