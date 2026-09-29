import apiClient from '@/shared/lib/api-client';
import type {
  ScoutingReport,
  PlayerWatchlist,
  ScoutingAssignment,
  CreateScoutingReportInput,
  UpdateScoutingReportInput,
  QueryScoutingReportsParams,
  AddToWatchlistInput,
  CreateAssignmentInput,
  UpdateAssignmentInput,
  ScoutingReportStats,
  PaginatedResponse,
} from '@/shared/types/scouting.types';

/**
 * Scouting Reports API
 */
export const scoutingReportsApi = {
  /**
   * Create a new scouting report
   */
  async create(data: CreateScoutingReportInput) {
    const response = await apiClient.post<{ data: ScoutingReport }>(
      '/scouting/reports',
      data,
    );
    return response.data;
  },

  /**
   * Get all scouting reports with pagination and filters
   */
  async getAll(params?: QueryScoutingReportsParams) {
    const response = await apiClient.get<PaginatedResponse<ScoutingReport>>(
      '/scouting/reports',
      {
        params,
      },
    );
    return response.data;
  },

  /**
   * Get scouting report by ID
   */
  async getById(id: string) {
    const response = await apiClient.get<{ data: ScoutingReport }>(
      `/scouting/reports/${id}`,
    );
    return response.data;
  },

  /**
   * Update scouting report
   */
  async update(id: string, data: UpdateScoutingReportInput) {
    const response = await apiClient.patch<{ data: ScoutingReport }>(
      `/scouting/reports/${id}`,
      data,
    );
    return response.data;
  },

  /**
   * Submit scouting report for review
   */
  async submit(id: string) {
    const response = await apiClient.post<{ data: ScoutingReport }>(
      `/scouting/reports/${id}/submit`,
    );
    return response.data;
  },

  /**
   * Approve scouting report
   */
  async approve(id: string, recommendation: string) {
    const response = await apiClient.post<{ data: ScoutingReport }>(
      `/scouting/reports/${id}/approve`,
      { recommendation },
    );
    return response.data;
  },

  /**
   * Reject scouting report
   */
  async reject(id: string) {
    const response = await apiClient.post<{ data: ScoutingReport }>(
      `/scouting/reports/${id}/reject`,
    );
    return response.data;
  },

  /**
   * Delete scouting report
   */
  async delete(id: string) {
    const response = await apiClient.delete(`/scouting/reports/${id}`);
    return response.data;
  },

  /**
   * Get my scouting report statistics
   */
  async getMyStats() {
    const response = await apiClient.get<{ data: ScoutingReportStats }>(
      '/scouting/reports/stats/my-stats',
    );
    return response.data;
  },
};

/**
 * Watchlist API
 */
export const watchlistApi = {
  /**
   * Add player to watchlist
   */
  async add(data: AddToWatchlistInput) {
    const response = await apiClient.post<{ data: PlayerWatchlist }>(
      '/scouting/watchlist',
      data,
    );
    return response.data;
  },

  /**
   * Get my watchlist
   */
  async getMyWatchlist() {
    const response = await apiClient.get<{ data: PlayerWatchlist[] }>(
      '/scouting/watchlist',
    );
    return response.data;
  },

  /**
   * Remove player from watchlist
   */
  async remove(playerId: string) {
    const response = await apiClient.delete(`/scouting/watchlist/${playerId}`);
    return response.data;
  },

  /**
   * Check if player is in watchlist
   */
  async check(playerId: string) {
    const response = await apiClient.get<{ data: { isInWatchlist: boolean } }>(
      `/scouting/watchlist/check/${playerId}`,
    );
    return response.data;
  },
};

/**
 * Assignments API
 */
export const assignmentsApi = {
  /**
   * Create scouting assignment
   */
  async create(data: CreateAssignmentInput) {
    const response = await apiClient.post<{ data: ScoutingAssignment }>(
      '/scouting/assignments',
      data,
    );
    return response.data;
  },

  /**
   * Get my assignments (for scouts)
   */
  async getMyAssignments(status?: string) {
    const response = await apiClient.get<{ data: ScoutingAssignment[] }>(
      '/scouting/assignments/my-assignments',
      { params: { status } },
    );
    return response.data;
  },

  /**
   * Get assignments created by director
   */
  async getDirectorView(status?: string) {
    const response = await apiClient.get<{ data: ScoutingAssignment[] }>(
      '/scouting/assignments/director-view',
      { params: { status } },
    );
    return response.data;
  },

  /**
   * Update assignment
   */
  async update(id: string, data: UpdateAssignmentInput) {
    const response = await apiClient.patch<{ data: ScoutingAssignment }>(
      `/scouting/assignments/${id}`,
      data,
    );
    return response.data;
  },

  /**
   * Update assignment status
   */
  async updateStatus(id: string, status: string) {
    const response = await apiClient.patch<{ data: ScoutingAssignment }>(
      `/scouting/assignments/${id}/status`,
      { status },
    );
    return response.data;
  },

  /**
   * Delete assignment
   */
  async delete(id: string) {
    const response = await apiClient.delete(`/scouting/assignments/${id}`);
    return response.data;
  },
};
