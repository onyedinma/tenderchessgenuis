import { request } from './api';

export interface Puzzle {
  id: number;
  title: string;
  fen: string;
  difficulty: string;
  category: string;
  solution: string;
  created_at: string;
}

export interface PuzzlesResponse {
  success: boolean;
  puzzles: Puzzle[];
  total: number;
  limit: number;
  offset: number;
}

export interface PuzzleParams {
  difficulty?: string;
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

const getPuzzles = async (params: PuzzleParams = {}): Promise<PuzzlesResponse> => {
  const response = await request({
    method: 'GET',
    url: '/puzzles/get-puzzles.php',
    params
  });
  return response.data;
};

export default {
  getPuzzles,
}; 