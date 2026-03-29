
export class WeldingCalculators {
  static calculateVoltageAmperage(params: {
    material: string;
    thickness: number;
    process: string;
    position: string;
    wireSize?: number;
  }) {
    const { material, thickness, process, position, wireSize = 0.9 } = params;

    let baseVoltage = 18;
    let baseAmperage = 100;

    // Thickness in mm — AWS D1.1 empirical rule ~40A per mm of steel for GMAW
    if (thickness <= 3) {
      baseAmperage = 80 + (thickness * 15.75);
      baseVoltage = 16 + (thickness * 0.787);
    } else if (thickness <= 13) {
      baseAmperage = 130 + (thickness * 7.87);
      baseVoltage = 18 + (thickness * 0.63);
    } else {
      baseAmperage = 180 + (thickness * 4.72);
      baseVoltage = 20 + (thickness * 0.47);
    }

    if (process === 'GTAW') {
      baseAmperage *= 0.8;
      baseVoltage *= 0.9;
    } else if (process === 'SMAW') {
      baseAmperage *= 1.1;
      baseVoltage *= 0.95;
    } else if (process === 'FCAW') {
      baseAmperage *= 1.05;
      baseVoltage *= 1.02;
    }

    if (material.includes('aluminum') || material === 'aluminum') {
      baseAmperage *= 0.9;
      baseVoltage *= 0.95;
    } else if (material.includes('stainless')) {
      baseAmperage *= 0.95;
    }

    if (position === 'overhead') {
      baseAmperage *= 0.85;
    } else if (position === 'vertical') {
      baseAmperage *= 0.90;
    }

    const recAmperage = Math.round(baseAmperage);
    const recVoltage = Math.round(baseVoltage);

    return {
      recommendedVoltage: recVoltage,
      recommendedAmperage: recAmperage,
      voltageRange: { min: recVoltage - 2, max: recVoltage + 2 },
      amperageRange: { min: recAmperage - 20, max: recAmperage + 20 },
      recommendations: [
        "Start with lower settings and gradually increase",
        "Adjust based on penetration and bead appearance",
        "Monitor for proper arc characteristics",
        process === 'GTAW' ? "GTAW: use high-frequency start and maintain consistent arc length" :
          "Follow your WPS if one is available for this joint"
      ]
    };
  }

  static calculateWireFeedSpeed(params: {
    amperage: number;
    wireSize: number;
    material: string;
  }) {
    const { amperage, wireSize, material } = params;

    let materialFactor = 1.0;
    if (material.includes('aluminum')) {
      materialFactor = 1.3;
    } else if (material.includes('stainless')) {
      materialFactor = 0.9;
    }

    // wireSize in mm — compute area in mm², convert to in² for empirical formula, return mm/min
    const wireArea_mm2 = Math.PI * Math.pow(wireSize / 2, 2);
    const wireArea_in2 = wireArea_mm2 / 645.16;
    const wireSpeed_ipm = (amperage / (wireArea_in2 * 1000)) * materialFactor;
    const wireSpeed_mmpm = wireSpeed_ipm * 25.4;

    return {
      wireSpeed: Math.round(wireSpeed_mmpm),
      unit: 'mm/min',
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

    // ISO 13916 / AWS D1.1 Metric Formula:
    // HI (kJ/mm) = (V × A × 60 × η) / (S_mm/min × 1000)
    const heatInput = (voltage * amperage * efficiency * 60) / (travelSpeed * 1000);

    // Thresholds in kJ/mm (converted from kJ/in: ÷ 25.4)
    // Low  < 1.0 kJ/mm  (~25 kJ/in)
    // High > 2.5 kJ/mm  (~65 kJ/in)
    let classification = 'Medium';
    if (heatInput < 1.0) classification = 'Low';
    else if (heatInput > 2.5) classification = 'High';

    return {
      heatInput: Math.round(heatInput * 1000) / 1000,
      unit: 'kJ/mm',
      classification,
      recommendations: classification === 'High' ? [
        "High heat input — preheat base metal per ISO 13916 / AWS D1.1",
        "Monitor heat-affected zone (HAZ) grain growth carefully",
        "Post-weld heat treatment (PWHT) may be required for code work",
        "Consider increasing travel speed to reduce heat input"
      ] : classification === 'Low' ? [
        "Low heat input — verify adequate fusion at root of joint",
        "Increase amperage or reduce travel speed if lack-of-fusion occurs",
        "Good for thin materials and distortion-sensitive assemblies"
      ] : [
        "Heat input is within the optimal range for most structural welding",
        "Monitor weld bead profile and penetration visually",
        "Document parameters for WPS qualification records"
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

    let baseFlow = 9; // L/min (equiv. ~20 CFH)

    if (material.includes('aluminum')) {
      baseFlow = 12; // ~25 CFH
    } else if (material.includes('stainless')) {
      baseFlow = 10; // ~22 CFH
    }

    if (thickness > 13) { // > 0.5 in equivalent
      baseFlow += 2;
    }

    if (position === 'overhead') {
      baseFlow += 1;
    }

    if (environment === 'windy') {
      baseFlow += 5;
    }

    let gasType = '75% Ar / 25% CO₂';
    if (process === 'GTAW') {
      gasType = '100% Argon';
    } else if (material.includes('aluminum')) {
      gasType = '100% Argon';
    } else if (material.includes('stainless')) {
      gasType = '98% Ar / 2% CO₂ (Tri-Mix optional)';
    } else if (process === 'FCAW') {
      gasType = '75% Ar / 25% CO₂ (or per wire spec)';
    }

    return {
      flowRate: baseFlow,
      unit: 'L/min',
      range: `${baseFlow - 2}–${baseFlow + 2} L/min`,
      gasType,
      recommendations: [
        `Recommended gas: ${gasType}`,
        "Start at the lower end of the range and increase if porosity occurs",
        "Too much flow can cause turbulence and pull in atmospheric contamination",
        environment === 'windy' ? "Outdoor/windy: use a windshield or increase to 17–21 L/min" : "Indoor welding: lower flow rates are sufficient"
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

    // Base preheat (°C) from CE — ISO 13916 / AWS D1.1 guidance
    let preheatC = 0;
    if (ce >= 0.60) preheatC = 175;
    else if (ce >= 0.55) preheatC = 120;
    else if (ce >= 0.45) preheatC = 65;
    else if (ce >= 0.40) preheatC = 10;

    // Thickness adjustments (mm thresholds)
    if (thickness > 63) preheatC += 55;        // > 2.5 in
    else if (thickness > 38) preheatC += 28;   // > 1.5 in
    else if (thickness > 19) preheatC += 14;   // > 0.75 in

    // Low heat input (< 0.04 kJ/mm ≈ 1.0 kJ/in) increases cold-cracking risk
    if (heatInput < 0.04) preheatC += 28;

    // GTAW/GMAW are cleaner processes — slight reduction
    if (process === 'GTAW' || process === 'GMAW') {
      preheatC = Math.max(0, preheatC - 14);
    }

    preheatC = Math.round(preheatC / 10) * 10; // round to nearest 10°C
    const maxInterpassC = Math.min(preheatC + 195, 260);
    const riskLevel = ce > 0.60 ? 'High' : ce > 0.45 ? 'Moderate' : 'Low';

    const recs: string[] = [];
    if (preheatC > 0) {
      recs.push(`Heat base metal to at least ${preheatC}°C before welding`);
    } else {
      recs.push('No preheat required under normal ambient conditions');
    }
    recs.push(`Maximum interpass temperature: ${maxInterpassC}°C`);
    if (ce > 0.60) recs.push('Post-weld heat treatment (PWHT) strongly recommended');
    recs.push('Verify temperature using temp-sticks or contact thermocouple');
    recs.push('Maintain preheat for at least 75 mm on each side of the joint');

    return {
      preheatC: Math.max(0, preheatC),
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

    const efficiency: Record<string, number> = {
      'GMAW': 0.93,
      'FCAW': 0.86,
      'SMAW': 0.68,
      'GTAW': 0.98,
      'SAW': 0.99,
    };
    const depEff = efficiency[process] ?? 0.85;
    const lossFactor = 1 / depEff;

    // Steel density kg/mm³
    const density = 7.85e-6;

    // Cross-sectional area in mm²
    let area = 0;
    if (jointType === 'fillet') {
      area = 0.5 * legSize * legSize;
    } else if (jointType === 'butt-vgroove') {
      const halfAngle = (grooveAngle / 2) * (Math.PI / 180);
      area = Math.pow(plateThickness, 2) * Math.tan(halfAngle) * 0.5 + 1.6 * plateThickness;
    } else if (jointType === 'lap') {
      area = legSize * legSize * 0.5;
    }

    const weldVolume = area * weldLength * passes; // mm³
    const depositedWeight = weldVolume * density;  // kg deposited
    const fillerRequired = depositedWeight * lossFactor; // kg of filler needed
    // 7018 3.2mm × 450mm electrode: ~0.15 kg usable per electrode
    const electrodesEstimate = Math.ceil(fillerRequired / 0.15);

    return {
      depositedWeight: Math.round(depositedWeight * 1000) / 1000,
      fillerRequired: Math.round(fillerRequired * 1000) / 1000,
      weldVolume: Math.round(weldVolume),
      depositEfficiency: Math.round(depEff * 100),
      electrodesEstimate: process === 'SMAW' ? electrodesEstimate : null,
      unit: 'kg',
      recommendations: [
        `Order at least ${(Math.ceil(fillerRequired * 1.1 * 100) / 100).toFixed(3)} kg to account for waste`,
        `Deposition efficiency for ${process}: ${Math.round(depEff * 100)}%`,
        'Track actual consumption per joint to refine estimates',
        process === 'SMAW' ? `Approx. ${electrodesEstimate} electrodes (3.2 mm 7018)` : 'Use wire spool weight to plan procurement',
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
    const totalArcTime = arcTimePerPass * passes;
    const totalSetupTime = numberOfJoints * setupTimePerJoint;
    const totalOperatingTime = totalArcTime / (arcEfficiency / 100);
    const totalTime = totalOperatingTime + totalSetupTime;
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
        laborRate > 0 ? `Estimated labor cost: R${laborCost.toFixed(2)} at R${laborRate}/hr` : 'Enter a labor rate to calculate cost',
      ],
    };
  }

  static calculateCuttingLength(params: {
    stockLength: number;
    parts: Array<{ length: number; quantity: number }>;
    kerfWidth: number;
  }) {
    const { stockLength, parts, kerfWidth } = params;

    const stocks: number[] = [];
    let totalCuts = 0;
    let totalPartsLength = 0;

    const allPieces: number[] = [];
    for (const part of parts) {
      for (let i = 0; i < part.quantity; i++) {
        allPieces.push(part.length);
        totalPartsLength += part.length;
      }
    }

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
        `${barsNeeded} stock bar(s) required at ${stockLength} mm each`,
        `Material utilization: ${utilization}%`,
        utilization < 75 ? 'Consider re-nesting parts to reduce waste' : 'Good material utilization',
        `Total kerf waste from cuts: ${Math.round(totalCutLength * 100) / 100} mm`,
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

    // Material densities in kg/mm³
    const densities: Record<string, number> = {
      'steel': 7.85e-6,
      'aluminum': 2.70e-6,
      'stainless': 7.93e-6,
      'copper': 8.96e-6,
      'brass': 8.47e-6
    };

    const density = densities[material.toLowerCase()] || densities.steel;
    let volume = 0; // mm³

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

    const weight = volume * density; // kg
    const volumeCm3 = volume / 1000; // convert mm³ to cm³

    return {
      weight: Math.round(weight * 1000) / 1000,
      unit: 'kg',
      volume: Math.round(volumeCm3 * 100) / 100,
      volumeUnit: 'cm³',
      density,
      recommendations: [
        "Add 5–10% for waste and cutoffs",
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

    // Bend Allowance (mm) = (π/180) × Angle × (Inside Radius + K-Factor × Thickness)
    const bendAllowance = (Math.PI / 180) * bendAngle * (insideRadius + kFactor * thickness);

    // Setback (mm) = (Inside Radius + Thickness) × tan(Angle / 2)
    const setback = (insideRadius + thickness) * Math.tan((bendAngle * Math.PI / 180) / 2);

    return {
      bendAllowance: Math.round(bendAllowance * 100) / 100,
      setback: Math.round(setback * 100) / 100,
      kFactor,
      unit: 'mm',
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
