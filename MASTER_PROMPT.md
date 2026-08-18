======================================================================
VEN+ / VENPLUS
MASTER SYSTEM SPECIFICATION
FINAL IMPLEMENTATION CONTRACT
PRODUCTION-GRADE COMMERCE + LOYALTY + REFERRAL + OPERATIONS PLATFORM
======================================================================

DOCUMENT STATUS
---------------
THIS DOCUMENT IS THE AUTHORITATIVE MASTER CONTRACT.

It supersedes:
- previous prompts
- previous generated code
- previous schema assumptions
- previous UI assumptions
- previous implementation shortcuts
- agent assumptions

When an implementation conflicts with this specification:
THIS SPECIFICATION WINS.

The system is not a prototype.
The system is not a visual mockup.
The system is not a CRUD demo.

It is a real transactional commerce and operational platform.

======================================================================
0. MISSION
======================================================================

Build VEN+ as a production-grade platform containing:

CUSTOMER STOREFRONT
CUSTOMER AUTHENTICATION
CUSTOMER ACCOUNTS
PRODUCT CATALOG
CATEGORIES
PRODUCT VARIANTS
MEDIA MANAGEMENT
CART
CHECKOUT
CASH-ON-DELIVERY ORDERS
POINTS PRODUCT REDEMPTION
FREE SHIPPING REDEMPTION
LOYALTY / POINTS LEDGER
REFERRAL SYSTEM
ORDER CONFIRMATION
MANUAL PHONE CONFIRMATION
MANUAL WHATSAPP CONFIRMATION
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

Never reverse this priority.

======================================================================
1. NON-NEGOTIABLE SOURCE OF TRUTH
======================================================================

PostgreSQL is the authoritative source of truth.

Never treat any of the following as authoritative:

- React state
- Zustand
- localStorage
- sessionStorage
- URL parameters
- browser memory
- client totals
- client prices
- client stock
- client points balance
- client role
- client permissions
- Excel
- WhatsApp messages
- UI state

Excel is an import/export transport mechanism.

WhatsApp is a communication/confirmation mechanism.

The Admin Dashboard is an operational control interface.

Critical business logic must execute server-side.

======================================================================
2. TECHNOLOGY BASELINE
======================================================================

Use a mutually compatible production stack:

Framework:
- Next.js 15+
- App Router
- React
- TypeScript
- strict: true

UI:
- Tailwind CSS
- shadcn/ui
- Lucide icons
- limited justified animation

State:
- Zustand only for client-side convenience/state mirroring

Backend:
- Server Actions
- Route Handlers
- dedicated Service Layer

Database:
- PostgreSQL
- Prisma ORM

Validation:
- Zod

Authentication:
- Auth.js / NextAuth-compatible architecture
- Credentials authentication
- Argon2id preferred

Excel:
- ExcelJS or equivalent safe XLSX library

Testing:
- Vitest
- Playwright

Deployment:
- Vercel-compatible
- Docker-compatible
- Node.js-compatible

Exact dependency versions must be verified during Phase 00.

Do not blindly upgrade packages.

Do not install unnecessary packages.

======================================================================
3. ARCHITECTURAL PIPELINE
======================================================================

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

- React components
- hooks
- Zustand
- Server Actions
- Route Handlers
- Excel processors
- UI helpers

Critical rules have exactly one authoritative domain implementation.

======================================================================
4. DOMAIN SERVICES
======================================================================

Create centralized services as required:

AuthService
UserService
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

======================================================================
5. BRAND IDENTITY
======================================================================

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
- CTA
- active navigation
- active selection
- focus
- important action
- points/rewards

Do not make the entire application orange.

Visual identity:
- premium
- minimal
- modern
- white
- operational
- commerce-oriented
- high information density
- clean

Avoid:
- excessive gradients
- excessive shadows
- unnecessary glassmorphism
- decorative noise
- pointless animation
- fake dashboard widgets

======================================================================
6. TYPOGRAPHY
======================================================================

Arabic:
- Cairo preferred
- Readex Pro acceptable

English:
- modern readable sans-serif

Typography must be consistent across:
- storefront
- checkout
- account
- admin
- tables
- dialogs
- forms

======================================================================
7. INTERNATIONALIZATION
======================================================================

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
- visible in header
- preserves session
- preserves cart
- preserves business context where technically possible

Localized fields must use strict structure:

{
  ar: string,
  en: string
}

Required localized entities:
- Product title
- Product description
- Category name

No arbitrary localization JSON.

Fallback:

requested locale
→ English
→ available value

All layouts must correctly support RTL/LTR.

======================================================================
8. AUTHENTICATION MODEL — FINAL
======================================================================

There is ONE unified login interface.

No:
- Admin login page
- Customer login page
- Role selector
- public Admin registration

Login:

Email
Password

[ Login ]

Create Account
Forgot Password?

The server determines identity.

======================================================================
9. ADMIN IDENTITY — FINAL RESOLUTION
======================================================================

The Admin MUST exist as a real User row in PostgreSQL.

Role:

ADMIN

The Admin is NOT an ephemeral environment-only identity.

Environment variables are used for bootstrap/configuration:

ADMIN_EMAIL
ADMIN_PASSWORD_HASH

Bootstrap behavior:

1. normalize ADMIN_EMAIL
2. ensure corresponding User exists
3. ensure role = ADMIN
4. ensure secure password hash exists
5. NEVER expose Admin credentials to client
6. NEVER submit role from browser

Auth.js authenticates against the actual database User record.

The environment configuration is a bootstrap authority,
not a substitute for the User table.

Do NOT create:
- env-only Admin sessions
- fake Admin objects
- client-side Admin flags

Do NOT overwrite the Admin password on every request.

Use a controlled bootstrap/sync operation.

======================================================================
10. CUSTOMER AUTHENTICATION
======================================================================

Public registration always creates:

role = CUSTOMER

Client cannot submit:
- role
- isAdmin
- permissions
- admin
- privilege

Email:
- normalized
- case-insensitive unique

Phone:
- normalized
- validated

Password:
- securely hashed
- never logged
- never returned
- never stored plaintext

Authentication failure:
"Invalid email or password."

Never reveal whether the account exists.

======================================================================
11. EMAIL VERIFICATION — FINAL
======================================================================

Email verification is REQUIRED for full account activation.

Policy:

- Registration creates the customer.
- Customer may log in before verification.
- Unverified customers enter a restricted account state.
- Unverified customers may browse and manage basic account context.
- Unverified customers CANNOT create orders.
- Unverified customers CANNOT redeem points.
- Unverified customers CANNOT claim referral rewards directly.
- Admin account is exempt from email verification requirement.

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
- single-use
- expires after 15 minutes
- replay protected
- never logged raw

Resend verification:
- rate limited

======================================================================
12. PASSWORD RESET — FINAL
======================================================================

Reset token:
- cryptographically secure
- hashed before storage
- single-use
- expires after 15 minutes
- replay protected
- never logged

Reset request uses generic response.

Rate-limited.

======================================================================
13. SESSION POLICY
======================================================================

Use secure HttpOnly cookies.

Production:
- Secure
- HttpOnly
- SameSite appropriate to architecture

Default customer session maximum age:
30 days

Admin session maximum age:
12 hours

Session activity may be refreshed safely.

Critical Admin operations may require reauthentication in future.

Never place authoritative role information in localStorage.

======================================================================
14. REFERRAL SYSTEM — FINAL
======================================================================

Every user receives exactly one immutable Referral Code.

Referral Code:
- server generated
- unique
- stable
- not editable
- collision resistant
- does not expose User ID

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
15. REFERRAL LINK
======================================================================

Optional referral URL:

/register?ref=VEN-XXXXXX

The URL parameter is not authoritative.

Server validates code.

Do not store referral attribution merely because browser visited a URL.

Only successful registration creates Referral relation.

======================================================================
16. REFERRAL DATA MODEL
======================================================================

Referral:

id
referrerId
refereeId
createdAt
qualifiedAt nullable
rewardTransactionId nullable

Constraints:

- refereeId unique
- one referee → one referrer
- relationship immutable

======================================================================
17. REFERRAL REWARD — FINAL
======================================================================

Reward:
50 Points

Receiver:
REFERRER

Trigger:
REFEREE'S FIRST DELIVERED ORDER

Exactly once.

Never award at:
- registration
- account creation
- cart
- checkout
- confirmation
- processing
- shipped

======================================================================
18. REFERRAL CORRECTION RULE — FINAL
======================================================================

If referee's first qualifying order changes:

DELIVERED
→
CUSTOMER_REFUSED

and the 50-point referral reward was already granted:

IMMEDIATELY reverse the reward using a ledger entry:

REFERRAL_REWARD
→
POINTS_REVERSAL

Do NOT delete the historical reward transaction.

Record:
- original reward
- reversal
- correction reason
- actor
- timestamp
- related order

If the order later changes:

CUSTOMER_REFUSED
→
DELIVERED

and the referral reward is no longer currently active:

re-award exactly 50 points through a new ledger transaction.

Never allow more than one active referral reward for the same referee's first qualifying delivered order.

======================================================================
19. PRODUCT ARCHITECTURE
======================================================================

Product has no authoritative stock.

Stock exists only on ProductVariant.

Every active Product MUST have:
at least one active ProductVariant.

Product concept:

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
20. VARIANT ARCHITECTURE
======================================================================

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
21. DELIVERY POINTS REWARD — FINAL
======================================================================

Delivery reward is configured per product.

Product field:

defaultDeliveryPointsReward

Variant may override:

deliveryPointsReward

Value:
integer >= 0

Semantics:
reward is earned PER DELIVERED UNIT.

Example:

Product reward = 10 points
Quantity delivered = 3

Reward:
30 points

OrderItem MUST snapshot:

pointsRewardSnapshot

The snapshot represents the exact reward-per-unit at order creation.

Total delivery reward:

sum(
  pointsRewardSnapshot
  × deliveredQuantity
)

across eligible order items.

======================================================================
22. POINTS-REDEMPTION DELIVERY REWARD — FINAL
======================================================================

Setting:

AWARD_DELIVERY_POINTS_ON_POINTS_REDEMPTION

Type:
boolean

Current default:
FALSE

Meaning:

If FALSE:
points-purchased product lines earn 0 delivery points.

If TRUE:
points-purchased product lines earn their normal configured
deliveryPointsReward.

Cash-purchased product lines always use their configured reward.

This rule is explicit and deterministic.

No percentage-of-price calculation exists.

No dynamic formula exists.

======================================================================
23. POINTS ARE NOT MONEY
======================================================================

Points:
- are not EGP
- cannot be converted to EGP
- cannot be withdrawn
- cannot become cash
- cannot function as generic cash discount
- cannot directly reduce an EGP subtotal

Points can ONLY be used for:

1. Full Product Redemption
2. Full Free Shipping Redemption

======================================================================
24. PRODUCT POINTS REDEMPTION — FINAL
======================================================================

Product redemption is ALL-OR-NOTHING.

For a points-enabled product:

Cash Price:
1500 EGP

Points Price:
500 Points

Options:

CASH PURCHASE
→ 1500 EGP

POINTS PURCHASE
→ 500 Points

There is NO:

250 Points + 750 EGP
or
100 Points + 1200 EGP

Partial product redemption is forbidden.

======================================================================
25. MIXED CART — FINAL
======================================================================

A cart MAY contain:

- cash-purchased lines
- points-purchased lines

within the same order.

Each OrderItem has:

purchaseMode:
CASH
or
POINTS

A points-purchased line:
- pays full points price
- pays zero cash product price

A cash line:
- pays normal cash price

Shipping remains a separate settlement component.

======================================================================
26. ORDER FUNDING — FINAL
======================================================================

Do NOT call CASH / POINTS / MIXED "payment gateway methods".

The actual payment method in Phase 1 is:

CASH_ON_DELIVERY

The order's funding composition is separate:

CASH_ONLY
POINTS_ONLY
MIXED

Examples:

Cash products + normal shipping:
CASH_ONLY

Points product + normal COD shipping:
MIXED

Cash product + free shipping:
MIXED

Points product + free shipping:
POINTS_ONLY

Mixed cart with cash and points items:
MIXED

This resolves the previous semantic ambiguity.

======================================================================
27. PAYMENT METHOD — FINAL
======================================================================

Current production payment method:

CASH_ON_DELIVERY

Meaning:
customer pays cash to courier at delivery.

No current:
- card gateway
- bank transfer
- wallet
- installment provider
- online payment provider

Do NOT implement them.

Future payment support must use PaymentProvider abstraction.

======================================================================
28. PAYMENT DATA MODEL
======================================================================

Order:

paymentMethod = CASH_ON_DELIVERY

Optional Payment entity may exist for future extension.

Do NOT create fake Payment rows claiming electronic settlement.

Cash collection status is derived from order fulfillment in Phase 1:

DELIVERED
→ COD expected/fulfilled

CUSTOMER_REFUSED
→ COD not collected

No financial gateway settlement exists in Phase 1.

======================================================================
29. SHIPPING
======================================================================

One global shipping price.

Setting:

GLOBAL_SHIPPING_PRICE

Example:
70 EGP

All governorates use same price.

No governorate-specific shipping.

======================================================================
30. FREE SHIPPING
======================================================================

Setting:

FREE_SHIPPING_POINTS_THRESHOLD

Example:
200 Points

If customer has >= threshold:
customer may redeem full free shipping.

Shipping:
0 EGP

Otherwise:
full shipping amount

No partial shipping discount.

======================================================================
31. SHIPPING SNAPSHOT
======================================================================

At order creation:

shippingAmountSnapshot

must be stored.

If:
70 → 80

existing order remains:
70

new order:
80

======================================================================
32. DELIVERY ESTIMATE
======================================================================

Setting:

EXPECTED_DELIVERY_DURATION

Examples:
2–3 Days
3–5 Days
5–7 Days

Current global value shown on:
- homepage
- product detail
- checkout
- delivery information

At order creation:

estimatedDeliveryTimeSnapshot

is stored.

Later setting changes do not modify historical orders.

======================================================================
33. CHECKOUT CONTACT DATA
======================================================================

Required:

fullName
primaryPhone
secondaryPhone
whatsappNumber

Optional toggle:

whatsappSameAsPrimary

If checked:
WhatsApp = primary phone

Server stores the resolved value.

======================================================================
34. CHECKOUT ADDRESS
======================================================================

Required structured address:

governorate
cityOrCenter
area
street
buildingNumber
floor
apartmentNumber
landmark
addressNotes

Do NOT use one free-text address as the only address source.

======================================================================
35. CHECKOUT SERVER FLOW
======================================================================

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
11. Resolve item purchase modes
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
22. Generate idempotency result
23. Deduct stock atomically
24. Deduct points atomically
25. Create Order
26. Create OrderItems
27. Create PointsTransaction records
28. Create InventoryTransaction records
29. Create audit event where needed
30. Persist idempotency result
31. Commit

Any failure:
ROLLBACK ALL MUTATIONS.

======================================================================
36. CHECKOUT IDEMPOTENCY — FINAL
======================================================================

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

Default retention:
7 days

Same key + same fingerprint:
return same business result.

Same key + different fingerprint:
reject with IDEMPOTENCY_CONFLICT.

======================================================================
37. ORDER MODEL
======================================================================

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
38. ORDER ITEM MODEL
======================================================================

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

No historical order is rebuilt from current Product state.

======================================================================
39. PAYMENT / TOTAL SEMANTICS
======================================================================

cashSubtotal:
sum of cash-mode product lines

pointsSubtotal:
sum of points-mode product lines

shippingAmount:
cash shipping charged

totalCashDue:
cashSubtotal + shippingAmount

pointsTotalRedeemed:
product points + shipping points

This removes ambiguity.

Example:

Cash product 1500
Paid shipping 70

cashSubtotal = 1500
pointsSubtotal = 0
shipping = 70
totalCashDue = 1570

Example:

Points product 500
Paid shipping 70

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
40. ORDER STATUS
======================================================================

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
- Admin authorization
- reason
- audit
- points effects
- inventory effects
- idempotency

======================================================================
41. ORDER CANCELLATION
======================================================================

Cancellation before shipment:

- restore exact inventory
- refund product points
- refund shipping points
- create ledger entries
- update order
- audit

Cancellation after shipment:
NOT permitted through normal cancellation flow.

A separate return/refusal workflow must be used.

======================================================================
42. CONFIRMATION — FINAL EDITABLE FIELDS
======================================================================

NORMAL CONFIRMATION EDIT MODE may edit ONLY:

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

Every change:
creates OrderDataChange.

The following are READ-ONLY during normal Confirmation:

- product selection
- product IDs
- variant IDs
- SKU
- unit price
- points price
- product purchase mode
- order totals
- shipping amount
- points already reserved
- status

======================================================================
43. ORDER AMENDMENT FLOW — FINAL
======================================================================

If the customer requests:

- change product
- change variant
- change quantity
- remove item
- add item

DO NOT mutate OrderItem directly from Confirmation screen.

Use:

Order Amendment Flow

Process:

1. verify order status is amendable
2. authenticate Admin
3. capture requested change
4. calculate new authoritative order state
5. determine stock delta
6. determine points delta
7. determine cash delta
8. reverse old pending effects where required
9. apply new effects transactionally
10. update order items/snapshots
11. create amendment audit
12. create OrderDataChange
13. create points/inventory ledger entries where applicable
14. produce new order totals
15. preserve full history

Order amendment permitted only before SHIPPED.

======================================================================
44. CONFIRMATION ATTEMPTS
======================================================================

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
45. THREE FAILED CALLS
======================================================================

After 3 failed phone attempts:

DO NOT AUTO-CANCEL.

Order remains:

PENDING_CONFIRMATION

Display:

HIGH_ATTEMPT_COUNT

This is a mandatory business rule.

======================================================================
46. WHATSAPP
======================================================================

Phase 1:
manual only

Customer provides WhatsApp.

Admin can:
- copy number
- open WhatsApp
- prepare prefilled text
- record manual result

No automated WhatsApp API in Phase 1.

Architecture:

IWhatsAppConfirmationProvider

Current:
ManualWhatsAppConfirmationProvider

Future:
AutomatedWhatsAppConfirmationProvider

======================================================================
47. INVENTORY
======================================================================

Authoritative source:

ProductVariant.stock

At checkout:

atomic deduction.

Concept:

UPDATE ProductVariant
SET stock = stock - quantity
WHERE id = variantId
AND stock >= quantity

If no rows affected:
INSUFFICIENT_STOCK

Rollback.

======================================================================
48. INVENTORY LEDGER
======================================================================

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

Ledger is append-only.

======================================================================
49. CUSTOMER REFUSED INVENTORY
======================================================================

Customer refused does NOT restore inventory automatically.

Workflow:

CUSTOMER_REFUSED
→ RETURN_IN_TRANSIT
→ WAREHOUSE_RECEIVED
→ WAREHOUSE_RETURN_VERIFIED
→ INVENTORY_RESTORED

Phase 1 authorization:

ADMIN ONLY

Future:
permission-based role may be introduced.

Warehouse Return Verified requires:
- Admin authorization
- reason if manual
- audit
- idempotency

======================================================================
50. RETURN VERIFICATION
======================================================================

Only ADMIN can currently mark:

WAREHOUSE_RETURN_VERIFIED

Action:

- verify physical return
- create InventoryTransaction
- restore exact quantity
- prevent duplicate restoration
- audit

No automatic restoration before this state.

======================================================================
51. DELIVERY EXCEL
======================================================================

Required:

Order ID
Delivery Status

Optional:

Delivery Date
Notes

Allowed:

DELIVERED
CUSTOMER_REFUSED

Each row:

validated
processed
audited
idempotent

======================================================================
52. DELIVERY PROCESSING
======================================================================

DELIVERED:

- validate legal state transition
- update order
- award eligible item delivery points
- evaluate referral reward
- audit
- idempotency

CUSTOMER_REFUSED:

- update order
- award ZERO delivery points
- do not issue referral reward
- create return workflow
- audit

No inventory restoration at this point.

======================================================================
53. DELIVERY POINTS — COMPUTATION
======================================================================

For every delivered eligible OrderItem:

reward =
pointsRewardSnapshot × deliveredQuantity

Total order delivery reward:

SUM(all eligible order item rewards)

Points are awarded once.

If points purchased product and:

AWARD_DELIVERY_POINTS_ON_POINTS_REDEMPTION = FALSE

that item reward = 0.

If TRUE:
use normal configured reward.

======================================================================
54. DELIVERY CORRECTION
======================================================================

DELIVERED → CUSTOMER_REFUSED:

If delivery points were previously awarded:
create reversal ledger.

If referral reward for first delivery was awarded:
create referral reward reversal.

No ledger history is deleted.

CUSTOMER_REFUSED → DELIVERED:

re-award eligible delivery points only if no current active reward exists.

Re-award referral 50 points only if the first-delivery condition is once again satisfied and previous reward is currently reversed.

All transitions are idempotent.

======================================================================
55. POINTS LEDGER
======================================================================

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

No deletion of ledger history.

======================================================================
56. POINTS BALANCE
======================================================================

pointsBalance may be cached.

Ledger remains authoritative.

Invariant:

pointsBalance >= 0

All changes:
atomic

No direct arbitrary mutation from Admin UI.

Admin adjustment:

ledger + balance update + audit

one transaction.

======================================================================
57. ADMIN POINTS ADJUSTMENT
======================================================================

Admin must provide:

customer
amount
direction
reason

Positive or negative adjustment must pass:
- validation
- authorization
- transaction
- ledger
- audit

Never:
UPDATE users SET pointsBalance = X

without ledger.

======================================================================
58. CUSTOMER POINTS HISTORY
======================================================================

Display:

+50 Referral Reward
-500 Product Redemption
+500 Product Refund
-200 Free Shipping Redemption
+200 Free Shipping Refund
+delivery reward
-admin adjustment where visible

Use explicit "Points".

Never display points with EGP symbol.

======================================================================
59. PRODUCT POINTS CATALOG
======================================================================

Only show products that are:

- active
- pointsEnabled
- active variant
- stock > 0
- valid points price

Filter:
- category
- points range
- availability
- variant availability

======================================================================
60. ADMIN PRODUCT MANAGEMENT
======================================================================

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
61. PRODUCT ADMIN FORM
======================================================================

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

No raw JSON fields for normal administrators.

======================================================================
62. VARIANT BUILDER
======================================================================

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
63. IMAGE MANAGEMENT
======================================================================

Admin-only.

Support:

- upload
- preview
- multiple images
- primary image
- reorder
- replace
- delete
- alt text

Provider:

IImageStorageProvider

Server validates:
- actual file content
- type
- extension
- size
- authorization
- storage key

======================================================================
64. IMAGE LIFECYCLE
======================================================================

Replacement:

upload new
→ validate
→ persist new metadata
→ commit DB
→ delete old storage object

If DB fails:
cleanup new upload

If cleanup fails:
log orphan warning

Never corrupt current image metadata because obsolete cleanup failed.

======================================================================
65. CATEGORY SYSTEM
======================================================================

Category:

id
name
slug
parentId nullable
isActive
createdAt
updatedAt

Rules:
- unique slug
- inactive cannot receive new products
- existing history preserved
- prevent cycles
- prefer deactivation

======================================================================
66. CUSTOMER NAVIGATION
======================================================================

SHOP:
All Products
Categories
New Arrivals
Offers

VEN+ REWARDS:
Points Products
My Points
Points History

ACCOUNT:
My Orders
Profile
Addresses
Settings

======================================================================
67. CUSTOMER HOMEPAGE
======================================================================

Hero
Categories
Featured Products
New Arrivals
Rewards
Points Products
Delivery Estimate
Shipping Benefit
Current Promotions/Offers where actual promotion exists

Authenticated:
You have X Points

======================================================================
68. SEARCH
======================================================================

Support:

- localized product title
- category
- SKU where appropriate
- relevant attributes where justified

Search:
- normalized
- length limited
- server-side
- safely queried
- paginated

Search must never show inactive customer-ineligible entities.

======================================================================
69. CATALOG FILTERS
======================================================================

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
70. CART
======================================================================

Cart is persistent.

Client state is a mirror.

Cart operations:

add
remove
increment
decrement
set quantity
clear

Every checkout:
full server revalidation.

======================================================================
71. GUEST CART
======================================================================

If implemented:

secure guest cart token.

On authentication:
validate
merge
deduplicate
respect stock

Do not lose an authenticated cart silently.

======================================================================
72. CUSTOMER ACCOUNT
======================================================================

Profile
Orders
Points
Points History
Referral Code
Referral Statistics
Addresses
Settings

Address changes:
do NOT affect historical orders.

======================================================================
73. CUSTOMER ORDER HISTORY
======================================================================

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
74. CUSTOMER ORDER DETAIL
======================================================================

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

Do not recompute historical commercial values from current product data.

======================================================================
75. ADMIN DASHBOARD
======================================================================

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
76. ADMIN ORDERS
======================================================================

Filters:
- Order ID
- customer
- status
- confirmation
- date
- governorate

Actions:
- view
- confirmation
- authorized edit
- cancel if legal
- amend
- correction if authorized

Pagination mandatory.

======================================================================
77. ADMIN CUSTOMER PAGE
======================================================================

Show:

profile
contact
orders
points
points history
referral
account status

Do not expose secrets.

======================================================================
78. ADMIN INVENTORY
======================================================================

Show:

product
variant
SKU
stock
low stock
out of stock
last movement

Actions:

Manual Adjustment

Adjustment requires:
quantity
direction
reason

Creates ledger + audit.

======================================================================
79. ADMIN POINTS
======================================================================

Show:

balance
earned
redeemed
refunded
recent ledger

Allow controlled Admin adjustment.

======================================================================
80. ADMIN REFERRAL
======================================================================

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
81. ADMIN DELIVERY
======================================================================

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
82. ADMIN SETTINGS
======================================================================

General
Shipping
Points
Referral
Inventory
Localization
System

Each setting:
- typed
- validated
- audited
- timestamped
- actor recorded

======================================================================
83. APP SETTINGS — FINAL
======================================================================

GLOBAL_SHIPPING_PRICE
FREE_SHIPPING_POINTS_THRESHOLD
EXPECTED_DELIVERY_DURATION
AWARD_DELIVERY_POINTS_ON_POINTS_REDEMPTION
REFERRAL_REWARD_POINTS
LOW_STOCK_THRESHOLD

Current defaults:

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

These are configurable runtime business settings.

Historical transactions are NOT rewritten when settings change.

======================================================================
84. NOTIFICATION TYPES — FINAL
======================================================================

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
85. NOTIFICATION CREATION RULES
======================================================================

ORDER_CONFIRMATION_REQUIRED:
exactly once when order enters Pending Confirmation.

HIGH_CONFIRMATION_ATTEMPTS:
created when attempt count reaches 3.
Do not create duplicates for the same threshold.

LOW_STOCK:
created when stock crosses from > threshold to <= threshold.
Do not create repeatedly while still below threshold.

OUT_OF_STOCK:
created when stock transitions to 0.

When stock becomes positive again and later reaches zero:
a new notification may be created.

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

======================================================================
86. NOTIFICATION STORAGE
======================================================================

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
87. FINANCIAL REPORTING — FINAL DEFINITIONS
======================================================================

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

POINTS REDEMPTION IS NOT CASH REVENUE.

Points have zero EGP monetary value in reporting.

FREE SHIPPING affects cash shipping amount:
0 EGP when redeemed.

Do not include cancelled orders in Gross Sales.

Do not classify Pending Confirmation as realized revenue.

======================================================================
88. REPORTING TIME SEMANTICS
======================================================================

Reports must specify date basis.

Default:
createdAt for order volume/bookings

For delivered revenue:
delivery transition timestamp

For cancelled:
cancellation timestamp where available

For refused:
refusal transition timestamp

Never mix event timestamps silently.

======================================================================
89. ORDER VALUE VS CASH COLLECTION
======================================================================

Because payment is COD:

An order can exist without cash being collected.

Therefore:

Order Value:
commercial obligation/sale booking

Collected/Realized Revenue:
Delivered COD orders

Do NOT call pending COD revenue "collected revenue".

======================================================================
90. EXCEL EXPORT
======================================================================

Admin export supports:

date range
status
confirmation status
customer
governorate

Canonical key:
Order ID

Export must contain:
- stable headers
- deterministic formats
- safe cell encoding
- no formula injection
- localized human-readable columns where useful
- canonical machine-readable fields where needed

======================================================================
91. ORDER EXCEL IMPORT
======================================================================

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
92. EXCEL DUPLICATE KEY — FINAL
======================================================================

Exact file replay:
fileHash

Constraint:
same import type + same fileHash
→ duplicate import

Within one import:
(importId, orderId)
must be unique

Normalized row fingerprint:

SHA-256(
  importType
  +
  orderId
  +
  sorted normalized editable field/value pairs
)

Store fingerprint.

If identical business mutation is re-submitted:
NO-OP / ALREADY_PROCESSED

If same order has a legitimately different approved change:
new fingerprint
→ process

This makes duplicate detection deterministic.

======================================================================
93. EXCEL EDITABLE FIELDS — FINAL
======================================================================

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

If future approval enables more fields:
update whitelist + schema + audit + tests.

======================================================================
94. EXCEL SECURITY
======================================================================

Excel is untrusted.

Validate:
- extension
- actual content
- file size
- workbook
- sheet structure
- required headers
- types
- Order IDs
- status values
- allowed columns

Protect against:
- formula injection
- malformed workbook
- memory abuse
- mass assignment
- duplicate processing
- malicious payloads

Never execute formulas.

======================================================================
95. EXCEL PERFORMANCE
======================================================================

No arbitrary benchmark claims.

Use:
- streaming
- batching
- limited selected columns
- bounded memory
- efficient bulk operations
- progress tracking

Data integrity > throughput.

======================================================================
96. RBAC — FINAL
======================================================================

Current roles:

CUSTOMER
ADMIN

No public role selection.

All privileged operations use server authorization.

Examples of future permission concepts:

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

Do not implement future subroles until approved.

Current authorization:
ADMIN only.

======================================================================
97. ADMIN RETURN VERIFICATION PERMISSION
======================================================================

Current Phase 1:

Only ADMIN can:
- mark warehouse received
- mark return verified
- restore inventory

Future role granularity may introduce:

delivery.return.verify

but not now.

======================================================================
98. SECURITY
======================================================================

Implement:

- secure sessions
- HttpOnly cookies
- Secure production cookies
- SameSite
- rate limiting
- Zod
- server authorization
- anti-enumeration
- Argon2id
- CSRF protection as applicable
- security headers
- safe uploads
- Excel security
- IDOR prevention
- privilege escalation prevention
- mass assignment prevention
- audit logging
- replay protection
- idempotency

Never expose:
- password
- password hash
- token
- OTP
- secret
- internal stack trace

======================================================================
99. RATE LIMITS — FINAL BASELINE
======================================================================

These are default operational limits and may be adjusted through secure infrastructure config,
but implementation must start with these values.

LOGIN:
5 failed attempts / 15 minutes per IP + normalized email
20 attempts / 15 minutes per IP

After repeated failures:
progressive delay
and temporary throttling

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
5 imports / hour per Admin

DELIVERY EXCEL IMPORT:
5 imports / hour per Admin

IMAGE UPLOAD:
60 image mutations / hour per Admin

Sensitive Admin mutation APIs:
100 requests / minute per Admin session as baseline.

Implement rate limiting using appropriate production storage;
do not rely on process-local memory in multi-instance deployment.

======================================================================
100. RETENTION POLICY — FINAL BASELINE
======================================================================

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
expire by policy;
inactive sessions invalidated after 30 days customer,
12 hours maximum Admin session

Email verification tokens:
15 minutes

Password reset tokens:
15 minutes

Idempotency records:
7 days

Excel import metadata:
24 months

Uploaded raw import files:
90 days unless required longer for audit/compliance

DigestExecution:
24 months

Temporary image/orphan cleanup records:
90 days

These are baseline policies and may be extended by legal/business requirements.

Never delete commercial history solely for convenience.

======================================================================
101. SOFT DELETE
======================================================================

Prefer:
isActive / archivedAt

for:
- products
- categories
- users
- variants

Do not destroy referenced commercial history.

======================================================================
102. IDOR PROTECTION
======================================================================

Every protected object operation must verify ownership/relationship.

Examples:

Order:
orderId + authenticatedUserId

Image:
imageId + productId

Variant:
variantId + productId

Customer:
userId from authenticated Admin/permission

Never trust IDs merely because they are difficult to guess.

======================================================================
103. MASS ASSIGNMENT
======================================================================

Never use:

update(data)

with uncontrolled client object.

Use:
validated schema
+
explicit mapping
+
domain command

Never allow:
role
pointsBalance
stock
price
total
permissions

to be mass-assigned.

======================================================================
104. MONEY
======================================================================

Never use floating-point numbers for authoritative monetary calculations.

Use precise decimal/integer representation.

Store monetary values consistently.

Document currency:
EGP

Points:
integer

Quantity:
positive integer

======================================================================
105. IMAGE SECURITY
======================================================================

Validate actual content.

Restrict:
- file type
- size
- extension
- image dimensions
- storage destination

Use server-generated storage keys.

Never execute uploaded content.

======================================================================
106. PERFORMANCE
======================================================================

Optimize:

- no N+1
- indexed queries
- pagination
- selective Prisma fields
- aggregate stock queries
- efficient variants
- efficient images
- bounded Excel processing
- minimized client JS
- Server Components where appropriate
- Suspense/loading boundaries

Do not introduce complexity without evidence.

======================================================================
107. SEARCH QUERY SAFETY
======================================================================

Search:
- trim
- length limit
- normalize
- safely parameterize

No raw SQL interpolation.

Sort fields:
strict whitelist.

Filter fields:
strict whitelist.

======================================================================
108. SEO
======================================================================

Public storefront:

- localized metadata
- canonical URLs
- Open Graph
- product metadata
- category metadata

Do not index:
- Admin
- account
- internal API
- private routes

Generate sitemap for public content if appropriate.

======================================================================
109. OBSERVABILITY
======================================================================

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
- passwords
- hashes
- tokens
- OTPs
- cookies
- authorization headers

======================================================================
110. HEALTH CHECKS
======================================================================

Provide operational endpoints where appropriate:

/api/health
/api/ready

Distinguish:
process alive
from
database/storage readiness

Do not leak sensitive diagnostics.

======================================================================
111. DAILY DIGEST
======================================================================

Schedule:
00:00 UTC

Aggregate previous 24h:

- Gross Merchandise Sales
- Gross Order Value
- Delivered Revenue
- Refused Value
- Cancelled Value
- Outstanding COD
- New customers
- Delivered orders
- Low stock
- Top variants
- Points redeemed
- Points earned
- Referral rewards
- Import failures

Use:

IEmailProvider

Track:
DigestExecution

No duplicate send.

======================================================================
112. REPORT DEFINITIONS
======================================================================

Revenue metrics must always display their definition.

Example:

"Delivered Revenue — Last 24 Hours"

not:

"Revenue"

unless the semantic definition is unambiguous.

======================================================================
113. ORDER AMENDMENT FINANCIAL RULE
======================================================================

If an order amendment changes:
- quantity
- product
- variant
- purchaseMode

then the system must recompute:

cashSubtotal
pointsSubtotal
shipping
cashDue
pointsRedeemed
delivery reward snapshot
inventory effects

Any old reservation/effect must be reversed appropriately.

No silent mutation.

======================================================================
114. CART / POINTS PURCHASE
======================================================================

The cart may retain intended purchaseMode per item.

At checkout:
server revalidates.

If points balance is insufficient:
entire transaction fails.

No partial conversion to cash.

The user must explicitly change purchase mode if the UI supports it.

======================================================================
115. CUSTOMER PRODUCT PURCHASE UX
======================================================================

For points-enabled product:

Cash:
1500 EGP

OR

500 Points

Actions:

Add to Cart
Buy with Points

If "Buy with Points":
the item enters cart with:

purchaseMode = POINTS

No hidden automatic conversion.

======================================================================
116. FREE SHIPPING REDEMPTION UX
======================================================================

At checkout:

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
117. POINTS + SHIPPING DISPLAY
======================================================================

For:

500 product points
70 cash shipping

display:

Product:
500 Points

Shipping:
70 EGP

Total Cash Due:
70 EGP

Total Points:
500

For:

500 product points
200 free shipping

display:

Product:
500 Points
Free Shipping:
200 Points

Total Cash Due:
0 EGP

Total Points:
700

======================================================================
118. PAYMENT LANGUAGE
======================================================================

DO NOT display:
"Payment Method: Points"

Instead:

Payment Method:
Cash on Delivery

Funding:
Points Redemption / Mixed / Cash

This prevents semantic confusion.

======================================================================
119. DELIVERY STATUS
======================================================================

DeliveryStatus:

DELIVERED
CUSTOMER_REFUSED

Internal return states:

RETURN_IN_TRANSIT
WAREHOUSE_RECEIVED
WAREHOUSE_RETURN_VERIFIED

These internal states are not necessarily customer-facing order statuses.

======================================================================
120. CUSTOMER-FACING ORDER STATUS
======================================================================

Customer-facing status should remain simple.

Primary display:

Pending confirmation
Confirmed
Processing
Shipped
Delivered
Customer refused
Cancelled

Do not expose internal warehouse states unless useful.

======================================================================
121. AUDIT ARCHITECTURE
======================================================================

Separate:

AuditLog
OrderDataChange
OrderConfirmationAttempt
OrderStatusHistory
PointsTransaction
InventoryTransaction
Import history

Do not collapse these into one generic table.

======================================================================
122. AUDIT IMMUTABILITY
======================================================================

Audit records:
append-only

No normal edit.
No normal delete.

If retention cleanup is later required:
controlled maintenance operation.

======================================================================
123. DATABASE ENTITIES
======================================================================

Required conceptual entities:

User
Referral

Category
Product
ProductVariant
ProductImage

Cart
CartItem

Order
OrderItem
OrderStatusHistory

OrderConfirmation
OrderConfirmationAttempt
OrderDataChange
OrderAmendment

PointsTransaction
InventoryTransaction

DeliveryImport
DeliveryImportRow

Notification

AuditLog
AppSetting

DigestExecution
IdempotencyKey

Payment
only where future architecture requires it

======================================================================
124. USER MODEL
======================================================================

User:

id
email
passwordHash
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

======================================================================
125. ADDRESS MODEL
======================================================================

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

Historical orders DO NOT reference mutable Address as their source of truth.

They snapshot it.

======================================================================
126. PRODUCT IMAGE MODEL
======================================================================

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
127. ORDER CONFIRMATION MODEL
======================================================================

OrderConfirmation:

orderId
status
method
confirmedBy
confirmedAt
notes

======================================================================
128. ORDER AMENDMENT MODEL
======================================================================

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

Only APPROVED/validated amendments may apply business effects.

======================================================================
129. IMPORT MODEL
======================================================================

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

Row:

id
importId
orderId
rowFingerprint
rowNumber
status
errorCode
errorMessage
createdAt

Unique:
importId + orderId
for delivery/order imports where one order may appear once per file.

======================================================================
130. NOTIFICATION MODEL
======================================================================

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
131. SETTINGS HISTORY
======================================================================

Business-critical setting changes must be auditable.

Do not rely only on current AppSetting value.

Audit captures:
- previous
- new
- actor
- timestamp
- reason if required

======================================================================
132. API / SERVER ACTION SECURITY CONTRACT
======================================================================

Every state-changing operation:

Authenticate
→ Authorize
→ Validate
→ Service
→ Transaction
→ Audit
→ Return safe DTO

Never return raw Prisma model blindly.

======================================================================
133. RESPONSE DTO POLICY
======================================================================

Server returns DTOs.

Do not expose:
- passwordHash
- roles unnecessarily
- internal audit data
- secret metadata
- provider credentials
- internal errors

======================================================================
134. ERROR TAXONOMY
======================================================================

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
INTERNAL_ERROR

Map to localized safe messages.

======================================================================
135. ADMIN DASHBOARD INFORMATION ARCHITECTURE
======================================================================

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
136. CUSTOMER INFORMATION ARCHITECTURE
======================================================================

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
137. ADMIN PRODUCT TABLE
======================================================================

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
138. ADMIN INVENTORY TABLE
======================================================================

Product
Variant
SKU
Current Stock
Low Stock
Status
Last Movement
Actions

======================================================================
139. ADMIN ORDER TABLE
======================================================================

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
140. ADMIN CONFIRMATION TABLE
======================================================================

Order ID
Customer
Created
Attempts
Last Attempt
Status
High Attempt Warning
Actions

======================================================================
141. ADMIN REFERRAL TABLE
======================================================================

Referral Code
Referrer
Referee
Registered
First Delivered Order
Reward State
Reward Amount
Actions

======================================================================
142. ADMIN IMPORT TABLE
======================================================================

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
143. ADMIN AUDIT TABLE
======================================================================

Timestamp
Actor
Action
Entity
Entity ID
Summary
Details

Read-only.

======================================================================
144. CUSTOMER UI PRINCIPLES
======================================================================

Always provide:
- loading
- empty
- error
- success
- retry

Never fake zero values if data failed to load.

Never show stale financial values as current without indication.

======================================================================
145. RESPONSIVE DESIGN
======================================================================

Support:
mobile
tablet
desktop

No critical customer action depends on hover.

Admin mobile:
collapsible navigation
usable tables
responsive detail pages

======================================================================
146. ACCESSIBILITY
======================================================================

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
147. SEO
======================================================================

Public pages:
metadata
canonical
Open Graph
structured content
localized URLs

Private/admin:
no indexing

======================================================================
148. CACHING
======================================================================

Cache only data safe to cache.

Never use cached frontend values as checkout authority.

Checkout always re-reads:
price
points price
stock
shipping
delivery estimate
points balance

======================================================================
149. PERFORMANCE
======================================================================

Mandatory:
- no N+1
- pagination
- selective DB fields
- efficient images
- bounded Excel memory
- minimized JS
- proper indexes
- Server Components where useful
- Suspense where useful

======================================================================
150. TESTING STRATEGY
======================================================================

Vitest:
- unit
- services
- database
- transactions
- invariants
- concurrency

Playwright:
- registration
- verification
- login
- storefront
- cart
- checkout
- points
- referral
- Admin
- confirmation
- Excel
- delivery
- correction flows
- RTL/LTR

======================================================================
151. REQUIRED AUTH TESTS
======================================================================

Test:
- Admin login
- customer login
- wrong password
- role escalation
- unauthorized Admin
- email verification
- checkout blocked before verification
- password reset
- session expiry
- enumeration protection
- rate limit

======================================================================
152. REQUIRED PAYMENT TESTS
======================================================================

Because current payment is COD:

Test:
- CASH_ONLY
- POINTS_ONLY
- MIXED
- cash product + paid shipping
- points product + paid shipping
- cash product + free shipping
- points product + free shipping
- mixed cart
- cash due
- points due
- no fake gateway transaction

======================================================================
153. REQUIRED POINTS TESTS
======================================================================

Test:
- product redemption
- no partial product redemption
- mixed cart
- free shipping
- insufficient points
- refund
- duplicate refund
- delivery reward
- points-purchased reward setting
- correction reversal
- referral reward
- referral reversal
- re-award after correction
- Admin adjustment

======================================================================
154. REQUIRED REFERRAL TESTS
======================================================================

Test:
valid code
invalid code
self referral
no code
late assignment attempt
one referee / one referrer
first delivered reward
second delivered no second reward
delivered→refused reversal
refused→delivered re-award
duplicate import
concurrent processing

======================================================================
155. REQUIRED INVENTORY TESTS
======================================================================

Test:
- final-unit race
- insufficient stock
- cancellation restore
- duplicate cancellation
- refusal no restore
- return verification restore
- duplicate return verification
- Admin stock adjustment
- order amendment inventory delta

======================================================================
156. REQUIRED CONFIRMATION TESTS
======================================================================

Test:
- normal edit
- unauthorized field edit
- quantity change via normal confirmation rejected
- amendment flow
- 3 failed calls
- no automatic cancellation
- attempt audit
- post-shipment edit lock

======================================================================
157. REQUIRED EXCEL TESTS
======================================================================

Test:
- valid import
- invalid workbook
- missing columns
- protected field
- duplicate file
- duplicate row
- same row fingerprint
- intentionally changed row
- formula injection
- unauthorized Admin
- mixed rows
- transaction failure
- retry

======================================================================
158. REQUIRED REPORT TESTS
======================================================================

Verify:
Gross Merchandise Sales
Gross Order Value
Delivered Revenue
Refused Value
Cancelled Value
Outstanding COD

against known fixtures.

Ensure:
points do not inflate EGP revenue.

======================================================================
159. REQUIRED SECURITY AUDIT
======================================================================

Audit:
Authentication
Authorization
IDOR
Privilege escalation
CSRF
XSS
Injection
Mass assignment
Upload security
Excel security
Replay
Rate limiting
Points abuse
Referral abuse
Inventory abuse
Session security
Secret leakage

======================================================================
160. HEALTH / OPERATIONS
======================================================================

Provide:
health
readiness
structured logs
error tracking abstraction
cron execution tracking
import tracking
storage status where appropriate

Do not expose secrets.

======================================================================
161. DEPLOYMENT
======================================================================

Must support:
Vercel
Docker
Node

Secrets via environment.

No hard-coded secrets.

Provide:
.env.example

Never commit real credentials.

======================================================================
162. BACKUPS
======================================================================

Production documentation must define:

database backups
backup retention
restore test procedure
migration safety
object storage protection

Baseline:
daily database backup
30-day backup retention

This is an operational requirement, not a claim that infrastructure is automatically configured.

======================================================================
163. DOCUMENTATION
======================================================================

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

Documentation must match implementation.

======================================================================
164. REQUIREMENT TRACEABILITY
======================================================================

Every critical requirement must map:

Requirement
→ Domain
→ Service
→ Schema
→ UI
→ API/Action
→ Tests
→ Documentation

No critical requirement may exist only in prose.

======================================================================
165. BUSINESS RULE MATRIX
======================================================================

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

======================================================================
166. SECURITY MATRIX
======================================================================

Maintain:

Threat
Surface
Mitigation
Implementation
Test
Residual Risk
Status

======================================================================
167. RETENTION IMPLEMENTATION
======================================================================

Retention jobs may be scheduled for:

- expired sessions
- expired tokens
- operational notifications
- temporary imports
- old operational logs
- orphaned storage records

Never allow automated retention job to delete:
orders
order items
points ledger
inventory ledger
referral history
without explicit future legal/business policy.

======================================================================
168. LEGAL / POLICY SAFETY
======================================================================

Do not invent:
- tax
- VAT
- coupons
- discounts
- chargebacks
- bank transfer
- card gateway
- wallet provider
- installment plans

unless explicitly added later.

======================================================================
169. CRITICAL DOMAIN INVARIANTS
======================================================================

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
payment method in Phase 1 = CASH_ON_DELIVERY

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

======================================================================
170. PHASE 00 — DO NOT IMPLEMENT
======================================================================

Phase 00 must inspect:

- repository
- dependencies
- routes
- schema
- migrations
- services
- auth
- security
- UI
- imports
- storage
- tests

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
13. Test Matrix
14. Migration Plan
15. Legacy Cleanup Plan
16. File Tree
17. Deployment Model
18. Storage Model
19. Retention Model
20. Rate Limit Model
21. Notification Model
22. Reporting Definitions
23. FINAL CONFIGURATION MATRIX
24. Risk Register
25. Phase 01 Plan

No schema rewrite before the audit.

======================================================================
171. PHASE 00 — FINAL CONFIGURATION MATRIX
======================================================================

The resulting document MUST explicitly state:

Payment Method:
CASH_ON_DELIVERY

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
YES on DELIVERED→CUSTOMER_REFUSED

Referral Re-award:
YES on CUSTOMER_REFUSED→DELIVERED when condition becomes valid again

Delivery Reward:
per-unit configured reward

Points Purchase Delivery Reward:
default FALSE

Confirmation Editable Fields:
contact + address only

Product/Variant/Quantity Change:
Order Amendment Flow

Return Verification:
ADMIN ONLY

Email Verification:
required before checkout

Current Payment Gateway:
NONE

Current Payment Method:
CASH_ON_DELIVERY

Admin Identity:
DB User role ADMIN bootstrapped from environment

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

Idempotency Records:
7 days

Import Metadata:
24 months

Raw Import Files:
90 days

Backup Retention:
30 days

These are NOT questions.

They are the implementation baseline.

======================================================================
172. PHASE 01
======================================================================

After Phase 00 approval:

Implement:

- Prisma schema
- enums
- relations
- indexes
- constraints
- migrations
- seed/bootstrap architecture

No unrelated UI feature work.

======================================================================
173. PHASE 02
======================================================================

Implement:

- env validation
- DB infrastructure
- logging
- errors
- rate limiting
- security headers
- health checks
- Docker
- configuration

======================================================================
174. PHASE 03
======================================================================

Implement:

- Auth.js
- User
- Customer registration
- Admin bootstrap
- Login
- Logout
- Sessions
- RBAC

======================================================================
175. PHASE 04
======================================================================

Implement:

- email verification
- password reset
- rate limiting
- anti-enumeration

======================================================================
176. PHASE 05
======================================================================

Implement:

- storefront
- catalog
- categories
- search
- filters
- product details
- variants
- media
- points catalog
- i18n

======================================================================
177. PHASE 06
======================================================================

Implement:
- cart
- persistence
- variant selection
- stock validation
- optional guest merge

======================================================================
178. PHASE 07
======================================================================

Implement:

- checkout
- COD
- cash/points/mixed funding
- free shipping
- snapshots
- points
- inventory
- order creation
- idempotency

======================================================================
179. PHASE 08
======================================================================

Implement:

- points ledger
- delivery reward
- referral
- referral reversal
- refunds
- concurrency controls

======================================================================
180. PHASE 09
======================================================================

Payment abstraction only.

No electronic provider.

======================================================================
181. PHASE 10
======================================================================

Customer account.

======================================================================
182. PHASE 11
======================================================================

Admin dashboard.

======================================================================
183. PHASE 12
======================================================================

Confirmation.

======================================================================
184. PHASE 13
======================================================================

Order Excel.

======================================================================
185. PHASE 14
======================================================================

Delivery Excel + return verification.

======================================================================
186. PHASE 15
======================================================================

Manual WhatsApp abstraction.

======================================================================
187. PHASE 16
======================================================================

Security hardening.

======================================================================
188. PHASE 17
======================================================================

Complete test suite.

======================================================================
189. PHASE 18
======================================================================

Performance audit.

======================================================================
190. PHASE 19
======================================================================

Production audit.

======================================================================
191. PHASE GATE
======================================================================

A phase is COMPLETE only when:

- implementation exists
- requirements are traceable
- tests exist
- tests pass
- security reviewed
- data integrity reviewed
- documentation updated
- known issues documented
- Gate = PASS

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

======================================================================
192. DEFINITION OF DONE
======================================================================

A feature is NOT DONE because:

- UI exists
- endpoint returns 200
- code compiles
- database row exists
- happy path works

A feature is DONE only when:

UI
+
Validation
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
Error handling
+
Tests
+
Documentation

are aligned.

======================================================================
193. ABSOLUTE PROHIBITIONS
======================================================================

NEVER:

trust client price
trust client points
trust client stock
trust client role
trust client total

allow product partial points redemption

restore stock immediately on customer refusal

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

mark a phase complete without verification

======================================================================
194. FINAL ENGINEERING STANDARD
======================================================================

The system must work correctly under:

financial conditions
operational conditions
security conditions
concurrent conditions
human error
network retries
duplicate requests
stale state
malformed files
historical data mutation
status corrections
partial external failures

Optimize for:

"CORRECT UNDER REAL-WORLD CONDITIONS"

not:

"LOOKS FINISHED"

======================================================================
195. FINAL EXECUTION COMMAND
======================================================================

READ THIS ENTIRE SPECIFICATION.

AUDIT THE REPOSITORY.

RECONCILE THE CURRENT IMPLEMENTATION.

DO NOT INVENT ALTERNATIVE BUSINESS RULES.

DO NOT LEAVE CRITICAL BUSINESS SEMANTICS AMBIGUOUS.

DO NOT HIDE BUSINESS DECISIONS INSIDE UI CODE.

CENTRALIZE BUSINESS LOGIC.

MAKE TRANSACTIONAL OPERATIONS ATOMIC.

MAKE REPEATED OPERATIONS IDEMPOTENT.

MAKE HISTORICAL DATA RECONSTRUCTABLE.

MAKE ADMIN AUTHORITY SERVER-SIDE.

MAKE EXCEL UNTRUSTED.

MAKE POINTS LEDGER-BASED.

MAKE INVENTORY LEDGER-BASED.

MAKE REFERRAL REWARDS EXACTLY-ONCE.

MAKE STATUS CORRECTIONS FULLY AUDITABLE.

IMPLEMENT.
TEST.
VERIFY.
DOCUMENT.
AUDIT AGAIN.

END OF MASTER SPECIFICATION.
