import React from 'react';
import Svg, { G, Path } from 'react-native-svg';
import { colors } from '../theme/colors';

/**
 * Logo fleur Link & Walk reconstruit depuis la maquette Figma (nœud 3:58).
 * Les 6 pétales sont placés dans un viewBox de 84 x 90 (taille native du logo)
 * via une translation (x, y) reprise des positions du design.
 */

type Petal = {
  x: number;
  y: number;
  width: number;
  height: number;
  // viewBox d'origine de chaque pétale (pour mettre le path à l'échelle)
  vbWidth: number;
  vbHeight: number;
  fill: string;
  d: string;
};

// Offsets relatifs au cadre du logo (origine Figma 155, 189)
const PETALS: Petal[] = [
  {
    x: 32.572, y: 0, width: 20.085, height: 34.03, vbWidth: 20.0847, vbHeight: 34.0304,
    fill: colors.petalPink,
    d: 'M9.37572 34.0304C-12.6803 19.1151 11.096 0 11.096 0C11.096 0 31.4783 18.3512 10.8579 33.8349',
  },
  {
    x: 49.333, y: 24.481, width: 34.608, height: 19.38, vbWidth: 34.6082, vbHeight: 19.3804,
    fill: colors.petalBlue,
    d: 'M0 15.2374C6.11495 -9.32185 34.6082 3.1836 34.6082 3.1836C34.6082 3.1836 24.4028 27.6928 0.784409 16.4125',
  },
  {
    x: 45.5, y: 44.069, width: 22.969, height: 28.877, vbWidth: 22.9693, vbHeight: 28.8771,
    fill: colors.petalBlue,
    d: 'M2.33141 0C29.6882 0.698389 21.9629 28.8771 21.9629 28.8771C21.9629 28.8771 -6.14202 24.4758 1.23372 0.937938',
  },
  {
    x: 14.363, y: 44.068, width: 24.786, height: 27.33, vbWidth: 24.7857, vbHeight: 27.3301,
    fill: colors.petalDark,
    d: 'M23.3482 0.638798C31.7815 24.6093 0.354948 27.3301 0.354948 27.3301C0.354948 27.3301 -4.53932 1.47186 22.0201 0',
  },
  {
    x: 0, y: 24.415, width: 35.174, height: 19.514, vbWidth: 35.1739, vbHeight: 19.5135,
    fill: colors.petalPink,
    d: 'M34.9591 14.7734C13.171 30.02 0 3.60876 0 3.60876C0 3.60876 24.8922 -9.18629 35.1739 13.4088',
  },
  {
    x: 38.806, y: 36.476, width: 5.874, height: 5.408, vbWidth: 5.87417, vbHeight: 5.40834,
    fill: colors.text,
    d: 'M2.93709 5.40834C4.5592 5.40834 5.87417 4.19764 5.87417 2.70417C5.87417 1.2107 4.5592 0 2.93709 0C1.31497 0 0 1.2107 0 2.70417C0 4.19764 1.31497 5.40834 2.93709 5.40834Z',
  },
];

const LOGO_WIDTH = 84;
const LOGO_HEIGHT = 90;

type Props = {
  size?: number;
};

export function Logo({ size = 84 }: Props) {
  const height = (size / LOGO_WIDTH) * LOGO_HEIGHT;
  return (
    <Svg width={size} height={height} viewBox={`0 0 ${LOGO_WIDTH} ${LOGO_HEIGHT}`}>
      {PETALS.map((p, i) => (
        <G key={i} transform={`translate(${p.x}, ${p.y}) scale(${p.width / p.vbWidth}, ${p.height / p.vbHeight})`}>
          <Path d={p.d} fill={p.fill} />
        </G>
      ))}
    </Svg>
  );
}
