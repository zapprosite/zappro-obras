export interface CLTEmployee {
  id: string;
  profissional_id: string;
  nome: string;
  cpf?: string;
  cargo: string;
  salario_mensal: number;
}

export interface CLTPayroll {
  id: string;
  profissional_id: string;
  month: string;
  gross_salary: number;
  inss: number;
  irrf: number;
  fgts: number;
  net_salary: number;
  decimo_terceiro_accrual: number;
  vacation_days_accrued: number;
  created_at: string;
  user_id: string;
}

export interface CLTCalculationResult {
  gross_salary: number;
  inss: number;
  inss_rate: number;
  irrf: number;
  irrf_rate: number;
  fgts: number;
  net_salary: number;
  decimo_terceiro_monthly: number;
  vacation_days_monthly: number;
}

export interface PJContractor {
  id: string;
  profissional_id: string;
  nome: string;
  cnpj?: string;
  tipo_contratacao: string;
}

export interface PJInvoice {
  id: string;
  profissional_id: string;
  invoice_number: string;
  service_description: string;
  gross_value: number;
  iss: number;
  inss_prolabore: number;
  irrf: number;
  taxes_paid: number;
  net_value: number;
  invoice_date: string;
  payment_date?: string;
  created_at: string;
  user_id: string;
}

export interface PJCalculationResult {
  gross_value: number;
  iss: number;
  iss_rate: number;
  inss_prolabore: number;
  irrf: number;
  taxes_total: number;
  net_value: number;
}

export interface PJTaxSummary {
  total_invoiced: number;
  total_taxes: number;
  total_net: number;
  invoice_count: number;
  average_tax_rate: number;
}

export interface AccountingExportData {
  clt_payrolls?: CLTPayroll[];
  pj_invoices?: PJInvoice[];
  month: string;
  export_date: string;
}
