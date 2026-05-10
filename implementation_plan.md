# Website Update & Refinement Implementation Plan

This document outlines the steps to execute the requested UI/UX refinements, content logic updates, and integrations for PsychWithKabir.

## User Review Required

> [!WARNING]
> **UPI Payment Verification without a Backend**
> A frontend-only React application cannot securely verify UPI payments (like Razorpay or PhonePe) on its own. It requires a backend server to generate an Order ID and verify the signature. Since this project runs entirely on Firebase Client SDKs without Firebase Cloud Functions, a fully secure automated verification is not possible.
> **Proposed Solution for now**: I will implement a client-side Razorpay Checkout integration. When the payment succeeds on the frontend, it will automatically record an "approved" transaction in Firestore and instantly unlock the PDF. *Note that this is not 100% secure against tech-savvy users but fulfills the "instant unlock" requirement.*

## Open Questions

> [!IMPORTANT]
> 1. **Q&A Section (FAQ Manager)**: You requested an "FAQ Manager" in the admin panel and a "Q&A Structure architected exactly like Study Notes". Currently, `QA.tsx` serves as the FAQ page. I plan to separate these: `QA.tsx` will become the Unit-based Q&A PDF section, and I will create a new `FAQ.tsx` page for the Frequently Asked Questions (managed by the FAQ Manager). Is this acceptable?
> 2. **Razorpay Key**: To implement the payment gateway, you will need to provide a Razorpay Key ID (or similar provider's public key) in the `.env` file eventually. I will use a test configuration for now.

## Proposed Changes

### Navigation & Header Structure
#### [MODIFY] `src/components/layout/Navbar.tsx`
- Reorder the navigation links to: Home, Syllabus, Study Notes, Q&A, Video Lectures, Doubts.
#### [MODIFY] `src/pages/Syllabus.tsx`
- Remove the "Ask Doubt" CTA button to centralize queries.

---

### Homepage Enhancements
#### [MODIFY] `src/pages/Home.tsx`
- Update the "Explore Notes" button to ensure it maps correctly to the Study Notes page.
- Replace the static "Study Notes Archive" grid with a dynamic grid fetching the 4 most recent notes from the database.
- Completely remove the "Coming Soon: Video Lectures" banner section.

---

### Q&A Section & Integrated Logic
#### [MODIFY] `src/lib/db.ts`
- Add support for a `qaPdfLink` field inside the Note model so that Study Notes and Q&A PDFs are bound together by Unit.
#### [MODIFY] `src/pages/StudyNotes.tsx`
- Modify the `SecurePdfViewer` component to include a conditionally enabled "Download" button (enabled for free notes or unlocked premium notes).
#### [MODIFY] `src/pages/QA.tsx`
- Redesign the page entirely to mimic `StudyNotes.tsx`. It will display Unit-wise categorization and check for the same transaction access to unlock the Q&A PDFs.

---

### Video Lectures System
#### [MODIFY] `src/pages/VideoLectures.tsx`
- Group video lectures by their associated Unit.
- Implement a Dropdown/Accordion UI for each unit, which expands to show multiple video titles.
- Embed the YouTube player (`react-player`) so the video plays directly within the accordion.

---

### Doubts & Contact Modules
#### [MODIFY] `src/pages/Doubts.tsx`
- Rename "Admin/Sir" references to "Course Instructor".
- Update the feed on the right side to display a "Community Doubts Feed" of recently asked doubts with their related Unit Name/Number tags.
#### [MODIFY] `src/components/layout/Footer.tsx`
- Rename the "Newsletter" section to "Notes Update Notification" and update the placeholder/context text.
- Ensure the "Connect" section is properly aligned and the contact links are functional.

---

### Admin Panel Updates
#### [MODIFY] `src/pages/AdminDashboard.tsx`
- **Content Management**: Update the "Notes" publisher to include an upload field for the "Q&A PDF". Ensure the "Manage Video Lectures" section allows assigning videos to Units.
- **FAQ Manager**: Update the existing FAQ manager to allow editing and deleting FAQs.
- **Private Doubts**: Implement the User-to-Admin messaging system. Private questions will only be visible to the Admin, and once answered, they will appear in the specific user's private doubt feed.
- **Payment Management**: Remove the manual "Verify Payments" tab entirely as the process will be automated.

---

### Payment Gateway Integration
#### [MODIFY] `src/pages/StudyNotes.tsx` & `src/pages/QA.tsx`
- Integrate Razorpay Checkout script dynamically.
- When a user clicks to buy a Premium Note, trigger the UPI checkout flow.
- On successful payment callback, write an 'approved' transaction record to Firestore to instantly unlock the "Download" and "View" capabilities for both the Note and the related Q&A PDF.

## Verification Plan

### Manual Verification
1. **Navigation**: Ensure the Navbar follows the new sequence.
2. **Homepage**: Check that the 4 most recent notes are displayed and the Coming Soon banner is gone.
3. **Q&A & Study Notes**: Buy a premium note (using test credentials) and verify that both the Unit's Study Note and Q&A PDFs become accessible and downloadable.
4. **Video Lectures**: Expand a unit accordion and verify the video plays in-line.
5. **Doubts Feed**: Post a public doubt and verify it appears in the feed with the unit tag.
6. **Admin Panel**: Add an FAQ, delete an FAQ, publish a note with a Q&A PDF, and ensure the manual payment verification tab is gone.
