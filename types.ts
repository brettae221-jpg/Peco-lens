export interface ModuleConfig {
  id: AppMode;
  label: string;
  icon: string; // Icon name from lucide-react
  order: number;
  visible: boolean;
}

export interface User {
  id?: string;
  email: string;
  role: 'Admin' | 'Operator';
  name?: string;
  username?: string;
  dept?: string;
  appPosition?: string;
  password?: string;
  firstLogin?: boolean;
  accessibleModes?: AppMode[];
}

export interface ChatMessage {
  id: string;
  senderEmail: string;
  senderName?: string;
  role?: 'user' | 'model'; // Keep for compatibility with ActiveRecovery and AI service
  text: string;
  timestamp: any;
  image?: string;
  read?: boolean;
}

export interface NewsPost {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  type: 'training_complete' | 'test_complete' | 'ai_chat_shared' | 'pm_logged' | 'new_login' | 'status_update' | 'feature_update';
  textContent: string;
  metadata?: {
    courseTitle?: string;
    testScore?: number;
    equipmentId?: string;
    featureName?: string;
  };
  timestamp: any;
  likes: string[]; // user emails
}

export interface DirectMessage {
  id: string;
  participants: string[]; // emails
  lastMessage?: string;
  lastTimestamp?: any;
}

export enum System {
  Megajet = 'Megajet',
  Grassilli = 'Grassilli',
  MegajetScope = 'MegajetScope'
}

export enum AppMode {
  Dashboard = 'dashboard',
  Lenses = 'lenses',
  Tools = 'tools',
  Maintenance = 'maintenance',
  Training = 'training',
  Gallery = 'gallery',
  Calendar = 'calendar',
  Messages = 'messages',
  Machines = 'machines',
  Settings = 'settings',
  Admin = 'admin',
  Builder = 'builder',
  AIChat = 'ai-chat',
  DensityCalculator = 'density-calculator',
  Scope = 'scope'
}

export interface PMItem {
  id: string;
  timestamp: any;
  equipmentType: 'Megajet' | 'Grasselli' | 'Vision' | 'Thermal' | 'General';
  partName: string;
  issueDescription: string;
  severity: 'Low' | 'Medium' | 'High';
  loggedBy: string;
  status: 'Pending' | 'Fixed';
  aiReasoning?: string;
  modelUrl?: string; // For Tripo GLB
}

export interface OutgoingOrder {
  id: string;
  productCode: string;
  quantity: string;
}

export interface PrimeDataPoint {
  day: string;
  value: number;
}

export interface SpecAverage {
  w: { value: number; percentage: number };
  m: { value: number; percentage: number };
  nm: { value: number; percentage: number };
}

export interface Operator {
  id: string;
  name: string;
  megajet: string;
  details: string[];
}

export interface LogEntry {
  id: string;
  timestamp: string;
  system: System;
  equipmentId: string;
  issue: string;
  symptoms: string;
  possibleCauses: string;
  recoverySteps: string;
  author: string;
}

export interface RecoveryData {
  clarifyingQuestions: string[];
  symptoms: string[];
  possibleCauses: string[];
  recoverySteps: string[];
}

export interface TrainingCourse {
    id?: string;
    title: string;
    level: 'Beginner' | 'Moderate' | 'Advanced' | 'Expert';
    description?: string;
    modules: {
        moduleTitle: string;
        topics: {
            topicTitle: string;
            content: string;
        }[];
    }[];
    generatedBy?: 'AI';
    createdAt?: any;
}

export interface TrainingTest {
  id: string;
  courseId: string;
  courseTitle: string;
  level: 'Beginner' | 'Moderate' | 'Advanced' | 'Expert';
  questions: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation?: string;
  }[];
}

export interface TestResult {
  id: string;
  userId: string;
  userEmail: string;
  testId: string;
  testTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timestamp: any;
  difficulty: string;
}

export interface TroubleshootingScenario {
  id?: string;
  title: string;
  system: System;
  description: string;
  symptoms: string[];
  correctSolution: string;
}

export interface Diagram {
  id: string;
  name: string;
  imageData: string; // base64 data URL
}
export type Blueprint = Diagram;

export interface PMEntry {
  id?: string;
  source: 'Belt Check' | 'Manual Add';
  area: string;
  subArea?: string;
  description: string;
  image?: string;
  timestamp: any;
  userId: string;
  userEmail: string;
  status: 'Open' | 'Fixed';
  assignedTo: string;
}

export interface GalleryAsset {
  id: string;
  userId: string;
  title: string;
  type: 'diagram' | 'model' | 'photo' | 'scan';
  url: string; // base64 or placeholder
  timestamp: any;
  category: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  details: string;
  timestamp: any;
  severity: 'info' | 'warning' | 'critical';
}

export interface SystemConfig {
  id: string;
  facilityName: string;
  alertBanner?: string;
  operationalMode: 'Full' | 'Maintenance' | 'Emergency' | 'Holiday';
  activeUpdateId?: string;
}

export type AppView =
  | 'dashboard'
  | 'troubleshooting-tool'
  | 'megajet-settings'
  | 'scenario-creator'
  | 'employee-management'
  | 'break-tracker'
  | 'scenario-newsfeed'
  | 'troubleshooting-log'
  | 'operator-training';

export interface MegajetSetting {
  id: number;
  thickness: number;
  weight: number;
  cutType: string;
  waterPressure: number;
  cutterJet: string;
  actuatorControl: boolean;
}

export interface Scenario {
  id: number;
  title: string;
  description: string;
  createdBy: string;
  createdAt: string;
}

export interface BreakLog {
  id: string;
  username: string;
  startTime: string; // ISO string
  endTime: string | null;
  duration: number; // in minutes
}

export interface HourlyReading {
  hour: string;
  product: string;
  avgWeight: string;
  avgThickness: string;
  density: string;
  corrections: string;
  delfix: string;
}

export interface DowntimeEvent {
  id: string;
  startTime: string;
  endTime: string;
  unit: string;
  reason: string;
}

export interface BeltSpeedCheck {
  id: string;
  time: string;
  product: string;
  speed: string;
  type: 'Routine' | 'Changeover';
}

export interface MachineTelemetry {
  id: string; // Machine Name
  lastConnected: any;
  wagoInterfaceImage?: string;
  status: 'Online' | 'Offline';
  data: {
    servoLoad?: string;
    waterPressure?: string;
    actuatorFreq?: string;
    beltSpeed?: string;
    thickness?: string;
  };
}

export interface ShiftReport {
  id: string;
  date: string;
  shift: 'Day' | 'Night';
  operator: string;
  hourlyReadings: HourlyReading[];
  downtimeEvents: DowntimeEvent[];
  beltSpeedChecks: BeltSpeedCheck[];
}