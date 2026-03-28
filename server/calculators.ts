
export class WeldingCalculators {
  static calculateVoltageAmperage(params: {
    material: string;
    thickness: number;
    process: string;
    position: string;
    wireSize?: number;
  }) {
    const { material, thickness, process, position, wireSize = 0.035 } = params;
    
    let baseVoltage = 18;
    let baseAmperage = 100;
    
    // Adjust for thickness
    if (thickness <= 0.125) {
      baseAmperage = 80 + (thickness * 400);
      baseVoltage = 16 + (thickness * 20);
    } else if (thickness <= 0.5) {
      baseAmperage = 130 + (thickness * 200);
      baseVoltage = 18 + (thickness * 16);
    } else {
      baseAmperage = 180 + (thickness * 120);
      baseVoltage = 20 + (thickness * 12);
    }
    
    // Adjust for process
    if (process === 'GTAW') {
      baseAmperage *= 0.8;
      baseVoltage *= 0.9;
    } else if (process === 'SMAW') {
      baseAmperage *= 1.1;
      baseVoltage *= 0.95;
    }
    
    // Adjust for position
    if (position === 'overhead') {
      baseAmperage *= 0.85;
    } else if (position === 'vertical') {
      baseAmperage *= 0.9;
    }
    
    return {
      voltage: Math.round(baseVoltage),
      amperage: Math.round(baseAmperage),
      voltageRange: `${Math.round(baseVoltage - 2)}-${Math.round(baseVoltage + 2)}V`,
      amperageRange: `${Math.round(baseAmperage - 20)}-${Math.round(baseAmperage + 20)}A`,
      recommendations: [
        "Start with lower settings and gradually increase",
        "Adjust based on penetration and bead appearance",
        "Monitor for proper arc characteristics"
      ]
    };
  }

  static calculateWireFeedSpeed(params: {
    amperage: number;
    wireSize: number;
    material: string;
  }) {
    const { amperage, wireSize, material } = params;
    
    // Base calculation: IPM = (Amperage / Wire Cross-sectional Area) * Material Factor
    const wireArea = Math.PI * Math.pow(wireSize / 2, 2);
    let materialFactor = 1.0;
    
    if (material.includes('aluminum')) {
      materialFactor = 1.3;
    } else if (material.includes('stainless')) {
      materialFactor = 0.9;
    }
    
    const wireSpeed = (amperage / (wireArea * 1000)) * materialFactor;
    
    return {
      wireSpeed: Math.round(wireSpeed * 10) / 10,
      unit: 'IPM',
      recommendations: [
        "Fine-tune based on arc stability",
        "Increase speed for thicker materials",
        "Decrease speed for better penetration"
      ]
    };
  }

  static calculateHeatInput(params: {
    voltage: number;
    amperage: number;
    travelSpeed: number;
    efficiency?: number;
  }) {
    const { voltage, amperage, travelSpeed, efficiency = 0.8 } = params;
    
    // Heat Input = (Voltage × Amperage × Efficiency) / Travel Speed
    const heatInput = (voltage * amperage * efficiency) / travelSpeed;
    
    let classification = 'Medium';
    if (heatInput < 1.0) classification = 'Low';
    else if (heatInput > 2.5) classification = 'High';
    
    return {
      heatInput: Math.round(heatInput * 100) / 100,
      unit: 'kJ/in',
      classification,
      recommendations: classification === 'High' ? [
        "Consider preheating to reduce cooling rate",
        "Monitor for heat affected zone changes",
        "May require post-weld heat treatment"
      ] : [
        "Good heat input range for most applications",
        "Monitor weld penetration and fusion"
      ]
    };
  }

  static calculateGasFlowRate(params: {
    process: string;
    material: string;
    thickness: number;
    position: string;
    environment: string;
  }) {
    const { process, material, thickness, position, environment } = params;
    
    let baseFlow = 20; // CFH
    
    if (material.includes('aluminum')) {
      baseFlow = 25;
    } else if (material.includes('stainless')) {
      baseFlow = 22;
    }
    
    if (thickness > 0.5) {
      baseFlow += 5;
    }
    
    if (position === 'overhead') {
      baseFlow += 3;
    }
    
    if (environment === 'windy') {
      baseFlow += 10;
    }
    
    return {
      flowRate: baseFlow,
      unit: 'CFH',
      range: `${baseFlow - 5}-${baseFlow + 5} CFH`,
      gasType: process === 'GTAW' ? 'Argon' : '75% Ar / 25% CO₂',
      recommendations: [
        "Start with recommended flow rate",
        "Adjust based on weld quality",
        "Too much flow can cause turbulence"
      ]
    };
  }

  static calculatePreheatTemperature(params: {
    material: string;
    thickness: number;
    process: string;
    heatInput: number;
  }) {
    const { material, thickness, process, heatInput } = params;

    // Carbon Equivalent values by common steel grades
    const ceMap: Record<string, number> = {
      'a36': 0.40,
      'a572-gr50': 0.46,
      'a514': 0.65,
      '4130': 0.75,
      '4140': 0.82,
      '1045': 0.62,
      '1018': 0.35,
      '1020': 0.38,
      'a992': 0.47,
      'dom': 0.50,
    };

    const ce = ceMap[material] ?? 0.45;

    // Base preheat (°F) from CE per AWS D1.1 guidance
    let preheatF = 0;
    if (ce >= 0.60) preheatF = 350;
    else if (ce >= 0.55) preheatF = 250;
    else if (ce >= 0.45) preheatF = 150;
    else if (ce >= 0.40) preheatF = 50;

    // Thickness adjustments
    if (thickness > 2.5) preheatF += 100;
    else if (thickness > 1.5) preheatF += 50;
    else if (thickness > 0.75) preheatF += 25;

    // Low heat input increases cold-cracking risk
    if (heatInput < 1.0) preheatF += 50;

    // GTAW/GMAW are cleaner processes — slight reduction
    if (process === 'GTAW' || process === 'GMAW') {
      preheatF = Math.max(0, preheatF - 25);
    }

    preheatF = Math.round(preheatF / 25) * 25; // round to nearest 25°F
    const preheatC = Math.round((preheatF - 32) * 5 / 9);
    const maxInterpassF = Math.min(preheatF + 350, 500);
    const maxInterpassC = Math.round((maxInterpassF - 32) * 5 / 9);
    const riskLevel = ce > 0.60 ? 'High' : ce > 0.45 ? 'Moderate' : 'Low';

    const recs: string[] = [];
    if (preheatF > 0) {
      recs.push(`Heat base metal to at least ${preheatF}°F (${preheatC}°C) before welding`);
    } else {
      recs.push('No preheat required under normal ambient conditions');
    }
    recs.push(`Maximum interpass temperature: ${maxInterpassF}°F (${maxInterpassC}°C)`);
    if (ce > 0.60) recs.push('Post-weld heat treatment (PWHT) strongly recommended');
    recs.push('Verify temperature using temp-sticks or contact thermocouple');
    recs.push('Maintain preheat for at least 3" on each side of the joint');

    return {
      preheatF: Math.max(0, preheatF),
      preheatC: Math.max(-18, preheatC),
      maxInterpassF,
      maxInterpassC,
      carbonEquivalent: ce,
      riskLevel,
      recommendations: recs,
    };
  }

  static calculateFillerConsumption(params: {
    jointType: string;
    weldLength: number;
    legSize: number;
    plateThickness: number;
    grooveAngle: number;
    passes: number;
    process: string;
  }) {
    const { jointType, weldLength, legSize, plateThickness, grooveAngle, passes, process } = params;

    // Deposition efficiency by process
    const efficiency: Record<string, number> = {
      'GMAW': 0.93,
      'FCAW': 0.86,
      'SMAW': 0.68,
      'GTAW': 0.98,
      'SAW': 0.99,
    };
    const depEff = efficiency[process] ?? 0.85;

    // Spatter & stub loss factor (multiplier on wire/electrode needed)
    const lossFactor = 1 / depEff;

    // Steel density lb/in³
    const density = 0.284;

    // Cross-sectional area of the weld joint (in²)
    let area = 0;
    if (jointType === 'fillet') {
      area = 0.5 * legSize * legSize;
    } else if (jointType === 'butt-vgroove') {
      const halfAngle = (grooveAngle / 2) * (Math.PI / 180);
      area = Math.pow(plateThickness, 2) * Math.tan(halfAngle) * 0.5 + 0.0625 * plateThickness;
    } else if (jointType === 'lap') {
      area = legSize * legSize * 0.5;
    }

    const weldVolume = area * weldLength * passes; // in³
    const depositedWeight = weldVolume * density; // lbs deposited
    const fillerRequired = depositedWeight * lossFactor; // lbs of filler needed
    const electrodesEstimate = Math.ceil(fillerRequired / 0.35); // rough 7018 electrode ~0.35lb usable

    return {
      depositedWeight: Math.round(depositedWeight * 100) / 100,
      fillerRequired: Math.round(fillerRequired * 100) / 100,
      weldVolume: Math.round(weldVolume * 100) / 100,
      depositEfficiency: Math.round(depEff * 100),
      electrodesEstimate: process === 'SMAW' ? electrodesEstimate : null,
      unit: 'lbs',
      recommendations: [
        `Order at least ${Math.ceil(fillerRequired * 1.1)} lbs to account for waste`,
        `Deposition efficiency for ${process}: ${Math.round(depEff * 100)}%`,
        'Track actual consumption per joint to refine estimates',
        process === 'SMAW' ? `Approx. ${electrodesEstimate} electrodes (3/32"–1/8" 7018)` : 'Use wire spool weight to plan procurement',
      ],
    };
  }

  static calculateWeldTime(params: {
    weldLength: number;
    travelSpeed: number;
    passes: number;
    numberOfJoints: number;
    setupTimePerJoint: number;
    arcEfficiency: number;
    laborRate: number;
  }) {
    const { weldLength, travelSpeed, passes, numberOfJoints, setupTimePerJoint, arcEfficiency, laborRate } = params;

    const arcTimePerPass = weldLength / travelSpeed; // minutes
    const totalArcTime = arcTimePerPass * passes; // minutes
    const totalSetupTime = numberOfJoints * setupTimePerJoint; // minutes
    const totalOperatingTime = totalArcTime / (arcEfficiency / 100); // accounts for arc-off time
    const totalTime = totalOperatingTime + totalSetupTime; // minutes
    const totalHours = totalTime / 60;
    const laborCost = totalHours * laborRate;

    return {
      arcTimeMin: Math.round(totalArcTime * 10) / 10,
      setupTimeMin: Math.round(totalSetupTime * 10) / 10,
      totalTimeMin: Math.round(totalTime * 10) / 10,
      totalHours: Math.round(totalHours * 100) / 100,
      laborCost: Math.round(laborCost * 100) / 100,
      arcEfficiency,
      recommendations: [
        `Arc-on time: ${Math.round(totalArcTime)} min — operating time: ${Math.round(totalOperatingTime)} min`,
        'Add 10–15% buffer for unforeseen delays',
        arcEfficiency < 30 ? 'Low arc efficiency — consider workflow improvements' : 'Arc efficiency is within normal range',
        laborRate > 0 ? `Estimated labor cost: $${laborCost.toFixed(2)} at $${laborRate}/hr` : 'Enter a labor rate to calculate cost',
      ],
    };
  }

  static calculateCuttingLength(params: {
    stockLength: number;
    parts: Array<{ length: number; quantity: number }>;
    kerfWidth: number;
  }) {
    const { stockLength, parts, kerfWidth } = params;

    // Greedy first-fit bin packing
    const stocks: number[] = []; // remaining length in each stock bar
    let totalCuts = 0;
    let totalPartsLength = 0;

    const allPieces: number[] = [];
    for (const part of parts) {
      for (let i = 0; i < part.quantity; i++) {
        allPieces.push(part.length);
        totalPartsLength += part.length;
      }
    }

    // Sort descending for better packing
    allPieces.sort((a, b) => b - a);

    for (const piece of allPieces) {
      let placed = false;
      for (let i = 0; i < stocks.length; i++) {
        const needed = piece + kerfWidth;
        if (stocks[i] >= needed) {
          stocks[i] -= needed;
          totalCuts++;
          placed = true;
          break;
        }
      }
      if (!placed) {
        stocks.push(stockLength - piece);
        totalCuts++;
      }
    }

    const barsNeeded = stocks.length;
    const totalStockLength = barsNeeded * stockLength;
    const totalWaste = totalStockLength - totalPartsLength - (totalCuts * kerfWidth);
    const utilization = Math.round((totalPartsLength / totalStockLength) * 100 * 10) / 10;
    const totalCutLength = totalCuts * kerfWidth;

    return {
      barsNeeded,
      totalCuts,
      totalCutLength: Math.round(totalCutLength * 100) / 100,
      totalWaste: Math.round(totalWaste * 100) / 100,
      utilization,
      totalStockLength,
      recommendations: [
        `${barsNeeded} stock bar(s) required at ${stockLength}" each`,
        `Material utilization: ${utilization}%`,
        utilization < 75 ? 'Consider re-nesting parts to reduce waste' : 'Good material utilization',
        `Total kerf waste from cuts: ${Math.round(totalCutLength * 100) / 100}"`,
        'Add 1 extra bar as buffer for defects or remeasurement',
      ],
    };
  }
}

export class FabricationCalculators {
  static calculateMetalWeight(params: {
    material: string;
    shape: string;
    dimensions: {
      length?: number;
      width?: number;
      thickness?: number;
      diameter?: number;
      outerDiameter?: number;
      innerDiameter?: number;
    };
  }) {
    const { material, shape, dimensions } = params;
    
    // Material densities (lb/in³)
    const densities: Record<string, number> = {
      'steel': 0.284,
      'aluminum': 0.098,
      'stainless': 0.290,
      'copper': 0.324,
      'brass': 0.307
    };
    
    const density = densities[material.toLowerCase()] || densities.steel;
    let volume = 0;
    
    switch (shape) {
      case 'plate':
        volume = (dimensions.length || 0) * (dimensions.width || 0) * (dimensions.thickness || 0);
        break;
      case 'rod':
        volume = Math.PI * Math.pow((dimensions.diameter || 0) / 2, 2) * (dimensions.length || 0);
        break;
      case 'tube':
        const outerRadius = (dimensions.outerDiameter || 0) / 2;
        const innerRadius = (dimensions.innerDiameter || 0) / 2;
        volume = Math.PI * (Math.pow(outerRadius, 2) - Math.pow(innerRadius, 2)) * (dimensions.length || 0);
        break;
    }
    
    const weight = volume * density;
    
    return {
      weight: Math.round(weight * 100) / 100,
      unit: 'lbs',
      volume: Math.round(volume * 100) / 100,
      volumeUnit: 'in³',
      density,
      recommendations: [
        "Add 5-10% for waste and cutoffs",
        "Consider material handling requirements",
        "Verify material specifications"
      ]
    };
  }

  static calculateBendAllowance(params: {
    thickness: number;
    bendAngle: number;
    insideRadius: number;
    kFactor?: number;
  }) {
    const { thickness, bendAngle, insideRadius, kFactor = 0.33 } = params;
    
    // Bend Allowance = (π/180) × Bend Angle × (Inside Radius + K-Factor × Thickness)
    const bendAllowance = (Math.PI / 180) * bendAngle * (insideRadius + kFactor * thickness);
    
    // Setback = (Inside Radius + Thickness) × tan(Bend Angle / 2)
    const setback = (insideRadius + thickness) * Math.tan((bendAngle * Math.PI / 180) / 2);
    
    return {
      bendAllowance: Math.round(bendAllowance * 1000) / 1000,
      setback: Math.round(setback * 1000) / 1000,
      kFactor,
      unit: 'in',
      recommendations: [
        "Test bend on scrap material first",
        "Adjust K-factor based on material properties",
        "Consider grain direction for best results"
      ]
    };
  }

  static calculateProjectCost(params: {
    materials: Array<{
      type: string;
      quantity: number;
      unitCost: number;
    }>;
    laborHours: number;
    laborRate: number;
    overhead?: number;
    profit?: number;
  }) {
    const { materials, laborHours, laborRate, overhead = 0.15, profit = 0.20 } = params;
    
    const materialCost = materials.reduce((total, material) => {
      return total + (material.quantity * material.unitCost);
    }, 0);
    
    const laborCost = laborHours * laborRate;
    const directCosts = materialCost + laborCost;
    const overheadCost = directCosts * overhead;
    const totalCost = directCosts + overheadCost;
    const profitAmount = totalCost * profit;
    const finalPrice = totalCost + profitAmount;
    
    return {
      materialCost: Math.round(materialCost * 100) / 100,
      laborCost: Math.round(laborCost * 100) / 100,
      overheadCost: Math.round(overheadCost * 100) / 100,
      profitAmount: Math.round(profitAmount * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      finalPrice: Math.round(finalPrice * 100) / 100,
      breakdown: {
        materials: `${((materialCost / finalPrice) * 100).toFixed(1)}%`,
        labor: `${((laborCost / finalPrice) * 100).toFixed(1)}%`,
        overhead: `${((overheadCost / finalPrice) * 100).toFixed(1)}%`,
        profit: `${((profitAmount / finalPrice) * 100).toFixed(1)}%`
      },
      recommendations: [
        "Add contingency for unexpected costs",
        "Review material prices regularly",
        "Track actual vs estimated time"
      ]
    };
  }
}
