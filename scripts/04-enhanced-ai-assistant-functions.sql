-- Enhanced AI Assistant Functions and Tables

-- Create enhanced agent_interactions table with more detailed tracking
CREATE TABLE IF NOT EXISTS agent_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    agent_type TEXT NOT NULL,
    interaction_type TEXT NOT NULL,
    session_id TEXT,
    message_content TEXT,
    response_content TEXT,
    metadata JSONB DEFAULT '{}',
    response_time_ms INTEGER,
    confidence_score DECIMAL(3,2),
    user_satisfaction INTEGER CHECK (user_satisfaction >= 1 AND user_satisfaction <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_preferences table for personalization
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    language_preference TEXT DEFAULT 'arabic',
    response_style TEXT DEFAULT 'detailed', -- detailed, brief, technical
    preferred_services TEXT[] DEFAULT '{}',
    interaction_history JSONB DEFAULT '{}',
    interests TEXT[] DEFAULT '{}',
    business_type TEXT, -- individual, small_business, enterprise
    industry TEXT,
    company_size TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ai_knowledge_base table for dynamic content
CREATE TABLE IF NOT EXISTS ai_knowledge_base (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category TEXT NOT NULL,
    subcategory TEXT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    keywords TEXT[] DEFAULT '{}',
    language TEXT DEFAULT 'arabic',
    confidence_threshold DECIMAL(3,2) DEFAULT 0.8,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversation_sessions table for session management
CREATE TABLE IF NOT EXISTS conversation_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    agent_type TEXT NOT NULL,
    status TEXT DEFAULT 'active', -- active, completed, abandoned
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    message_count INTEGER DEFAULT 0,
    user_satisfaction INTEGER,
    session_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ai_analytics table for performance tracking
CREATE TABLE IF NOT EXISTS ai_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    agent_type TEXT NOT NULL,
    total_interactions INTEGER DEFAULT 0,
    successful_interactions INTEGER DEFAULT 0,
    average_response_time DECIMAL(8,2),
    average_confidence DECIMAL(3,2),
    user_satisfaction_avg DECIMAL(3,2),
    popular_topics JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_agent_interactions_user_id ON agent_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_interactions_created_at ON agent_interactions(created_at);
CREATE INDEX IF NOT EXISTS idx_agent_interactions_agent_type ON agent_interactions(agent_type);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_base_category ON ai_knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_base_keywords ON ai_knowledge_base USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_conversation_sessions_user_id ON conversation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_sessions_status ON conversation_sessions(status);

-- Function to log AI interactions with enhanced metadata
CREATE OR REPLACE FUNCTION log_ai_interaction(
    p_user_id UUID,
    p_agent_type TEXT,
    p_interaction_type TEXT,
    p_session_id TEXT,
    p_message_content TEXT DEFAULT NULL,
    p_response_content TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}',
    p_response_time_ms INTEGER DEFAULT NULL,
    p_confidence_score DECIMAL DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    interaction_id UUID;
BEGIN
    INSERT INTO agent_interactions (
        user_id,
        agent_type,
        interaction_type,
        session_id,
        message_content,
        response_content,
        metadata,
        response_time_ms,
        confidence_score
    ) VALUES (
        p_user_id,
        p_agent_type,
        p_interaction_type,
        p_session_id,
        p_message_content,
        p_response_content,
        p_metadata,
        p_response_time_ms,
        p_confidence_score
    ) RETURNING id INTO interaction_id;
    
    -- Update session message count
    UPDATE conversation_sessions 
    SET message_count = message_count + 1,
        session_metadata = session_metadata || jsonb_build_object('last_interaction', NOW())
    WHERE session_token = p_session_id;
    
    RETURN interaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user preferences with defaults
CREATE OR REPLACE FUNCTION get_user_preferences(p_user_id UUID)
RETURNS TABLE (
    language_preference TEXT,
    response_style TEXT,
    preferred_services TEXT[],
    interaction_history JSONB,
    interests TEXT[],
    business_type TEXT,
    industry TEXT,
    company_size TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(up.language_preference, 'arabic'),
        COALESCE(up.response_style, 'detailed'),
        COALESCE(up.preferred_services, '{}'),
        COALESCE(up.interaction_history, '{}'),
        COALESCE(up.interests, '{}'),
        up.business_type,
        up.industry,
        up.company_size
    FROM user_preferences up
    WHERE up.user_id = p_user_id;
    
    -- If no preferences exist, return defaults
    IF NOT FOUND THEN
        RETURN QUERY
        SELECT 
            'arabic'::TEXT,
            'detailed'::TEXT,
            '{}'::TEXT[],
            '{}'::JSONB,
            '{}'::TEXT[],
            NULL::TEXT,
            NULL::TEXT,
            NULL::TEXT;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user preferences
CREATE OR REPLACE FUNCTION update_user_preferences(
    p_user_id UUID,
    p_language_preference TEXT DEFAULT NULL,
    p_response_style TEXT DEFAULT NULL,
    p_preferred_services TEXT[] DEFAULT NULL,
    p_interests TEXT[] DEFAULT NULL,
    p_business_type TEXT DEFAULT NULL,
    p_industry TEXT DEFAULT NULL,
    p_company_size TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    INSERT INTO user_preferences (
        user_id,
        language_preference,
        response_style,
        preferred_services,
        interests,
        business_type,
        industry,
        company_size
    ) VALUES (
        p_user_id,
        COALESCE(p_language_preference, 'arabic'),
        COALESCE(p_response_style, 'detailed'),
        COALESCE(p_preferred_services, '{}'),
        COALESCE(p_interests, '{}'),
        p_business_type,
        p_industry,
        p_company_size
    )
    ON CONFLICT (user_id) DO UPDATE SET
        language_preference = COALESCE(p_language_preference, user_preferences.language_preference),
        response_style = COALESCE(p_response_style, user_preferences.response_style),
        preferred_services = COALESCE(p_preferred_services, user_preferences.preferred_services),
        interests = COALESCE(p_interests, user_preferences.interests),
        business_type = COALESCE(p_business_type, user_preferences.business_type),
        industry = COALESCE(p_industry, user_preferences.industry),
        company_size = COALESCE(p_company_size, user_preferences.company_size),
        updated_at = NOW();
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to start a new conversation session
CREATE OR REPLACE FUNCTION start_conversation_session(
    p_user_id UUID,
    p_agent_type TEXT,
    p_session_metadata JSONB DEFAULT '{}'
)
RETURNS TEXT AS $$
DECLARE
    session_token TEXT;
BEGIN
    session_token := 'session_' || extract(epoch from now()) || '_' || substr(gen_random_uuid()::text, 1, 8);
    
    INSERT INTO conversation_sessions (
        user_id,
        session_token,
        agent_type,
        session_metadata
    ) VALUES (
        p_user_id,
        session_token,
        p_agent_type,
        p_session_metadata
    );
    
    RETURN session_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to end a conversation session
CREATE OR REPLACE FUNCTION end_conversation_session(
    p_session_token TEXT,
    p_user_satisfaction INTEGER DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE conversation_sessions 
    SET 
        status = 'completed',
        end_time = NOW(),
        user_satisfaction = p_user_satisfaction
    WHERE session_token = p_session_token;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get AI analytics
CREATE OR REPLACE FUNCTION get_ai_analytics(
    p_agent_type TEXT DEFAULT NULL,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    date DATE,
    agent_type TEXT,
    total_interactions BIGINT,
    successful_interactions BIGINT,
    success_rate DECIMAL,
    avg_response_time DECIMAL,
    avg_confidence DECIMAL,
    avg_satisfaction DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ai.created_at::DATE,
        ai.agent_type,
        COUNT(*)::BIGINT,
        COUNT(CASE WHEN ai.confidence_score >= 0.7 THEN 1 END)::BIGINT,
        ROUND(
            COUNT(CASE WHEN ai.confidence_score >= 0.7 THEN 1 END)::DECIMAL / 
            NULLIF(COUNT(*), 0) * 100, 2
        ),
        ROUND(AVG(ai.response_time_ms), 2),
        ROUND(AVG(ai.confidence_score), 2),
        ROUND(AVG(ai.user_satisfaction), 2)
    FROM agent_interactions ai
    WHERE 
        (p_agent_type IS NULL OR ai.agent_type = p_agent_type) AND
        (p_start_date IS NULL OR ai.created_at::DATE >= p_start_date) AND
        (p_end_date IS NULL OR ai.created_at::DATE <= p_end_date)
    GROUP BY ai.created_at::DATE, ai.agent_type
    ORDER BY ai.created_at::DATE DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
    subcategory TEXT,
    relevance_score DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        kb.id,
        kb.title,
        kb.content,
        kb.category,
        kb.subcategory,
        -- Simple relevance scoring based on keyword matches
        (
            CASE 
                WHEN kb.title ILIKE '%' || p_query || '%' THEN 1.0
                WHEN kb.content ILIKE '%' || p_query || '%' THEN 0.8
                WHEN EXISTS (
                    SELECT 1 FROM unnest(kb.keywords) AS keyword 
                    WHERE keyword ILIKE '%' || p_query || '%'
                ) THEN 0.6
                ELSE 0.0
            END
        )::DECIMAL AS relevance_score
    FROM ai_knowledge_base kb
    WHERE 
        kb.is_active = true AND
        kb.language = p_language AND
        (p_category IS NULL OR kb.category = p_category) AND
        (
            kb.title ILIKE '%' || p_query || '%' OR
            kb.content ILIKE '%' || p_query || '%' OR
            EXISTS (
                SELECT 1 FROM unnest(kb.keywords) AS keyword 
                WHERE keyword ILIKE '%' || p_query || '%'
            )
        )
    ORDER BY relevance_score DESC, kb.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert initial knowledge base content
INSERT INTO ai_knowledge_base (category, subcategory, title, content, keywords, language) VALUES
('services', 'ai_support', 'وكيل الدعم الذكي', 'نظام دعم عملاء ذكي يعمل على مدار الساعة مع قدرات متقدمة في فهم اللغة الطبيعية والاستجابة الفورية. يمكنه معالجة آلاف الاستفسارات متزامنة مع دقة عالية وتحسن مستمر.', ARRAY['دعم', 'عملاء', 'ذكي', 'support', 'customer'], 'arabic'),
('services', 'sales_automation', 'وكيل أتمتة المبيعات', 'نظام ذكي لأتمتة عمليات المبيعات من البداية للنهاية مع تحليلات متقدمة وتوقعات دقيقة. يساعد في زيادة معدل التحويل وتقليل دورة المبيعات.', ARRAY['مبيعات', 'أتمتة', 'sales', 'automation', 'crm'], 'arabic'),
('services', 'social_media', 'وكيل إدارة وسائل التواصل', 'منصة شاملة لإدارة وسائل التواصل الاجتماعي مع ذكاء اصطناعي لإنشاء المحتوى والتفاعل. يدير حساباتك على جميع المنصات بذكاء.', ARRAY['تواصل', 'اجتماعي', 'social', 'media', 'content'], 'arabic'),
('pricing', 'basic', 'الباقة الأساسية', 'باقة مثالية للشركات الصغيرة والمتوسطة. تشمل الميزات الأساسية مع دعم فني وتقارير أساسية.', ARRAY['سعر', 'باقة', 'أساسي', 'pricing', 'basic'], 'arabic'),
('technical', 'implementation', 'عملية التطبيق', 'عملية التطبيق تتم على 6 مراحل: التحليل، الإعداد، التدريب، التكامل، الاختبار، والنشر. كل مرحلة مصممة لضمان نجاح التطبيق.', ARRAY['تطبيق', 'تنفيذ', 'implementation', 'technical'], 'arabic'),
('benefits', 'roi', 'العائد على الاستثمار', 'الوكلاء الذكيون يحققون عائد استثمار مرتفع من خلال توفير التكاليف وزيادة الإيرادات. متوسط العائد يتراوح بين 300% إلى 1400%.', ARRAY['عائد', 'استثمار', 'roi', 'benefits', 'savings'], 'arabic');

-- Set up Row Level Security (RLS)
ALTER TABLE agent_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own interactions" ON agent_interactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own interactions" ON agent_interactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own preferences" ON user_preferences
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own sessions" ON conversation_sessions
    FOR ALL USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON agent_interactions TO authenticated;
GRANT ALL ON user_preferences TO authenticated;
GRANT ALL ON conversation_sessions TO authenticated;
GRANT SELECT ON ai_knowledge_base TO authenticated;
GRANT SELECT ON ai_analytics TO authenticated;

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_agent_interactions_updated_at
    BEFORE UPDATE ON agent_interactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_knowledge_base_updated_at
    BEFORE UPDATE ON ai_knowledge_base
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
