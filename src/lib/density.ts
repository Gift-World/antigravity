// src/lib/density.ts
import { RiskLevel } from '@/types/database';

export function getRiskLevelFromDensity(density: number, warningThreshold = 4.5, criticalThreshold = 5.5): RiskLevel {
  if (density >= criticalThreshold) return 'critical';
  if (density >= warningThreshold) return 'warning';
  if (density >= 3.0) return 'elevated';
  return 'safe';
}

export function getDensityColor(density: number): {
  fill: string;
  stroke: string;
  text: string;
  glow: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
} {
  if (density >= 5.5) {
    return {
      fill: 'rgba(255, 23, 68, 0.55)',
      stroke: '#FF1744',
      text: '#FF1744',
      glow: '0 0 24px rgba(255, 23, 68, 0.8)',
      badgeBg: 'bg-ag-red-dim',
      badgeBorder: 'border-ag-red/40',
      badgeText: 'text-ag-red',
    };
  }
  if (density >= 4.5) {
    return {
      fill: 'rgba(255, 145, 0, 0.45)',
      stroke: '#FF9100',
      text: '#FF9100',
      glow: '0 0 18px rgba(255, 145, 0, 0.6)',
      badgeBg: 'bg-ag-orange-dim',
      badgeBorder: 'border-ag-orange/40',
      badgeText: 'text-ag-orange',
    };
  }
  if (density >= 3.0) {
    return {
      fill: 'rgba(255, 215, 64, 0.35)',
      stroke: '#FFD740',
      text: '#FFD740',
      glow: '0 0 12px rgba(255, 215, 64, 0.5)',
      badgeBg: 'bg-ag-yellow-dim',
      badgeBorder: 'border-ag-yellow/40',
      badgeText: 'text-ag-yellow',
    };
  }
  return {
    fill: 'rgba(0, 230, 118, 0.25)',
    stroke: '#00E676',
    text: '#00E676',
    glow: '0 0 10px rgba(0, 230, 118, 0.3)',
    badgeBg: 'bg-ag-green-dim',
    badgeBorder: 'border-ag-green/40',
    badgeText: 'text-ag-green',
  };
}

export function getRiskLabel(risk: RiskLevel): string {
  switch (risk) {
    case 'critical':
      return 'CRITICAL CRUSH RISK';
    case 'warning':
      return 'DENSITY WARNING';
    case 'elevated':
      return 'ELEVATED FLOW';
    case 'safe':
    default:
      return 'SAFE CAPACITY';
  }
}
