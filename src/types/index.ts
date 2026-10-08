export type ActiveTab = 'home' | 'knowledge' | 'quiz' | 'games' | 'report' | 'ai' | 'student-videos';

export interface UserAccount {
  id: string;
  username: string;
  fullName: string;
  role: 'admin' | 'student' | 'teacher';
  school: string;
  gradeClass?: string;
  email?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface StudentVideo {
  id: string;
  title: string;
  authorName: string;
  studentGrade: string;
  school: string;
  category: 'drugs' | 'violence' | 'tobacco' | 'vape' | 'friendship';
  categoryLabel: string;
  videoUrl?: string;
  driveUrl?: string;
  fileType?: 'video' | 'image';
  thumbnailUrl?: string;
  description: string;
  duration?: string;
  likes: number;
  views: number;
  status: 'approved' | 'pending';
  uploadedAt: string;
  syncedToGoogleSheet?: boolean;
}

export interface GoogleSheetSyncStatus {
  sheetName: string;
  spreadsheetId?: string;
  sheetUrl?: string;
  webhookUrl?: string;
  lastSyncedAt?: string;
  totalAccountsSynced: number;
  totalReportsSynced: number;
  totalVideosSynced: number;
  status: 'connected' | 'demo_ready' | 'syncing';
  syncLog: { id: string; timestamp: string; action: string; count: number }[];
}

export interface PillarItem {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  iconName: string;
  colorClass: string;
  bgColorClass: string;
  borderColorClass: string;
  content: {
    tagline: string;
    rules: { title: string; desc: string }[];
    quote: string;
    actionTip: string;
  };
}

export interface AmbassadorMessage {
  id: string;
  studentName: string;
  grade: string;
  school?: string;
  badge: string;
  content: string;
  likes: number;
  timeAgo: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  category: 'ma-tuy' | 'thuoc-la' | 'bao-luc' | 'ky-nang';
  categoryLabel: string;
  date: string;
  views: string;
  likes: number;
  imageUrl: string;
  content: string[];
  tips: string[];
  badge?: string;
  sourceName: string;
  sourceUrl: string;
  verifiedBadge?: string;
}

export interface EducationalVideo {
  id: string;
  title: string;
  duration: string;
  source: string;
  sourceUrl: string;
  verifiedBadge?: string;
  category: string;
  thumbnailUrl: string;
  youtubeId?: string;
  description: string;
  keyTakeaway: string;
  tags: string[];
}

export interface QuizQuestion {
  id: number;
  question: string;
  category: 'drugs' | 'violence' | 'tobacco' | 'vape';
  options: string[];
  correctIndex: number;
  explanation: string;
  dangerAlert?: string;
}

export interface SituationStage {
  id: number;
  scenarioTitle: string;
  context: string;
  question: string;
  options: {
    label: string;
    text: string;
    isSafe: boolean;
    points: number;
    feedback: string;
    recommendation: string;
  }[];
}

export interface MiniGame {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  badge: string;
  difficulty: 'Dễ' | 'Trung bình' | 'Thử thách';
  themeColor: string;
}

export interface AnonymousReportSubmission {
  category: 'drugs' | 'violence' | 'tobacco' | 'vape' | 'cyberbullying';
  categoryLabel: string;
  urgency: 'low' | 'medium' | 'high';
  title: string;
  location: string;
  incidentTime: string;
  description: string;
  evidenceUrl?: string;
}

export interface ReportMessage {
  id: string;
  sender: 'student' | 'counselor';
  senderName: string;
  content: string;
  timestamp: string;
}

export interface ReportDetail {
  id: string;
  ticketCode: string;
  pin?: string;
  category: 'drugs' | 'violence' | 'tobacco' | 'vape' | 'cyberbullying';
  categoryLabel: string;
  urgency: 'low' | 'medium' | 'high';
  title: string;
  location: string;
  incidentTime: string;
  description: string;
  hasEvidence: boolean;
  evidenceUrl?: string;
  status: 'received' | 'verifying' | 'intervening' | 'resolved';
  createdAt: string;
  updatedAt: string;
  notesFromSchool?: string;
  messages: ReportMessage[];
}
