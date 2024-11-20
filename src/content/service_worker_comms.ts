import { Card, Grade } from '../types.js';

export const requestMine = async (card: Card, forq: boolean, sentence?: string, translation?: string) => {
  console.log('REQUEST MINE STUB');
};

export const requestReview = async (card: Card, rating: Grade) => {
  console.log('REQUEST REVIEW STUB');
};

export const requestSetFlag = async (card: Card, flag: 'blacklist' | 'never-forget' | 'forq', state: boolean) => {
  console.log('REQUEST SET FLAG STUB');
};
