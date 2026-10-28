# Quick Start Guide

## 🚀 Get the Dashboard Running (2 minutes)

### Option 1: Local Development
```bash
cd ~/shared/visualize-amazon
npm install
npm run dev
```
Open http://localhost:3000

### Option 2: Deploy to Vercel (Free)
```bash
cd ~/shared/visualize-amazon
git init
git add .
git commit -m "Initial commit"
gh repo create visualize-amazon --private --source=. --remote=origin --push
```
Then:
1. Go to https://vercel.com/new
2. Import `visualize-amazon` repo
3. Click "Deploy"
4. Done! Live in 2 minutes.

---

## 📊 What You'll See

- **Sales Dashboard** - Revenue trends, units sold, top SKUs
- **Inventory** - Stock levels, restock alerts, days remaining
- **Marketing** - PPC performance, ACOS tracking, campaign analysis
- **AI Council** - Prioritized recommendations and action items

**Note**: Currently using mock data. SP-API integration is next step.

---

## 📝 Key Commands

```bash
npm run dev      # Development server (http://localhost:3000)
npm run build    # Production build
npm start        # Run production build locally
```

---

## 🔧 What's Next?

### Immediate (No Coding):
1. Deploy to Vercel (see above)
2. Test on mobile
3. Share preview link with team
4. Gather feedback

### Short-Term (Development):
1. **Integrate Amazon SP-API** - Replace mock data
2. **Add Authentication** - Protect dashboard
3. **Date Filters** - Custom date ranges

### Long-Term (Enhancements):
- Email alerts for low stock
- Export to CSV/PDF
- Keyword tracking
- Mobile app

---

## 📚 Documentation

- **[README.md](README.md)** - Project overview
- **[docs/DASHBOARD_DESIGN.md](docs/DASHBOARD_DESIGN.md)** - Design decisions, layouts
- **[docs/COMPONENT_GUIDE.md](docs/COMPONENT_GUIDE.md)** - How to use components
- **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Deploy to Vercel
- **[docs/BUILD_SUMMARY.md](docs/BUILD_SUMMARY.md)** - What was built, why, what's next

---

## 🆘 Quick Troubleshooting

**Issue**: "Module not found"  
**Fix**: `rm -rf node_modules && npm install`

**Issue**: Styling broken  
**Fix**: `rm -rf .next && npm run dev`

**Issue**: Charts not showing  
**Fix**: Check browser console, ensure JavaScript enabled

---

## 💡 Key Files

```
app/dashboard/page.tsx  → Sales dashboard
app/inventory/page.tsx  → Inventory management
app/marketing/page.tsx  → Marketing insights
app/council/page.tsx    → AI recommendations
components/             → Reusable UI components
lib/mockData.ts         → Mock data (replace with SP-API)
```

---

## 🎯 Success Criteria

✅ All 4 pages working  
✅ Responsive design  
✅ Production build succeeds  
✅ Mock data displays correctly  
✅ Ready to deploy  
✅ Easy to integrate real data  

---

**Questions?** Check the docs/ folder or ask Peekay!
