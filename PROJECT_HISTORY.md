# Project History & Changelog

## 🚀 Initial Task
The overall objective was to build "Kabir's Classroom", a full-stack Learning Management System (LMS) and student portal. The platform required features like:
- **Study Notes:** A digital library with free and premium downloadable PDFs.
- **Syllabus Tracker:** A curriculum map where students can see their progress.
- **Video Lectures:** A section for embedded educational videos.
- **Q&A / Doubts System:** A pipeline for students to ask questions to the community or directly to the Admin.
- **Admin Dashboard:** A secured portal for the admin (Kabir Sir) to manage syllabus units, notes (free/premium), answer doubts, and track system status.
- **Firebase Backend:** Authentication, Firestore database, and Security Rules.

## 🔄 Iteration 1 & 2: Core Routing and Firebase Fixes
1. **Fixing Firebase Errors:** Resolve a `getDocFromServer is not defined` error and a `Missing or insufficient permissions` error when interacting with doubts.
2. **Notes Payment System:** Remove the UPI/Payment form popup for regular students, but allow the admin to still upload Premium (paid) files. Students should see a "Contact Admin to Unlock" message for premium files instead.
3. **Doubts Route Extraction:** Move the "Ask a Doubt" module out of just the Syllabus page and make it its own standalone page accessible from the top Navbar alongside "Q&A".

### ✅ What Worked (Iteration 1 & 2)
- **Admin vs. Student Separation:** Successfully isolated the logic where Admin sets the price/premium status of a note to `true`, and the student UI securely hides the PDF download behind a "Premium Resource - Contact Admin" wall without exposing the file.
- **Standalone Doubts Page:** Successfully extracted the Doubts logic into `/src/pages/Doubts.tsx`, wired it into `App.tsx` router, and added it to the main `Navbar.tsx` and `Footer.tsx`.
- **Firebase Configuration:** Successfully configured the client-side Firebase SDK and integrated robust global error handling (`handleFirestoreError`) to diagnose backend issues.

### ❌ What Didn't Work (And How We Fixed It)
- **Firestore Security Rules Blocking Updates:** 
  - *Failure:* The rigorous zero-trust Firebase rules blocked students from updating the "Community Answers" section under a doubt, returning a `Missing or insufficient permissions` error.
  - *Fix:* We patched `firestore.rules` to explicitly allow users to append answers if they are modifying the `answers` array on a community doubt.
- **Missing Imports & Code Structure:** 
  - *Failure:* An SDK misconfiguration resulted in a `getDocFromServer` error.
  - *Fix:* We updated `/src/lib/db.ts` to properly import the missing Firebase functions.
- **JSX Linter Errors During Refactoring:**
  - *Failure:* When removing the "Ask a Doubt" code block from the `Syllabus.tsx` layout to move it to `Doubts.tsx`, it inadvertently left trailing `</div>` tags that broke the component's tree structure.
  - *Fix:* We had to run the Linter, identify the malformed HTML, and apply a surgical edit to remove the extra tags to get the build passing again.

## 🔄 Iteration 3: Secure PDF & Project Tracking
1. **Secure PDF Viewer:** Instead of allowing direct downloads for Premium Content (which can be easily shared and pirated by students), the objective was to implement a secure, read-only PDF viewer in the browser that disables right-click, text selection, and printing.
2. **Project History Tracking:** Keep a running log of everything being built in `PROJECT_HISTORY.md`.
3. **GitHub Integration Inquiry:** Explain the limitations of GitHub integration within the AI Studio Build environment.

### ❓ Why can't I connect it directly to GitHub for continuous sync?
**Answer:** Google AI Studio Build operates as a sandboxed development environment where the AI agent manages the filesystem directly. It does not currently support *continuous two-way auto-syncing* with an external GitHub repository because the platform handles the preview builds and deployment to Cloud Run internally. 
**How to get it to GitHub:** You can export your completed project at any time. Click the **Settings (gear icon)** menu in the UI, and select **Export to GitHub** or **Download ZIP**. From there, you can push the code to your own repository and continue developing locally or deploy it via Vercel/Netlify.

## ✅ What Worked
- **Secure PDF Viewer Implementation:** Successfully installed `react-pdf` and integrated a `<SecurePdfViewer />` component. It renders in a modal with a `bg-transparent` absolute overlay that blocks dragging/dropping, sets `select-none` and `pointer-events-none` to prevent text highlighting, blocks right-clicks, and uses CSS to hide the PDF structure when a user attempts to "Print" the page.
- **Vite/Rollup CSS Resolution Fix:** We encountered a build error with `dist/esm/Page/AnnotationLayer.css`, which was resolved by switching the import paths to the standard `dist/Page/AnnotationLayer.css`.

## ❌ What Didn't Work (And How We Fixed It)
- **Direct PDF Download Button Removed:** 
  - *Failure:* Previously, students who had successfully paid for a premium resource got a button linking directly to the Firebase Storage URL, allowing them to download and distribute the file.
  - *Fix:* Replaced the "Download PDF" and "View Content Note" buttons structurally with a single "View Secure PDF" button that spawns the secure React PDF modal.
