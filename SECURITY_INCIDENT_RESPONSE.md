# 🚨 SECURITY INCIDENT: Exposed API Keys

## What Happened

GitGuardian detected that Supabase API keys were committed to the Git repository in the following files:
- `tests/test-supabase-connection.js` - Contained real Supabase anon key
- `docs/setup/ENV_SETUP.md` - Contained real API keys
- `scripts/SETUP_ENV.sh` - Contained real API keys

## ✅ Immediate Actions Taken

1. **Removed all real API keys** from tracked files and replaced with placeholders
2. **Updated files to use environment variables** instead of hardcoded keys

## ⚠️ CRITICAL: You Must Do This Now

### 1. Rotate Your Supabase API Keys IMMEDIATELY

**The exposed keys are compromised and must be regenerated:**

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/dgpntdkjsvkcftleryjx/settings/api
2. Click **"Reset"** or **"Regenerate"** for:
   - **anon public key** (if exposed)
   - **service_role key** (CRITICAL - this has admin access)
3. Copy the new keys
4. Update your `.env.local` file with the new keys
5. Update any deployed environments (Vercel, etc.) with the new keys

### 2. Remove Secrets from Git History

The keys are still in your Git history. You need to remove them:

**Option A: Using git-filter-repo (Recommended)**
```bash
# Install git-filter-repo if needed
pip install git-filter-repo

# Remove the exposed keys from history
git filter-repo --path tests/test-supabase-connection.js --invert-paths
# Or use BFG Repo-Cleaner for easier use
```

**Option B: Using BFG Repo-Cleaner (Easier)**
```bash
# Download BFG: https://rtyley.github.io/bfg-repo-cleaner/
# Create a file with the keys to remove
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRncG50ZGtqc3ZrY2Z0bGVyeWp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNzkwNjIsImV4cCI6MjA4MDk1NTA2Mn0.cAdPvfE1zJN_eHR0OlFpTI2Dia7ys8vJBLzFkfO4ZpA" > keys-to-remove.txt
echo "sb_publishable_JFejKohAvuA5f5zsQTekPg_tnI7I4Pg" >> keys-to-remove.txt
echo "sb_secret_-TK3R6rFnX9o1JUjRkMnlQ_03LMTX9f" >> keys-to-remove.txt

# Run BFG
java -jar bfg.jar --replace-text keys-to-remove.txt

# Force push (WARNING: This rewrites history)
git push --force
```

**Option C: If repository is private and you want to start fresh**
```bash
# Create a new repository and push current state
git remote set-url origin <new-repo-url>
git push -u origin main
```

### 3. Verify No Other Secrets Are Exposed

Check for other secrets:
```bash
# Search for common secret patterns
grep -r "api[_-]key\|secret\|password\|token" --include="*.js" --include="*.ts" --include="*.md" --include="*.sh" | grep -v node_modules | grep -v ".next"
```

### 4. Enable GitGuardian (Optional but Recommended)

If you haven't already, consider enabling GitGuardian for your repository to prevent future leaks.

## Prevention for Future

1. ✅ **Never commit `.env.local`** - Already in `.gitignore`
2. ✅ **Use environment variables** - Always reference `process.env.*`
3. ✅ **Use placeholder values** in documentation and example files
4. ✅ **Review files before committing** - Check for hardcoded secrets
5. ✅ **Use pre-commit hooks** - Tools like `git-secrets` or `truffleHog`

## Files Updated

- ✅ `tests/test-supabase-connection.js` - Now uses environment variables
- ✅ `docs/setup/ENV_SETUP.md` - Keys replaced with placeholders
- ✅ `scripts/SETUP_ENV.sh` - Keys replaced with placeholders
- ✅ `docs/setup/GET_API_KEYS.md` - Example tokens sanitized
- ✅ `docs/setup/API_KEYS_INSTRUCTIONS.md` - Example tokens sanitized

## Next Steps

1. **Rotate keys immediately** (most important)
2. **Update `.env.local`** with new keys
3. **Update production/deployment environments**
4. **Remove secrets from Git history** (if repository is public or shared)
5. **Test the application** with new keys

---

**Remember**: Even if your repository is private, exposed keys in Git history can be accessed by anyone with repository access. Always rotate compromised keys.

