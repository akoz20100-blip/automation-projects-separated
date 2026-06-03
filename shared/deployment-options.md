# Deployment Options

Use one deployment target for the Cloud API.

## Recommended

- Fastest: Vercel.
- More backend-oriented: Google Cloud Run.
- Firebase ecosystem: Firebase Functions.

## Cloud Run

```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
gcloud run deploy automation-cloud-api \
  --source . \
  --region me-central2 \
  --allow-unauthenticated
```

Set environment variables:

```bash
gcloud run services update automation-cloud-api \
  --region me-central2 \
  --set-env-vars APP_ENV=production,DEFAULT_TIMEZONE=Asia/Riyadh,WHATSAPP_MODE=manual_link
```

## Vercel

```bash
npm install -g vercel
vercel
vercel env add API_SECRET
vercel env add DEFAULT_TIMEZONE
vercel --prod
```

## Firebase Functions

```bash
npm install -g firebase-tools
firebase login
firebase init functions
firebase deploy --only functions
```

