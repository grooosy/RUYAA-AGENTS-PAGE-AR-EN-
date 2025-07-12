-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, provider)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    CASE 
      WHEN NEW.app_metadata->>'provider' = 'google' THEN 'google'
      ELSE 'email'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update user last seen
CREATE OR REPLACE FUNCTION public.update_user_last_seen(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET last_seen = NOW()
  WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user status with audit logging
CREATE OR REPLACE FUNCTION public.update_user_status(
  user_uuid UUID,
  new_status TEXT,
  user_ip INET DEFAULT NULL,
  user_agent_string TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  old_status TEXT;
BEGIN
  -- Get current status
  SELECT status INTO old_status
  FROM public.profiles
  WHERE id = user_uuid;

  -- Update status and last_seen
  UPDATE public.profiles
  SET 
    status = new_status,
    last_seen = NOW(),
    updated_at = NOW()
  WHERE id = user_uuid;

  -- Log the status change
  INSERT INTO public.audit_log (
    user_id,
    action,
    resource_type,
    resource_id,
    old_values,
    new_values,
    ip_address,
    user_agent
  ) VALUES (
    user_uuid,
    'status_update',
    'profile',
    user_uuid::TEXT,
    jsonb_build_object('status', old_status),
    jsonb_build_object('status', new_status),
    user_ip,
    user_agent_string
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user profile with interaction stats
CREATE OR REPLACE FUNCTION public.get_user_profile_with_stats(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  profile_data JSON;
  interaction_count INTEGER;
  last_interaction TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get profile data
  SELECT row_to_json(p) INTO profile_data
  FROM public.profiles p
  WHERE p.id = user_uuid;

  -- Get interaction statistics
  SELECT COUNT(*), MAX(created_at)
  INTO interaction_count, last_interaction
  FROM public.agent_interactions
  WHERE user_id = user_uuid;

  -- Return combined data
  RETURN json_build_object(
    'profile', profile_data,
    'stats', json_build_object(
      'total_interactions', COALESCE(interaction_count, 0),
      'last_interaction', last_interaction
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create service request
CREATE OR REPLACE FUNCTION public.create_service_request(
  user_uuid UUID,
  service_type TEXT,
  title TEXT,
  description TEXT DEFAULT NULL,
  priority TEXT DEFAULT 'medium'
)
RETURNS UUID AS $$
DECLARE
  request_id UUID;
BEGIN
  INSERT INTO public.service_requests (
    user_id,
    service_type,
    title,
    description,
    priority
  ) VALUES (
    user_uuid,
    service_type,
    title,
    description,
    priority
  ) RETURNING id INTO request_id;

  -- Create notification for the user
  INSERT INTO public.notifications (
    user_id,
    title,
    message,
    type
  ) VALUES (
    user_uuid,
    'Service Request Created',
    'Your service request "' || title || '" has been created and is being processed.',
    'info'
  );

  RETURN request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.user_sessions
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user notifications
CREATE OR REPLACE FUNCTION public.get_user_notifications(
  user_uuid UUID,
  limit_count INTEGER DEFAULT 10,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  message TEXT,
  type TEXT,
  read BOOLEAN,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id,
    n.title,
    n.message,
    n.type,
    n.read,
    n.action_url,
    n.created_at
  FROM public.notifications n
  WHERE n.user_id = user_uuid
  ORDER BY n.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION public.mark_notification_read(
  notification_id UUID,
  user_uuid UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  updated_rows INTEGER;
BEGIN
  UPDATE public.notifications
  SET read = TRUE
  WHERE id = notification_id AND user_id = user_uuid;
  
  GET DIAGNOSTICS updated_rows = ROW_COUNT;
  RETURN updated_rows > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
