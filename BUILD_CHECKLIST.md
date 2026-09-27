# SmartSpend — Build Checklist

## Phase 0 — Plan
- [ ] Choose final stack (this starter: React + Node/Express + PostgreSQL)
- [ ] Sketch schema: users, transactions, categories, budgets, goals

## Phase 1 — Manual tracker (this starter covers this)
- [x] Auth: signup/login with JWT
- [x] Add transaction manually
- [x] List transactions
- [x] Dashboard with category pie chart
- [ ] Deploy a working demo (even locally) and screenshot it for your portfolio

## Phase 2 — Statement import
- [ ] CSV upload endpoint (`multer` for file upload, `csv-parse` to read rows)
- [ ] Bulk-insert parsed rows into `transactions`
- [ ] Let user correct categories after import
- [ ] (Stretch) PDF statement parsing

## Phase 3 — AI categorization
- [ ] Rule-based first pass: keyword → category mapping (fast win)
- [ ] Build/find a labeled transaction dataset
- [ ] Train a scikit-learn classifier (TF-IDF + Naive Bayes/Logistic Regression) on transaction descriptions
- [ ] Serve it as a small Python API the Node backend calls
- [ ] Add recurring-subscription detection (same merchant + similar amount, monthly)

## Phase 4 — Budgets, goals, forecasting
- [ ] `budgets` table: per-category monthly limit
- [ ] Budget progress bars on dashboard
- [ ] `goals` table: target amount + deadline + saved so far
- [ ] Forecast: `(spent so far / days elapsed) × days in month`
- [ ] (Stretch) swap in Prophet for a real time-series forecast

## Phase 5 — Notifications
- [ ] Threshold check on each new transaction (e.g. 90% of budget used)
- [ ] Email via SendGrid, or in-app alert if you skip email infra
- [ ] Subscription-cancel reminders

## Phase 6 — Deploy
- [ ] Dockerize backend + frontend
- [ ] Backend → Render/Railway; Frontend → Vercel/Netlify; DB → Supabase/Neon
- [ ] Write a README with screenshots + architecture diagram for your resume/CRT portfolio

## Nice-to-haves once core is done
- [ ] Export data as PDF/CSV
- [ ] OCR receipt scanning (Tesseract.js or a cloud OCR API)
- [ ] Dark mode / mobile-responsive polish
