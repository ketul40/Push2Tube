# Security Guide: Encryption Key Management

## ⚠️ CRITICAL SECURITY WARNING

**NEVER commit encryption keys, API keys, or secrets to version control!**

All sensitive credentials must be managed through secure systems:
- **Google Cloud Secret Manager** (recommended for production)
- **Environment variables** (set via Google Cloud Console or CLI)
- **Local `.env` files** (for development only, already in `.gitignore`)

## TOKEN_ENCRYPTION_KEY Management

The `TOKEN_ENCRYPTION_KEY` is used for AES-256-GCM encryption of OAuth tokens stored in Firestore. This key must be:

1. **Generated securely** - Use cryptographically secure random generation
2. **Stored securely** - Never in code, documentation, or version control
3. **Rotated regularly** - If exposed, rotate immediately
4. **Consistent across functions** - All functions must use the same key

### Generating a Secure Key

Generate a 32-byte (256-bit) key in hexadecimal format (64 characters):

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32

# Using Python
python -c "import secrets; print(secrets.token_hex(32))"
```

### Setting the Key in Production

#### Option 1: Google Cloud Secret Manager (Recommended)

1. Create a secret in Secret Manager:
   ```bash
   echo -n "your-encryption-key-here" | gcloud secrets create token-encryption-key \
     --data-file=- \
     --replication-policy="automatic"
   ```

2. Grant functions access to the secret:
   ```bash
   gcloud secrets add-iam-policy-binding token-encryption-key \
     --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
     --role="roles/secretmanager.secretAccessor"
   ```

3. Update function code to use Secret Manager (requires code changes)

#### Option 2: Environment Variables (Current Method)

1. **Via Google Cloud Console:**
   - Go to: https://console.cloud.google.com/functions
   - Edit each function → Runtime environment variables
   - Add: `TOKEN_ENCRYPTION_KEY` = `[your-generated-key]`

2. **Via gcloud CLI:**
   ```bash
   # Set environment variable (do NOT hardcode in scripts!)
   export TOKEN_ENCRYPTION_KEY="your-generated-key-here"
   
   # Then run the script
   ./scripts/set-env-vars.sh
   ```

### Key Rotation Procedure

If a key is exposed or compromised:

1. **Generate a new key** using the methods above
2. **Update all functions** with the new key
3. **Re-encrypt existing tokens:**
   - Users will need to reconnect their YouTube accounts
   - Or create a migration script to decrypt with old key and encrypt with new key
4. **Remove the old key** from all functions
5. **Update documentation** to remove any references to the old key

### Current Status

⚠️ **If you see a hardcoded key in any file:**
- The key has been exposed and should be rotated immediately
- Remove the key from all files
- Generate a new key
- Update all functions with the new key
- Consider the old key compromised

### Best Practices

1. ✅ Use Google Cloud Secret Manager for production secrets
2. ✅ Never commit secrets to version control
3. ✅ Use different keys for development and production
4. ✅ Rotate keys periodically (every 90 days recommended)
5. ✅ Monitor for exposed keys in git history
6. ✅ Use `.gitignore` to exclude `.env` files
7. ✅ Review all commits before pushing to ensure no secrets are included

### Files That Should Never Contain Secrets

- ❌ Documentation files (`.md`)
- ❌ Script files (`.sh`, `.ps1`, `.js`)
- ❌ Configuration files (`.json`, `.yaml`, `.yml`)
- ❌ Source code files (`.ts`, `.js`, `.py`)
- ❌ Example files (`.example`, `.sample`)

### Files That Are Safe

- ✅ `.env` (in `.gitignore`)
- ✅ `.env.local` (in `.gitignore`)
- ✅ Google Cloud Secret Manager
- ✅ Environment variables set via console/CLI

## Reporting Security Issues

If you discover a security vulnerability or exposed secret:

1. **Immediately rotate the compromised key**
2. **Remove the key from all files**
3. **Review git history** and remove from history if possible
4. **Notify team members** if applicable
5. **Update affected users** if user data is at risk

