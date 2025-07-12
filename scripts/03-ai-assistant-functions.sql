-- Function to create AI assistant interaction
CREATE OR REPLACE FUNCTION public.create_ai_interaction(
  user_uuid UUID,
  message_content TEXT,
  response_content TEXT,
  session_id TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  interaction_id UUID;
BEGIN
  INSERT INTO public.agent_interactions (
    user_id,
    agent_type,
    interaction_type,
    session_id,
    duration_seconds,
    metadata
  ) VALUES (
    user_uuid,
    'ai_assistant',
    'chat',
    COALESCE(session_id, 'chat_' || extract(epoch from now())::text),
    0,
    jsonb_build_object(
      'user_message', message_content,
      'ai_response', response_content,
      'timestamp', now()
    )
  ) RETURNING id INTO interaction_id;

  RETURN interaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's chat history
CREATE OR REPLACE FUNCTION public.get_user_chat_history(
  user_uuid UUID,
  limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  session_id TEXT,
  user_message TEXT,
  ai_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ai.id,
    ai.session_id,
    ai.metadata->>'user_message' as user_message,
    ai.metadata->>'ai_response' as ai_response,
    ai.created_at
  FROM public.agent_interactions ai
  WHERE ai.user_id = user_uuid 
    AND ai.agent_type = 'ai_assistant'
    AND ai.interaction_type = 'chat'
  ORDER BY ai.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get AI assistant analytics
CREATE OR REPLACE FUNCTION public.get_ai_assistant_analytics(
  start_date TIMESTAMP WITH TIME ZONE DEFAULT (now() - interval '30 days'),
  end_date TIMESTAMP WITH TIME ZONE DEFAULT now()
)
RETURNS JSON AS $$
DECLARE
  total_interactions INTEGER;
  unique_users INTEGER;
  avg_session_length NUMERIC;
  popular_topics JSON;
BEGIN
  -- Get total interactions
  SELECT COUNT(*) INTO total_interactions
  FROM public.agent_interactions
  WHERE agent_type = 'ai_assistant'
    AND created_at BETWEEN start_date AND end_date;

  -- Get unique users
  SELECT COUNT(DISTINCT user_id) INTO unique_users
  FROM public.agent_interactions
  WHERE agent_type = 'ai_assistant'
    AND created_at BETWEEN start_date AND end_date;

  -- Get average session length (placeholder - would need more complex logic)
  SELECT AVG(duration_seconds) INTO avg_session_length
  FROM public.agent_interactions
  WHERE agent_type = 'ai_assistant'
    AND created_at BETWEEN start_date AND end_date;

  -- Return analytics
  RETURN json_build_object(
    'total_interactions', total_interactions,
    'unique_users', unique_users,
    'avg_session_length', COALESCE(avg_session_length, 0),
    'period_start', start_date,
    'period_end', end_date
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user preferences based on AI interactions
CREATE OR REPLACE FUNCTION public.update_user_ai_preferences(
  user_uuid UUID,
  preferences_data JSONB
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET 
    preferences = COALESCE(preferences, '{}'::jsonb) || preferences_data,
    updated_at = NOW()
  WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better AI assistant performance
CREATE INDEX IF NOT EXISTS idx_agent_interactions_ai_assistant 
ON public.agent_interactions(user_id, agent_type, created_at) 
WHERE agent_type = 'ai_assistant';

CREATE INDEX IF NOT EXISTS idx_agent_interactions_session 
ON public.agent_interactions(session_id, created_at);
