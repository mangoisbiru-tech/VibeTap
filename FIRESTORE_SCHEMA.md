# VibeTap — Firestore Collections Reference

## `merchants/{uid}`

| Field | Type | Description |
|-------|------|-------------|
| `uid` | string | Firebase Auth UID (same as doc ID) |
| `name` | string | Business/merchant name |
| `email` | string | Auth email |
| `slug` | string | Unique URL slug, e.g. `ahmadnasi4f2a` |
| `paymentUrl` | string | TNG / GrabPay / DuitNow redirect URL |
| `tapCount` | number | Cumulative tap count |
| `dailyTaps` | map<string, number> | Tap count per day e.g. `{"2025-07-10": 12}` |
| `isActive` | boolean | Whether sticker redirects are active |
| `fixedAmount` | number \| null | Optional fixed RM amount |
| `createdAt` | Timestamp | Account creation time |
| `lastTappedAt` | Timestamp \| null | Most recent tap |

## `tapEvents/{eventId}`

| Field | Type | Description |
|-------|------|-------------|
| `merchantId` | string | Reference to merchant doc ID |
| `merchantSlug` | string | Slug at time of tap |
| `tappedAt` | Timestamp | When the tap occurred |
| `ipHash` | string | Base64-hashed IP for privacy |
| `sessionAmount` | number \| null | RM amount if EFTPOS session was active |

## `cashierSessions/{sessionId}`

| Field | Type | Description |
|-------|------|-------------|
| `merchantId` | string | Merchant doc ID |
| `amount` | number | RM amount (e.g. 12.50) |
| `amountCents` | number | Amount in cents (e.g. 1250) |
| `used` | boolean | Whether this session has been consumed |
| `expiresAt` | Timestamp | 5 minutes from creation |
| `createdAt` | Timestamp | Session start time |
| `createdBy` | string | UID of merchant who created it |
| `usedAt` | Timestamp \| null | When it was consumed (set by Admin SDK) |

## Indexes Required (Firebase Console)

For `cashierSessions` query (composite index):
- `merchantId` ASC
- `expiresAt` ASC
- `used` ASC

Create this index in Firebase Console > Firestore > Indexes > Composite.
Or the first redirect attempt will show an error with a direct link to create it.
