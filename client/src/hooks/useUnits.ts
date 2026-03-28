import { useState, useEffect } from 'react';

export type UnitSystem = 'imperial' | 'metric';

export function useUnits() {
  const [units, setUnitsState] = useState<UnitSystem>(() => {
    return (localStorage.getItem('arcside-units') as UnitSystem) || 'imperial';
  });

  useEffect(() => {
    localStorage.setItem('arcside-units', units);
  }, [units]);

  const setUnits = (u: UnitSystem) => setUnitsState(u);
  const isMetric = units === 'metric';

  const labels = {
    length: isMetric ? 'mm' : 'in',
    weight: isMetric ? 'kg' : 'lbs',
    temp: isMetric ? '°C' : '°F',
    speed: isMetric ? 'mm/min' : 'in/min',
    flowRate: isMetric ? 'L/min' : 'CFH',
    heatInput: isMetric ? 'kJ/mm' : 'kJ/in',
    volume: isMetric ? 'cm³' : 'in³',
  };

  // Convert FROM the user's display unit TO imperial (for sending to the API)
  const toImperial = {
    length: (v: number) => isMetric ? v / 25.4 : v,
    weight: (v: number) => isMetric ? v * 2.20462 : v,
    speed: (v: number) => isMetric ? v / 25.4 : v,
    flowRate: (v: number) => isMetric ? v / 0.4719 : v,
  };

  // Convert FROM imperial (API result) TO the user's display unit
  const fromImperial = {
    length: (v: number) => isMetric ? Math.round(v * 25.4 * 100) / 100 : v,
    weight: (v: number) => isMetric ? Math.round(v * 0.453592 * 1000) / 1000 : v,
    temp: (v: number) => isMetric ? Math.round((v - 32) * 5 / 9) : v,
    speed: (v: number) => isMetric ? Math.round(v * 25.4 * 10) / 10 : v,
    flowRate: (v: number) => isMetric ? Math.round(v * 0.4719 * 100) / 100 : v,
    heatInput: (v: number) => isMetric ? Math.round((v / 25.4) * 10000) / 10000 : v,
    volume: (v: number) => isMetric ? Math.round(v * 16.3871 * 100) / 100 : v,
  };

  // Sensible default form values per unit system
  const defaults = {
    thickness: isMetric ? '6' : '0.25',
    length: isMetric ? '300' : '12',
    weldLength: isMetric ? '1500' : '60',
    travelSpeed: isMetric ? '200' : '8',
    stockLength: isMetric ? '6000' : '240',
    legSize: isMetric ? '6' : '0.25',
    plateThickness: isMetric ? '12' : '0.5',
    insideRadius: isMetric ? '3' : '0.125',
    materialThickness: isMetric ? '3' : '0.125',
    heatInput: isMetric ? '60' : '1.5',
  };

  return { units, setUnits, isMetric, labels, toImperial, fromImperial, defaults };
}
