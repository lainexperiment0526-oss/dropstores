-- Create store_reports table for handling buyer reports
CREATE TABLE IF NOT EXISTS public.store_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    report_type TEXT NOT NULL CHECK (report_type IN ('illegal', 'fraud', 'inappropriate', 'counterfeit', 'copyright', 'misleading', 'other')),
    description TEXT NOT NULL,
    reporter_email TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
    admin_notes TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_store_reports_store_id ON public.store_reports(store_id);
CREATE INDEX IF NOT EXISTS idx_store_reports_product_id ON public.store_reports(product_id) WHERE product_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_store_reports_status ON public.store_reports(status);
CREATE INDEX IF NOT EXISTS idx_store_reports_created_at ON public.store_reports(created_at DESC);

-- Enable RLS
ALTER TABLE public.store_reports ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert a report (buyers can report anonymously)
CREATE POLICY "Anyone can submit reports"
    ON public.store_reports
    FOR INSERT
    TO public
    WITH CHECK (true);

-- Policy: Admins and store owners can view reports about their stores
CREATE POLICY "Store owners can view reports about their store"
    ON public.store_reports
    FOR SELECT
    USING (
        auth.uid() IN (
            SELECT owner_id FROM public.stores WHERE id = store_id
        )
    );

-- Policy: Admins can update report status
CREATE POLICY "Admins can update reports"
    ON public.store_reports
    FOR UPDATE
    USING (
        auth.uid() IN (
            SELECT owner_id FROM public.stores WHERE id = store_id
        )
    )
    WITH CHECK (
        auth.uid() IN (
            SELECT owner_id FROM public.stores WHERE id = store_id
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_store_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS store_reports_updated_at ON public.store_reports;
CREATE TRIGGER store_reports_updated_at
    BEFORE UPDATE ON public.store_reports
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_store_reports_updated_at();

-- Add comment to table
COMMENT ON TABLE public.store_reports IS 'Stores buyer reports about stores and products for moderation';
COMMENT ON COLUMN public.store_reports.report_type IS 'Category of report: illegal, fraud, inappropriate, counterfeit, copyright, misleading, or other';
COMMENT ON COLUMN public.store_reports.status IS 'Current status: pending, reviewing, resolved, or dismissed';
