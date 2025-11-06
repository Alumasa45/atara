# Atara Frontend (scaffold)

This is a minimal React + Vite + TypeScript scaffold for the Atara frontend.
It uses the color palette you provided and example components that mirror backend entities (users, trainers, sessions, bookings, schedules, profiles).

Where to put images

- Place images in `public/images/` and reference them as `/images/your-image.jpg` inside the app.

Install & run (PowerShell)

```powershell
cd frontend
npm install
npm run dev
```

Notes & next steps

- The scaffold includes example components: `TrainerCard`, `SessionCard`, and `BookingForm`.
- Update `src/api.ts` and components to call your backend endpoints (e.g., `/api/trainers`, `/api/sessions`, `/api/bookings`).
- The primary UI color is `#DDB892` (your selected palette color). Modify `src/styles.css` to tweak spacing/typography.
- I can wire API calls and add forms that POST to the backend next. Do you want that now?
