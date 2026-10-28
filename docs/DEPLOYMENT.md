# Deployment Guide

## Quick Deploy to Vercel

### Prerequisites
- GitHub account
- Vercel account (free tier works)

### Steps

1. **Push to GitHub**
   ```bash
   cd ~/shared/visualize-amazon
   git init
   git add .
   git commit -m "Initial commit: VISUALIZE dashboard"
   gh repo create visualize-amazon --private --source=. --remote=origin --push
   ```

2. **Deploy to Vercel**
   - Go to https://vercel.com/new
   - Import your `visualize-amazon` GitHub repository
   - Framework Preset: **Next.js**
   - Root Directory: `./`
   - Leave build settings as default
   - Click **Deploy**

3. **Configure Environment Variables** (when ready for SP-API)
   - In Vercel dashboard, go to Settings → Environment Variables
   - Add:
     ```
     AMAZON_SP_API_REFRESH_TOKEN=your_token
     AMAZON_SP_API_CLIENT_ID=your_client_id
     AMAZON_SP_API_CLIENT_SECRET=your_client_secret
     AMAZON_SELLER_ID=your_seller_id
     AMAZON_MARKETPLACE_ID=ATVPDKIKX0DER
     ```

4. **Done!**
   - Your dashboard will be live at `https://visualize-amazon-[random].vercel.app`
   - Auto-deploys on every push to main

---

## Manual Deployment

### Build Locally
```bash
npm run build
npm start
# Runs on http://localhost:3000
```

### Deploy to VPS/Server
```bash
# Build
npm run build

# Copy .next/, public/, package.json, next.config.js to server

# On server
npm install --production
npm start
```

---

## Environment Variables

Create `.env.local` for development:

```bash
# Application
NEXT_PUBLIC_APP_NAME="VISUALIZE Sports Dashboard"

# Amazon SP-API (when ready)
AMAZON_SP_API_REFRESH_TOKEN=
AMAZON_SP_API_CLIENT_ID=
AMAZON_SP_API_CLIENT_SECRET=
AMAZON_SELLER_ID=
AMAZON_MARKETPLACE_ID=ATVPDKIKX0DER
```

**Important**: Never commit `.env.local` to git (already in `.gitignore`)

---

## Custom Domain (Vercel)

1. Go to Vercel dashboard → Settings → Domains
2. Add your domain: `dashboard.visualizesports.com`
3. Update DNS records as instructed by Vercel
4. Wait for SSL certificate (automatic)

---

## Monitoring

### Vercel Analytics (Free)
- Real-time visitor tracking
- Core Web Vitals
- Performance insights
- Enable in Vercel dashboard

### Error Tracking (Optional)
Consider adding Sentry for production error monitoring:
```bash
npm install @sentry/nextjs
```

---

## Performance Optimization

### Already Implemented:
- ✅ Static page generation
- ✅ Code splitting
- ✅ Image optimization (via Next.js)
- ✅ CSS minification

### Future Improvements:
- [ ] Enable Redis caching for SP-API responses
- [ ] Add service worker for offline support
- [ ] Implement lazy loading for charts
- [ ] Add CDN for static assets

---

## Security

### Current Setup:
- Private GitHub repository
- No authentication (internal use only)
- Environment variables for secrets

### Production Recommendations:
- Add authentication (NextAuth.js)
- Enable HTTPS-only (automatic on Vercel)
- Rate limiting on API routes
- Input validation for any user inputs

---

## CI/CD

Vercel handles CI/CD automatically:
- Push to `main` → Auto-deploy to production
- Push to other branches → Preview deployments
- Pull requests → Automatic preview URLs

---

## Rollback

If a deployment breaks:

1. **Via Vercel Dashboard:**
   - Go to Deployments
   - Find previous working version
   - Click "Promote to Production"

2. **Via Git:**
   ```bash
   git revert HEAD
   git push
   ```

---

## Local Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Run production build locally
npm start
```

---

## Troubleshooting

### Build fails with "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Styling not working
- Check `tailwind.config.js` has correct content paths
- Ensure `globals.css` imports Tailwind directives
- Clear Next.js cache: `rm -rf .next`

### Charts not rendering
- Ensure browser supports JavaScript
- Check console for errors
- Verify Recharts is installed: `npm list recharts`

### Environment variables not working
- Prefix with `NEXT_PUBLIC_` for client-side access
- Restart dev server after changing `.env.local`
- Redeploy to Vercel after adding env vars

---

## Support

For deployment issues:
- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs/deployment

For dashboard-specific questions:
- See `docs/COMPONENT_GUIDE.md`
- See `docs/DASHBOARD_DESIGN.md`
