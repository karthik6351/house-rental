# GitHub Setup Instructions

Your project is now ready to be pushed to GitHub! Follow these steps:

## Option 1: Create New Repository on GitHub (Recommended)

### Step 1: Create Repository on GitHub.com
1. Go to https://github.com/new
2. Repository name: `house-rent-platform` (or your preferred name)
3. Description: "Commercial house rental platform connecting owners and tenants"
4. Choose: **Public** or **Private** (your choice)
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

### Step 2: Connect & Push Your Code
After creating the repository, run these commands in your terminal:

```bash
cd d:\karthik\education\house-rent

# Add GitHub as remote origin (replace USERNAME with your GitHub username)
git remote add origin https://github.com/USERNAME/house-rent-platform.git

# Push your code
git branch -M main
git push -u origin main
```

GitHub will ask for authentication:
- Username: Your GitHub username
- Password: Use a **Personal Access Token** (not your password)

### Step 3: Get Personal Access Token (if needed)
1. Go to https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Name: "House Rent Platform"
4. Expiration: Choose duration
5. Select scopes: Check **"repo"** (full control of private repositories)
6. Click "Generate token"
7. **COPY THE TOKEN** - you won't see it again!
8. Use this token as password when pushing

---

## Option 2: Push to Existing Repository

If you already have a repository:

```bash
cd d:\karthik\education\house-rent

# Add your existing repo as remote
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git

# Push
git branch -M main
git push -u origin main
```

---

## Verify Everything Worked

After pushing, check:
1. Go to your GitHub repository URL
2. You should see all folders: `backend/`, `frontend/`, `README.md`, etc.
3. Check that `.env` files are NOT visible (they're gitignored)

---

## Current Git Status

✅ Git initialized  
✅ All files committed  
✅ .gitignore configured (sensitive files protected)  
✅ Ready to push to GitHub

**Committed Files Include:**
- Backend (Node.js/Express server)
- Frontend (Next.js application)
- Documentation (README, QUICKSTART)
- Configuration files
- Source code

**Protected Files (NOT in repo):**
- `.env` files with secrets
- `node_modules/`
- Build outputs
- Uploaded property images

---

## Need Help?

If you encounter issues:
1. **Authentication failed**: Make sure you're using a Personal Access Token, not your password
2. **Remote already exists**: Run `git remote remove origin` then try again
3. **Push rejected**: Make sure the GitHub repo is empty (no README initialized)

---

## Next Steps After Pushing

1. Add a nice README badge: `![Status](https://img.shields.io/badge/status-active-success)`
2. Set up GitHub Actions for CI/CD (optional)
3. Enable branch protection (optional)
4. Share the repository link!

**Your project is ready for GitHub! 🚀**
