
export type UnitSystem = 'imperial' | 'metric';

export function useUnits() {
  const units: UnitSystem = 'metric';
  const isMetric = true;

  const labels = {
    length: 'mm',
    weight: 'kg',
    temp: '°C',
    speed: 'mm/min',
    flowRate: 'L/min',
    heatInput: 'kJ/mm',
    volume: 'cm³',
  };

  const toImperial = {
    length: (v: number) => v,
    weight: (v: number) => v,
    speed: (v: number) => v,
    flowRate: (v: number) => v,
  };

  const fromImperial = {
    length: (v: number) => Math.round(v * 100) / 100,
    weight: (v: number) => Math.round(v * 1000) / 1000,
    temp: (v: number) => v,
    speed: (v: number) => Math.round(v * 10) / 10,
    flowRate: (v: number) => Math.round(v * 100) / 100,
    heatInput: (v: number) => Math.round(v * 10000) / 10000,
    volume: (v: number) => Math.round(v * 100) / 100,
  };

  const defaults = {
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

  const setUnits = (_u: UnitSystem) => {};

  return { units, setUnits, isMetric, labels, toImperial, fromImperial, defaults };
}
