
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
    
    // Adjust for material
    if (material.includes('aluminum')) {
      baseFlow = 25;
    } else if (material.includes('stainless')) {
      baseFlow = 22;
    }
    
    // Adjust for thickness
    if (thickness > 0.5) {
      baseFlow += 5;
    }
    
    // Adjust for position
    if (position === 'overhead') {
      baseFlow += 3;
    }
    
    // Adjust for environment
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
