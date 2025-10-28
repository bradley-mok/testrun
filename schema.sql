
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone_number TEXT,
  password_hash TEXT NOT NULL,
  profile_image TEXT,
  location TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  bio TEXT,
  account_type TEXT DEFAULT 'farmer',  -- could also be 'admin' or 'buyer'
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, phone_number, created_at)
  VALUES (NEW.id, NEW.email, NEW.phone, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();


