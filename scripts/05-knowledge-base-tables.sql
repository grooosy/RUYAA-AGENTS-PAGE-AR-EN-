-- Create knowledge base table
CREATE TABLE IF NOT EXISTS knowledge_base (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    language TEXT DEFAULT 'arabic',
    tags TEXT[] DEFAULT '{}',
    is_verified BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_knowledge_base_category ON knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_language ON knowledge_base(language);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_verified ON knowledge_base(is_verified);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_created_at ON knowledge_base(created_at);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_updated_at ON knowledge_base(updated_at);

-- Create full-text search index
CREATE INDEX IF NOT EXISTS idx_knowledge_base_search ON knowledge_base USING gin(to_tsvector('arabic', title || ' ' || content));

-- Enable Row Level Security
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

-- Create policies for knowledge base access
CREATE POLICY "Allow read access to knowledge base" ON knowledge_base
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert knowledge base items" ON knowledge_base
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow users to update their own knowledge base items" ON knowledge_base
    FOR UPDATE USING (auth.uid() = created_by OR auth.role() = 'service_role');

CREATE POLICY "Allow users to delete their own knowledge base items" ON knowledge_base
    FOR DELETE USING (auth.uid() = created_by OR auth.role() = 'service_role');

-- Function to search knowledge base with full-text search
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
    language TEXT,
    tags TEXT[],
    is_verified BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    relevance_score REAL
) 
LANGUAGE plpgsql
AS $$
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
        ts_rank(to_tsvector('arabic', kb.title || ' ' || kb.content), plainto_tsquery('arabic', p_query)) as relevance_score
    FROM knowledge_base kb
    WHERE 
        (p_category IS NULL OR kb.category = p_category)
        AND kb.language = p_language
        AND kb.is_verified = true
        AND to_tsvector('arabic', kb.title || ' ' || kb.content) @@ plainto_tsquery('arabic', p_query)
    ORDER BY relevance_score DESC
    LIMIT p_limit;
END;
$$;

-- Function to get knowledge base analytics
CREATE OR REPLACE FUNCTION get_knowledge_base_analytics()
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_items', (SELECT COUNT(*) FROM knowledge_base),
        'verified_items', (SELECT COUNT(*) FROM knowledge_base WHERE is_verified = true),
        'categories', (
            SELECT json_object_agg(category, count)
            FROM (
                SELECT category, COUNT(*) as count
                FROM knowledge_base
                GROUP BY category
            ) cat_counts
        ),
        'languages', (
            SELECT json_object_agg(language, count)
            FROM (
                SELECT language, COUNT(*) as count
                FROM knowledge_base
                GROUP BY language
            ) lang_counts
        ),
        'recent_updates', (
            SELECT json_agg(
                json_build_object(
                    'id', id,
                    'title', title,
                    'category', category,
                    'updated_at', updated_at
                )
            )
            FROM (
                SELECT id, title, category, updated_at
                FROM knowledge_base
                ORDER BY updated_at DESC
                LIMIT 5
            ) recent
        )
    ) INTO result;
    
    RETURN result;
END;
$$;

-- Function to update knowledge base item
CREATE OR REPLACE FUNCTION update_knowledge_base_item()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_knowledge_base_updated_at
    BEFORE UPDATE ON knowledge_base
    FOR EACH ROW
    EXECUTE FUNCTION update_knowledge_base_item();

-- Insert some initial knowledge base items
INSERT INTO knowledge_base (title, content, category, language, tags, is_verified) VALUES
(
    'خدمات رؤيا كابيتال',
    'رؤيا كابيتال شركة متخصصة في تطوير حلول الوكلاء الذكيين والذكاء الاصطناعي. نقدم خدمات شاملة تشمل: وكلاء الدعم الذكي، أتمتة المبيعات، إدارة وسائل التواصل الاجتماعي، والحلول المخصصة حسب احتياجات العميل.',
    'services',
    'arabic',
    ARRAY['خدمات', 'وكلاء ذكيين', 'ذكاء اصطناعي'],
    true
),
(
    'Ruyaa Capital Services',
    'Ruyaa Capital is a specialized company in developing intelligent agent solutions and artificial intelligence. We provide comprehensive services including: intelligent support agents, sales automation, social media management, and customized solutions according to client needs.',
    'services',
    'english',
    ARRAY['services', 'intelligent agents', 'artificial intelligence'],
    true
),
(
    'معلومات الشركة',
    'رؤيا كابيتال هي شركة رائدة في مجال الذكاء الاصطناعي والوكلاء الذكيين. نحن نساعد الشركات على تحسين خدمة العملاء وزيادة الكفاءة من خلال حلولنا المتطورة.',
    'company',
    'arabic',
    ARRAY['شركة', 'معلومات', 'رؤيا كابيتال'],
    true
),
(
    'Company Information',
    'Ruyaa Capital is a leading company in the field of artificial intelligence and intelligent agents. We help companies improve customer service and increase efficiency through our advanced solutions.',
    'company',
    'english',
    ARRAY['company', 'information', 'ruyaa capital'],
    true
);

-- Grant necessary permissions
GRANT ALL ON knowledge_base TO authenticated;
GRANT ALL ON knowledge_base TO service_role;
