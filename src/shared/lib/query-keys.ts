/**
 * Query Keys Factory
 * 
 * Centralized query key definitions for consistent cache management
 * and easy invalidation across the application.
 */

export const queryKeys = {
  // Auth queries
  auth: {
    all: ['auth'] as const,
    currentUser: () => [...queryKeys.auth.all, 'currentUser'] as const,
  },

  // Players queries
  players: {
    all: ['players'] as const,
    lists: () => [...queryKeys.players.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.players.lists(), filters] as const,
    details: () => [...queryKeys.players.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.players.details(), id] as const,
  },

  // Contracts queries
  contracts: {
    all: ['contracts'] as const,
    lists: () => [...queryKeys.contracts.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.contracts.lists(), filters] as const,
    details: () => [...queryKeys.contracts.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.contracts.details(), id] as const,
  },

  // Training queries
  training: {
    all: ['training'] as const,
    lists: () => [...queryKeys.training.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.training.lists(), filters] as const,
    details: () => [...queryKeys.training.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.training.details(), id] as const,
  },

  // Performance queries
  performance: {
    all: ['performance'] as const,
    lists: () => [...queryKeys.performance.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.performance.lists(), filters] as const,
    details: () => [...queryKeys.performance.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.performance.details(), id] as const,
  },

  // Legal queries
  legal: {
    all: ['legal'] as const,
    lists: () => [...queryKeys.legal.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.legal.lists(), filters] as const,
    details: () => [...queryKeys.legal.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.legal.details(), id] as const,
  },

  // Chat queries
  chat: {
    all: ['chat'] as const,
    conversations: () => [...queryKeys.chat.all, 'conversations'] as const,
    messages: (conversationId: string) => [...queryKeys.chat.all, 'messages', conversationId] as const,
  },
} as const;
