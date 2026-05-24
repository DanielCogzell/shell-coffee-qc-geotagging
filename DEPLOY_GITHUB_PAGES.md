# Deploy to GitHub Pages

GitHub Pages is a good free option if the repository is public. According to GitHub's docs, Pages is available for public repositories on GitHub Free; private-repo Pages requires a paid plan such as GitHub Pro or Team.

This project is already configured with a GitHub Actions workflow:

```text
.github/workflows/deploy-pages.yml
```

## Publish Steps

1. Create a new public repository on GitHub.

   Suggested name:

   ```text
   shell-coffee-qc-geotagging
   ```

2. Open PowerShell in this project folder:

   ```powershell
   cd "C:\Users\User\Credit Card Simulation\shell-coffee-qc-geotagging"
   ```

3. Initialize git and push the project:

   ```powershell
   git init
   git branch -M main
   git add .
   git commit -m "Deploy Shell coffee QC prototype"
   git remote add origin https://github.com/YOUR-USERNAME/shell-coffee-qc-geotagging.git
   git push -u origin main
   ```

4. On GitHub, open the repository.

5. Go to:

   ```text
   Settings > Pages
   ```

6. Under `Build and deployment`, set `Source` to:

   ```text
   GitHub Actions
   ```

   If the Pages screen only shows `Add domain`, that can still be normal after an Actions-based deployment. The important place to check is the repository `Actions` tab. The workflow uses `actions/configure-pages`, `actions/upload-pages-artifact`, and `actions/deploy-pages` to publish the site.

7. Go to the `Actions` tab and wait for `Deploy to GitHub Pages` to complete.

8. Your site will be available at a URL like:

   ```text
   https://YOUR-USERNAME.github.io/shell-coffee-qc-geotagging/
   ```

## Share Links

Replace the sample base URL with your actual GitHub Pages URL:

```text
Dashboard:
https://YOUR-USERNAME.github.io/shell-coffee-qc-geotagging/

Survey:
https://YOUR-USERNAME.github.io/shell-coffee-qc-geotagging/?view=survey

Cup QR demo:
https://YOUR-USERNAME.github.io/shell-coffee-qc-geotagging/?view=qr
```

## Notes

- This prototype stores submitted survey responses in local browser state only. Each viewer has their own temporary session data.
- GitHub Pages gives you a stable public URL, but it is static hosting. It does not provide a database.
- Browser geolocation works on HTTPS, so GitHub Pages is a better testing target than plain local network HTTP.
- If you do not want the repository to be public, use Netlify or Vercel with a private Git provider connection, or use ngrok for a temporary link.
