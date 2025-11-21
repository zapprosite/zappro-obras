-- Documents table for PDF attachments
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  obra_id UUID NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  document_type TEXT NOT NULL DEFAULT 'other',
  upload_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID NOT NULL REFERENCES auth.users(id)
);

-- Admin metrics for financial analysis
CREATE TABLE public.admin_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  obra_id UUID NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  total_budget NUMERIC DEFAULT 0,
  total_spent NUMERIC DEFAULT 0,
  rework_tasks_count INTEGER DEFAULT 0,
  profit_margin_percent NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- CLT payroll calculations
CREATE TABLE public.clt_payroll (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profissional_id UUID NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  gross_salary NUMERIC NOT NULL DEFAULT 0,
  inss NUMERIC NOT NULL DEFAULT 0,
  irrf NUMERIC NOT NULL DEFAULT 0,
  fgts NUMERIC NOT NULL DEFAULT 0,
  net_salary NUMERIC NOT NULL DEFAULT 0,
  decimo_terceiro_accrual NUMERIC DEFAULT 0,
  vacation_days_accrued NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID NOT NULL REFERENCES auth.users(id)
);

-- PJ invoices for contractors
CREATE TABLE public.pj_invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profissional_id UUID NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  service_description TEXT,
  gross_value NUMERIC NOT NULL DEFAULT 0,
  iss NUMERIC DEFAULT 0,
  inss_prolabore NUMERIC DEFAULT 0,
  irrf NUMERIC DEFAULT 0,
  taxes_paid NUMERIC DEFAULT 0,
  net_value NUMERIC NOT NULL DEFAULT 0,
  invoice_date DATE NOT NULL,
  payment_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID NOT NULL REFERENCES auth.users(id)
);

-- Personal life tasks
CREATE TABLE public.personal_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  due_date DATE,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clt_payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pj_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for documents
CREATE POLICY "Users can view documents from their obras"
  ON public.documents FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM obras
    WHERE obras.id = documents.obra_id
    AND obras.user_id = auth.uid()
  ));

CREATE POLICY "Users can upload documents to their obras"
  ON public.documents FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM obras
    WHERE obras.id = documents.obra_id
    AND obras.user_id = auth.uid()
  ) AND auth.uid() = user_id);

CREATE POLICY "Users can delete documents from their obras"
  ON public.documents FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for admin_metrics
CREATE POLICY "Users can view metrics from their obras"
  ON public.admin_metrics FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM obras
    WHERE obras.id = admin_metrics.obra_id
    AND obras.user_id = auth.uid()
  ));

CREATE POLICY "Users can create metrics for their obras"
  ON public.admin_metrics FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM obras
    WHERE obras.id = admin_metrics.obra_id
    AND obras.user_id = auth.uid()
  ));

CREATE POLICY "Users can update metrics from their obras"
  ON public.admin_metrics FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM obras
    WHERE obras.id = admin_metrics.obra_id
    AND obras.user_id = auth.uid()
  ));

-- RLS Policies for clt_payroll
CREATE POLICY "Users can view their own payroll data"
  ON public.clt_payroll FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create payroll records"
  ON public.clt_payroll FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their payroll records"
  ON public.clt_payroll FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for pj_invoices
CREATE POLICY "Users can view their own invoices"
  ON public.pj_invoices FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create invoices"
  ON public.pj_invoices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their invoices"
  ON public.pj_invoices FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their invoices"
  ON public.pj_invoices FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for personal_tasks
CREATE POLICY "Users can view their own personal tasks"
  ON public.personal_tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own personal tasks"
  ON public.personal_tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own personal tasks"
  ON public.personal_tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own personal tasks"
  ON public.personal_tasks FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_documents_obra_id ON public.documents(obra_id);
CREATE INDEX idx_admin_metrics_obra_id ON public.admin_metrics(obra_id);
CREATE INDEX idx_admin_metrics_month ON public.admin_metrics(month);
CREATE INDEX idx_clt_payroll_profissional_id ON public.clt_payroll(profissional_id);
CREATE INDEX idx_clt_payroll_month ON public.clt_payroll(month);
CREATE INDEX idx_pj_invoices_profissional_id ON public.pj_invoices(profissional_id);
CREATE INDEX idx_pj_invoices_date ON public.pj_invoices(invoice_date);
CREATE INDEX idx_personal_tasks_user_id ON public.personal_tasks(user_id);
CREATE INDEX idx_personal_tasks_due_date ON public.personal_tasks(due_date);

-- Triggers for updated_at
CREATE TRIGGER update_admin_metrics_updated_at
  BEFORE UPDATE ON public.admin_metrics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_personal_tasks_updated_at
  BEFORE UPDATE ON public.personal_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();