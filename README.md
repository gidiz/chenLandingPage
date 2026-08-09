# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## GitHub Actions AWS Deployment

This project includes a GitHub Actions workflow at `.github/workflows/deploy.yml` that builds the static Nuxt site and deploys `.output/public` to AWS S3.

## Analytics environment configuration

This app now supports loading a GTM environment-specific snippet through Nuxt runtime config and GitHub environment variables.

### Local environment variables

Set these variables in your local `.env` file when you want to test a non-live GTM environment:

```bash
NUXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NUXT_PUBLIC_GTM_CONTAINER_ID=GTM-XXXXXXX
NUXT_PUBLIC_GTM_AUTH=YOUR_GTM_AUTH_TOKEN
NUXT_PUBLIC_GTM_PREVIEW=env-XX
NUXT_PUBLIC_GTM_COOKIES_WIN=x
NUXT_PUBLIC_APP_ENVIRONMENT=development
```

Notes:

- Leave `NUXT_PUBLIC_GTM_AUTH` and `NUXT_PUBLIC_GTM_PREVIEW` empty to load the live GTM container snippet.
- `NUXT_PUBLIC_APP_ENVIRONMENT` is pushed into the dataLayer as `app_environment` for debugging and tag routing.
- In GTM, use the built-in `Environment Name` variable for lookup tables that switch between GA4 Measurement IDs.

### What the workflow does

1. Runs on pushes to `develop` and `main`, and on manual dispatch.
2. Installs dependencies with `npm ci`.
3. Builds the static site with `npm run generate`.
4. Selects the GitHub environment automatically:
   - `develop` branch -> `dev`
   - `main` branch -> `prod`
   - Manual dispatch -> whichever target you choose
5. Assumes an AWS IAM role using GitHub OIDC.
6. Syncs `.output/public` to your S3 bucket.
7. Optionally invalidates CloudFront if a distribution ID is configured.

### Environments used by this repo

- `dev`: `dev.example.com`
- `prod`: `example.com`

### Required GitHub configuration

Create two GitHub Environments in the repository:

- `dev`
- `prod`

For each environment, add these variables:

- `AWS_REGION`: The AWS region for your bucket, for example `us-east-1`.
- `AWS_S3_BUCKET`: The target bucket name.
- `AWS_CLOUDFRONT_DISTRIBUTION_ID`: Optional. Set this only if you want automatic cache invalidation.
- `SITE_URL`: The public domain for that environment.
- `NUXT_PUBLIC_GA_MEASUREMENT_ID`: The GA4 Measurement ID for that environment.
- `NUXT_PUBLIC_GTM_CONTAINER_ID`: Your GTM container ID.
- `NUXT_PUBLIC_GTM_AUTH`: Optional. The GTM environment auth token.
- `NUXT_PUBLIC_GTM_PREVIEW`: Optional. The GTM environment preview value such as `env-3`.
- `NUXT_PUBLIC_GTM_COOKIES_WIN`: Optional. Usually `x` when using GTM environments.
- `NUXT_PUBLIC_APP_ENVIRONMENT`: A readable environment label such as `development` or `production`.

Recommended values for `SITE_URL`:

- `dev`: `https://dev.example.com`
- `prod`: `https://example.com`

Recommended analytics values:

- `dev`: use the dev GA4 Measurement ID, dev GTM auth/preview values, and `NUXT_PUBLIC_APP_ENVIRONMENT=development`
- `prod`: use the prod GA4 Measurement ID, leave GTM auth/preview empty if you want the Live environment, and `NUXT_PUBLIC_APP_ENVIRONMENT=production`

For each environment, add this secret:

- `AWS_ROLE_TO_ASSUME`: The IAM role ARN that GitHub Actions should assume.

You can use different buckets, CloudFront distributions, and IAM roles for `dev` and `prod`.

### Required AWS setup

1. Create an S3 bucket configured for static site hosting or front it with CloudFront.
2. Create an IAM role trusted by GitHub's OIDC provider.
3. Allow that role to write to the bucket and optionally create CloudFront invalidations.

Example trust policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::<aws-account-id>:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": [
            "repo:<github-org-or-user>/<repo-name>:ref:refs/heads/develop",
            "repo:<github-org-or-user>/<repo-name>:ref:refs/heads/main"
          ]
        }
      }
    }
  ]
}
```

Example permissions policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": ["arn:aws:s3:::<bucket-name>", "arn:aws:s3:::<bucket-name>/*"]
    },
    {
      "Effect": "Allow",
      "Action": "cloudfront:CreateInvalidation",
      "Resource": "arn:aws:cloudfront::<aws-account-id>:distribution/<distribution-id>"
    }
  ]
}
```

### Notes

- The workflow deploys from `develop` to the `dev` environment and from `main` to the `prod` environment.
- The current static build emits a warning about `assets/cover.png` resolving at runtime during `npm run generate`. Deployment still works, but you may want to clean that asset reference up separately.

## MCP Integrations

This repository now includes a local MCP server for operational and analytics read access.

### What it exposes

- GA4 Admin API tools
- GA4 Data API tools
- Google Tag Manager API tools
- AWS S3 and CloudFront tools
- GitHub repository and issue tools

### Workspace setup

The shared VS Code workspace configuration lives at `.vscode/mcp.json` and starts the local server with:

```bash
npm run mcp:start
```

The workspace config loads environment variables from `.env`. Keep `.env.example` as the tracked template for required keys, and keep real credentials only in your local `.env` or shell environment.

### Required environment variables

Google authentication options:

- `GOOGLE_APPLICATION_CREDENTIALS` pointing to a service-account JSON file
- `GOOGLE_SERVICE_ACCOUNT_JSON` containing the JSON payload directly
- or Application Default Credentials if you already have them configured locally

For Google Tag Manager access, prefer a service account. Grant that service account access in the GTM account or container UI, then point the MCP server at the service-account JSON through one of the variables above.

User ADC with the default gcloud client can be blocked for GTM scopes in this workspace, so service-account auth is the reliable path here.

If your organization blocks service-account key creation, use a custom OAuth client instead of the default gcloud client:

```bash
gcloud auth application-default login --client-id-file=/path/to/oauth-client.json --scopes=https://www.googleapis.com/auth/cloud-platform,https://www.googleapis.com/auth/tagmanager.readonly
gcloud auth application-default set-quota-project chen-web-500809
```

Use the OAuth client JSON you created in Google Cloud Console, not the default gcloud OAuth client.

AWS variables:

- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_SESSION_TOKEN` when you use temporary credentials

GitHub variables:

- `GITHUB_TOKEN` for higher rate limits or private repositories
- `GITHUB_REPOSITORY` to override the default `gidiz/chenLandingPage`

### Validation

Use these commands locally:

```bash
npm run mcp:smoke
npm run mcp:typecheck
```

Then start the MCP server in VS Code and confirm these read-only tools work:

1. `ga4_list_accounts`
2. `ga4_run_report`
3. `gtm_list_accounts`
4. `aws_list_s3_buckets`
5. `github_get_repository`

Detailed setup notes and provider-specific permissions are documented in `server/mcp/README.md`.
