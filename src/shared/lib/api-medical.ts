import apiClient from '@/shared/lib/api-client';
import type {
  MedicalRecord,
  TreatmentSession,
  CreateMedicalRecordInput,
  UpdateMedicalRecordInput,
  CreateTreatmentSessionInput,
  UpdateTreatmentSessionInput,
  InjuryHistoryStats,
  TreatmentSessionStats,
  PaginatedResponse,
} from '@/shared/types/medical.types';

/**
 * Medical Records API
 */
export const medicalRecordsApi = {
  /**
   * Create a new medical record
   */
  async create(data: CreateMedicalRecordInput) {
    const response = await apiClient.post<{ data: MedicalRecord }>('/medical/records', data);
    return response.data;
  },

  /**
   * Get all medical records with pagination and filters
   */
  async getAll(params?: {
    playerId?: string;
    injuryType?: string;
    isConfidential?: boolean;
    page?: number;
    limit?: number;
  }) {
    const response = await apiClient.get<PaginatedResponse<MedicalRecord>>('/medical/records', {
      params,
    });
    return response.data;
  },

  /**
   * Get medical records for a specific player
   */
  async getByPlayer(playerId: string, params?: {
    injuryType?: string;
    isConfidential?: boolean;
    page?: number;
    limit?: number;
  }) {
    const response = await apiClient.get<PaginatedResponse<MedicalRecord>>(
      `/medical/records/player/${playerId}`,
      { params }
    );
    return response.data;
  },

  /**
   * Get medical record by ID
   */
  async getById(id: string) {
    const response = await apiClient.get<{ data: MedicalRecord }>(`/medical/records/${id}`);
    return response.data;
  },

  /**
   * Update medical record
   */
  async update(id: string, data: UpdateMedicalRecordInput) {
    const response = await apiClient.patch<{ data: MedicalRecord }>(
      `/medical/records/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Delete medical record
   */
  async delete(id: string) {
    const response = await apiClient.delete(`/medical/records/${id}`);
    return response.data;
  },

  /**
   * Get active injuries for a player
   */
  async getActiveInjuries(playerId: string) {
    const response = await apiClient.get<{ data: MedicalRecord[] }>(
      `/medical/records/player/${playerId}/active-injuries`
    );
    return response.data;
  },

  /**
   * Get player injury history statistics
   */
  async getInjuryHistory(playerId: string) {
    const response = await apiClient.get<{ data: InjuryHistoryStats }>(
      `/medical/records/player/${playerId}/history`
    );
    return response.data;
  },
};

/**
 * Treatment Sessions API
 */
export const treatmentSessionsApi = {
  /**
   * Create a new treatment session
   */
  async create(data: CreateTreatmentSessionInput) {
    const response = await apiClient.post<{ data: TreatmentSession }>('/medical/sessions', data);
    return response.data;
  },

  /**
   * Get treatment sessions for a player
   */
  async getByPlayer(playerId: string, params?: {
    status?: string;
    medicalRecordId?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await apiClient.get<PaginatedResponse<TreatmentSession>>(
      `/medical/sessions/player/${playerId}`,
      { params }
    );
    return response.data;
  },

  /**
   * Get treatment session by ID
   */
  async getById(id: string) {
    const response = await apiClient.get<{ data: TreatmentSession }>(`/medical/sessions/${id}`);
    return response.data;
  },

  /**
   * Update treatment session
   */
  async update(id: string, data: UpdateTreatmentSessionInput) {
    const response = await apiClient.patch<{ data: TreatmentSession }>(
      `/medical/sessions/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Update treatment session status
   */
  async updateStatus(id: string, status: string) {
    const response = await apiClient.patch<{ data: TreatmentSession }>(
      `/medical/sessions/${id}/status`,
      { status }
    );
    return response.data;
  },

  /**
   * Delete treatment session
   */
  async delete(id: string) {
    const response = await apiClient.delete(`/medical/sessions/${id}`);
    return response.data;
  },

  /**
   * Get upcoming treatment sessions for a player
   */
  async getUpcoming(playerId: string) {
    const response = await apiClient.get<{ data: TreatmentSession[] }>(
      `/medical/sessions/player/${playerId}/upcoming`
    );
    return response.data;
  },

  /**
   * Get treatment session statistics for a player
   */
  async getStats(playerId: string) {
    const response = await apiClient.get<{ data: TreatmentSessionStats }>(
      `/medical/sessions/player/${playerId}/stats`
    );
    return response.data;
  },
};
