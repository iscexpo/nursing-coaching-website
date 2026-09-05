# Admit Card Full Functionality Plan

## Goal

Implement a complete admit-card workflow for the nursing coaching website, covering admin management, student access, and export/sharing.

## Scope

- Admin can create, view, update, delete, and search admit cards.
- Students can view their own admit card securely.
- Admit cards can be exported/printed in a clean, printable format.
- The workflow is validated, resilient, and consistent with the existing admin dashboard.

## Phase 1 — Core CRUD Reliability

1. Harden the existing admit-card API and UI.
   - Add clear success/error feedback for create/update/delete.
   - Validate required fields before submission.
   - Prevent duplicate admit cards for the same student and exam.
2. Improve the admin experience.
   - Add search/filter by student name, exam name, and date.
   - Add edit action for existing admit cards.
   - Improve table empty states and loading states.
3. Wire the admin tab to real data flows.
   - Ensure refresh behavior works correctly after every mutation.
   - Handle failed requests gracefully.

## Phase 2 — Student-Facing Access

1. Create a student-only admit-card page.
   - Route: `/dashboard/admit-card` or `/student/admit-card`.
   - Show the logged-in student’s admit card only.
2. Add API protection.
   - Restrict access so users can only view their own admit cards.
3. Add a visible entry point.
   - Link the admit card from the student dashboard.

## Phase 3 — Export and Sharing

1. Add printable admit-card view.
   - Use a dedicated printable layout with student info, exam info, center, and seat number.
2. Add export options.
   - PDF export via browser print.
   - Optional download as image/PDF if the package supports it.
3. Add sharing support.
   - Generate a shareable link for the student’s admit card.

## Phase 4 — Notifications and Automation

1. Notify students when an admit card is issued.
   - Trigger a notification entry in the existing notification system.
   - Optionally send WhatsApp or SMS integration if available.
2. Keep auditability.
   - Log who created or updated the admit card.

## Phase 5 — Quality and Rollout

1. Add tests.
   - API tests for create/update/delete permissions.
   - UI tests for form validation and card rendering.
2. Add sample data.
   - Seed example exams, enrollments, and admit cards for local testing.
3. Verify end-to-end flow.
   - Admin creates card.
   - Student views it.
   - Card prints correctly.

## Implementation Order

1. API and validation hardening
2. Admin CRUD UX improvements
3. Student admit-card page
4. Print/export support
5. Notifications and automation
6. Tests and polish

## Acceptance Criteria

- Admins can create and manage admit cards without errors.
- Students can view only their own admit card.
- Admit cards are printable and readable.
- The workflow works end-to-end from admin creation to student access.
