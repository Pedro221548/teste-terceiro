import { PricingConfig } from './types';

export const DEFAULT_PRICING: PricingConfig = {
  type: 'STARS',
  stars: {
    '1': { employee: 40, company: 10 },
    '2': { employee: 50, company: 10 },
    '3': { employee: 60, company: 10 },
    '4': { employee: 70, company: 10 },
    '5': { employee: 80, company: 10 }
  },
  weekly: {
    'Segunda': { employee: 60, company: 15 },
    'Terça': { employee: 60, company: 15 },
    'Quarta': { employee: 60, company: 15 },
    'Quinta': { employee: 60, company: 15 },
    'Sexta': { employee: 70, company: 20 },
    'Sábado': { employee: 80, company: 25 },
    'Domingo': { employee: 80, company: 25 }
  }
};

export const calculateValue = (rating: number) => {
  return 50 + (rating - 1) * 10;
};
