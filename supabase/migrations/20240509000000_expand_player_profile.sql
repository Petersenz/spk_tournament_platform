-- Add missing player attributes to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS custom_user_identifier TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Update the handle_new_user trigger to support these fields if provided during signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, nickname, role, preferred_language, custom_user_identifier)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'nickname', 'User_' || substr(new.id::text, 1, 6)),
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'player'),
    COALESCE(new.raw_user_meta_data->>'preferred_language', 'en'),
    new.raw_user_meta_data->>'custom_user_identifier'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
