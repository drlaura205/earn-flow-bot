
-- Create new admin auth user if missing
DO $$
DECLARE
  _uid uuid;
BEGIN
  SELECT id INTO _uid FROM auth.users WHERE email = 'bruffen@gic.local';

  IF _uid IS NULL THEN
    _uid := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email,
      encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', _uid, 'authenticated', 'authenticated',
      'bruffen@gic.local',
      crypt('bruffen#202#6', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"phone":"Bruffen"}'::jsonb,
      now(), now(), '', '', '', ''
    );

    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), _uid, jsonb_build_object('sub', _uid::text, 'email', 'bruffen@gic.local'), 'email', _uid::text, now(), now(), now());
  ELSE
    UPDATE auth.users
      SET encrypted_password = crypt('bruffen#202#6', gen_salt('bf')),
          email_confirmed_at = COALESCE(email_confirmed_at, now()),
          updated_at = now()
      WHERE id = _uid;
  END IF;

  -- Ensure profile exists for the admin
  INSERT INTO public.profiles (id, phone, invitation_code, my_code)
  VALUES (_uid, 'Bruffen', '', lpad((floor(random() * 900000) + 100000)::text, 6, '0'))
  ON CONFLICT (id) DO NOTHING;

  -- Ensure admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_uid, 'admin')
  ON CONFLICT DO NOTHING;

  -- Revoke admin from anyone else
  DELETE FROM public.user_roles WHERE role = 'admin' AND user_id <> _uid;
END $$;
