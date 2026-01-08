# STUDENT PERFORMANCE DASHBOARD SYSTEM v2.0

This project implements a static, production-ready Student Performance Dashboard system. It features a main dashboard displaying all students with search, filter, and sort capabilities, and individual student profile pages with detailed assessment data, charts, and trend analysis.

## 🚀 Deployment to GitHub Pages

### Step 1: Initialize Git and Make Initial Commit

```bash
# Initialize git repository
git init

# Add all files
git add .

# Make initial commit
git commit -m "Initial commit: Student Performance Dashboard v2.0"
```

### Step 2: Create GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Name your repository (e.g., `student-dashboard`)
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

### Step 3: Push to GitHub

After creating the repository, GitHub will show you commands. Use these (replace `YOUR_USERNAME` with your GitHub username):

```bash
# Add remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/student-dashboard.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

### Step 4: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on **Settings** (top menu)
3. Scroll down to **Pages** in the left sidebar
4. Under "Source", select **Deploy from a branch**
5. Select branch: **main**
6. Select folder: **/ (root)**
7. Click **Save**

### Step 5: Access Your Live Site

Your dashboard will be available at:
```
https://YOUR_USERNAME.github.io/student-dashboard/
```

**Note:** It may take a few minutes for GitHub Pages to deploy your site. You'll see a green checkmark on your repository when it's ready.

## 📊 Updating Data

To update the student data:

1. Edit `data.csv` with new data
2. Run `node generate.js` to regenerate student pages
3. Commit and push changes:
   ```bash
   git add .
   git commit -m "Update student data"
   git push
   ```

## 🛠 Project Structure

```
student-dashboard/
├── index.html              # Main Dashboard (All Students)
├── data.csv                # Source Data (All Students)
├── generate.js             # Node.js Generator for student pages
├── js/
│   ├── app.js              # Core Logic (CSV Parse/Filter/Render)
│   ├── charts.js           # Chart.js Dual Charts
│   └── utils.js            # Data Utils (Totals/Trends)
├── css/
│   └── styles.css          # Modern Responsive Design
├── students/               # AUTO-GENERATED (1 per student)
│   ├── student-rahul.html
│   └── ... (all students)
└── README.md               # This file
```

## ✅ Features

- 📊 Main dashboard with all students
- 🔍 Search and filter functionality
- 📈 Sort by name, overall score, weekly, or fortnight performance
- 👤 Individual student profile pages
- 📉 Charts and trend analysis
- 📱 Fully responsive design
- ⚡ Fast loading with optimized performance

## 🎨 Technologies Used

- HTML5
- CSS3 (Modern gradients, glassmorphism effects)
- JavaScript (ES6+)
- Bootstrap 5.3.3
- Chart.js 4.4.0
- PapaParse 5.4.1

## 📝 License

This project is open source and available for educational purposes.