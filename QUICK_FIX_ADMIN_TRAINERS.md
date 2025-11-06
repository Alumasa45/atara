# Quick Fix - Admin Trainers Not Fetching

## Problem

Trainers page not loading data - stats cards and list empty

## Root Cause

Frontend calling **wrong endpoints**

### Issue 1: Fetch Endpoint

- ❌ Wrong: `/trainers`
- ✅ Fixed: `/admin/trainers`

### Issue 2: Create Endpoint

- ❌ Wrong: `/trainers/create`
- ✅ Fixed: `/trainers`

---

## Changes Made

**File**: `frontend/src/pages/AdminTrainersPage.tsx`

```typescript
// Line 55 - BEFORE:
const trainersData = await getJson('/trainers');

// Line 55 - AFTER:
const trainersData = await getJson('/admin/trainers');

// Line 69 - BEFORE:
const response = await fetch('http://localhost:3000/trainers/create', {

// Line 69 - AFTER:
const response = await fetch('http://localhost:3000/trainers', {
```

---

## Result

✅ Trainers now load correctly  
✅ Stats cards show trainer counts  
✅ Trainer list displays data  
✅ Create trainer works

---

**Status**: ✅ FIXED  
**Date**: November 5, 2025
