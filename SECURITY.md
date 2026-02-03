# Security Policy

## Supported Versions

Please use the latest version of the website code.

## CMS Security Layers

1.  **Visual Lock Screen**: The `/admin` route is protected by a client-side PIN (Default: `OmkarAdmin`) to prevent casual access.
2.  **Netlify Identity**: Actual write access to the repository via the CMS requires **OAuth Authentication**.
    *   **Configuration**: Ensure "Registration" is set to "Invite Only" in Netlify Site Settings.
3.  **Local Development Server**:
    *   The `cms-server.js` file handles local file operations (`npm start`).
    *   **Production Safety**: This script **does not run** on Netlify/GitHub Pages. It is treated as a static static file. Even if present in the repository, it effectively does nothing in production.

## Maintainer Access

As this project is maintained by a single developer, **Branch Protection** rules are optional but recommended for preventing accidental force pushes.
- **Critical**: Enable **2FA (Two-Factor Authentication)** on both GitHub and Netlify accounts.

## Reporting a Vulnerability

If you find a security issue, please open a GitHub Issue or contact the owner directly.
