# Share the Shell Coffee QC Prototype with ngrok

Use this when you want to send the dashboard, survey, and cup QR demo to someone through a temporary public HTTPS link.

## 1. Start the local app

Open PowerShell in this folder:

```powershell
cd "C:\Users\User\Credit Card Simulation\shell-coffee-qc-geotagging"
npm.cmd run dev -- --port 5174
```

Keep this terminal open.

Local links:

```text
Dashboard: http://127.0.0.1:5174
Survey:    http://127.0.0.1:5174/?view=survey
Cup QR:    http://127.0.0.1:5174/?view=qr
```

## 2. Install ngrok

Install the ngrok agent for Windows from:

```text
https://ngrok.com/download/windows/
```

If `ngrok version` opens nothing or fails, install the real ngrok agent rather than relying on the WindowsApps placeholder.

## 3. Connect ngrok to your account

Log into the ngrok dashboard and copy your personal authtoken.

In a new PowerShell terminal, run:

```powershell
ngrok config add-authtoken YOUR_NGROK_AUTHTOKEN
```

Do not paste the token into chat. Run it locally in your terminal.

## 4. Start the public tunnel

In that same second terminal, run:

```powershell
ngrok http 5174
```

ngrok will show a forwarding URL similar to:

```text
https://abc123.ngrok-free.app
```

## 5. Send these links

Replace `https://abc123.ngrok-free.app` with your actual ngrok URL:

```text
Dashboard:
https://abc123.ngrok-free.app

Survey:
https://abc123.ngrok-free.app/?view=survey

Cup QR demo:
https://abc123.ngrok-free.app/?view=qr
```

## Notes

- The link works only while both terminals are running: the Vite app and the ngrok tunnel.
- ngrok gives an HTTPS URL, which is useful because browser geolocation works best from secure HTTPS contexts.
- On a free ngrok account, the URL may change each time you restart the tunnel.
- For a stable long-term link, deploy the `dist/` folder to Netlify, Vercel, or GitHub Pages instead of using a temporary tunnel.
