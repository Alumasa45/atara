# ⚡ IMMEDIATE ACTION REQUIRED

## Do These 3 Things NOW (5 minutes):

### 1️⃣ Update Backend on Render (2 min)

**Go to**: https://dashboard.render.com → Select `atara-dajy` backend

**Environment Tab** → Add/Update:

```
CORS_ORIGIN=https://atara-1.onrender.com,http://localhost:5173
APP_BASE_URL=https://atara-1.onrender.com
```

**Save Changes** ✅

---

### 2️⃣ Update Google OAuth Settings (2 min)

**Go to**: https://console.cloud.google.com/apis/credentials

**Click your OAuth Client ID** → Add:

**Authorized JavaScript origins**:

```
https://atara-1.onrender.com
```

**Click SAVE** ✅

---

### 3️⃣ Update Frontend on Render (1 min)

**Go to**: https://dashboard.render.com → Select `atara-1` frontend

**Environment Tab** → Add:

```
VITE_GOOGLE_CLIENT_ID=567628815213-0vjg04n40juo7a8vmn5cbdg56nj3v9dq.apps.googleusercontent.com
```

**Save & Redeploy** ✅

---

## ✅ That's It!

Wait 2-3 minutes for redeployment, then visit:

👉 **https://atara-1.onrender.com**

Your system will be fully operational! 🚀

---

## 🧪 Quick Test:

1. Visit https://atara-1.onrender.com
2. Try logging in (regular or Google)
3. Check admin features if you're admin
4. Create a test booking

---

**Everything else is already configured!** ✨
