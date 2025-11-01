-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create groups table
CREATE TABLE public.groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create document_groups junction table
CREATE TABLE public.document_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  document_id TEXT NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_groups ENABLE ROW LEVEL SECURITY;

-- RLS Policies for groups
CREATE POLICY "Users can view their own groups" 
ON public.groups 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own groups" 
ON public.groups 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own groups" 
ON public.groups 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own groups" 
ON public.groups 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for document_groups
CREATE POLICY "Users can view documents in their groups" 
ON public.document_groups 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.groups 
    WHERE groups.id = document_groups.group_id 
    AND groups.user_id = auth.uid()
  )
);

CREATE POLICY "Users can add documents to their groups" 
ON public.document_groups 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.groups 
    WHERE groups.id = document_groups.group_id 
    AND groups.user_id = auth.uid()
  )
);

CREATE POLICY "Users can remove documents from their groups" 
ON public.document_groups 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.groups 
    WHERE groups.id = document_groups.group_id 
    AND groups.user_id = auth.uid()
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_groups_updated_at
BEFORE UPDATE ON public.groups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_groups_user_id ON public.groups(user_id);
CREATE INDEX idx_document_groups_group_id ON public.document_groups(group_id);
CREATE INDEX idx_document_groups_document_id ON public.document_groups(document_id);