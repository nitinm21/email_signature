# Switching Cloudflare R2 Accounts

This guide explains how to update the environment variables when moving the app to a different Cloudflare account.

## Prerequisites
- Access to the target Cloudflare account.
- Permission to manage R2 buckets and API keys.
- The app uses `.env.local` for local/dev configuration (do not commit secrets).

## Variables to Update
These variables live in `.env.local` (see `.env.example` for the template):

- `R2_ACCOUNT_ID`: The Cloudflare account ID for the new account.
- `R2_BUCKET_NAME`: The R2 bucket name in the new account.
- `R2_ACCESS_KEY_ID`: R2 access key ID generated in the new account.
- `R2_SECRET_ACCESS_KEY`: R2 secret access key generated in the new account.
- `R2_PUBLIC_BASE_URL`: Public URL for the bucket (r2.dev or custom domain).
- `R2_API_HOST`: R2 S3 endpoint host for the account.

## Step-by-step
1. Log in to the target Cloudflare account.
2. Find the account ID:
   - Go to the Cloudflare dashboard and open the account.
   - The **Account ID** is shown in the right sidebar or under **Workers & Pages**.
3. Create or select an R2 bucket:
   - Navigate to **R2**.
   - Create a bucket (or select an existing one) and note the bucket name.
4. Create R2 access keys:
   - In **R2**, go to **Manage R2 API Tokens** or **Access Keys**.
   - Create a key with the permissions the app needs (typically read/write for the bucket).
   - Copy the **Access Key ID** and **Secret Access Key**.
5. Determine the public URL:
   - If using `r2.dev`, note the public bucket URL shown in the bucket settings.
   - If using a custom domain, use the configured domain instead.
6. Build the API host:
   - Use `R2_ACCOUNT_ID.r2.cloudflarestorage.com`.
7. Update `.env.local` with the new values. Example (placeholders only):

```env
R2_ACCOUNT_ID=your_account_id
R2_BUCKET_NAME=your_bucket_name
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_PUBLIC_BASE_URL=https://your-bucket-subdomain.r2.dev
R2_API_HOST=your_account_id.r2.cloudflarestorage.com
```

8. Restart the app so it picks up the new environment variables.

## Validation
- Upload a file from the app and confirm it appears in the new bucket.
- Verify that public URLs resolve and serve the uploaded assets.

## Notes
- Keep `.env.local` out of version control and never share keys in logs or tickets.
- If you use a custom domain, ensure it is correctly mapped to the new bucket.
