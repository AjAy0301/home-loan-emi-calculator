# 🚀 GitHub Pages Deployment Guide

## Your repository is ready! Follow these steps to host on GitHub Pages:

### Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the **"+"** icon (top right) → **"New repository"**
3. Repository settings:
   - **Name**: `home-loan-emi-calculator` (or any name you prefer)
   - **Description**: "Advanced Home Loan EMI Calculator with prepayment features"
   - **Visibility**: Public (required for free GitHub Pages)
   - **DO NOT** initialize with README (we already have one)
4. Click **"Create repository"**

### Step 2: Push Your Code to GitHub

After creating the repository, GitHub will show you commands. Run these in your terminal:

```bash
cd "/Users/ajaykumar/Home Loan EMI Calculator"

# Add the remote repository (replace YOUR-USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR-USERNAME/home-loan-emi-calculator.git

# Push your code
git branch -M main
git push -u origin main
```

**Example:**
If your GitHub username is `johndoe`, the command would be:
```bash
git remote add origin https://github.com/johndoe/home-loan-emi-calculator.git
```

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **"Settings"** (tab at the top)
3. Scroll down and click **"Pages"** (left sidebar)
4. Under **"Source"**:
   - Branch: Select **"main"**
   - Folder: Select **"/ (root)"**
5. Click **"Save"**

### Step 4: Wait for Deployment (1-2 minutes)

GitHub will build and deploy your site. You'll see a message:
> "Your site is ready to be published at https://YOUR-USERNAME.github.io/home-loan-emi-calculator/"

### Step 5: Access Your Live Website! 🎉

Your calculator will be available at:
```
https://YOUR-USERNAME.github.io/home-loan-emi-calculator/
```

---

## 📝 Quick Command Reference

```bash
# Navigate to project
cd "/Users/ajaykumar/Home Loan EMI Calculator"

# Set up remote (replace YOUR-USERNAME)
git remote add origin https://github.com/YOUR-USERNAME/home-loan-emi-calculator.git

# Push code
git branch -M main
git push -u origin main
```

---

## 🔄 Future Updates

When you make changes to your calculator:

```bash
cd "/Users/ajaykumar/Home Loan EMI Calculator"
git add -A
git commit -m "Description of your changes"
git push
```

Your live site will automatically update in 1-2 minutes!

---

## ✅ Checklist

- [ ] Created GitHub repository
- [ ] Added remote origin
- [ ] Pushed code to GitHub
- [ ] Enabled GitHub Pages in settings
- [ ] Waited for deployment
- [ ] Tested live website URL

---

## 🆘 Troubleshooting

**If you get authentication errors:**
1. Use GitHub Personal Access Token instead of password
2. Or set up SSH keys (recommended)

**If pages don't work:**
1. Check that repository is **Public**
2. Ensure you selected **main** branch
3. Wait a few minutes and refresh

---

## 🎯 What You'll Get

A live, professional website accessible by anyone with:
- Your own custom URL
- All features working perfectly
- Free hosting forever (as long as repo is public)
- Automatic HTTPS security

**Share your calculator with the world! 🌍**
