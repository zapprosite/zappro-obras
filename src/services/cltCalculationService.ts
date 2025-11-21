import { CLTCalculationResult } from "@/types/accounting";

export const cltCalculationService = {
  calculateINSS(grossSalary: number): { value: number; rate: number } {
    // INSS brackets 2024 (Brazilian social security)
    if (grossSalary <= 1320.00) {
      return { value: grossSalary * 0.075, rate: 7.5 };
    } else if (grossSalary <= 2571.29) {
      return { value: grossSalary * 0.09, rate: 9.0 };
    } else if (grossSalary <= 3856.94) {
      return { value: grossSalary * 0.12, rate: 12.0 };
    } else if (grossSalary <= 7507.49) {
      return { value: grossSalary * 0.14, rate: 14.0 };
    } else {
      return { value: 7507.49 * 0.14, rate: 14.0 }; // Max ceiling
    }
  },

  calculateIRRF(grossSalary: number, inssValue: number): { value: number; rate: number } {
    // IRRF brackets 2024 (Brazilian income tax)
    const taxableIncome = grossSalary - inssValue;
    
    if (taxableIncome <= 2112.00) {
      return { value: 0, rate: 0 };
    } else if (taxableIncome <= 2826.65) {
      return { value: (taxableIncome * 0.075) - 158.40, rate: 7.5 };
    } else if (taxableIncome <= 3751.05) {
      return { value: (taxableIncome * 0.15) - 370.40, rate: 15.0 };
    } else if (taxableIncome <= 4664.68) {
      return { value: (taxableIncome * 0.225) - 651.73, rate: 22.5 };
    } else {
      return { value: (taxableIncome * 0.275) - 884.96, rate: 27.5 };
    }
  },

  calculateFGTS(grossSalary: number): number {
    return grossSalary * 0.08; // 8% FGTS
  },

  calculateFullPayroll(grossSalary: number): CLTCalculationResult {
    const inss = this.calculateINSS(grossSalary);
    const irrf = this.calculateIRRF(grossSalary, inss.value);
    const fgts = this.calculateFGTS(grossSalary);
    const netSalary = grossSalary - inss.value - irrf.value;

    // 13th salary accrual (1/12 per month)
    const decimoTerceiroMonthly = grossSalary / 12;

    // Vacation accrual (30 days + 1/3 = 1.33 months per year / 12 months)
    const vacationDaysMonthly = 2.5; // 30 days / 12 months

    return {
      gross_salary: grossSalary,
      inss: inss.value,
      inss_rate: inss.rate,
      irrf: irrf.value,
      irrf_rate: irrf.rate,
      fgts,
      net_salary: netSalary,
      decimo_terceiro_monthly: decimoTerceiroMonthly,
      vacation_days_monthly: vacationDaysMonthly,
    };
  },
};
