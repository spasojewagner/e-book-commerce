# Forbidden Knowledge: e-book store

[![CI](https://github.com/spasojewagner/e-book-commerce/actions/workflows/ci.yml/badge.svg)](https://github.com/spasojewagner/e-book-commerce/actions/workflows/ci.yml)

An online store for PDF e-books. Customers add books to the cart and pay by card with Stripe. After payment the books arrive by email as attachments, each with a personal download link.

**Stack:** React 19, TypeScript, Vite, Tailwind CSS, Zustand, Stripe Elements · Node.js, Express, MongoDB with Mongoose, Stripe, Nodemailer

## How a purchase works

1. The store sends only product ids and quantities. The API looks up titles and prices in its own catalog (`src/config/catalog.ts`), creates the order and a Stripe PaymentIntent for that total.
2. The customer pays with Stripe Elements.
3. The store asks the API to confirm. The API checks with Stripe that this order's payment succeeded for the right amount. It then marks the order paid in a single atomic step, so a double confirmation can't send the books twice.
4. The API creates a download token for each book and emails the PDFs. Each token is valid for 24 hours and 5 downloads.

The PDF files live in `ebook-commerce-backend/ebooks/`, outside every public folder. They can only be downloaded with a token from a paid order. The repository includes one sample PDF that every title delivers.

## Running it locally

You need Node.js 20+, MongoDB, a Stripe account in test mode and an SMTP account (SendGrid, or Mailtrap for testing).

```bash
# API (http://localhost:4000)
cd ebook-commerce-backend
cp .env.example .env        # MONGODB_URI, STRIPE_SECRET_KEY, EMAIL_*
npm install
npm run dev

# Store (http://localhost:5173)
cd ../ebook-commerce
cp .env.example .env        # VITE_STRIPE_PUBLISHABLE_KEY
npm install
npm run dev
```

Pay with the test card `4242 4242 4242 4242`, any future date and any CVC.

## API

| Route | |
|---|---|
| `POST /api/payment/create-payment-intent` | `{ items: [{ productId, quantity }], customerInfo }` → `{ clientSecret, orderId, amount }` |
| `POST /api/payment/confirm-payment` | `{ paymentIntentId, orderId }`: verifies the payment and sends the books |
| `GET /api/payment/order/:orderId` | order status for the success page (no email or download links) |
| `GET /api/download/:token` | downloads a bought book |
| `GET /api/download/info/:token` | expiry and downloads left |
| `GET /health` | liveness |

GitHub Actions type-checks and builds both apps on every push.
