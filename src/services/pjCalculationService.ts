import { PJCalculationResult } from "@/types/accounting";

export const pjCalculationService = {
  calculateISS(grossValue: number, issRate: number = 5): number {
    // ISS (Service Tax) - varies by city, default 5%
    return grossValue * (issRate / 100);
  },

  calculateINSSProLabore(netValue: number): number {
    // INSS on pro-labore (11% on net after ISS)
    const minWage = 1320.00; // Brazilian minimum wage 2024
    const proLabore = Math.max(netValue * 0.3, minWage); // At least 30% or min wage
    return proLabore * 0.11;
  },

  calculateIRRF(grossValue: number): number {
    // IRRF 1.5% on services (withholding tax)
    return grossValue * 0.015;
  },

  calculateSimplesNacional(grossValue: number): number {
    // Simples Nacional approximation (varies by revenue bracket)
    // Using average 6% for services
    return grossValue * 0.06;
  },

  calculateFullInvoice(grossValue: number, issRate: number = 5): PJCalculationResult {
    const iss = this.calculateISS(grossValue, issRate);
    const irrf = this.calculateIRRF(grossValue);
    const simplesNacional = this.calculateSimplesNacional(grossValue);
    
    const netAfterISS = grossValue - iss;
    const inss_prolabore = this.calculateINSSProLabore(netAfterISS);
    
    const taxes_total = iss + irrf + inss_prolabore + simplesNacional;
    const net_value = grossValue - taxes_total;

    return {
      gross_value: grossValue,
      iss,
      iss_rate: issRate,
      inss_prolabore,
      irrf,
      taxes_total,
      net_value,
    };
  },

  calculateTaxRate(grossValue: number, issRate: number = 5): number {
    const result = this.calculateFullInvoice(grossValue, issRate);
    return (result.taxes_total / grossValue) * 100;
  },
};
