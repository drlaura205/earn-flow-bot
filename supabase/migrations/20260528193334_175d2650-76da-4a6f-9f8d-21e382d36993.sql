UPDATE auth.users
SET email = 'mnyamakim2012@gic.local',
    encrypted_password = crypt('#2552$2557@drdanK@', gen_salt('bf')),
    email_confirmed_at = COALESCE(email_confirmed_at, now()),
    updated_at = now()
WHERE id = '9a2d6481-27b4-4832-90fb-ff064b889471';

UPDATE auth.identities
SET identity_data = jsonb_set(identity_data, '{email}', '"mnyamakim2012@gic.local"'),
    updated_at = now()
WHERE user_id = '9a2d6481-27b4-4832-90fb-ff064b889471' AND provider = 'email';