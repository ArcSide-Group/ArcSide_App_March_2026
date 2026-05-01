import { useUserPreferences, type UnitSystem } from "@/hooks/useUserPreferences";

export type { UnitSystem };

const METRIC_LABELS = {
  length: 'mm',
  weight: 'kg',
  temp: '°C',
  speed: 'mm/min',
  flowRate: 'L/min',
  heatInput: 'kJ/mm',
  volume: 'cm³',
};

const IMPERIAL_LABELS = {
  length: 'in',
  weight: 'lb',
  temp: '°F',
  speed: 'in/min',
  flowRate: 'CFH',
  heatInput: 'kJ/in',
  volume: 'in³',
};

const METRIC_DEFAULTS = {
  thickness: '6',
  length: '300',
  weldLength: '1500',
  travelSpeed: '200',
  stockLength: '6000',
  legSize: '6',
  plateThickness: '12',
  insideRadius: '3',
  materialThickness: '3',
  heatInput: '0.65',
};

const IMPERIAL_DEFAULTS = {
  thickness: '0.25',
  length: '12',
  weldLength: '60',
  travelSpeed: '8',
  stockLength: '240',
  legSize: '0.25',
  plateThickness: '0.5',
  insideRadius: '0.125',
  materialThickness: '0.125',
  heatInput: '16.5',
};

export function useUnits() {
  const { preferences, setPreference } = useUserPreferences();
  const units: UnitSystem = preferences.units ?? 'metric';
  const isMetric = units === 'metric';

  const labels = isMetric ? METRIC_LABELS : IMPERIAL_LABELS;
  const defaults = isMetric ? METRIC_DEFAULTS : IMPERIAL_DEFAULTS;

  // Conversion factors: 1 in = 25.4 mm, 1 lb = 0.4536 kg
  const toImperial = {
    length: (mm: number) => Math.round((mm / 25.4) * 1000) / 1000,
    weight: (kg: number) => Math.round((kg / 0.4536) * 1000) / 1000,
    speed: (mmPerMin: number) => Math.round((mmPerMin / 25.4) * 100) / 100,
    flowRate: (lpm: number) => Math.round((lpm * 2.119) * 100) / 100,
  };

  const fromImperial = {
    length: (inches: number) => Math.round(inches * 25.4 * 100) / 100,
    weight: (lb: number) => Math.round(lb * 0.4536 * 1000) / 1000,
    temp: (f: number) => Math.round(((f - 32) * 5) / 9 * 10) / 10,
    speed: (inPerMin: number) => Math.round(inPerMin * 25.4 * 10) / 10,
    flowRate: (cfh: number) => Math.round((cfh / 2.119) * 100) / 100,
    heatInput: (kJin: number) => Math.round((kJin / 25.4) * 10000) / 10000,
    volume: (in3: number) => Math.round((in3 * 16.387) * 100) / 100,
  };

  const setUnits = (u: UnitSystem) => setPreference('units', u);

  return { units, setUnits, isMetric, labels, toImperial, fromImperial, defaults };
}
