# Disable Email Confirmation in Supabase

To disable email confirmation after signup, you need to update your Supabase project settings:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/dgpntdkjsvkcftleryjx
2. Navigate to **Authentication** → **Settings** (or **Configuration** → **Authentication**)
3. Find the **Email Auth** section
4. **Disable** "Enable email confirmations"
5. Save the changes

Alternatively, you can do this via SQL:

```sql
-- Disable email confirmation requirement
UPDATE auth.config 
SET enable_signup = true,
    enable_email_confirmations = false;
```

After disabling email confirmations, users will be able to sign in immediately after signing up without needing to verify their email.

