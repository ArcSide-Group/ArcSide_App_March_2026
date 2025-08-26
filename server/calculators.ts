
export class WeldingCalculators {
  // Voltage and Amperage Calculator
  static calculateVoltageAmperage(params: {
    process: string;
    material: string;
    thickness: number;
    position: string;
    fillerSize?: number;
  }) {
    const { process, material, thickness, position } = params;
    
    let baseAmperage = 0;
    let baseVoltage = 0;
    
    // Base calculations for different processes
    switch (process) {
      case 'GMAW':
        baseAmperage = thickness * 40; // Rough estimate: 40A per mm
        baseVoltage = 18 + (baseAmperage * 0.04);
        break;
      case 'SMAW':
        baseAmperage = params.fillerSize ? params.fillerSize * 40 : thickness * 35;
        baseVoltage = 20 + (baseAmperage * 0.04);
        break;
      case 'GTAW':
        baseAmperage = thickness * 35;
        baseVoltage = 12 + (baseAmperage * 0.02);
        break;
      case 'FCAW':
        baseAmperage = thickness * 45;
        baseVoltage = 22 + (baseAmperage * 0.03);
        break;
      default:
        baseAmperage = thickness * 40;
        baseVoltage = 20;
    }
    
    // Position adjustments
    const positionMultiplier = position === 'overhead' ? 0.85 : position === 'vertical' ? 0.9 : 1.0;
    
    return {
      recommendedAmperage: Math.round(baseAmperage * positionMultiplier),
      recommendedVoltage: Math.round(baseVoltage * 10) / 10,
      amperageRange: {
        min: Math.round(baseAmperage * positionMultiplier * 0.85),
        max: Math.round(baseAmperage * positionMultiplier * 1.15)
      },
      voltageRange: {
        min: Math.round((baseVoltage * 0.9) * 10) / 10,
        max: Math.round((baseVoltage * 1.1) * 10) / 10
      }
    };
  }

  // Wire Feed Speed Calculator
  static calculateWireFeedSpeed(params: {
    amperage: number;
    wireSize: number;
    material: string;
  }) {
    const { amperage, wireSize, material } = params;
    
    // Wire feed speed formula varies by wire size and material
    let baseFactor = 0;
    
    switch (wireSize) {
      case 0.8: baseFactor = 400; break;
      case 0.9: baseFactor = 350; break;
      case 1.0: baseFactor = 300; break;
      case 1.2: baseFactor = 250; break;
      case 1.6: baseFactor = 200; break;
      default: baseFactor = 300;
    }
    
    const materialFactor = material.includes('stainless') ? 0.9 : 1.0;
    const wireFeedSpeed = (amperage / wireSize) * (baseFactor / 1000) * materialFactor;
    
    return {
      wireFeedSpeed: Math.round(wireFeedSpeed * 100) / 100,
      unit: 'inches/minute',
      range: {
        min: Math.round(wireFeedSpeed * 0.85 * 100) / 100,
        max: Math.round(wireFeedSpeed * 1.15 * 100) / 100
      }
    };
  }

  // Heat Input Calculator
  static calculateHeatInput(params: {
    voltage: number;
    amperage: number;
    travelSpeed: number;
    efficiency?: number;
  }) {
    const { voltage, amperage, travelSpeed, efficiency = 0.8 } = params;
    
    // Heat input formula: (Voltage × Amperage × Efficiency) / Travel Speed
    const heatInput = (voltage * amperage * efficiency) / travelSpeed;
    
    return {
      heatInput: Math.round(heatInput * 100) / 100,
      unit: 'J/mm',
      efficiency: efficiency * 100,
      classification: heatInput < 1000 ? 'Low' : heatInput < 2000 ? 'Medium' : 'High'
    };
  }

  // Gas Flow Rate Calculator
  static calculateGasFlowRate(params: {
    process: string;
    material: string;
    thickness: number;
    position: string;
    windConditions?: string;
  }) {
    const { process, material, thickness, position, windConditions = 'calm' } = params;
    
    let baseFlowRate = 0;
    
    switch (process) {
      case 'GMAW':
        baseFlowRate = 20 + (thickness * 2);
        break;
      case 'GTAW':
        baseFlowRate = 15 + (thickness * 1.5);
        break;
      case 'FCAW':
        baseFlowRate = 25 + (thickness * 2.5);
        break;
      default:
        baseFlowRate = 20;
    }
    
    // Position and environment adjustments
    const positionFactor = position === 'overhead' ? 1.2 : 1.0;
    const windFactor = windConditions === 'windy' ? 1.3 : windConditions === 'breezy' ? 1.15 : 1.0;
    
    const recommendedFlow = baseFlowRate * positionFactor * windFactor;
    
    return {
      recommendedFlowRate: Math.round(recommendedFlow),
      unit: 'CFH',
      range: {
        min: Math.round(recommendedFlow * 0.8),
        max: Math.round(recommendedFlow * 1.2)
      },
      gasType: process === 'GTAW' ? 'Argon' : 'Ar/CO2 mix'
    };
  }

  // Filler Metal Consumption Calculator
  static calculateFillerConsumption(params: {
    weldLength: number;
    weldSize: number;
    jointType: string;
    passes?: number;
  }) {
    const { weldLength, weldSize, jointType, passes = 1 } = params;
    
    // Volume calculation based on joint type
    let volumeFactor = 0;
    
    switch (jointType) {
      case 'fillet':
        volumeFactor = 0.707 * weldSize * weldSize; // mm²
        break;
      case 'groove':
        volumeFactor = weldSize * weldSize * 0.5; // Assuming V-groove
        break;
      case 'plug':
        volumeFactor = Math.PI * (weldSize / 2) * (weldSize / 2);
        break;
      default:
        volumeFactor = weldSize * weldSize * 0.5;
    }
    
    const volume = volumeFactor * weldLength * passes; // mm³
    const density = 7.8; // g/cm³ for steel
    const efficiency = 0.65; // Typical deposition efficiency
    
    const weight = (volume / 1000) * density / efficiency; // grams
    
    return {
      fillerWeight: Math.round(weight * 100) / 100,
      unit: 'grams',
      volume: Math.round(volume),
      efficiency: efficiency * 100,
      passes: passes
    };
  }
}

export class FabricationCalculators {
  // Metal Weight Calculator
  static calculateMetalWeight(params: {
    material: string;
    shape: string;
    dimensions: { [key: string]: number };
    quantity?: number;
  }) {
    const { material, shape, dimensions, quantity = 1 } = params;
    
    // Density values (kg/m³)
    const densities: { [key: string]: number } = {
      'steel': 7850,
      'stainless_steel': 8000,
      'aluminum': 2700,
      'copper': 8960,
      'brass': 8400,
      'titanium': 4500
    };
    
    const density = densities[material] || 7850;
    let volume = 0; // m³
    
    switch (shape) {
      case 'plate':
        volume = (dimensions.length / 1000) * (dimensions.width / 1000) * (dimensions.thickness / 1000);
        break;
      case 'round_bar':
        const radius = (dimensions.diameter / 1000) / 2;
        volume = Math.PI * radius * radius * (dimensions.length / 1000);
        break;
      case 'square_bar':
        volume = (dimensions.side / 1000) * (dimensions.side / 1000) * (dimensions.length / 1000);
        break;
      case 'angle':
        const leg1Area = (dimensions.leg1 / 1000) * (dimensions.thickness / 1000);
        const leg2Area = (dimensions.leg2 / 1000) * (dimensions.thickness / 1000);
        const overlapArea = (dimensions.thickness / 1000) * (dimensions.thickness / 1000);
        volume = (leg1Area + leg2Area - overlapArea) * (dimensions.length / 1000);
        break;
      case 'pipe':
        const outerRadius = (dimensions.outerDiameter / 1000) / 2;
        const innerRadius = (dimensions.innerDiameter / 1000) / 2;
        volume = Math.PI * (outerRadius * outerRadius - innerRadius * innerRadius) * (dimensions.length / 1000);
        break;
    }
    
    const weight = volume * density * quantity;
    
    return {
      weight: Math.round(weight * 100) / 100,
      unit: 'kg',
      volume: Math.round(volume * 1000000), // cm³
      density: density,
      quantity: quantity
    };
  }

  // Bend Allowance Calculator
  static calculateBendAllowance(params: {
    thickness: number;
    angle: number;
    insideRadius: number;
    kFactor?: number;
  }) {
    const { thickness, angle, insideRadius, kFactor = 0.33 } = params;
    
    // Bend allowance formula: BA = (π/180) × A × (R + K × T)
    const angleRadians = (Math.PI / 180) * angle;
    const bendAllowance = angleRadians * (insideRadius + kFactor * thickness);
    
    // Bend deduction
    const outsideSetback = (insideRadius + thickness) * Math.tan(angleRadians / 2);
    const bendDeduction = 2 * outsideSetback - bendAllowance;
    
    return {
      bendAllowance: Math.round(bendAllowance * 1000) / 1000,
      bendDeduction: Math.round(bendDeduction * 1000) / 1000,
      kFactor: kFactor,
      outsideSetback: Math.round(outsideSetback * 1000) / 1000,
      unit: 'mm'
    };
  }

  // Project Cost Estimator
  static calculateProjectCost(params: {
    materials: Array<{ name: string; cost: number; quantity: number }>;
    laborHours: number;
    laborRate: number;
    consumables: Array<{ name: string; cost: number }>;
    overhead?: number;
    markup?: number;
  }) {
    const { materials, laborHours, laborRate, consumables, overhead = 0.1, markup = 0.2 } = params;
    
    const materialCost = materials.reduce((sum, item) => sum + (item.cost * item.quantity), 0);
    const laborCost = laborHours * laborRate;
    const consumableCost = consumables.reduce((sum, item) => sum + item.cost, 0);
    
    const subtotal = materialCost + laborCost + consumableCost;
    const overheadCost = subtotal * overhead;
    const totalCost = subtotal + overheadCost;
    const finalPrice = totalCost * (1 + markup);
    
    return {
      breakdown: {
        materials: Math.round(materialCost * 100) / 100,
        labor: Math.round(laborCost * 100) / 100,
        consumables: Math.round(consumableCost * 100) / 100,
        overhead: Math.round(overheadCost * 100) / 100,
        markup: Math.round((finalPrice - totalCost) * 100) / 100
      },
      totalCost: Math.round(totalCost * 100) / 100,
      finalPrice: Math.round(finalPrice * 100) / 100,
      profitMargin: markup * 100
    };
  }
}
