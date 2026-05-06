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
NUXT_PUBLIC_GA_MEASUREMENT_ID=G-P46K3PK4KD
NUXT_PUBLIC_GTM_CONTAINER_ID=GTM-WXGV32T9
NUXT_PUBLIC_GTM_AUTH=UvX2WLFuE3k0QgzT03_Zww
NUXT_PUBLIC_GTM_PREVIEW=env-21
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

- `dev`: `test.drchenpardo.co.il`
- `prod`: `drchenpardo.co.il`

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

- `dev`: `https://test.drchenpardo.co.il`
- `prod`: `https://drchenpardo.co.il`

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
