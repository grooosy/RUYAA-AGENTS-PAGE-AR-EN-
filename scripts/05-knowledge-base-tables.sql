-- Create knowledge_base table
CREATE TABLE IF NOT EXISTS public.knowledge_base (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general',
    language TEXT NOT NULL DEFAULT 'arabic',
    tags TEXT[] DEFAULT '{}',
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    metadata JSONB DEFAULT '{}'::jsonb,
    relevance_score FLOAT DEFAULT 0.0
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_knowledge_base_category ON public.knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_language ON public.knowledge_base(language);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_verified ON public.knowledge_base(is_verified);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_created_at ON public.knowledge_base(created_at);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_updated_at ON public.knowledge_base(updated_at);

-- Create full-text search index
CREATE INDEX IF NOT EXISTS idx_knowledge_base_content_search 
ON public.knowledge_base 
USING gin(to_tsvector('arabic', content));

CREATE INDEX IF NOT EXISTS idx_knowledge_base_title_search 
ON public.knowledge_base 
USING gin(to_tsvector('arabic', title));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_knowledge_base_updated_at ON public.knowledge_base;
CREATE TRIGGER update_knowledge_base_updated_at
    BEFORE UPDATE ON public.knowledge_base
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Allow public read access to verified knowledge" ON public.knowledge_base
    FOR SELECT USING (is_verified = true);

CREATE POLICY "Allow authenticated users to read all knowledge" ON public.knowledge_base
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert knowledge" ON public.knowledge_base
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow users to update their own knowledge" ON public.knowledge_base
    FOR UPDATE TO authenticated USING (created_by = auth.uid());

CREATE POLICY "Allow users to delete their own knowledge" ON public.knowledge_base
    FOR DELETE TO authenticated USING (created_by = auth.uid());

-- Insert sample knowledge base data
INSERT INTO public.knowledge_base (title, content, category, language, is_verified, tags) VALUES
-- Arabic content
('خدمات رؤيا كابيتال', 'رؤيا كابيتال تقدم حلول الذكاء الاصطناعي المتقدمة للشركات والمؤسسات. نحن متخصصون في تطوير الوكلاء الذكيين والأنظمة التفاعلية التي تساعد في تحسين خدمة العملاء وزيادة الكفاءة التشغيلية.', 'services', 'arabic', true, ARRAY['خدمات', 'ذكاء اصطناعي', 'وكلاء ذكيين']),

('الوكلاء الذكيين', 'الوكلاء الذكيين هم أنظمة ذكية قادرة على فهم والتفاعل مع العملاء بطريقة طبيعية. يمكنهم الإجابة على الاستفسارات، تقديم المساعدة، وحل المشاكل بكفاءة عالية على مدار الساعة.', 'technology', 'arabic', true, ARRAY['وكلاء ذكيين', 'تقنية', 'خدمة عملاء']),

('حلول تقنية متقدمة', 'نقدم حلول تقنية متطورة تشمل معالجة اللغة الطبيعية، التعلم الآلي، والذكاء الاصطناعي التحادثي. حلولنا مصممة لتلبية احتياجات الشركات المختلفة وتحسين تجربة العملاء.', 'technology', 'arabic', true, ARRAY['تقنية', 'ذكاء اصطناعي', 'حلول']),

('فوائد الذكاء الاصطناعي', 'الذكاء الاصطناعي يساعد الشركات في تقليل التكاليف، زيادة الكفاءة، تحسين دقة الخدمات، وتوفير خدمة عملاء متاحة على مدار الساعة. كما يساعد في تحليل البيانات واتخاذ قرارات أفضل.', 'benefits', 'arabic', true, ARRAY['فوائد', 'ذكاء اصطناعي', 'كفاءة']),

-- English content
('Ruyaa Capital Services', 'Ruyaa Capital provides advanced artificial intelligence solutions for businesses and organizations. We specialize in developing intelligent agents and interactive systems that help improve customer service and increase operational efficiency.', 'services', 'english', true, ARRAY['services', 'artificial intelligence', 'intelligent agents']),

('Intelligent Agents', 'Intelligent agents are smart systems capable of understanding and interacting with customers naturally. They can answer inquiries, provide assistance, and solve problems efficiently around the clock.', 'technology', 'english', true, ARRAY['intelligent agents', 'technology', 'customer service']),

('Advanced Technical Solutions', 'We provide advanced technical solutions including natural language processing, machine learning, and conversational artificial intelligence. Our solutions are designed to meet the needs of different companies and improve customer experience.', 'technology', 'english', true, ARRAY['technology', 'artificial intelligence', 'solutions']),

('AI Benefits', 'Artificial intelligence helps companies reduce costs, increase efficiency, improve service accuracy, and provide 24/7 customer service. It also helps in data analysis and making better decisions.', 'benefits', 'english', true, ARRAY['benefits', 'artificial intelligence', 'efficiency']),

-- Company information
('معلومات الشركة', 'رؤيا كابيتال هي شركة رائدة في مجال الذكاء الاصطناعي والتقنيات المتقدمة. نحن نساعد الشركات في تحويل عملياتها رقمياً وتحسين تفاعلها مع العملاء من خلال حلول ذكية ومبتكرة.', 'company', 'arabic', true, ARRAY['شركة', 'معلومات', 'رؤيا كابيتال']),

('Company Information', 'Ruyaa Capital is a leading company in artificial intelligence and advanced technologies. We help companies digitally transform their operations and improve customer interaction through smart and innovative solutions.', 'company', 'english', true, ARRAY['company', 'information', 'ruyaa capital']);

-- Create function for text search
CREATE OR REPLACE FUNCTION search_knowledge_base(
    search_query TEXT,
    search_language TEXT DEFAULT 'arabic',
    verified_only BOOLEAN DEFAULT true,
    result_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    content TEXT,
    category TEXT,
    language TEXT,
    tags TEXT[],
    is_verified BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    relevance_score FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        kb.id,
        kb.title,
        kb.content,
        kb.category,
        kb.language,
        kb.tags,
        kb.is_verified,
        kb.created_at,
        kb.updated_at,
        ts_rank(
            to_tsvector(CASE WHEN search_language = 'arabic' THEN 'arabic' ELSE 'english' END, kb.content || ' ' || kb.title),
            plainto_tsquery(CASE WHEN search_language = 'arabic' THEN 'arabic' ELSE 'english' END, search_query)
        ) as relevance_score
    FROM public.knowledge_base kb
    WHERE 
        (NOT verified_only OR kb.is_verified = true)
        AND kb.language = search_language
        AND (
            to_tsvector(CASE WHEN search_language = 'arabic' THEN 'arabic' ELSE 'english' END, kb.content || ' ' || kb.title) 
            @@ plainto_tsquery(CASE WHEN search_language = 'arabic' THEN 'arabic' ELSE 'english' END, search_query)
            OR kb.content ILIKE '%' || search_query || '%'
            OR kb.title ILIKE '%' || search_query || '%'
        )
    ORDER BY relevance_score DESC, kb.updated_at DESC
    LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;
