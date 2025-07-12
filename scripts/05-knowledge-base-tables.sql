-- Create knowledge base tables and functions for AI assistant

-- Knowledge base table
CREATE TABLE IF NOT EXISTS knowledge_base (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    language TEXT DEFAULT 'arabic',
    verified BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_knowledge_base_category ON knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_language ON knowledge_base(language);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_verified ON knowledge_base(verified);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_updated_at ON knowledge_base(updated_at);

-- Full text search index
CREATE INDEX IF NOT EXISTS idx_knowledge_base_search ON knowledge_base USING gin(to_tsvector('arabic', title || ' ' || content));

-- Enable RLS
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Knowledge base is viewable by everyone" ON knowledge_base
    FOR SELECT USING (true);

CREATE POLICY "Knowledge base is editable by authenticated users" ON knowledge_base
    FOR ALL USING (auth.role() = 'authenticated');

-- Function to search knowledge base
CREATE OR REPLACE FUNCTION search_knowledge_base(
    p_query TEXT,
    p_category TEXT DEFAULT NULL,
    p_language TEXT DEFAULT 'arabic',
    p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    content TEXT,
    category TEXT,
    language TEXT,
    verified BOOLEAN,
    metadata JSONB,
    relevance_score REAL
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT 
        kb.id,
        kb.title,
        kb.content,
        kb.category,
        kb.language,
        kb.verified,
        kb.metadata,
        ts_rank(
            to_tsvector(COALESCE(p_language, 'arabic'), kb.title || ' ' || kb.content),
            plainto_tsquery(COALESCE(p_language, 'arabic'), p_query)
        ) AS relevance_score
    FROM knowledge_base kb
    WHERE 
        (p_category IS NULL OR kb.category = p_category)
        AND (p_language IS NULL OR kb.language = p_language)
        AND kb.verified = true
        AND to_tsvector(COALESCE(p_language, 'arabic'), kb.title || ' ' || kb.content) @@ plainto_tsquery(COALESCE(p_language, 'arabic'), p_query)
    ORDER BY relevance_score DESC
    LIMIT p_limit;
END;
$$;

-- Function to get knowledge analytics
CREATE OR REPLACE FUNCTION get_knowledge_analytics()
RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE
    result JSONB;
    total_items INTEGER;
    verified_items INTEGER;
    category_counts JSONB;
    language_counts JSONB;
    recently_updated INTEGER;
BEGIN
    -- Get total items
    SELECT COUNT(*) INTO total_items FROM knowledge_base;
    
    -- Get verified items
    SELECT COUNT(*) INTO verified_items FROM knowledge_base WHERE verified = true;
    
    -- Get category counts
    SELECT jsonb_object_agg(category, count)
    INTO category_counts
    FROM (
        SELECT category, COUNT(*) as count
        FROM knowledge_base
        GROUP BY category
    ) t;
    
    -- Get language counts
    SELECT jsonb_object_agg(language, count)
    INTO language_counts
    FROM (
        SELECT language, COUNT(*) as count
        FROM knowledge_base
        GROUP BY language
    ) t;
    
    -- Get recently updated (last 7 days)
    SELECT COUNT(*) INTO recently_updated
    FROM knowledge_base
    WHERE updated_at >= NOW() - INTERVAL '7 days';
    
    -- Build result
    result := jsonb_build_object(
        'totalItems', total_items,
        'verifiedItems', verified_items,
        'categoryCounts', COALESCE(category_counts, '{}'::jsonb),
        'languageCounts', COALESCE(language_counts, '{}'::jsonb),
        'recentlyUpdated', recently_updated
    );
    
    RETURN result;
END;
$$;

-- Function to update knowledge item timestamp
CREATE OR REPLACE FUNCTION update_knowledge_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_update_knowledge_updated_at
    BEFORE UPDATE ON knowledge_base
    FOR EACH ROW
    EXECUTE FUNCTION update_knowledge_updated_at();

-- Insert initial knowledge base items
INSERT INTO knowledge_base (title, content, category, language, verified) VALUES
(
    'خدمات رؤيا كابيتال',
    'رؤيا كابيتال تقدم مجموعة شاملة من حلول الذكاء الاصطناعي والوكلاء الذكيين للشركات، بما في ذلك أتمتة خدمة العملاء، وتحسين عمليات المبيعات، وإدارة وسائل التواصل الاجتماعي، والحلول المخصصة.',
    'services',
    'arabic',
    true
),
(
    'معلومات التواصل',
    'للتواصل مع رؤيا كابيتال: الهاتف +963940632191، واتساب +963940632191. نحن متاحون للرد على استفساراتكم وتقديم استشارات مخصصة.',
    'contact',
    'arabic',
    true
),
(
    'سياسة التسعير',
    'نحن نقدم عروض أسعار مخصصة لكل عميل بناءً على حجم الشركة واحتياجاتها، ونوع الخدمات المطلوبة، ومستوى التخصيص المطلوب. للحصول على عرض سعر دقيق، يرجى التواصل معنا مباشرة.',
    'pricing',
    'arabic',
    true
),
(
    'وكيل الدعم الذكي',
    'نظام دعم عملاء ذكي يعمل على مدار الساعة مع قدرات متقدمة في فهم اللغة الطبيعية ومعالجة الاستفسارات تلقائياً.',
    'services',
    'arabic',
    true
),
(
    'وكيل أتمتة المبيعات',
    'نظام ذكي لأتمتة عمليات المبيعات من البداية للنهاية مع تحليلات متقدمة وإدارة العملاء المحتملين.',
    'services',
    'arabic',
    true
);

-- Grant necessary permissions
GRANT ALL ON knowledge_base TO authenticated;
GRANT EXECUTE ON FUNCTION search_knowledge_base TO authenticated;
GRANT EXECUTE ON FUNCTION get_knowledge_analytics TO authenticated;
