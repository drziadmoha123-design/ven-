# VEN+ / VENPLUS

# MASTER SYSTEM SPECIFICATION

# FINAL IMPLEMENTATION CONTRACT

# PRODUCTION-GRADE COMMERCE + LOYALTY + REFERRAL + OPERATIONS PLATFORM

======================================================================
DOCUMENT STATUS
===============

THIS DOCUMENT IS THE AUTHORITATIVE MASTER CONTRACT.

It supersedes:

* previous prompts
* previous generated code
* previous schema assumptions
* previous UI assumptions
* previous implementation shortcuts
* previous agent assumptions
* prototype behavior
* visual mockups
* inferred business rules

When an implementation conflicts with this specification:

THIS SPECIFICATION WINS.

The system is NOT:

* a prototype
* a visual mockup
* a CRUD demo
* a fake transactional application
* a frontend-only simulation
* a simplified educational implementation

It is a real transactional commerce and operational platform.

The implementation must prioritize:

CORRECTNESS

>

SECURITY

>

DATA INTEGRITY

>

BUSINESS RULE INTEGRITY

>

AUDITABILITY

>

MAINTAINABILITY

>

TESTABILITY

>

RELIABILITY

>

PERFORMANCE

>

UX

>

VISUAL POLISH

Never reverse this priority.

======================================================================
0. MISSION
==========

Build VEN+ as a production-grade platform containing:

CUSTOMER STOREFRONT
CUSTOMER AUTHENTICATION
CUSTOMER ACCOUNTS
GOOGLE OAUTH
PRODUCT CATALOG
CATEGORIES
PRODUCT VARIANTS
MEDIA MANAGEMENT
PERSISTENT CART
CHECKOUT
CASH-ON-DELIVERY ORDERS
POINTS PRODUCT REDEMPTION
FREE SHIPPING REDEMPTION
LOYALTY / POINTS LEDGER
REFERRAL SYSTEM
ORDER CONFIRMATION
MANUAL PHONE CONFIRMATION
MANUAL WHATSAPP CONFIRMATION
ORDER AMENDMENTS
FULFILLMENT
DELIVERY PROCESSING
INVENTORY
RETURN VERIFICATION
ORDER EXCEL EXPORT
ORDER EXCEL IMPORT
DELIVERY EXCEL IMPORT
ADMIN DASHBOARD
REPORTING
NOTIFICATIONS
AUDIT
SETTINGS
EMAIL VERIFICATION
PASSWORD RESET
SECURITY
OBSERVABILITY
CRON
TESTING
DEPLOYMENT
BACKUP / RECOVERY DOCUMENTATION

Optimize for:

CORRECTNESS

>

SECURITY

>

DATA INTEGRITY

>

BUSINESS RULE INTEGRITY

>

AUDITABILITY

>

MAINTAINABILITY

>

TESTABILITY

>

RELIABILITY

>

PERFORMANCE

>

UX

>

VISUAL POLISH

======================================================================

1. NON-NEGOTIABLE SOURCE OF TRUTH
   ======================================================================

PostgreSQL is the authoritative persistent source of truth.

Never treat any of the following as authoritative:

* React state
* Zustand
* localStorage
* sessionStorage
* URL parameters
* browser memory
* client totals
* client prices
* client stock
* client points balance
* client role
* client permissions
* Excel
* WhatsApp messages
* UI state
* cached frontend responses

Excel is an import/export transport mechanism.

WhatsApp is a communication / manual confirmation mechanism.

The Admin Dashboard is an operational control interface.

Critical business logic MUST execute server-side.

======================================================================
2. TECHNOLOGY BASELINE
======================

Use a mutually compatible production stack.

Framework:

* Next.js 15+
* App Router
* React
* TypeScript
* strict: true

UI:

* Tailwind CSS
* shadcn/ui
* Lucide icons
* limited justified animation

State:

* Zustand ONLY for client-side convenience/state mirroring
* never as business authority

Backend:

* Next.js Server Actions
* Route Handlers
* dedicated Service Layer

Database:

* PostgreSQL

ORM:

* Prisma ORM

Validation:

* Zod

Authentication:

* Auth.js / NextAuth-compatible architecture

Authentication providers:

* Credentials
* Google OAuth 2.0

Password hashing:

* Argon2id preferred

Excel:

* ExcelJS or equivalent safe XLSX library

Testing:

* Vitest
* Playwright

Deployment:

* Vercel-compatible
* Docker-compatible
* Node.js-compatible

Exact dependency versions must be verified during Phase 00.

Do not blindly upgrade packages.

Do not install unnecessary packages.

IMPORTANT:

If the repository being audited currently uses another compatible architecture
or technology baseline, the agent MUST NOT silently rewrite it.

Phase 00 must determine:

* current stack
* target stack
* migration need
* migration cost
* compatibility risks
* data preservation risks

Any migration must be explicit, traceable, reversible where possible,
and approved by the phase gate.

======================================================================
3. ARCHITECTURAL PIPELINE
=========================

CLIENT
↓
Next.js App Router
↓
Server Component / Client Component
↓
Server Action / Route Handler
↓
Authentication
↓
Authorization
↓
Zod Validation
↓
Domain Command
↓
Service Layer
↓
Business Rules / Invariants
↓
Transaction
↓
Prisma
↓
PostgreSQL

Business logic MUST NOT be duplicated between:

* React components
* hooks
* Zustand
* Server Actions
* Route Handlers
* Excel processors
* cron jobs
* UI helpers
* background workers

Critical rules have exactly one authoritative domain implementation.

======================================================================
4. DOMAIN SERVICES
==================

Create centralized services as required:

AuthService
UserService
OAuthService
ReferralService
CategoryService
ProductService
VariantService
ProductImageService
CartService
CheckoutService
OrderService
OrderAmendmentService
OrderConfirmationService
InventoryService
ReturnService
PointsService
DeliveryService
ExcelImportService
ExcelExportService
NotificationService
ShippingService
SettingsService
ReportService
AuditService
EmailService

Service boundaries may be refined during Phase 00.

Business rules may not be duplicated.

The existence of a service does not justify unnecessary abstraction.

Use the smallest architecture that preserves:

* correctness
* testability
* transaction integrity
* domain isolation
* maintainability

======================================================================
5. BRAND IDENTITY
=================

Brand:
Ven+

VEN:
#09090B
#000000

PLUS:
#FF6B00
#F97316

Primary:
#FF6B00

Hover:
#FF8C00

Deep Carbon:
#18181B

Background:
#FFFFFF

Soft Background:
#FAFAFA

Border:
#E4E4E7

Primary Text:
#18181B

Secondary Text:
#71717A

Muted:
#A1A1AA

Success:
#16A34A

Warning:
#F59E0B

Error:
#DC2626

Info:
#2563EB

Orange is an ACTION COLOR.

Use orange mainly for:

* CTA
* active navigation
* active selection
* focus
* important action
* points/rewards

Do not make the entire application orange.

Visual identity:

* premium
* minimal
* modern
* white
* operational
* commerce-oriented
* high information density
* clean

Avoid:

* excessive gradients
* excessive shadows
* unnecessary glassmorphism
* decorative noise
* pointless animation
* fake dashboard widgets

======================================================================
6. TYPOGRAPHY
=============

Arabic:

* Cairo preferred
* Readex Pro acceptable

English:

* modern readable sans-serif

Typography must be consistent across:

* storefront
* checkout
* account
* admin
* tables
* dialogs
* forms

======================================================================
7. INTERNATIONALIZATION
=======================

Locales:

AR
EN

Arabic:
RTL

English:
LTR

Preferred routing:

/ar/...
/en/...

Language switcher:

* visible in header
* preserves session
* preserves cart
* preserves business context where technically possible

Localized fields must use strict structure:

{
ar: string,
en: string
}

Required localized entities:

* Product title
* Product description
* Category name

No arbitrary localization JSON.

Fallback:

requested locale
→ English
→ available value

All layouts must correctly support RTL/LTR.

======================================================================
8. AUTHENTICATION MODEL — FINAL
===============================

There is ONE unified login interface.

No:

* Admin login page
* Customer login page
* Role selector
* public Admin registration

Credentials login:

Email
Password

[ Login ]

Create Account
Forgot Password?

Google:

[ Continue with Google ]

The server determines identity and role.

======================================================================
9. ADMIN IDENTITY — FINAL RESOLUTION
====================================

The Admin MUST exist as a real User row in PostgreSQL.

Role:

ADMIN

The Admin is NOT an ephemeral environment-only identity.

Environment variables are used for bootstrap/configuration:

ADMIN_EMAIL
ADMIN_PASSWORD_HASH

Bootstrap behavior:

1. normalize ADMIN_EMAIL
2. find or create corresponding User
3. ensure role = ADMIN
4. ensure secure password hash exists
5. never expose Admin credentials to client
6. never accept role from browser
7. never overwrite the Admin password on every request
8. use a controlled bootstrap/sync operation

Auth.js authenticates against the actual database User record.

The environment configuration is a bootstrap authority,
not a substitute for the User table.

Do NOT create:

* env-only Admin sessions
* fake Admin objects
* client-side Admin flags
* browser-controlled Admin privilege

======================================================================
10. CUSTOMER AUTHENTICATION
===========================

Public registration always creates:

role = CUSTOMER

Client cannot submit:

* role
* isAdmin
* permissions
* admin
* privilege
* pointsBalance

Email:

* normalized
* case-insensitive unique

Phone:

* normalized
* validated

Password:

* securely hashed
* Argon2id preferred
* never logged
* never returned
* never stored plaintext

Authentication failure:

"Invalid email or password."

Never reveal whether the account exists.

======================================================================
11. GOOGLE OAUTH — FINAL
========================

Google OAuth 2.0 is a supported authentication provider.

Google Sign-In is an authentication mechanism,
not a role system.

Authentication architecture:

Credentials
+
Google OAuth

Both MUST resolve to the same internal User identity model
and the same session / authorization architecture.

Required environment variables:

GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_CALLBACK_URL

Secrets:

* server-side only
* never hard-coded
* never exposed to client
* never logged

Conceptual OAuth entity:

OAuthAccount

Fields:

id
userId
provider
providerAccountId
createdAt
updatedAt

Constraint:

UNIQUE(provider, providerAccountId)

Google OAuth flow:

User
→ Google authorization
→ callback
→ validate provider response
→ resolve internal identity
→ create or link internal User
→ establish application session

Google authentication MUST NOT determine:

* role
* permissions
* points
* referral ownership
* admin privilege
* account status

Role is ALWAYS taken from the internal User record.

======================================================================
12. GOOGLE ACCOUNT CREATION — FINAL
===================================

When a valid Google identity authenticates for the first time:

1. validate the provider response
2. validate provider identity
3. require a trusted / verified Google email according to policy
4. create internal User if no valid account exists
5. default new identity to CUSTOMER
6. generate exactly one immutable Referral Code
7. create OAuthAccount
8. establish normal application session
9. apply normal customer onboarding rules

Google login MUST NOT create an Admin.

Google login MUST NOT elevate a Customer to Admin.

======================================================================
13. GOOGLE ACCOUNT LINKING — FINAL
==================================

Do NOT blindly merge accounts because email strings match.

Automatic linking is allowed ONLY when:

* provider email is verified/trusted
* existing account-linking policy explicitly permits it
* the operation is safe
* the operation is auditable

Otherwise require:

authenticated explicit account-linking flow

Rules:

* a provider identity can belong to only one internal User
* duplicate provider identities are rejected
* linking cannot transfer Admin privileges
* linking cannot transfer points
* linking cannot transfer referral ownership
* linking cannot silently merge two customer records

Any failed linking operation must not leave partial identity records.

======================================================================
14. GOOGLE OAUTH SECURITY
=========================

Protect against:

* CSRF
* OAuth state attacks
* callback manipulation
* provider identity confusion
* account takeover
* unsafe account linking
* replay
* session fixation

Callback URLs must be environment-specific.

Do not trust browser role information.

Do not store Google access/refresh tokens unless actually required.

If tokens are stored:

* encrypt at rest
* never expose to client
* never log
* apply retention/rotation policy

Required tests:

* first Google login
* returning Google login
* invalid OAuth callback
* duplicate provider identity
* explicit account linking
* unauthorized account linking
* unverified provider email policy
* Google customer cannot become Admin
* Admin authorization policy
* session creation
* provider failure
* replay protection

======================================================================
15. EMAIL VERIFICATION — FINAL
==============================

Email verification is REQUIRED for full account activation.

Policy:

* Registration creates customer.
* Customer may log in before verification.
* Unverified customers enter restricted account state.
* Unverified customers may browse and manage basic account context.
* Unverified customers CANNOT create orders.
* Unverified customers CANNOT redeem points.
* Unverified customers CANNOT claim referral rewards directly.
* Admin account is exempt.

Flow:

registration
→ create customer
→ generate random token
→ hash token
→ send email
→ verify
→ mark emailVerifiedAt
→ enable commerce actions

Verification token:

* cryptographically secure
* hashed before storage
* single-use
* expires after 15 minutes
* replay protected
* never logged raw

Resend verification:

* rate limited

======================================================================
16. PASSWORD RESET — FINAL
==========================

Reset token:

* cryptographically secure
* hashed before storage
* single-use
* expires after 15 minutes
* replay protected
* never logged

Reset request uses generic response.

Never disclose whether account exists.

Rate limit reset operations.

======================================================================
17. SESSION POLICY
==================

Use secure HttpOnly cookies.

Production:

* Secure
* HttpOnly
* SameSite appropriate to architecture

Default maximum age:

Customer:
30 days

Admin:
12 hours

Session activity may be refreshed safely.

Never place authoritative role information in localStorage.

Critical Admin operations may require reauthentication in future.

======================================================================
18. REFERRAL SYSTEM — FINAL
===========================

Every user receives exactly one immutable Referral Code.

Referral Code:

* server generated
* unique
* stable
* not editable
* collision resistant
* does not expose User ID

Registration field:

Referral Code (Optional)

Referral attribution occurs ONLY during registration.

If customer registers without code:

THE CUSTOMER CAN NEVER ADD A REFERRAL LATER.

If customer registers with valid code:

relationship becomes immutable.

Self-referral:

REJECT.

A customer may invite any person they legitimately choose.

======================================================================
19. REFERRAL LINK
=================

Optional referral URL:

/register?ref=VEN-XXXXXX

URL parameter is not authoritative.

Server validates code.

Visiting URL does NOT create attribution.

Only successful registration creates Referral relation.

======================================================================
20. REFERRAL DATA MODEL
=======================

Referral:

id
referrerId
refereeId
createdAt
qualifiedAt nullable
rewardTransactionId nullable

Constraints:

* refereeId unique
* one referee → one referrer
* relationship immutable

======================================================================
21. REFERRAL REWARD — FINAL
===========================

Reward:

50 Points

Receiver:

REFERRER

Trigger:

REFEREE'S FIRST DELIVERED ORDER

Exactly once.

Never award at:

* registration
* account creation
* cart
* checkout
* confirmation
* processing
* shipped

======================================================================
22. REFERRAL CORRECTION RULE — FINAL
====================================

If referee's first qualifying order changes:

DELIVERED
→
CUSTOMER_REFUSED

and 50-point referral reward already exists:

create:

REFERRAL_REWARD
→
POINTS_REVERSAL

Do NOT delete historical transactions.

Record:

* original reward
* reversal
* correction reason
* actor
* timestamp
* related order

If later:

CUSTOMER_REFUSED
→
DELIVERED

and reward is currently inactive:

re-award exactly 50 points through a new ledger transaction.

Never allow more than one active referral reward for the same referee's first qualifying delivered order.

======================================================================
23. PRODUCT ARCHITECTURE
========================

Product has NO authoritative stock.

Stock exists only on ProductVariant.

Every active Product MUST have at least one active ProductVariant.

Product:

id
title
description
categoryId
basePrice
specifications
pointsEnabled
defaultPointsPrice
defaultDeliveryPointsReward
isActive
createdAt
updatedAt

======================================================================
24. VARIANT ARCHITECTURE
========================

ProductVariant:

id
productId
sku
price nullable
pointsPrice nullable
deliveryPointsReward nullable
stock
attributes
isActive
createdAt
updatedAt

Variant pricing:

variant price overrides product base price.

Variant points price:

variant points price overrides product default points price.

Variant delivery reward:

variant reward overrides product default delivery reward.

Stock:

integer >= 0

SKU:

unique when present

Attributes:

strictly validated JSON.

Duplicate variant combinations are forbidden.

======================================================================
25. DELIVERY POINTS REWARD — FINAL
==================================

Delivery reward configured per Product:

defaultDeliveryPointsReward

Variant override:

deliveryPointsReward

Reward:

PER DELIVERED UNIT

Example:

Product reward = 10 points
Delivered quantity = 3

Reward = 30 points

OrderItem MUST snapshot:

pointsRewardSnapshot

Total reward:

SUM(
pointsRewardSnapshot
×
deliveredQuantity
)

across eligible items.

======================================================================
26. POINTS-REDEMPTION DELIVERY REWARD — FINAL
=============================================

Setting:

AWARD_DELIVERY_POINTS_ON_POINTS_REDEMPTION

Type:

boolean

Default:

FALSE

If FALSE:

points-purchased product lines earn 0 delivery points.

If TRUE:

points-purchased product lines use their configured delivery reward.

Cash-purchased lines always use configured reward.

No percentage-of-price formula exists.

No dynamic reward formula exists.

======================================================================
27. POINTS ARE NOT MONEY
========================

Points:

* are not EGP
* cannot convert to EGP
* cannot be withdrawn
* cannot become cash
* cannot act as generic cash discount
* cannot partially reduce EGP subtotal

Points can ONLY be used for:

1. Full Product Redemption
2. Full Free Shipping Redemption

======================================================================
28. PRODUCT POINTS REDEMPTION — FINAL
=====================================

Product redemption is ALL-OR-NOTHING.

Example:

Cash:
1500 EGP

Points:
500 Points

Options:

CASH PURCHASE
→ 1500 EGP

POINTS PURCHASE
→ 500 Points

Forbidden:

250 Points + 750 EGP

100 Points + 1200 EGP

Partial product redemption is prohibited.

======================================================================
29. MIXED CART — FINAL
======================

A cart MAY contain:

* cash-purchased lines
* points-purchased lines

within the same order.

Each OrderItem:

purchaseMode:
CASH
or
POINTS

Points line:

* full points price
* zero cash product price

Cash line:

* normal cash price

Shipping is separately settled.

======================================================================
30. ORDER FUNDING — FINAL
=========================

Funding modes:

CASH_ONLY
POINTS_ONLY
MIXED

These are NOT payment gateway methods.

Examples:

Cash products + normal shipping:
CASH_ONLY

Points product + normal COD shipping:
MIXED

Cash product + free shipping:
MIXED

Points product + free shipping:
POINTS_ONLY

Mixed product cart:
MIXED

IMPORTANT:

MIXED IS VALID AT ORDER-LEVEL FUNDING COMPOSITION.

Do NOT remove MIXED from the domain model.

Do NOT confuse MIXED funding composition with a mixed payment gateway.

======================================================================
31. PAYMENT METHOD — FINAL
==========================

Current production payment method:

CASH_ON_DELIVERY

Meaning:

customer pays cash to courier at delivery.

No current:

* credit card
* debit card
* bank transfer
* wallet
* installment provider
* online payment gateway

Do NOT implement them.

Future support must use:

PaymentProvider abstraction

======================================================================
32. PAYMENT DATA MODEL
======================

Order:

paymentMethod = CASH_ON_DELIVERY

Optional Payment entity may exist for future architecture.

Do NOT create fake electronic settlement records.

Phase 1 cash collection semantics:

DELIVERED
→ COD expected/fulfilled

CUSTOMER_REFUSED
→ COD not collected

======================================================================
33. SHIPPING
============

One global shipping price.

Setting:

GLOBAL_SHIPPING_PRICE

Default:

70 EGP

All governorates use same shipping price in Phase 1.

No governorate-specific shipping.

======================================================================
34. FREE SHIPPING
=================

Setting:

FREE_SHIPPING_POINTS_THRESHOLD

Default:

200 Points

If customer has >= threshold:

customer may redeem full free shipping.

Shipping:

0 EGP

Otherwise:

full shipping amount

No partial shipping discount.

======================================================================
35. SHIPPING SNAPSHOT
=====================

At order creation:

shippingAmountSnapshot

must be stored.

If:

70 → 80

Existing order remains:

70

New order:

80

Historical values are immutable.

======================================================================
36. DELIVERY ESTIMATE
=====================

Setting:

EXPECTED_DELIVERY_DURATION

Examples:

2–3 Days
3–5 Days
5–7 Days

Current global value shown on:

* homepage
* product detail
* checkout
* delivery information

At order creation:

estimatedDeliveryTimeSnapshot

is stored.

======================================================================
37. CHECKOUT CONTACT DATA
=========================

Required:

fullName
primaryPhone
secondaryPhone
whatsappNumber

Optional:

whatsappSameAsPrimary

If checked:

WhatsApp = primary phone

Server stores resolved value.

======================================================================
38. CHECKOUT ADDRESS
====================

Required:

governorate
cityOrCenter
area
street
buildingNumber
floor
apartmentNumber
landmark
addressNotes

Do NOT use one free-text address as the only source.

======================================================================
39. CHECKOUT SERVER FLOW — FINAL
================================

1. Authenticate
2. Verify email
3. Verify cart ownership
4. Load cart
5. Load products
6. Load variants
7. Validate active state
8. Validate quantities
9. Retrieve authoritative cash prices
10. Retrieve authoritative points prices
11. Resolve purchase modes
12. Calculate cash subtotal
13. Calculate points subtotal
14. Load shipping settings
15. Evaluate free shipping
16. Validate points balance
17. Validate stock
18. Snapshot customer/contact/address
19. Snapshot commercial values
20. Snapshot shipping
21. Snapshot delivery estimate
22. Generate/validate idempotency identity
23. Deduct stock atomically
24. Deduct points atomically
25. Create Order
26. Create OrderItems
27. Create PointsTransaction records
28. Create InventoryTransaction records
29. Create audit event where required
30. Persist idempotency result
31. Commit

Any failure:

ROLLBACK ALL MUTATIONS.

No partial checkout is allowed.

======================================================================
40. CHECKOUT IDEMPOTENCY — FINAL
================================

Every checkout request requires an idempotency key.

Canonical key:

userId
+
operation
+
clientIdempotencyKey

Store:

key
userId
operation
requestFingerprint
resultOrderId
createdAt
expiresAt

Retention:

7 days

Same key + same fingerprint:

return original result.

Same key + different fingerprint:

IDEMPOTENCY_CONFLICT

Concurrent same-key requests:

must not create duplicate business effects.

Use:

* unique database constraint
* transaction
* appropriate locking/isolation
* deterministic result persistence

A naïve check-then-create implementation is insufficient.

======================================================================
41. ORDER MODEL
===============

Order:

id
publicOrderNumber
userId
status

customerNameSnapshot
phone1Snapshot
phone2Snapshot
whatsappSnapshot

governorateSnapshot
citySnapshot
areaSnapshot
streetSnapshot
buildingNumberSnapshot
floorSnapshot
apartmentNumberSnapshot
landmarkSnapshot
addressNotesSnapshot

cashSubtotal
pointsSubtotal
shippingAmount
totalCashDue

productPointsRedeemed
shippingPointsRedeemed
totalPointsRedeemed
freeShippingApplied

paymentMethod
fundingMode

estimatedDeliveryTimeSnapshot

confirmationStatus
confirmationMethod

createdAt
updatedAt

All snapshots are historical.

======================================================================
42. ORDER ITEM MODEL
====================

OrderItem:

id
orderId
productId
variantId

purchaseMode
quantity

productNameSnapshot
variantAttributesSnapshot
skuSnapshot

unitPriceSnapshot
pointsPriceSnapshot

pointsRewardSnapshot

cashLineTotal
pointsLineTotal

createdAt
updatedAt

Historical orders MUST NOT depend on mutable current catalog values.

======================================================================
43. PAYMENT / TOTAL SEMANTICS
=============================

cashSubtotal:
sum of CASH product lines

pointsSubtotal:
sum of POINTS product lines

shippingAmount:
cash shipping charged

totalCashDue:

cashSubtotal + shippingAmount

totalPointsRedeemed:

product points + shipping points

Example:

Cash product 1500
Shipping 70

cashSubtotal = 1500
pointsSubtotal = 0
shipping = 70
totalCashDue = 1570

Example:

Points product 500
Shipping 70

cashSubtotal = 0
pointsSubtotal = 500
shipping = 70
totalCashDue = 70
totalPointsRedeemed = 500

Example:

Points product 500
Free shipping 200

cashSubtotal = 0
shipping = 0
totalPointsRedeemed = 700

======================================================================
44. ORDER STATUS
================

PENDING_CONFIRMATION
CONFIRMED
PROCESSING
SHIPPED
DELIVERED
CUSTOMER_REFUSED
CANCELLED

Valid transitions:

PENDING_CONFIRMATION
→ CONFIRMED
→ CANCELLED

CONFIRMED
→ PROCESSING
→ CANCELLED

PROCESSING
→ SHIPPED
→ CANCELLED

SHIPPED
→ DELIVERED
→ CUSTOMER_REFUSED

Correction:

DELIVERED
↔ CUSTOMER_REFUSED

Corrections require:

* Admin authorization
* reason
* audit
* points effects
* inventory effects
* idempotency

======================================================================
45. ORDER CANCELLATION
======================

Cancellation before shipment:

* restore exact inventory
* refund product points
* refund shipping points
* create ledger entries
* update order
* audit
* protect against duplicate execution

Cancellation after shipment:

NOT permitted through normal cancellation flow.

Use return/refusal workflow.

======================================================================
46. CONFIRMATION — FINAL EDITABLE FIELDS
========================================

Normal Confirmation may edit ONLY:

fullName
primaryPhone
secondaryPhone
whatsappNumber
governorate
cityOrCenter
area
street
buildingNumber
floor
apartmentNumber
landmark
addressNotes

Every change creates:

OrderDataChange

Read-only:

* product selection
* product IDs
* variant IDs
* SKU
* unit price
* points price
* purchase mode
* order totals
* shipping amount
* points already reserved
* status

======================================================================
47. ORDER AMENDMENT FLOW — FINAL
================================

Customer requests:

* product change
* variant change
* quantity change
* item removal
* item addition

MUST enter Order Amendment Flow.

Steps:

1. verify order is amendable
2. authenticate Admin
3. capture requested change
4. calculate authoritative new state
5. determine stock delta
6. determine points delta
7. determine cash delta
8. reverse old pending effects where necessary
9. apply new effects transactionally
10. update order items/snapshots
11. create amendment audit
12. create OrderDataChange
13. create ledger entries
14. preserve complete history
15. calculate new authoritative totals

Amendment permitted ONLY before SHIPPED.

Statuses:

PENDING
APPROVED
APPLIED
REJECTED
FAILED

======================================================================
48. CONFIRMATION ATTEMPTS
=========================

Fields:

attemptNumber
method
employeeId
result
notes
createdAt

Methods:

PHONE
WHATSAPP

Results:

NO_ANSWER
CONFIRMED
CUSTOMER_REQUESTED_CHANGE
INVALID_NUMBER
CALL_BACK_REQUIRED
CUSTOMER_REFUSED
OTHER

======================================================================
49. THREE FAILED CALLS
======================

After 3 failed phone attempts:

DO NOT AUTO-CANCEL.

Order remains:

PENDING_CONFIRMATION

Display:

HIGH_ATTEMPT_COUNT

Mandatory.

======================================================================
50. WHATSAPP
============

Phase 1:

MANUAL ONLY

Admin can:

* copy number
* open WhatsApp
* prepare prefilled text
* record manual result

No automated WhatsApp API.

Architecture:

IWhatsAppConfirmationProvider

Current:

ManualWhatsAppConfirmationProvider

Future:

AutomatedWhatsAppConfirmationProvider

======================================================================
51. INVENTORY
=============

Authoritative source:

ProductVariant.stock

Checkout deduction must be atomic.

Concept:

UPDATE ProductVariant
SET stock = stock - quantity
WHERE id = variantId
AND stock >= quantity

If no rows affected:

INSUFFICIENT_STOCK

Rollback.

======================================================================
52. INVENTORY LEDGER
====================

InventoryTransaction:

id
variantId
orderId nullable
type
quantity
beforeStock
afterStock
reason
createdBy
idempotencyKey
createdAt

Types:

SALE_DEDUCTION
CANCELLATION_RESTORATION
RETURN_RESTORATION
ADMIN_ADJUSTMENT
AMENDMENT_ADJUSTMENT

Append-only.

======================================================================
53. CUSTOMER REFUSED INVENTORY
==============================

Customer refused does NOT restore inventory immediately.

Flow:

CUSTOMER_REFUSED
→ RETURN_IN_TRANSIT
→ WAREHOUSE_RECEIVED
→ WAREHOUSE_RETURN_VERIFIED
→ INVENTORY_RESTORED

Phase 1 authorization:

ADMIN ONLY

Verification requires:

* Admin authorization
* reason
* audit
* idempotency

======================================================================
54. RETURN VERIFICATION
=======================

Only ADMIN may mark:

WAREHOUSE_RETURN_VERIFIED

Actions:

* verify physical return
* restore exact quantity
* create InventoryTransaction
* prevent duplicate restoration
* audit

No automatic restoration before verification.

======================================================================
55. DELIVERY EXCEL
==================

Required:

Order ID
Delivery Status

Optional:

Delivery Date
Notes

Allowed:

DELIVERED
CUSTOMER_REFUSED

Each row must be:

* validated
* processed
* audited
* idempotent

======================================================================
56. DELIVERY PROCESSING
=======================

DELIVERED:

* validate state transition
* update order
* award eligible item delivery points
* evaluate referral reward
* audit
* idempotency

CUSTOMER_REFUSED:

* update order
* award zero delivery points
* do not issue referral reward
* create return workflow
* audit

No inventory restoration at refusal.

======================================================================
57. DELIVERY POINTS — COMPUTATION
=================================

For each eligible delivered OrderItem:

reward =
pointsRewardSnapshot
×
deliveredQuantity

Order reward:

SUM(all eligible line rewards)

Award exactly once.

For POINTS purchases:

if:

AWARD_DELIVERY_POINTS_ON_POINTS_REDEMPTION = FALSE

reward = 0

If TRUE:

normal configured reward applies.

======================================================================
58. DELIVERY CORRECTION
=======================

DELIVERED → CUSTOMER_REFUSED:

If delivery points were awarded:

create reversal ledger entry.

If referral reward was awarded:

create reversal entry.

Never delete history.

CUSTOMER_REFUSED → DELIVERED:

re-award eligible delivery points only if currently inactive.

Re-award referral reward only when qualification is valid again and previous reward is reversed.

All transitions must be idempotent.

======================================================================
59. POINTS LEDGER
=================

PointsTransaction:

id
userId
orderId nullable
amount
type
reason
createdBy
idempotencyKey
createdAt

Types:

ORDER_DELIVERED
POINTS_PRODUCT_REDEMPTION
POINTS_PRODUCT_REFUND
FREE_SHIPPING_REDEMPTION
FREE_SHIPPING_REFUND
POINTS_REVERSAL
REFERRAL_REWARD
ADMIN_ADJUSTMENT

Ledger is append-only.

======================================================================
60. POINTS BALANCE
==================

pointsBalance may be cached.

Ledger remains authoritative.

Invariant:

pointsBalance >= 0

Every balance change:

* atomic
* ledger-backed
* auditable where required

Never arbitrary-update pointsBalance.

======================================================================
61. ADMIN POINTS ADJUSTMENT
===========================

Admin inputs:

customer
amount
direction
reason

Required:

validation
authorization
transaction
ledger
audit

No direct arbitrary balance overwrite.

======================================================================
62. CUSTOMER POINTS HISTORY
===========================

Display:

+50 Referral Reward
-500 Product Redemption
+500 Product Refund
-200 Free Shipping Redemption
+200 Free Shipping Refund
+delivery reward
-Admin Adjustment or equivalent explicit presentation

Use explicit "Points".

Never display points with EGP symbol.

======================================================================
63. PRODUCT POINTS CATALOG
==========================

Only show products that are:

* active
* pointsEnabled
* active variant
* stock > 0
* valid points price

Filter:

* category
* points range
* availability
* variant availability

======================================================================
64. ADMIN PRODUCT MANAGEMENT
============================

Product table:

Product
Category
Cash Price
Points Availability
Points Price
Delivery Reward
Variant Count
Total Stock
Status
Actions

Actions:

View
Edit
Deactivate
Manage Images
Manage Variants

======================================================================
65. PRODUCT ADMIN FORM
======================

STEP 1:
Localized title

STEP 2:
Localized description

STEP 3:
Category

STEP 4:
Base cash price

STEP 5:
Specifications

STEP 6:
Images

STEP 7:
Points redemption

STEP 8:
Delivery reward

STEP 9:
Variants

STEP 10:
Preview

STEP 11:
Save

No raw JSON fields for normal Admin users.

======================================================================
66. VARIANT BUILDER
===================

Visual controls:

Color
Size
Custom Attributes

Variant row:

Color
Size
Price
Points Price
Delivery Reward
Stock
SKU
Status

Server validates serialized representation.

======================================================================
67. IMAGE MANAGEMENT
====================

Admin-only.

Support:

* upload
* preview
* multiple images
* primary image
* reorder
* replace
* delete
* alt text

Provider:

IImageStorageProvider

Validate:

* actual file content
* MIME/type
* extension
* size
* dimensions
* authorization
* storage key

======================================================================
68. IMAGE LIFECYCLE
===================

Replacement:

upload new
→ validate
→ persist new metadata
→ commit DB
→ delete old object

If DB fails:

cleanup new upload

If cleanup fails:

log orphan warning

Current valid image metadata must remain intact.

======================================================================
69. CATEGORY SYSTEM
===================

Category:

id
name
slug
parentId nullable
isActive
createdAt
updatedAt

Rules:

* unique slug
* inactive category cannot receive new products
* history preserved
* cycle prevention
* prefer deactivation

======================================================================
70. CUSTOMER NAVIGATION
=======================

SHOP:

All Products
Categories
New Arrivals
Offers

VEN+ REWARDS:

Points Products
My Points
Points History
Referrals

ACCOUNT:

My Orders
Profile
Addresses
Settings

======================================================================
71. CUSTOMER HOMEPAGE
=====================

Hero
Categories
Featured Products
New Arrivals
Rewards
Points Products
Delivery Estimate
Shipping Benefit
Current Promotions/Offers where a real promotion exists

Authenticated:

You have X Points

Never invent data.

======================================================================
72. SEARCH
==========

Support:

* localized title
* category
* SKU where appropriate
* relevant attributes where justified

Search:

* normalized
* length-limited
* server-side
* safely queried
* paginated

Search must never show inactive customer-ineligible entities.

======================================================================
73. CATALOG FILTERS
===================

Category
Price range
Points availability
Points range
Availability
Sorting

Sorting:

Newest
Price ascending
Price descending
Relevance where supported

No invented ranking logic.

======================================================================
74. CUSTOMER ORDER HISTORY
==========================

Display:

Order ID
Date
Status
Items
Cash Due
Points Redeemed
Shipping
Delivery Estimate Snapshot

Customer sees only owned orders.

======================================================================
75. CUSTOMER ORDER DETAIL
=========================

Show:

products
variants
quantities
historical prices
points
shipping
status timeline
delivery estimate
address snapshot where appropriate

Do not rebuild commercial values from current catalog data.

======================================================================
76. ADMIN DASHBOARD
===================

Dashboard
Orders
Confirmation
Customers
Products
Categories
Inventory
Points
Points Products
Referrals
Delivery
Reports
Notifications
Settings
Audit Logs

No unnecessary support portal.

======================================================================
77. ADMIN ORDERS
================

Filters:

* Order ID
* customer
* status
* confirmation
* date
* governorate

Actions:

* view
* confirmation
* authorized edit
* cancel if legal
* amend
* correction if authorized

Pagination mandatory.

======================================================================
78. ADMIN CUSTOMER PAGE
=======================

Show:

profile
contact
orders
points
points history
referral
account status

Never expose secrets.

======================================================================
79. ADMIN INVENTORY
===================

Show:

product
variant
SKU
stock
low stock
out of stock
last movement

Manual Adjustment requires:

quantity
direction
reason

Creates ledger + audit.

======================================================================
80. ADMIN POINTS
================

Show:

balance
earned
redeemed
refunded
recent ledger

Allow controlled Admin adjustment.

======================================================================
81. ADMIN REFERRAL
==================

Show:

referrer
referee
referral code
registration
qualifying order
reward state
reward amount
reward transaction
reversal transaction where applicable

======================================================================
82. ADMIN DELIVERY
==================

Show:

imports
processing state
delivered
refused
return verification
errors
history

Return verification:

ADMIN ONLY

======================================================================
83. ADMIN SETTINGS
==================

General
Shipping
Points
Referral
Inventory
Localization
System

Every setting:

* typed
* validated
* audited
* timestamped
* actor recorded

======================================================================
84. APP SETTINGS — FINAL
========================

GLOBAL_SHIPPING_PRICE
FREE_SHIPPING_POINTS_THRESHOLD
EXPECTED_DELIVERY_DURATION
AWARD_DELIVERY_POINTS_ON_POINTS_REDEMPTION
REFERRAL_REWARD_POINTS
LOW_STOCK_THRESHOLD

Defaults:

GLOBAL_SHIPPING_PRICE:
70 EGP

FREE_SHIPPING_POINTS_THRESHOLD:
200 Points

EXPECTED_DELIVERY_DURATION:
2–3 Days

AWARD_DELIVERY_POINTS_ON_POINTS_REDEMPTION:
FALSE

REFERRAL_REWARD_POINTS:
50

LOW_STOCK_THRESHOLD:
5 units

Historical transactions are never rewritten when settings change.

======================================================================
85. NOTIFICATION TYPES — FINAL
==============================

CUSTOMER:

ORDER_CREATED
ORDER_CONFIRMED
ORDER_PROCESSING
ORDER_SHIPPED
ORDER_DELIVERED
ORDER_CUSTOMER_REFUSED
ORDER_CANCELLED
POINTS_EARNED
POINTS_REDEEMED
POINTS_REFUNDED
REFERRAL_REWARD_EARNED
REFERRAL_REWARD_REVERSED

ADMIN:

ORDER_CONFIRMATION_REQUIRED
HIGH_CONFIRMATION_ATTEMPTS
LOW_STOCK
OUT_OF_STOCK
DELIVERY_IMPORT_COMPLETED
DELIVERY_IMPORT_FAILED
ORDER_IMPORT_COMPLETED
ORDER_IMPORT_FAILED
SECURITY_ALERT
DIGEST_FAILED
SYSTEM_WARNING

======================================================================
86. NOTIFICATION CREATION RULES
===============================

ORDER_CONFIRMATION_REQUIRED:

exactly once when order enters PENDING_CONFIRMATION.

HIGH_CONFIRMATION_ATTEMPTS:

created when attempt count reaches 3.

LOW_STOCK:

created when stock crosses:

> threshold
> →
> <= threshold

Do not repeatedly create while still below threshold.

OUT_OF_STOCK:

created when stock transitions to 0.

When stock returns above zero and later reaches zero:

new notification may be created.

ORDER_SHIPPED:
once per shipment transition.

ORDER_DELIVERED:
once per delivery transition.

ORDER_CUSTOMER_REFUSED:
once per refusal transition.

REFERRAL_REWARD_EARNED:
once per reward activation.

REFERRAL_REWARD_REVERSED:
once per reversal event.

All notification triggers must be idempotent.

======================================================================
87. NOTIFICATION STORAGE
========================

Notification:

id
userId nullable
type
title
body
severity
readAt
deduplicationKey
metadata
createdAt

Unique/deduplication semantics must prevent unintended duplicates.

======================================================================
88. FINANCIAL REPORTING — FINAL
===============================

Because payment is Cash on Delivery:

GROSS MERCHANDISE SALES:

sum of CASH SUBTOTAL for non-cancelled orders.

GROSS ORDER VALUE:

sum of TOTAL CASH DUE for non-cancelled orders.

DELIVERED REVENUE:

sum of TOTAL CASH DUE for DELIVERED orders.

REFUSED VALUE:

sum of TOTAL CASH DUE for CUSTOMER_REFUSED orders.

CANCELLED VALUE:

sum of TOTAL CASH DUE for CANCELLED orders.

OUTSTANDING COD:

sum of TOTAL CASH DUE for:

PENDING_CONFIRMATION
CONFIRMED
PROCESSING
SHIPPED

Points redemption is NOT EGP revenue.

Points have zero EGP monetary value in reporting.

Do not include cancelled orders in Gross Sales.

Do not classify Pending Confirmation as realized revenue.

======================================================================
89. REPORTING TIME SEMANTICS
============================

Reports must specify date basis.

Default:

order volume/bookings:
createdAt

delivered revenue:
delivery transition timestamp

cancelled:
cancellation timestamp where available

refused:
refusal transition timestamp where available

Never mix event timestamps silently.

======================================================================
90. ORDER VALUE VS CASH COLLECTION
==================================

An order can exist without cash being collected.

Order Value:

commercial obligation / booking

Collected / Realized Revenue:

Delivered COD orders

Do NOT call pending COD revenue collected revenue.

======================================================================
91. EXCEL EXPORT
================

Admin export supports:

date range
status
confirmation status
customer
governorate

Canonical key:

Order ID

Export contains:

* stable headers
* deterministic formats
* safe cell encoding
* no formula injection
* localized human-readable columns where useful
* canonical machine-readable fields where needed

======================================================================
92. ORDER EXCEL IMPORT
======================

Flow:

UPLOAD
↓
FILE VALIDATION
↓
SCHEMA VALIDATION
↓
ORDER ID MATCH
↓
ROW DEDUPLICATION
↓
COLUMN WHITELIST
↓
DIFF
↓
PREVIEW
↓
ADMIN APPROVAL
↓
TRANSACTIONAL APPLY
↓
AUDIT
↓
RESULT REPORT

======================================================================
93. EXCEL DUPLICATE KEY — FINAL
===============================

Exact file replay:

fileHash

Constraint:

same import type + same fileHash
→ duplicate import

Within one import:

(importId, orderId)
must be unique where applicable.

Normalized row fingerprint:

SHA-256(
importType
+
orderId
+
sorted normalized editable field/value pairs
)

Store fingerprint.

If identical business mutation is resubmitted:

NO-OP / ALREADY_PROCESSED

If same order receives legitimate different approved change:

new fingerprint
→ process

======================================================================
94. EXCEL EDITABLE FIELDS — FINAL
=================================

Allowed:

secondaryPhoneSnapshot
whatsappNumberSnapshot
governorateSnapshot
citySnapshot
areaSnapshot
streetSnapshot
buildingNumberSnapshot
floorSnapshot
apartmentNumberSnapshot
landmarkSnapshot
addressNotesSnapshot

NOT editable by ordinary Excel import:

product
variant
quantity
unit price
points price
shipping amount
total
points redeemed
order status
payment method
funding mode

Future approval of additional fields requires:

whitelist update
+
schema update
+
audit update
+
tests

======================================================================
95. EXCEL SECURITY
==================

Excel is untrusted input.

Validate:

* extension
* actual content
* file size
* workbook
* sheet structure
* required headers
* types
* Order IDs
* status values
* allowed columns

Protect against:

* formula injection
* malformed workbooks
* memory abuse
* mass assignment
* duplicate processing
* malicious payloads

Never execute formulas.

======================================================================
96. EXCEL PERFORMANCE
=====================

Do not make unsupported benchmark claims.

Use:

* streaming
* batching
* selected columns
* bounded memory
* efficient bulk operations
* progress tracking

Data integrity > throughput.

======================================================================
97. RBAC — FINAL
================

Current roles:

CUSTOMER
ADMIN

No public role selection.

All privileged operations use server-side authorization.

Future concepts may include:

products.read
products.write
inventory.adjust
orders.read
orders.edit
orders.correct
orders.import
delivery.import
delivery.return.verify
points.adjust
settings.write
audit.read
reports.read

Do not implement future subroles without approval.

======================================================================
98. ADMIN RETURN VERIFICATION PERMISSION
========================================

Phase 1:

Only ADMIN can:

* mark warehouse received
* mark return verified
* restore inventory

Future permission granularity may introduce:

delivery.return.verify

but NOT now.

======================================================================
99. SECURITY
============

Implement:

* secure sessions
* HttpOnly cookies
* Secure production cookies
* SameSite
* rate limiting
* Zod
* server authorization
* anti-enumeration
* Argon2id
* CSRF protection as applicable
* security headers
* safe uploads
* Excel security
* IDOR prevention
* privilege escalation prevention
* mass assignment prevention
* audit logging
* replay protection
* idempotency
* OAuth state protection
* OAuth account-linking protection

Never expose:

* password
* password hash
* token
* OTP
* secret
* OAuth secret
* provider token
* internal stack trace

======================================================================
100. RATE LIMITS — FINAL BASELINE
=================================

LOGIN:

5 failed attempts / 15 minutes per IP + normalized email
20 attempts / 15 minutes per IP

After repeated failures:

progressive delay
+
temporary throttling

REGISTRATION:

5 registrations / 15 minutes per IP
20 / 24 hours per IP

PASSWORD RESET REQUEST:

3 / 15 minutes per IP
3 / hour per normalized email

EMAIL VERIFICATION RESEND:

3 / hour per account

CHECKOUT:

5 checkout attempts / minute per authenticated user
20 / hour per authenticated user

SEARCH:

60 / minute per IP

ORDER EXCEL IMPORT:

5 / hour per Admin

DELIVERY EXCEL IMPORT:

5 / hour per Admin

IMAGE UPLOAD:

60 mutations / hour per Admin

Sensitive Admin mutation APIs:

100 requests / minute per Admin session baseline

Production rate limiting MUST use shared storage in multi-instance deployments.

Do not rely only on process-local memory.

======================================================================
101. RETENTION POLICY — FINAL BASELINE
======================================

Commercial history:

Orders:
INDEFINITE

OrderItems:
INDEFINITE

Points ledger:
INDEFINITE

Inventory ledger:
INDEFINITE

Referral history:
INDEFINITE

AuditLog:
24 months minimum

Admin security logs:
24 months minimum

Operational logs:
90 days

Customer notifications:
90 days

Admin notifications:
180 days

Sessions:
expire by policy

Customer session:
30 days maximum

Admin session:
12 hours maximum

Email verification tokens:
15 minutes

Password reset tokens:
15 minutes

Idempotency records:
7 days

Excel import metadata:
24 months

Raw import files:
90 days unless required longer

DigestExecution:
24 months

Temporary image/orphan cleanup records:
90 days

Never delete commercial history merely for convenience.

======================================================================
102. SOFT DELETE
================

Prefer:

isActive
archivedAt

for:

* products
* categories
* users
* variants

Do not destroy referenced commercial history.

======================================================================
103. IDOR PROTECTION
====================

Every protected object operation must verify:

ownership
+
relationship
+
authorization

Examples:

Order:
orderId + authenticatedUserId

Image:
imageId + productId

Variant:
variantId + productId

Customer:
authenticated Admin/approved authorization

Never trust object IDs merely because they are hard to guess.

======================================================================
104. MASS ASSIGNMENT
====================

Never use:

update(data)

with uncontrolled client objects.

Use:

validated schema
+
explicit mapping
+
domain command

Never allow mass assignment of:

role
pointsBalance
stock
price
total
permissions

======================================================================
105. MONEY
==========

Currency:

EGP

Never use floating point for authoritative monetary calculations.

Use precise Decimal/integer-compatible representation.

Points:

integer

Quantity:

positive integer

All persisted values must be deterministic.

======================================================================
106. IMAGE SECURITY
===================

Validate actual file content.

Restrict:

* type
* size
* extension
* image dimensions
* storage destination

Use server-generated storage keys.

Never execute uploaded content.

======================================================================
107. PERFORMANCE
================

Optimize:

* no N+1
* indexed queries
* pagination
* selective Prisma fields
* aggregate stock queries
* efficient variants
* efficient images
* bounded Excel processing
* minimized client JavaScript
* Server Components where appropriate
* Suspense/loading boundaries

Do not introduce complexity without evidence.

======================================================================
108. SEARCH QUERY SAFETY
========================

Search:

* trim
* length limit
* normalize
* safely parameterize

Sort fields:

strict whitelist

Filter fields:

strict whitelist

No raw SQL interpolation.

======================================================================
109. SEO
========

Public storefront:

* localized metadata
* canonical URLs
* Open Graph
* product metadata
* category metadata
* structured content
* sitemap where appropriate

Do not index:

* Admin
* account
* internal API
* private routes

======================================================================
110. CACHING
============

Cache only data safe to cache.

Never use cached frontend values as checkout authority.

Checkout always re-reads:

* price
* points price
* stock
* shipping
* delivery estimate
* points balance

======================================================================
111. OBSERVABILITY
==================

Structured logs.

Levels:

DEBUG
INFO
WARN
ERROR
SECURITY
AUDIT

Include correlation/request ID where useful.

Never log:

* passwords
* password hashes
* tokens
* OTPs
* cookies
* authorization headers
* OAuth secrets
* provider tokens

======================================================================
112. HEALTH CHECKS
==================

Provide:

/api/health
/api/ready

Distinguish:

process alive

from:

database/storage readiness

Do not leak sensitive diagnostics.

======================================================================
113. DAILY DIGEST
=================

Schedule:

00:00 UTC

Aggregate previous 24h:

* Gross Merchandise Sales
* Gross Order Value
* Delivered Revenue
* Refused Value
* Cancelled Value
* Outstanding COD
* New customers
* Delivered orders
* Low stock
* Top variants
* Points redeemed
* Points earned
* Referral rewards
* Import failures

Use:

IEmailProvider

Track:

DigestExecution

No duplicate send.

======================================================================
114. REPORT DEFINITIONS
=======================

Every financial metric MUST explicitly state its semantic definition.

Example:

"Delivered Revenue — Last 24 Hours"

not:

"Revenue"

unless the definition is unambiguous.

======================================================================
115. ORDER AMENDMENT FINANCIAL RULE
===================================

If amendment changes:

* quantity
* product
* variant
* purchaseMode

recompute:

cashSubtotal
pointsSubtotal
shipping
cashDue
pointsRedeemed
delivery reward snapshot
inventory effects

Old pending effects must be reversed where required.

No silent mutation.

======================================================================
116. CART / POINTS PURCHASE
===========================

Cart may retain intended purchaseMode per item.

At checkout:

server revalidates.

If points balance insufficient:

entire transaction fails.

No partial conversion to cash.

User must explicitly change purchase mode if the UI supports it.

======================================================================
117. CUSTOMER PRODUCT PURCHASE UX
=================================

For points-enabled product:

Cash:
1500 EGP

OR

500 Points

Actions:

Add to Cart
Buy with Points

Buy with Points creates cart item:

purchaseMode = POINTS

No automatic hidden conversion.

======================================================================
118. FREE SHIPPING REDEMPTION UX
================================

Checkout example:

Current Points:
700

Free Shipping:
200 Points

[ Use 200 Points for Free Shipping ]

After selection:

Shipping:
0 EGP

Points used:
200

Remaining:
500 Points

No partial discount.

======================================================================
119. POINTS + SHIPPING DISPLAY
==============================

Example:

500 product points
70 cash shipping

Display:

Product:
500 Points

Shipping:
70 EGP

Total Cash Due:
70 EGP

Total Points:
500

For free shipping:

500 product points
200 free shipping

Display:

Product:
500 Points

Free Shipping:
200 Points

Total Cash Due:
0 EGP

Total Points:
700

======================================================================
120. PAYMENT LANGUAGE
=====================

DO NOT display:

Payment Method:
Points

Instead:

Payment Method:
Cash on Delivery

Funding:
Points Redemption / Mixed / Cash

This prevents semantic confusion.

======================================================================
121. DELIVERY STATUS
====================

DeliveryStatus:

DELIVERED
CUSTOMER_REFUSED

Internal return states:

RETURN_IN_TRANSIT
WAREHOUSE_RECEIVED
WAREHOUSE_RETURN_VERIFIED

Internal warehouse states are not necessarily customer-facing.

======================================================================
122. CUSTOMER-FACING ORDER STATUS
=================================

Customer-facing statuses:

Pending confirmation
Confirmed
Processing
Shipped
Delivered
Customer refused
Cancelled

Do not expose internal warehouse states unless useful.

======================================================================
123. AUDIT ARCHITECTURE
=======================

Separate:

AuditLog
OrderDataChange
OrderConfirmationAttempt
OrderStatusHistory
PointsTransaction
InventoryTransaction
Import History
OAuth security events where needed

Do not collapse them into one generic table.

======================================================================
124. AUDIT IMMUTABILITY
=======================

Audit records:

append-only

No normal edit.

No normal delete.

Controlled maintenance only.

======================================================================
125. USER MODEL
===============

User:

id
email
passwordHash nullable
fullName
phone
role
referralCode
pointsBalance
emailVerifiedAt
isActive
createdAt
updatedAt

Roles:

CUSTOMER
ADMIN

OAuth-only users may have:

passwordHash = NULL

subject to authentication policy.

======================================================================
126. ADDRESS MODEL
==================

Address:

id
userId
label
fullName
phone1
phone2
whatsapp
governorate
cityOrCenter
area
street
buildingNumber
floor
apartmentNumber
landmark
notes
isDefault
createdAt
updatedAt

Historical orders snapshot values.

======================================================================
127. PRODUCT IMAGE MODEL
========================

ProductImage:

id
productId
storageKey
url/reference
altText
displayOrder
isPrimary
createdAt
updatedAt

======================================================================
128. ORDER CONFIRMATION MODEL
=============================

OrderConfirmation:

orderId
status
method
confirmedBy
confirmedAt
notes

======================================================================
129. ORDER AMENDMENT MODEL
==========================

OrderAmendment:

id
orderId
requestedBy
reason
beforeSnapshot
afterSnapshot
cashDelta
pointsDelta
inventoryDelta
status
createdAt

Statuses:

PENDING
APPROVED
APPLIED
REJECTED
FAILED

======================================================================
130. IMPORT MODEL
=================

Import:

id
type
fileName
fileHash
uploadedBy
totalRows
validRows
invalidRows
processedRows
status
createdAt
completedAt

Import Row:

id
importId
orderId
rowFingerprint
rowNumber
status
errorCode
errorMessage
createdAt

======================================================================
131. NOTIFICATION MODEL
=======================

Notification:

id
userId nullable
type
title
body
severity
readAt
deduplicationKey
metadata
createdAt

======================================================================
132. SETTINGS HISTORY
=====================

Business-critical setting changes must be auditable.

Capture:

* previous value
* new value
* actor
* timestamp
* reason where required

======================================================================
133. API / SERVER ACTION SECURITY CONTRACT
==========================================

Every state-changing operation:

Authenticate
→ Authorize
→ Validate
→ Service
→ Transaction
→ Audit
→ Return safe DTO

Never return raw database model blindly.

======================================================================
134. RESPONSE DTO POLICY
========================

Server returns safe DTOs.

Never expose:

* passwordHash
* provider credentials
* secrets
* internal stack traces
* authorization secrets
* unnecessary sensitive metadata

======================================================================
135. ERROR TAXONOMY
===================

VALIDATION_ERROR
UNAUTHENTICATED
FORBIDDEN
NOT_FOUND
CONFLICT
INVALID_STATE_TRANSITION
INSUFFICIENT_STOCK
INSUFFICIENT_POINTS
INVALID_REFERRAL_CODE
SELF_REFERRAL
REFERRAL_ALREADY_ASSIGNED
IDEMPOTENCY_CONFLICT
ALREADY_PROCESSED
PROTECTED_FIELD
IMPORT_INVALID
RATE_LIMITED
STORAGE_ERROR
EMAIL_ERROR
OAUTH_ERROR
INTERNAL_ERROR

Map to safe localized messages.

======================================================================
136. ADMIN DASHBOARD INFORMATION ARCHITECTURE
=============================================

DASHBOARD

ORDERS
All Orders
Confirmation Queue
Amendments
Import / Export

CUSTOMERS

CATALOG
Products
Categories
Variants
Media

INVENTORY

REWARDS
Points
Points Products
Referrals

DELIVERY
Imports
Return Verification

REPORTS

NOTIFICATIONS

SETTINGS

AUDIT LOGS

======================================================================
137. CUSTOMER INFORMATION ARCHITECTURE
======================================

SHOP
All Products
Categories
Search
Offers

REWARDS
Points Products
My Points
Points History
Referrals

ACCOUNT
Orders
Profile
Addresses
Settings

======================================================================
138. ADMIN PRODUCT TABLE
========================

Product
Category
Cash Price
Points Availability
Points Price
Delivery Reward
Variant Count
Total Stock
Status
Actions

Actions:

View
Edit
Deactivate
Manage Images
Manage Variants

======================================================================
139. ADMIN INVENTORY TABLE
==========================

Product
Variant
SKU
Current Stock
Low Stock
Status
Last Movement
Actions

======================================================================
140. ADMIN ORDER TABLE
======================

Order ID
Customer
Created At
Status
Confirmation
Funding
Cash Due
Points Used
Shipping
Actions

======================================================================
141. ADMIN CONFIRMATION TABLE
=============================

Order ID
Customer
Created
Attempts
Last Attempt
Status
High Attempt Warning
Actions

======================================================================
142. ADMIN REFERRAL TABLE
=========================

Referral Code
Referrer
Referee
Registered
First Delivered Order
Reward State
Reward Amount
Actions

======================================================================
143. ADMIN IMPORT TABLE
=======================

Import ID
Type
File
Uploaded By
Created
Rows
Succeeded
Failed
Status
Actions

======================================================================
144. ADMIN AUDIT TABLE
======================

Timestamp
Actor
Action
Entity
Entity ID
Summary
Details

Read-only.

======================================================================
145. CUSTOMER UI PRINCIPLES
===========================

Always provide:

* loading
* empty
* error
* success
* retry

Never fake zero values.

Never represent failed data retrieval as valid zero state.

Never present stale financial state as authoritative.

======================================================================
146. RESPONSIVE DESIGN
======================

Support:

mobile
tablet
desktop

No critical customer action depends on hover.

Admin mobile:

* collapsible navigation
* usable responsive tables
* responsive detail pages
* touch-friendly controls

======================================================================
147. ACCESSIBILITY
==================

Use:

semantic HTML
keyboard navigation
focus management
accessible dialogs
labels
error associations
contrast
non-color-only statuses
RTL/LTR accessibility

======================================================================
148. SEO
========

Public pages:

metadata
canonical URLs
Open Graph
structured product/category data
localized URLs
sitemap where appropriate

Private/admin routes must not be indexed.

======================================================================
149. CACHING
============

Cache only data safe to cache.

Never use cached frontend data as checkout authority.

Checkout must re-read:

price
points price
stock
shipping
delivery estimate
points balance

======================================================================
150. PERFORMANCE
================

Mandatory:

* no N+1
* pagination
* selective DB fields
* efficient images
* bounded Excel memory
* minimized client JS
* proper indexes
* Server Components where useful
* Suspense where useful

No speculative complexity.

======================================================================
151. SEARCH QUERY SAFETY
========================

Search:

* trim
* length-limit
* normalize
* safely parameterize

Sorting:

strict whitelist

Filtering:

strict whitelist

Never interpolate raw query values into SQL.

======================================================================
152. SECURITY MATRIX
====================

Maintain:

Threat
Surface
Mitigation
Implementation
Test
Residual Risk
Status

At minimum cover:

Authentication
Authorization
IDOR
Privilege Escalation
CSRF
XSS
Injection
Mass Assignment
Upload Security
Excel Security
OAuth Security
Replay
Rate Limiting
Points Abuse
Referral Abuse
Inventory Abuse
Session Security
Secret Leakage

======================================================================
153. BUSINESS RULE MATRIX
=========================

Maintain:

Rule ID
Rule
Authoritative Service
DB Enforcement
Transaction Requirement
Idempotency Requirement
Audit Requirement
Test
Status

No critical business rule may exist only in UI or documentation.

======================================================================
154. REQUIREMENT TRACEABILITY
=============================

Every critical requirement maps:

Requirement
→ Domain
→ Service
→ Schema
→ API / Server Action
→ UI
→ Test
→ Documentation

======================================================================
155. REQUIRED AUTH TESTS
========================

Test:

Admin login
Customer login
Wrong password
Role escalation
Unauthorized Admin access
Email verification
Checkout blocked before verification
Password reset
Session expiry
Enumeration protection
Rate limiting
First Google login
Returning Google login
Invalid OAuth callback
Duplicate provider identity
Account linking
Unsafe account linking
Google cannot create Admin
Google cannot elevate Customer
OAuth failure recovery
OAuth session creation

======================================================================
156. REQUIRED PAYMENT TESTS
===========================

Because Phase 1 is COD:

Test:

CASH_ONLY
POINTS_ONLY
MIXED
Cash product + paid shipping
Points product + paid shipping
Cash product + free shipping
Points product + free shipping
Mixed cart
Cash due
Points due
No fake gateway
No fake settlement

======================================================================
157. REQUIRED POINTS TESTS
==========================

Test:

Product redemption
No partial redemption
Mixed cart
Free shipping
Insufficient points
Points refund
Duplicate refund
Delivery reward
Points-purchase reward setting
Correction reversal
Referral reward
Referral reversal
Re-award after correction
Admin adjustment
Concurrent redemption
Non-negative balance

======================================================================
158. REQUIRED REFERRAL TESTS
============================

Test:

Valid code
Invalid code
Self referral
No code
Late assignment attempt
One referee / one referrer
First delivered reward
Second delivered order no duplicate reward
Delivered → refused reversal
Refused → delivered re-award
Duplicate processing
Concurrent processing

======================================================================
159. REQUIRED INVENTORY TESTS
=============================

Test:

Final-unit race
Insufficient stock
Cancellation restore
Duplicate cancellation
Refusal no immediate restore
Return verification restore
Duplicate return verification
Admin adjustment
Order amendment inventory delta
Concurrent checkout

======================================================================
160. REQUIRED CONFIRMATION TESTS
================================

Test:

Normal edit
Unauthorized field edit
Product change rejected through normal confirmation
Quantity change rejected through normal confirmation
Amendment flow
Three failed calls
No auto-cancellation
Attempt audit
Post-shipment edit lock

======================================================================
161. REQUIRED EXCEL TESTS
=========================

Test:

Valid import
Invalid workbook
Missing columns
Protected field
Duplicate file
Duplicate row
Same fingerprint
Legitimate changed row
Formula injection
Unauthorized Admin
Mixed valid/invalid rows
Transaction failure
Retry
Memory bounds

======================================================================
162. REQUIRED REPORT TESTS
==========================

Verify:

Gross Merchandise Sales
Gross Order Value
Delivered Revenue
Refused Value
Cancelled Value
Outstanding COD

Verify points never inflate EGP revenue.

Verify date-basis semantics.

======================================================================
163. HEALTH / OPERATIONS
========================

Provide:

health
readiness
structured logging
error tracking abstraction
cron execution tracking
import tracking
storage status where appropriate

Never expose secrets.

======================================================================
164. DEPLOYMENT
===============

Support:

Vercel
Docker
Node

Secrets via environment.

Provide:

.env.example

Never commit credentials.

======================================================================
165. BACKUPS
============

Documentation must define:

database backups
retention
restore test procedure
migration safety
object storage protection

Baseline:

daily database backup
30-day backup retention

Infrastructure configuration must be verified separately.

======================================================================
166. DOCUMENTATION
==================

Maintain:

docs/MASTER_SPEC.md
docs/BUSINESS_RULES.md
docs/ARCHITECTURE.md
docs/DATABASE.md
docs/API.md
docs/SECURITY.md
docs/ORDER_LIFECYCLE.md
docs/ORDER_CONFIRMATION.md
docs/ORDER_AMENDMENTS.md
docs/POINTS_SPEC.md
docs/REFERRAL_SPEC.md
docs/INVENTORY_SPEC.md
docs/DELIVERY_SPEC.md
docs/EXCEL_IMPORT_SPEC.md
docs/IMAGE_SPEC.md
docs/SHIPPING_SPEC.md
docs/NOTIFICATIONS_SPEC.md
docs/REPORTING.md
docs/I18N_SPEC.md
docs/TESTING.md
docs/DEPLOYMENT.md
docs/RETENTION.md
docs/DECISIONS.md
docs/CHANGELOG.md

Documentation must match actual implementation.

======================================================================
167. RETENTION IMPLEMENTATION
=============================

Retention jobs may clean:

* expired sessions
* expired tokens
* operational notifications
* temporary imports
* operational logs
* orphaned storage records
* temporary processing artifacts

Never allow automated retention to delete:

* orders
* order items
* points ledger
* inventory ledger
* referral history

unless future explicit legal/business policy authorizes it.

======================================================================
168. LEGAL / POLICY SAFETY
==========================

Do NOT invent:

* tax
* VAT
* coupons
* discounts
* chargebacks
* bank transfer
* card gateways
* wallet providers
* installment plans

unless explicitly added in a future approved specification.

======================================================================
169. CRITICAL DOMAIN INVARIANTS
===============================

INVARIANT 1:
pointsBalance >= 0

INVARIANT 2:
referee has at most one referrer

INVARIANT 3:
referral ownership immutable

INVARIANT 4:
referral reward max one active reward

INVARIANT 5:
delivery reward cannot duplicate

INVARIANT 6:
inventory cannot fall below zero

INVARIANT 7:
inventory restoration cannot duplicate

INVARIANT 8:
historical order snapshots are immutable

INVARIANT 9:
Phase 1 payment method = CASH_ON_DELIVERY

INVARIANT 10:
points are not monetary currency

INVARIANT 11:
partial product points redemption prohibited

INVARIANT 12:
partial free shipping prohibited

INVARIANT 13:
customer refusal does not immediately restore stock

INVARIANT 14:
unverified customer cannot create order

INVARIANT 15:
Admin role cannot be client-controlled

INVARIANT 16:
Excel cannot mutate protected fields

INVARIANT 17:
duplicate checkout cannot create duplicate order

INVARIANT 18:
audit records are append-only

INVARIANT 19:
OAuth provider identity is unique

INVARIANT 20:
Google OAuth cannot elevate role

INVARIANT 21:
unsafe OAuth account linking is prohibited

======================================================================
170. PHASE 00 — DO NOT IMPLEMENT
================================

Phase 00 MUST inspect:

* repository
* Git history
* dependencies
* routes
* schema
* migrations
* services
* authentication
* OAuth
* security
* UI
* imports
* storage
* tests
* environment
* deployment

Output:

1. Repository Audit
2. Architecture Summary
3. Entity Model
4. ERD
5. Route Map
6. Domain Map
7. API Map
8. Service Map
9. Business Rules Matrix
10. Database Enforcement Matrix
11. RBAC Matrix
12. Security Threat Model
13. OAuth Security Model
14. Test Matrix
15. Migration Plan
16. Legacy Cleanup Plan
17. File Tree
18. Deployment Model
19. Storage Model
20. Retention Model
21. Rate Limit Model
22. Notification Model
23. Reporting Definitions
24. Final Configuration Matrix
25. Risk Register
26. Phase 01 Plan

No schema rewrite before the audit.

======================================================================
171. LEGACY / PROTOTYPE RECOVERY
================================

If the repository contains:

* mockData
* localStorage business logic
* fake checkout
* fake orders
* fake stock
* fake points
* fake authentication
* fake Admin
* arbitrary cashback
* wrong currency
* prototype scripts
* duplicate architecture
* obsolete routes
* obsolete services

the agent MUST:

1. identify them;
2. classify them;
3. preserve recoverability;
4. never treat them as authoritative;
5. map replacement plan;
6. remove only after validated replacement exists.

Never perform:

git reset --hard

or destructive mass deletion merely to obtain a clean repository.

Never delete unknown files without first determining their purpose.

======================================================================
172. PHASE 00 FINAL CONFIGURATION MATRIX
========================================

The final configuration must explicitly state:

Payment Method:
CASH_ON_DELIVERY

Funding Modes:
CASH_ONLY
POINTS_ONLY
MIXED

Product Points Redemption:
FULL PRODUCT ONLY

Partial Product Points + Cash:
FORBIDDEN

Free Shipping:
FULL ONLY

Global Shipping:
70 EGP default

Free Shipping Threshold:
200 Points default

Referral Reward:
50 Points

Referral Trigger:
First DELIVERED order

Referral Reversal:
YES on DELIVERED → CUSTOMER_REFUSED

Referral Re-award:
YES on CUSTOMER_REFUSED → DELIVERED when valid

Delivery Reward:
per-unit configured reward

Points Purchase Delivery Reward:
default FALSE

Confirmation Editable Fields:
contact + address only

Product / Variant / Quantity Change:
Order Amendment Flow

Return Verification:
ADMIN ONLY

Email Verification:
required before checkout

Current Payment Gateway:
NONE

Current Payment Method:
CASH_ON_DELIVERY

Authentication:
Credentials + Google OAuth

Admin Identity:
DB User role ADMIN bootstrapped from environment

OAuth Identity:
OAuthAccount linked to internal User

Audit Retention:
24 months minimum

Commercial Ledger Retention:
indefinite

Operational Logs:
90 days

Customer Notifications:
90 days

Admin Notifications:
180 days

Idempotency:
7 days

Import Metadata:
24 months

Raw Import Files:
90 days

Backup Retention:
30 days

These are the implementation baseline.

They are NOT questions.

======================================================================
173. PHASE 01
=============

After Phase 00 approval:

Implement:

* Prisma schema
* enums
* relations
* indexes
* constraints
* migrations
* seed/bootstrap architecture
* User
* OAuthAccount
* commercial domain foundation

No unrelated UI feature work.

======================================================================
174. PHASE 02
=============

Implement:

* env validation
* DB infrastructure
* logging
* errors
* rate limiting
* security headers
* health checks
* Docker
* configuration
* observability foundations

======================================================================
175. PHASE 03
=============

Implement:

* Auth.js
* User
* Customer registration
* Admin bootstrap
* Credentials login
* Google OAuth
* OAuth account linking
* Logout
* sessions
* RBAC

======================================================================
176. PHASE 04
=============

Implement:

* email verification
* password reset
* rate limiting
* anti-enumeration

======================================================================
177. PHASE 05
=============

Implement:

* storefront
* catalog
* categories
* search
* filters
* product details
* variants
* media
* points catalog
* i18n
* responsive design
* SEO

======================================================================
178. PHASE 06
=============

Implement:

* cart
* persistence
* variant selection
* stock validation
* purchaseMode
* optional guest merge

======================================================================
179. PHASE 07
=============

Implement:

* checkout
* COD
* CASH_ONLY
* POINTS_ONLY
* MIXED
* free shipping
* authoritative totals
* historical snapshots
* points redemption
* inventory
* order creation
* idempotency
* transaction integrity
* concurrency protection

======================================================================
180. PHASE 08
=============

Implement:

* points ledger
* delivery reward
* referral reward
* referral reversal
* referral re-award
* refunds
* concurrency controls

======================================================================
181. PHASE 09
=============

Payment abstraction only.

No electronic provider.

No fake payment settlement.

======================================================================
182. PHASE 10
=============

Customer account:

* profile
* orders
* points
* history
* referrals
* addresses
* settings

======================================================================
183. PHASE 11
=============

Admin dashboard:

* dashboard
* orders
* customers
* catalog
* categories
* variants
* media
* inventory
* points
* referrals
* settings
* reports
* notifications
* audit

======================================================================
184. PHASE 12
=============

Implement:

* Order Confirmation
* Phone Confirmation
* Manual WhatsApp
* Confirmation Attempts
* Confirmation edits
* Order Amendment Flow

======================================================================
185. PHASE 13
=============

Implement:

* Order Excel Export
* Order Excel Import
* preview
* validation
* protected field policy
* deduplication
* transactional apply
* audit

======================================================================
186. PHASE 14
=============

Implement:

* Delivery Excel Import
* Delivery processing
* DELIVERED
* CUSTOMER_REFUSED
* return workflow
* warehouse received
* warehouse return verification
* inventory restoration

======================================================================
187. PHASE 15
=============

Implement:

IWhatsAppConfirmationProvider

Current:

ManualWhatsAppConfirmationProvider

No automated WhatsApp API.

======================================================================
188. PHASE 16
=============

Security hardening:

* authentication audit
* authorization audit
* Google OAuth audit
* account-linking audit
* IDOR
* privilege escalation
* CSRF
* XSS
* injection
* upload security
* Excel security
* replay protection
* rate limiting
* secret handling
* session security

======================================================================
189. PHASE 17
=============

Complete test suite:

Vitest
Playwright
unit tests
service tests
database tests
integration tests
transaction tests
concurrency tests
security tests
regression tests

======================================================================
190. PHASE 18
=============

Performance audit:

* database queries
* indexes
* N+1
* rendering
* client JavaScript
* image delivery
* Excel processing
* caching
* API latency

No unsupported performance claims.

======================================================================
191. PHASE 19
=============

Production audit:

* architecture
* security
* business rules
* data integrity
* observability
* deployment
* backups
* recovery
* retention
* documentation
* operational readiness

======================================================================
192. PHASE GATE
===============

A phase is COMPLETE only when:

* implementation exists
* requirements are traceable
* tests exist
* tests pass
* security reviewed
* data integrity reviewed
* documentation updated
* known issues documented
* phase gate = PASS

At each gate output:

PHASE
STATUS
IMPLEMENTED
FILES CREATED
FILES MODIFIED
FILES REMOVED
DATABASE CHANGES
BUSINESS RULES
SECURITY
TESTS
TEST RESULTS
PERFORMANCE
DOCUMENTATION
KNOWN ISSUES
REMAINING WORK
GATE

Never report completion because:

* code compiles
* UI renders
* endpoint returns 200
* one happy path passes
* build succeeds

======================================================================
193. DEFINITION OF DONE
=======================

A feature is NOT DONE because:

* UI exists
* endpoint exists
* build passes
* database row exists
* happy path works

A feature is DONE only when:

UI
+
Validation
+
Authentication
+
Authorization
+
Service
+
Database
+
Transaction
+
Idempotency where required
+
Audit where required
+
Error Handling
+
Tests
+
Documentation

are aligned.

======================================================================
194. ABSOLUTE PROHIBITIONS
==========================

NEVER:

trust client price

trust client points

trust client stock

trust client role

trust client total

trust client permissions

allow product partial points redemption

allow partial free shipping

restore inventory immediately on customer refusal

award referral twice

award delivery points twice

refund points twice

deduct inventory twice

duplicate checkout

edit historical snapshots silently

edit audit history

allow arbitrary Excel field mutation

auto-cancel after 3 failed calls

create fake electronic payment

claim collected revenue before COD delivery

allow unverified customer checkout

allow Admin role from browser

allow env-only fake Admin identity

silently invent business rules

silently modify approved business rules

silently introduce cashback

silently introduce SAR or another currency

silently introduce tax/VAT/coupon/discount systems

silently introduce card payment

silently introduce wallet payment

silently introduce bank transfer

silently introduce installments

silently merge OAuth accounts

trust a Google email without applying the approved account-linking policy

allow Google authentication to elevate privileges

allow frontend-only business authority

replace the architecture merely to simplify implementation

rewrite working code without traceability

perform destructive migration without recovery plan

delete existing functionality to make tests pass

disable tests to make the build green

skip security checks because the feature "works"

mark a phase complete without validation

======================================================================
195. FINAL ENGINEERING STANDARD
===============================

The system must remain correct under:

* real financial conditions
* operational conditions
* security attacks
* concurrency
* human error
* network retries
* duplicate requests
* stale state
* malformed files
* historical mutations
* status corrections
* partial external failures
* OAuth retries
* provider failures
* session expiry
* race conditions
* repeated imports
* repeated delivery updates
* repeated refunds
* repeated inventory operations

Optimize for:

CORRECT UNDER REAL-WORLD CONDITIONS

NOT:

LOOKS FINISHED

======================================================================
196. PHASE EXECUTION PROTOCOL
=============================

READ THIS ENTIRE SPECIFICATION BEFORE ANY IMPLEMENTATION.

PHASE 00 MUST BE AUDIT ONLY.

Do not code during Phase 00 unless required for non-destructive inspection tooling.

Every phase must have:

1. objective
2. requirements
3. implementation plan
4. dependency map
5. risk analysis
6. implementation
7. tests
8. security review
9. data integrity review
10. documentation update
11. validation gate

Do not skip phases merely because the agent believes the work is simple.

Do not combine unrelated phases without explicit justification.

======================================================================
197. REPOSITORY SAFETY PROTOCOL
===============================

Before modifying an existing repository:

1. inspect Git status
2. inspect Git history
3. inspect current branch
4. identify last known-good state
5. inspect recent changes
6. identify prototype/legacy artifacts
7. preserve recoverability

Never automatically execute:

git reset --hard

Never automatically delete:

* unknown files
* migrations
* tests
* domain services
* repository interfaces
* documentation
* configuration

When replacing legacy implementation:

OLD
→
MIGRATION
→
NEW
→
TEST
→
VERIFY
→
REMOVE OLD

not:

DELETE
→
GUESS
→
REBUILD

======================================================================
198. CURRENT REPOSITORY RECOVERY PROTOCOL
=========================================

If the current repository contains a prototype that conflicts with this specification:

Treat the specification as authoritative.

Prototype artifacts may include:

* mockData
* hardcoded products
* localStorage cart
* client-generated order numbers
* fake points
* fake referral bonuses
* cashback
* SAR currency
* fake Admin flags
* fake API responses
* fake payment systems
* fake inventory
* visual-only tracking
* static charts
* generated prototype scripts

These MUST be classified as:

LEGACY / PROTOTYPE

unless proven otherwise.

Do not infer production business rules from them.

======================================================================
199. CONFIGURATION BASELINE
===========================

The Phase 00 output MUST explicitly state:

Payment Method:
CASH_ON_DELIVERY

Funding Modes:

CASH_ONLY
POINTS_ONLY
MIXED

Product Points Redemption:

FULL ONLY

Partial Product Points + Cash:

FORBIDDEN

Free Shipping:

FULL ONLY

Global Shipping:

70 EGP

Free Shipping Threshold:

200 Points

Expected Delivery:

2–3 Days

Referral Reward:

50 Points

Referral Trigger:

First DELIVERED order

Referral Reversal:

YES

Referral Re-award:

YES when qualification becomes valid again

Delivery Reward:

per-unit configured value

Points Purchase Delivery Reward:

FALSE by default

Confirmation Editable Fields:

Contact + Address only

Product / Variant / Quantity Changes:

Order Amendment Flow

Return Verification:

ADMIN ONLY

Email Verification:

required before checkout

Payment Gateway:

NONE

Payment Method:

CASH_ON_DELIVERY

Authentication:

Credentials + Google OAuth

Admin:

DB User with ADMIN role

OAuth Identity:

OAuthAccount linked to User

Audit Retention:

24 months minimum

Commercial History:

indefinite

Operational Logs:

90 days

Customer Notifications:

90 days

Admin Notifications:

180 days

Idempotency:

7 days

Import Metadata:

24 months

Raw Import Files:

90 days

Backup Retention:

30 days

======================================================================
200. MASTER CONTRACT ENFORCEMENT
================================

Every AI coding agent, human developer, code-generation model,
or external system working on VEN+ MUST obey this contract.

Before making changes, the agent must determine:

* which phase is active
* which requirements are being implemented
* which files are authoritative
* which business rules are involved
* which tests cover the change
* whether transaction semantics are affected
* whether audit is required
* whether idempotency is required
* whether security boundaries are affected

The agent must NOT infer that:

"working code" = "correct code"

The agent must verify compliance with this specification.

======================================================================
201. NO ARCHITECTURAL DRIFT
===========================

The agent MUST NOT:

* redesign the architecture for convenience
* replace the domain layer with UI logic
* introduce a second repository pattern
* introduce duplicate services
* introduce duplicate authentication
* introduce duplicate checkout
* create a parallel API
* create fake business infrastructure
* bypass the database because it is easier
* use mock data as production authority
* use localStorage as business authority
* implement core rules inside React
* invent a second source of truth

Any architectural deviation requires:

* documented reason
* impact analysis
* security assessment
* migration plan
* tests
* explicit phase approval

======================================================================
202. NO BUSINESS-RULE DRIFT
===========================

The agent MUST NOT invent:

* percentages
* cashback formulas
* conversion rates
* taxes
* discounts
* coupon systems
* hidden rewards
* payment providers
* shipping tiers
* governorate pricing
* automatic cancellations
* automatic warehouse restoration
* automatic referral qualification
* alternative points semantics

unless explicitly added to a future approved specification.

======================================================================
203. TRANSACTIONAL STANDARD
===========================

Any business operation that changes multiple authoritative resources
MUST define its transaction boundary.

Examples:

Checkout:
Order + OrderItems + Stock + Points + Idempotency + Cart

Cancellation:
Order + Stock + Points + Audit

Delivery:
Order + Points + Referral + Notifications + Audit

Return Verification:
Order/Return + Inventory + Audit

Admin Points Adjustment:
PointsBalance + PointsTransaction + Audit

Order Amendment:
Order + OrderItems + Stock + Points + Audit

If atomicity is impossible because of an external provider:

the system must use:

* outbox/event strategy
* compensating transaction
* retry policy
* idempotency
* audit
* failure state

Do not pretend distributed operations are atomic when they are not.

======================================================================
204. IDEMPOTENCY STANDARD
=========================

Idempotency is mandatory for critical repeatable operations.

At minimum:

* checkout
* cancellation
* refunds
* delivery imports
* order imports
* return verification
* delivery status processing
* referral reward processing
* points reward processing
* inventory restoration
* Admin adjustments where necessary

Repeated requests MUST NOT create duplicate business effects.

======================================================================
205. HISTORICAL DATA STANDARD
=============================

Historical commercial data must remain reconstructable.

Orders must snapshot:

* customer information
* contact information
* address
* product name
* variant information
* SKU
* prices
* points price
* delivery reward
* shipping
* delivery estimate
* purchase mode

Changes to current catalog/account/settings MUST NOT rewrite historical facts.

======================================================================
206. LEDGER STANDARD
====================

Points and inventory are ledger-backed domains.

Ledger records are:

* append-only
* traceable
* idempotent where required
* linked to the responsible business operation
* auditable

Do not mutate ledger history to "fix" mistakes.

Use:

reversal
+
correction
+
new transaction

======================================================================
207. ORDER STATE CORRECTION STANDARD
====================================

Status corrections must:

* validate legal transition
* require authorization
* capture reason
* capture actor
* create audit
* apply corresponding points effects
* apply corresponding inventory effects
* preserve previous history
* be idempotent

======================================================================
208. OAUTH IDENTITY STANDARD
============================

External OAuth identity is never equivalent to internal authorization.

Google proves identity.

The internal User record determines:

* role
* permissions
* account state
* points
* referrals
* ownership

Google must never directly assign:

ADMIN

======================================================================
209. TESTING GATE
=================

Every phase must run the repository's canonical validation commands.

At minimum, when applicable:

npm run lint

npx vitest run

npm run build

And for browser functionality:

npx playwright test

A green build does NOT prove business correctness.

All required tests must pass.

No tests may be:

* deleted
* skipped
* disabled
* weakened
* rewritten merely to pass

without documented justification.

======================================================================
210. TEST COVERAGE PHILOSOPHY
=============================

Test:

Happy path
Failure path
Boundary conditions
Concurrency
Retries
Duplicate requests
Stale state
Unauthorized access
Malformed inputs
Database constraints
Transaction rollback
Historical integrity
Security invariants

Tests must prove behavior,
not merely execute lines of code.

======================================================================
211. DOCUMENTATION STANDARD
===========================

Every completed phase must update:

* architecture documentation
* business rules documentation
* database documentation
* security documentation where relevant
* testing documentation
* decisions/changelog
* requirement traceability

Documentation must reflect reality.

Never document features that are not implemented.

Never leave removed behavior documented as active.

======================================================================
212. PHASE COMPLETION REPORT
============================

At the end of every phase output:

PHASE
STATUS
OBJECTIVE
IMPLEMENTED
FILES CREATED
FILES MODIFIED
FILES REMOVED
DATABASE CHANGES
API CHANGES
BUSINESS RULES
SECURITY
TRANSACTIONS
IDEMPOTENCY
AUDIT
TESTS
TEST RESULTS
BUILD RESULTS
PERFORMANCE
DOCUMENTATION
KNOWN ISSUES
RESIDUAL RISK
REMAINING WORK
NEXT PHASE
GATE

======================================================================
213. FINAL ABSOLUTE RULE
========================

IF A REQUIREMENT IS UNCLEAR:

DO NOT GUESS.

Inspect:

* this specification
* existing domain model
* existing schema
* existing tests
* existing documentation
* approved decisions

If ambiguity remains:

identify the conflict explicitly.

Do not silently choose a business rule.

======================================================================
214. FINAL EXECUTION COMMAND
============================

READ THIS ENTIRE SPECIFICATION.

AUDIT THE REPOSITORY.

RECONCILE THE CURRENT IMPLEMENTATION.

PRESERVE RECOVERABILITY.

DO NOT INVENT ALTERNATIVE BUSINESS RULES.

DO NOT LEAVE CRITICAL BUSINESS SEMANTICS AMBIGUOUS.

DO NOT HIDE BUSINESS DECISIONS INSIDE UI CODE.

CENTRALIZE BUSINESS LOGIC.

USE ONE AUTHORITATIVE DOMAIN IMPLEMENTATION.

MAKE TRANSACTIONAL OPERATIONS ATOMIC.

MAKE REPEATED OPERATIONS IDEMPOTENT.

MAKE HISTORICAL DATA RECONSTRUCTABLE.

MAKE ADMIN AUTHORITY SERVER-SIDE.

MAKE EXCEL UNTRUSTED.

MAKE POINTS LEDGER-BASED.

MAKE INVENTORY LEDGER-BASED.

MAKE REFERRAL REWARDS EXACTLY-ONCE.

MAKE STATUS CORRECTIONS FULLY AUDITABLE.

MAKE GOOGLE OAUTH SAFELY INTEGRATED WITH INTERNAL USER IDENTITY.

MAKE ACCOUNT LINKING EXPLICIT, SECURE, AND AUDITABLE.

DO NOT IMPLEMENT A NEW PAYMENT GATEWAY.

DO NOT IMPLEMENT CASHBACK.

DO NOT IMPLEMENT PARTIAL POINTS REDEMPTION.

DO NOT IMPLEMENT PARTIAL FREE SHIPPING.

DO NOT INVENT TAX/VAT/COUPONS/DISCOUNTS.

DO NOT TRUST THE CLIENT FOR BUSINESS AUTHORITY.

DO NOT MARK A PHASE COMPLETE WITHOUT VERIFICATION.

IMPLEMENT.
TEST.
VERIFY.
DOCUMENT.
AUDIT AGAIN.

END OF MASTER SYSTEM SPECIFICATION.
