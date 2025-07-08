-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, provider)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    CASE 
      WHEN NEW.app_metadata->>'provider' = 'google' THEN 'google'
      ELSE 'email'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update user's last_seen timestamp
CREATE OR REPLACE FUNCTION public.update_user_last_seen(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles 
  SET last_seen = NOW(), updated_at = NOW()
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
  SELECT status INTO old_status FROM public.profiles WHERE id = user_uuid;
  
  -- Update status
  UPDATE public.profiles 
  SET status = new_status, updated_at = NOW()
  WHERE id = user_uuid;
  
  -- Log the change
  INSERT INTO public.audit_log (user_id, action, resource_type, resource_id, old_values, new_values, ip_address, user_agent)
  VALUES (
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

-- Function to get user profile with stats
CREATE OR REPLACE FUNCTION public.get_user_profile_with_stats(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  profile_data JSON;
  interaction_count INTEGER;
  request_count INTEGER;
  unread_notifications INTEGER;
BEGIN
  -- Get profile data
  SELECT to_json(p.*) INTO profile_data
  FROM public.profiles p
  WHERE p.id = user_uuid;
  
  -- Get interaction count
  SELECT COUNT(*) INTO interaction_count
  FROM public.agent_interactions
  WHERE user_id = user_uuid;
  
  -- Get service request count
  SELECT COUNT(*) INTO request_count
  FROM public.service_requests
  WHERE user_id = user_uuid;
  
  -- Get unread notifications count
  SELECT COUNT(*) INTO unread_notifications
  FROM public.notifications
  WHERE user_id = user_uuid AND read = FALSE;
  
  -- Combine all data
  RETURN json_build_object(
    'profile', profile_data,
    'stats', json_build_object(
      'interactions', interaction_count,
      'requests', request_count,
      'unread_notifications', unread_notifications
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS VOID AS $$
BEGIN
  DELETE FROM public.user_sessions
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
