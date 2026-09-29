// Medical Module Types for Frontend

export type TreatmentStatus =
  'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface MedicalRecord {
  id: string;
  tenantId: string;
  playerId: string;
  createdById: string;
  injuryType: string;
  bodyPart?: string;
  severity?: string;
  description?: string;
  treatment?: string;
  injuryDate?: string;
  recoveryDate?: string;
  returnToPlayDate?: string;
  isConfidential: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  // Relations
  player?: {
    id: string;
    fullName: string;
    position?: string;
  };
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export interface TreatmentSession {
  id: string;
  tenantId: string;
  playerId: string;
  medicalRecordId?: string;
  sessionDate: string;
  duration?: number;
  status: TreatmentStatus;
  treatmentType: string;
  description?: string;
  exercises?: string;
  progressNotes?: string;
  conductedBy: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  player?: {
    id: string;
    fullName: string;
    position?: string;
  };
  medicalRecord?: {
    id: string;
    injuryType?: string;
    bodyPart?: string;
  };
  conductor?: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

// DTOs / Request Types

export interface CreateMedicalRecordInput {
  playerId: string;
  injuryType: string;
  bodyPart?: string;
  severity?: string;
  description?: string;
  treatment?: string;
  injuryDate?: string;
  recoveryDate?: string;
  returnToPlayDate?: string;
  isConfidential?: boolean;
}

export interface UpdateMedicalRecordInput {
  injuryType?: string;
  bodyPart?: string;
  severity?: string;
  description?: string;
  treatment?: string;
  injuryDate?: string;
  recoveryDate?: string;
  returnToPlayDate?: string;
  isConfidential?: boolean;
}

export interface CreateTreatmentSessionInput {
  playerId: string;
  medicalRecordId?: string;
  sessionDate: string;
  duration?: number;
  status?: TreatmentStatus;
  treatmentType: string;
  description?: string;
  exercises?: string;
  progressNotes?: string;
}

export interface UpdateTreatmentSessionInput {
  sessionDate?: string;
  duration?: number;
  status?: TreatmentStatus;
  treatmentType?: string;
  description?: string;
  exercises?: string;
  progressNotes?: string;
}

// Response Types

export interface InjuryHistoryStats {
  total: number;
  byType: Array<{ injuryType: string; _count: number }>;
  bySeverity: Array<{ severity: string; _count: number }>;
}

export interface TreatmentSessionStats {
  total: number;
  scheduled: number;
  inProgress: number;
  completed: number;
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
