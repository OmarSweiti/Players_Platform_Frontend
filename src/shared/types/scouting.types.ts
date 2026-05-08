// Scouting Types for Frontend

export type ScoutReportStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';

export type RecommendationLevel = 'STRONG_SIGN' | 'SIGN' | 'MONITOR' | 'NOT_SUITABLE';

export type WatchlistPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export type AssignmentStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED';

export interface ScoutingReport {
  id: string;
  tenantId: string;
  scoutId: string;
  playerId?: string;
  prospectName?: string;
  prospectAge?: number;
  prospectClub?: string;
  prospectPosition?: string;
  prospectNationality?: string;
  status: ScoutReportStatus;
  recommendation?: RecommendationLevel;
  technicalScore?: number;
  physicalScore?: number;
  tacticalScore?: number;
  mentalScore?: number;
  strengths?: string;
  weaknesses?: string;
  personalityNotes?: string;
  tacticalFit?: string;
  overallRating?: number;
  potentialRating?: number;
  reportDate: string;
  matchObserved?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  // Relations
  player?: {
    id: string;
    fullName: string;
    position?: string;
    currentClub?: string;
  };
  scout?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface PlayerWatchlist {
  id: string;
  tenantId: string;
  userId: string;
  playerId: string;
  priority?: WatchlistPriority;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  player?: {
    id: string;
    fullName: string;
    position?: string;
    dateOfBirth?: string;
    nationality?: string;
    currentClub?: string;
  };
}

export interface ScoutingAssignment {
  id: string;
  tenantId: string;
  assignedToId: string;
  assignedById: string;
  region?: string;
  competition?: string;
  targetPosition?: string;
  minAge?: number;
  maxAge?: number;
  dueDate?: string;
  status: AssignmentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  assignedTo?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  assignedBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

// DTOs / Request Types

export interface CreateScoutingReportInput {
  playerId?: string;
  prospectName?: string;
  prospectAge?: number;
  prospectClub?: string;
  prospectPosition?: string;
  prospectNationality?: string;
  recommendation?: RecommendationLevel;
  technicalScore?: number;
  physicalScore?: number;
  tacticalScore?: number;
  mentalScore?: number;
  strengths?: string;
  weaknesses?: string;
  personalityNotes?: string;
  tacticalFit?: string;
  overallRating?: number;
  potentialRating?: number;
  matchObserved?: string;
}

export interface UpdateScoutingReportInput {
  status?: ScoutReportStatus;
  recommendation?: RecommendationLevel;
  technicalScore?: number;
  physicalScore?: number;
  tacticalScore?: number;
  mentalScore?: number;
  strengths?: string;
  weaknesses?: string;
  personalityNotes?: string;
  tacticalFit?: string;
  overallRating?: number;
  potentialRating?: number;
}

export interface QueryScoutingReportsParams {
  status?: ScoutReportStatus;
  scoutId?: string;
  playerId?: string;
  recommendation?: RecommendationLevel;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface AddToWatchlistInput {
  playerId: string;
  priority?: WatchlistPriority;
  notes?: string;
}

export interface CreateAssignmentInput {
  assignedToId: string;
  region?: string;
  competition?: string;
  targetPosition?: string;
  minAge?: number;
  maxAge?: number;
  dueDate?: string;
  notes?: string;
}

export interface UpdateAssignmentInput {
  region?: string;
  competition?: string;
  targetPosition?: string;
  minAge?: number;
  maxAge?: number;
  dueDate?: string;
  status?: AssignmentStatus;
  notes?: string;
}

// Response Types

export interface ScoutingReportStats {
  total: number;
  draft: number;
  submitted: number;
  approved: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
