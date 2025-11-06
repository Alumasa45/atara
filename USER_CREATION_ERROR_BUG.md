# Bug: User Created But Error Thrown - Root Cause Analysis

## 🔴 Problem Description

**Scenario**: When creating a user via `/auth/register`, the user is successfully saved to the database, BUT an error message is shown to the frontend (client receives error response).

**Expected Behavior**: User should be created AND response should be successful (200 OK).

**Actual Behavior**: User IS created (can verify in database), but client receives an error.

---

## 🔍 Root Cause Analysis

### The Issue: Order of Operations

```typescript
// In src/users/users.service.ts - create() method

const saved = await this.userRepository.save(user);
//                ↑ User is NOW in database ✅

// Then later...
await this.setCurrentRefreshToken(refreshToken, saved.user_id);
//     ↑ This might fail ❌
```

### The Problem Flow

```
1. User data received
2. Validation check (if user exists)
3. ✅ User SAVED to database
4. Profile creation (wrapped in try-catch) ✅
5. Email verification setup (wrapped in try-catch) ✅
6. ❌ setCurrentRefreshToken() - NOT WRAPPED IN TRY-CATCH
7. If step 6 fails → Error thrown
8. Promise rejects → Frontend gets error response
9. But user is already in DB! ✅
```

### Where It Could Fail

**Line 96 in `src/users/users.service.ts`:**

```typescript
await this.setCurrentRefreshToken(refreshToken, saved.user_id);
// ↑ This call is NOT wrapped in try-catch
// ↑ This could throw if:
//   - Database connection fails
//   - User update fails
//   - bcrypt hashing fails
//   - Any other database error
```

### The Code Problem

```typescript
// Current code (PROBLEMATIC):
async create(createUserDto: CreateUserDto) {
  return (async () => {
    // ... other code ...

    const saved = await this.userRepository.save(user);
    // ✅ User is now in database

    // Profile and email are wrapped in try-catch ✅
    try {
      await this.profilesService.createForUser(saved, 5);
    } catch (e) {
      // Silently handled
    }

    try {
      // Email verification...
    } catch (e) {
      console.warn('Failed to create/send verification email', e);
    }

    // ❌ BUT THIS IS NOT WRAPPED:
    await this.setCurrentRefreshToken(refreshToken, saved.user_id);
    // If this fails, entire promise rejects
    // Even though user already saved!

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: safe,
    };
  })();
}
```

---

## 🔧 Solution

Wrap the `setCurrentRefreshToken()` call in a try-catch block, just like profile creation and email verification.

### Fixed Code

```typescript
async create(createUserDto: CreateUserDto) {
  return (async () => {
    // ... existing validation and user creation code ...

    const saved = await this.userRepository.save(user);

    // Profile creation (wrapped)
    try {
      await this.profilesService.createForUser(saved, 5);
    } catch (e) {
      // don't fail registration on profile creation issues
    }

    // Email verification (wrapped)
    try {
      const token = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const v = this.verificationRepository.create({
        token,
        user: saved,
        expires_at: expires,
      });
      await this.verificationRepository.save(v);
      await this.mailService.sendVerificationEmail(saved.email, token);
    } catch (e) {
      console.warn('Failed to create/send verification email', e);
    }

    // Access/Refresh Token generation (NEW: wrapped)
    try {
      const accessToken = await this.generateAccessToken(saved);
      const refreshToken = crypto.randomBytes(64).toString('hex');
      await this.setCurrentRefreshToken(refreshToken, saved.user_id);

      const { password: _p, hashed_refresh_token: _h, ...safe } = saved as any;
      return {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: safe,
      };
    } catch (e) {
      // Even if token generation fails, user was successfully created
      console.warn('Failed to generate tokens for new user', e);

      // Return basic user info without tokens
      const { password: _p, hashed_refresh_token: _h, ...safe } = saved as any;
      return {
        user: safe,
        message: 'User created but token generation failed. Please login.',
      };
    }
  })();
}
```

### Why This Solution Works

1. ✅ User is definitely saved before token generation
2. ✅ If token generation fails, we still return success with user info
3. ✅ Frontend can either:
   - Get tokens and auto-login (success path)
   - Get user info only and redirect to login (degraded path)
4. ✅ No user will be lost due to token generation errors

---

## 📊 Comparison: Before vs After

| Scenario                                   | Before                            | After                              |
| ------------------------------------------ | --------------------------------- | ---------------------------------- |
| Token generation succeeds                  | ✅ User created + tokens returned | ✅ User created + tokens returned  |
| Token generation fails                     | ❌ 500 Error (but user IS in DB!) | ✅ User created + message to login |
| Database connection lost during token save | ❌ 500 Error (but user IS in DB!) | ✅ User created + message to login |

---

## 🧪 Testing the Fix

### Test Case 1: Normal Registration (Should Still Work)

```javascript
POST /auth/register
{
  email: "user@example.com",
  username: "testuser",
  password: "securePassword123"
}

Expected Response: 200 OK
{
  access_token: "eyJhbGc...",
  refresh_token: "abc123...",
  user: {
    user_id: 1,
    email: "user@example.com",
    username: "testuser",
    role: "client",
    status: "active"
  }
}
```

### Test Case 2: Token Generation Failure (New: Should Not Fail Registration)

```javascript
POST /auth/register
{
  email: "user2@example.com",
  username: "testuser2",
  password: "securePassword123"
}

(Even if token generation fails internally)

Expected Response: 200 OK
{
  user: {
    user_id: 2,
    email: "user2@example.com",
    username: "testuser2",
    role: "client",
    status: "active"
  },
  message: "User created but token generation failed. Please login."
}

Database Result: ✅ User IS created and findable
```

---

## 🔐 Security Note

This fix maintains security because:

1. User is still saved successfully
2. If they get degraded response, they can login normally with password
3. No sensitive data exposed
4. Failed token generation is logged for debugging

---

## 📝 Files to Modify

**File**: `src/users/users.service.ts`
**Method**: `create()`
**Lines**: ~90-110

---

## ✅ Implementation Steps

1. Read the `create()` method in `src/users/users.service.ts`
2. Locate the `setCurrentRefreshToken()` call (around line 96)
3. Wrap token generation block in try-catch
4. Return degraded response on failure
5. Test with registration
6. Verify user is created even if tokens fail

---

## 📅 Status

**Identified**: November 5, 2025
**Severity**: Medium (Users are created but with error - confusing UX)
**Priority**: High (Easy fix, improves user experience)
**Status**: Ready for implementation ⏳
