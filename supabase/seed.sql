-- Seed default admin user
-- Credentials: admin@example.com / admin123
WITH new_user AS (
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change,
    email_change_token_current,
    phone_change,
    phone_change_token,
    reauthentication_token,
    created_at,
    updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@example.com',
    crypt('admin123', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"],"role":"admin"}',
    '{"name":"Admin"}',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    NOW(),
    NOW()
  )
  ON CONFLICT DO NOTHING
  RETURNING id, email
)
INSERT INTO auth.identities (
  id,
  provider_id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  new_user.email,
  new_user.id,
  json_build_object('sub', new_user.id::text, 'email', new_user.email),
  'email',
  NOW(),
  NOW(),
  NOW()
FROM new_user
ON CONFLICT DO NOTHING;
