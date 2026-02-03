# Security Policy

## Supported Versions

Please use the latest version of the website code.

## CMS Security

- **Authentication**: Access to the CMS (`/admin`) is restricted to **Invite Only** members via Netlify Identity.
- **Backend**: We use Git Gateway to securely interact with the GitHub API.
- **Local Development**: The `cms-server.js` script is intended for **LOCAL DEVELOPMENT ONLY**. Do not deploy this script to a public server as it allows unauthenticated file system access.

## Reporting a Vulnerability

If you find a security issue, please open a GitHub Issue or contact the owner directly.
