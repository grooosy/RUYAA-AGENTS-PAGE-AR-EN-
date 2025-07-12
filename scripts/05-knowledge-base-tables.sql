-- Create AI Knowledge Base table
CREATE TABLE IF NOT EXISTS ai_knowledge_base (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    keywords TEXT[],
    language TEXT DEFAULT 'arabic',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    approved_by UUID REFERENCES auth.users(id)
);

-- Create indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_category ON ai_knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_language ON ai_knowledge_base(language);
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_active ON ai_knowledge_base(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_keywords ON ai_knowledge_base USING GIN(keywords);

-- Create full-text search index
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_search ON ai_knowledge_base USING GIN(
    to_tsvector('arabic', title || ' ' || content)
);

-- Create function to search knowledge base
CREATE OR REPLACE FUNCTION search_knowledge_base(
    p_query TEXT,
    p_category TEXT DEFAULT NULL,
    p_language TEXT DEFAULT 'arabic',
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    content TEXT,
    category TEXT,
    subcategory TEXT,
    relevance REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        kb.id,
        kb.title,
        kb.content,
        kb.category,
        kb.subcategory,
        ts_rank(
            to_tsvector(p_language, kb.title || ' ' || kb.content),
            plainto_tsquery(p_language, p_query)
        ) as relevance
    FROM ai_knowledge_base kb
    WHERE 
        kb.is_active = true
        AND kb.language = p_language
        AND (p_category IS NULL OR kb.category = p_category)
        AND (
            to_tsvector(p_language, kb.title || ' ' || kb.content) @@ plainto_tsquery(p_language, p_query)
            OR kb.keywords && string_to_array(lower(p_query), ' ')
        )
    ORDER BY relevance DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Create AI System Instructions table
CREATE TABLE IF NOT EXISTS ai_system_instructions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT false,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Create function to update knowledge base item
CREATE OR REPLACE FUNCTION update_knowledge_item()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating timestamps
CREATE TRIGGER trigger_update_knowledge_timestamp
    BEFORE UPDATE ON ai_knowledge_base
    FOR EACH ROW
    EXECUTE FUNCTION update_knowledge_item();

-- Insert default knowledge base items
INSERT INTO ai_knowledge_base (title, content, category, keywords, is_active) VALUES
(
    'خدمات رؤيا كابيتال',
    'رؤيا كابيتال شركة متخصصة في تطوير حلول الذكاء الاصطناعي والوكلاء الذكيين للشركات. نحن نقدم خدمات متنوعة تشمل أتمتة خدمة العملاء، تحسين عمليات المبيعات، وإدارة وسائل التواصل الاجتماعي.',
    'services',
    ARRAY['خدمات', 'ذكاء اصطناعي', 'وكلاء ذكيين', 'أتمتة'],
    true
),
(
    'معلومات التواصل',
    'للتواصل مع رؤيا كابيتال: الهاتف والواتساب: +963940632191. نحن متاحون للرد على استفساراتكم وتقديم استشارات مخصصة حول حلول الذكاء الاصطناعي.',
    'contact',
    ARRAY['تواصل', 'هاتف', 'واتساب', 'استشارة'],
    true
),
(
    'سياسة التسعير',
    'نحن نقدم عروض أسعار مخصصة لكل عميل بناءً على حجم الشركة واحتياجاتها، نوع الخدمات المطلوبة، ومستوى التخصيص المطلوب. للحصول على عرض سعر دقيق، يرجى التواصل معنا مباشرة.',
    'pricing',
    ARRAY['أسعار', 'تكلفة', 'عرض سعر', 'تسعير'],
    true
),
(
    'الوكيل الذكي للدعم',
    'وكيل الدعم الذكي هو نظام متطور يستخدم الذكاء الاصطناعي للرد على استفسارات العملاء تلقائياً، توجيه المكالمات، وحل المشاكل الشائعة. يعمل على مدار الساعة ويتعلم من كل تفاعل.',
    'services',
    ARRAY['دعم عملاء', 'وكيل ذكي', 'خدمة تلقائية', 'مساعد افتراضي'],
    true
),
(
    'أتمتة المبيعات',
    'وكيل أتمتة المبيعات يساعد في تحسين عملية البيع من خلال تتبع العملاء المحتملين، إرسال المتابعات التلقائية، وتحليل سلوك العملاء لزيادة معدلات التحويل.',
    'services',
    ARRAY['مبيعات', 'أتمتة', 'عملاء محتملين', 'تحويل'],
    true
);

-- Create RLS policies
ALTER TABLE ai_knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_system_instructions ENABLE ROW LEVEL SECURITY;

-- Allow read access to knowledge base for all authenticated users
CREATE POLICY "Allow read access to knowledge base" ON ai_knowledge_base
    FOR SELECT TO authenticated
    USING (is_active = true);

-- Allow full access to admins (you can modify this based on your admin role system)
CREATE POLICY "Allow admin access to knowledge base" ON ai_knowledge_base
    FOR ALL TO authenticated
    USING (true);

-- Allow read access to system instructions for authenticated users
CREATE POLICY "Allow read access to system instructions" ON ai_system_instructions
    FOR SELECT TO authenticated
    USING (is_active = true);
