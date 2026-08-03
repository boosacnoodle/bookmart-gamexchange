# Data Model

## Design Decisions

- Products represent physical sellable listings. For second-hand stock, quantity will often be `1`.
- Inventory state is explicit and transition-controlled.
- Category-specific metadata is stored in typed one-to-one extension tables rather than arbitrary unvalidated JSON.
- AI extraction data is preserved separately from approved product facts.
- Restricted cost/margin data is separated and permission-gated.
- Money is stored as integer minor units in EUR by default.
- Editorial shelves are independent entities whose identity survives individual product sales.

## Core Entities

### User

- id
- email
- name
- phone
- role: CUSTOMER, STAFF, ADMIN
- password/session identity fields depending auth provider
- marketingConsentAt
- createdAt
- updatedAt

### CustomerProfile

- userId
- delivery addresses
- contact preferences
- deletionRequestedAt
- exportedAt

### Product

- id
- name
- slug
- category
- subcategory
- creatorOrAuthor
- publisher
- publicationDate
- releaseDate
- edition
- isbn
- ean
- upc
- platform
- region
- format
- sku
- internalQrToken
- priceMinor
- currency
- description
- shortDescription
- conditionGrade
- conditionReport
- defects
- includedComponents
- missingComponents
- testedStatus
- authenticityStatus
- signedOrInscribedStatus
- provenanceNotes
- stockLocationId
- shelfLocation
- weightGrams
- dimensions
- shippingProfileId
- collectionOnly
- availability
- inventoryState
- quantity
- aiConfidence
- reviewStatus
- createdAt
- updatedAt
- publishedAt
- soldAt

### ProductFinancials

Admin-only/restricted:

- productId
- costPriceMinor
- expectedMarginMinor
- acquiredVia
- privateNotes

### ProductImage

- id
- productId
- storageKey
- originalFilename
- mimeType
- byteSize
- width
- height
- altText
- sortOrder
- crop
- rotation
- brightnessAdjustment
- backgroundCleanupVersion
- isPrimary
- createdAt

Image edits are non-destructive. No tool may alter photos to hide damage or materially misrepresent condition.

### Category Metadata Extensions

BookMetadata:

- productId
- isbn13
- isbn10
- author
- publisher
- publicationDate
- edition
- binding
- language
- signedStatus
- inscriptionNotes

GameMetadata:

- productId
- platform
- region
- publisher
- developer
- releaseDate
- ageRating
- boxedStatus
- manualIncluded
- discOrCartCondition

ConsoleMetadata:

- productId
- platformFamily
- model
- serialNumber
- region
- powerSupplyIncluded
- controllerCount
- cableIncludes
- testedStatus

MediaMetadata:

- productId
- mediaType
- artistOrDirector
- labelOrStudio
- format
- releaseDate
- region
- gradingNotes

CurioMetadata:

- productId
- objectType
- material
- maker
- period
- dimensions
- authenticityStatus
- provenanceNotes

### InventoryReservation

- id
- productId
- userId nullable
- basketId nullable
- orderId nullable
- status: ACTIVE, EXPIRED, CONVERTED, CANCELLED
- expiresAt
- createdAt
- updatedAt

Unique active reservation constraints prevent overselling one-off items.

### Order

- id
- orderNumber
- userId nullable
- email
- status: PENDING_PAYMENT, PAID, PAYMENT_FAILED, CANCELLED, FULFILLED, REFUNDED, PARTIALLY_REFUNDED
- fulfillmentType: SHIP, COLLECT
- subtotalMinor
- shippingMinor
- totalMinor
- currency
- stripeCheckoutSessionId
- stripePaymentIntentId
- createdAt
- updatedAt

### OrderItem

- id
- orderId
- productId
- sku
- titleSnapshot
- priceMinor
- quantity
- conditionSnapshot

### StripeWebhookEvent

- id
- stripeEventId unique
- type
- receivedAt
- processedAt
- processingStatus
- payloadHash

## Curated Shelves

### CuratedShelf

- id
- title
- slug
- introduction
- coverImageId
- curatorName
- homepageVisible
- displayOrder
- publicationStatus
- publishAt
- unpublishAt
- seoTitle
- metaDescription
- soldItemDisplayMode: SHOW_SOLD, HIDE_SOLD
- archivedAt
- createdAt
- updatedAt

### CuratedShelfProduct

- shelfId
- productId
- sortOrder
- staffNote
- addedAt

## AI Listing

### AiExtraction

- id
- productDraftId
- model
- promptVersion
- extractionType
- extractedAt
- rawResponse
- validationStatus
- warnings
- createdByUserId

### AiExtractedField

- id
- extractionId
- fieldName
- value
- confidence
- evidenceSource
- observationType: OBSERVED, EXTERNAL, INFERRED, UNKNOWN
- requiresReview

### ProductApproval

- id
- productId
- extractionId nullable
- approvedByUserId
- approvedAt
- approvedValues
- staffEdits

## Sell Or Trade

### SellTradeSubmission

- id
- userId nullable
- status
- contactName
- contactEmail
- contactPhone
- preference: CASH, STORE_CREDIT, EITHER
- customerNotes
- expiresAt
- createdAt
- updatedAt

### SellTradeItem

- id
- submissionId
- title
- category
- barcode
- conditionDescription
- customerPhotos
- staffAssessment
- cashOfferMinor
- storeCreditOfferMinor
- receivedAt
- convertedProductId nullable

## Wanted Items

### WantedRequest

- id
- userId nullable
- title
- author
- isbn
- platform
- gameTitle
- console
- category
- notes
- maxPriceMinor
- preferredCondition
- contactEmail
- status
- unsubscribedAt
- createdAt
- updatedAt

### WantedMatch

- id
- wantedRequestId
- productId
- score
- reasons
- status: POSSIBLE, APPROVED, NOTIFIED, DISMISSED
- approvedByUserId
- notifiedAt

## Administration

### SiteSetting

- key
- value
- updatedByUserId
- updatedAt

### StockLocation

- id
- name
- type
- publicLabel
- privateNotes

### ShippingProfile

- id
- name
- collectionOnly
- rules
- active

### AuditLog

- id
- actorUserId
- action
- entityType
- entityId
- before
- after
- ipHash
- userAgent
- createdAt

Audit logs should avoid storing unnecessary personal data.
