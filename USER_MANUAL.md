# EduMetric CRM — User Manual

**Application:** EduMetric CRM — Multidimensional Student-Growth Evaluation Platform
**Version:** 1.0.0
**Audience:** Administrators, Teachers, Students, Parents
**Last updated:** June 2026

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [System Requirements](#2-system-requirements)
3. [Key Concept — The Composite Score](#3-key-concept--the-composite-score)
4. [Accessing the Application](#4-accessing-the-application)
   - 4.1 Logging In
   - 4.2 Failed Login
   - 4.3 Forgot / Reset Password
   - 4.4 Accepting an Invitation
   - 4.5 Verifying Your Email
   - 4.6 Changing a Required Password
   - 4.7 Logging Out
5. [Interface Overview](#5-interface-overview)
   - 5.1 The Sidebar
   - 5.2 The Header
   - 5.3 Collapsing the Sidebar (Desktop & Mobile)
   - 5.4 Dark Mode
   - 5.5 Changing the Language
   - 5.6 Roles & What You See
6. [Student Guide](#6-student-guide)
7. [Teacher Guide](#7-teacher-guide)
8. [Administrator Guide](#8-administrator-guide)
9. [Parent Guide](#9-parent-guide)
10. [Verifying a Certificate (Public)](#10-verifying-a-certificate-public)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Introduction

EduMetric CRM is a web-based platform that replaces "GPA as a single number" with a transparent, **multidimensional composite score** for every student. Instead of judging progress on grades alone, EduMetric combines grades, attendance, practical work, behaviour, and activity — plus growth and consistency bonuses — into one clear, explainable figure that updates the moment new data is entered.

The platform serves four kinds of user, each with its own workspace:

| Role | What they do |
|---|---|
| **Student** | Track their own growth, grades, attendance, homework, quizzes and certificates. |
| **Teacher** | Run lessons: mark attendance, grade work, build rubrics and quizzes, and watch for at-risk students. |
| **Administrator** | Run the institution: manage people, courses and terms, tune the scoring formula, and read analytics. |
| **Parent** | Monitor the progress of their linked children. |

This manual covers every page and the most common tasks for each role. Each section describes the page, then gives step-by-step instructions. Wherever a screenshot helps, you will see a marker like:

> 📷 **Screenshot:** *(description of what to capture)*

Replace each marker with your own image.

---

## 2. System Requirements

| Requirement | Minimum |
|---|---|
| Browser | Chrome 110+, Firefox 115+, Safari 16+, Edge 110+ |
| Internet connection | Required (the app talks to a REST API) |
| Screen resolution | 1280 × 720 or higher recommended |
| JavaScript | Must be enabled |
| Camera (optional) | Needed only for QR check-in scanning |

> **Mobile:** EduMetric works on mobile browsers. On small screens the left sidebar is replaced by a slide-out drawer opened from the menu (☰) button in the top bar.

---

## 3. Key Concept — The Composite Score

Everything in EduMetric revolves around the **composite score** — a single percentage that summarises a student's overall standing. It is calculated from seven weighted components:

```
composite = (w_g  × grades)
          + (w_a  × attendance)
          + (w_p  × practical)
          + (w_b  × behaviour)
          + (w_ac × activity)
          + (w_gr × growth bonus)
          + (w_c  × consistency bonus)
```

The default weights (which always add up to 1.0) are:

| Component | Default weight |
|---|---|
| Grades | 0.25 |
| Attendance | 0.15 |
| Practical | 0.25 |
| Behaviour | 0.10 |
| Activity | 0.10 |
| Growth bonus | 0.10 |
| Consistency bonus | 0.05 |

Two things make the score special:

- **It is transparent.** Every student can see exactly which dimension contributed what — there is no hidden black box.
- **It updates live.** When a teacher saves attendance or a grade, the affected students' scores are recalculated immediately, in the same operation. Mark attendance, switch to the dashboard, and the score has already changed.

Administrators can adjust the weights at any time on the **Formula** page (see §8). Changing the weights re-scores every student in the institution.

---

## 4. Accessing the Application

### 4.1 Logging In

1. Open your browser and go to the EduMetric URL provided by your institution.
2. The login screen appears, with a welcome panel on the left and the sign-in form on the right.
3. Enter your **Email** and **Password**.
4. Click **Sign in**.
5. On success, you are taken straight to the home page for your role:
   - Students → **My dashboard**
   - Teachers → **Today**
   - Admins → **Institution dashboard**
   - Parents → **My children**

> 📷 **Screenshot:** The login page (welcome panel + email/password form).

> **Tip:** The theme toggle and language switcher sit in the top-right corner of the login screen, so you can switch to dark mode or change language before signing in.

### 4.2 Failed Login

If your email or password is wrong, an error message appears on the form. Check that:

- Caps Lock is off,
- your email is spelled correctly,
- you are using the password for *this* system.

If you still cannot get in, use **Forgot password** or contact your administrator.

### 4.3 Forgot / Reset Password

1. On the login screen, click **Forgot password**.
2. Enter your account email and submit. If the email is registered, a reset link is sent to it.
3. Open the email and click the link — it takes you to the **Reset password** page (the link carries a one-time token).
4. Enter and confirm your new password, then submit.
5. You can now log in with the new password.

### 4.4 Accepting an Invitation

New users are usually added by an administrator who sends an email invitation.

1. Open the invitation email and click the link — it opens the **Accept invitation** page.
2. Complete the form to set your name and password.
3. Submit to create your account, then sign in.

### 4.5 Verifying Your Email

If your account requires email verification, the link in your verification email opens the **Verify email** page, which confirms your address automatically and lets you continue.

### 4.6 Changing a Required Password

If your administrator flagged your account to change its password (for example, after a temporary password was issued), you are sent to the **Change password** page automatically after login. Enter a new password and submit to continue to your workspace.

### 4.7 Logging Out

1. Find your name and avatar at the **bottom of the left sidebar**.
2. Click **Sign out**.
3. You are returned to the login page.

> On mobile, open the drawer with the ☰ menu button first; the **Sign out** button is at the bottom of the drawer.

---

## 5. Interface Overview

After logging in, every workspace shares the same layout: a **left sidebar** for navigation, a **header** at the top of each page, and the **main content area**.

> 📷 **Screenshot:** A dashboard showing the sidebar (left), header (top) and content area.

### 5.1 The Sidebar

The left sidebar is your main menu. Its contents depend on your role (see §6–§9). For administrators, the menu is divided into labelled groups (Main, People, Organization, Insights, System); for the other roles it is a single list. Your profile and the **Sign out** button are always at the bottom.

### 5.2 The Header

Each page has a header showing the page **title** and a short description on the left, and these controls on the right:

- **Search box** (on wider screens),
- **Language switcher**,
- **Dark-mode toggle**,
- **Notifications bell**,
- and sometimes a page-specific action button.

### 5.3 Collapsing the Sidebar (Desktop & Mobile)

- **Desktop:** Click the collapse arrow in the sidebar header to shrink it to icon-only mode (icons remain, labels hide). Click again to expand. Active items still show, and badges become a small red dot in collapsed mode.
- **Mobile:** Tap the **menu (☰)** button in the top bar to slide out the navigation drawer; tap any item to navigate and the drawer closes.

### 5.4 Dark Mode

Click the **moon / sun icon** in the header (or top bar on mobile) to switch between light and dark themes. Your choice is remembered by the browser.

### 5.5 Changing the Language

EduMetric is available in three languages, switched with the segmented control in the header (or top bar):

- **OʻZB** — Uzbek
- **РУС** — Russian
- **ENG** — English

Click a language to switch instantly.

### 5.6 Roles & What You See

Your role determines your home page and which menu items appear. You cannot see another role's pages. Administrators have the broadest access; the role hierarchy is **Admin → Teacher → Student**. Parents have a small, dedicated workspace focused on their children.

---

## 6. Student Guide

The student workspace is a single menu of everything you need to follow your own progress. Your home page is **My dashboard**.

### 6.1 Dashboard — `/student`

Your personal overview.

- **Profile hero** with your name and key figures.
- **Performance radar** — a radar chart of your scores across all dimensions.
- **Growth trend** — an area chart of your composite score over recent weeks.
- **Performance breakdown** — cards for each dimension.
- **Growth areas** — where you are ahead of or behind the group.
- **Recent activity** — your latest grades and attendance.

> 📷 **Screenshot:** Student dashboard with radar chart and growth trend.

### 6.2 My Growth — `/student/growth`

- An **area chart** of your weekly composite score.
- A **focus-areas** list comparing your score with the group average per dimension, so you can see where to improve.

### 6.3 Attendance — `/student/attendance`

- Four stat cards: **attendance %**, **present**, **late**, **absent**.
- A **weekly attendance trend** chart.

### 6.4 Check-in — `/student/checkin`

Mark yourself present in class using a code your teacher displays.

1. Ask your teacher to open check-in for the lesson (they will show a QR code and a short code).
2. On this page, type the **check-in code** into the field.
3. Press **Enter** or click the button.
4. A confirmation appears once you are checked in.

### 6.5 Justifications — `/student/justifications`

Explain an absence and track whether it was accepted.

1. Choose the lesson (use the picker, or switch to manual entry of a lesson ID).
2. Write your **reason** in the text box.
3. Submit. Your request appears in the table below with columns **Lesson · Reason · Status · Submitted**.
4. Watch the **Status** badge — a teacher will approve or reject it.

### 6.6 Grades — `/student/grades`

- A large **course grade** card with a percentage and progress bar.
- A list of assignments, each showing its **name, weight, due date, grade/status** and any teacher comment.

### 6.7 Submissions — `/student/submissions`

A list of everything you have submitted across your courses.

### 6.8 Feedback — `/student/feedback`

1. Pick an assignment from the dropdown.
2. Read the teacher's feedback items (author and timestamp shown for each).

### 6.9 Appeals — `/student/appeals`

Ask for a grade to be reconsidered.

1. In **Request regrade**, choose the assignment and write your reason.
2. Submit.
3. Track it in **My appeals** (columns: **Assignment · Status · Reason · Resolution · Created**).

### 6.10 Transcript — `/student/transcript`

Your finalised grades, in a table by **Term · Course · Final % · Letter grade · GPA**.

### 6.11 Peer Reviews — `/student/peer-reviews`

Review work assigned to you.

1. Open a review card (it shows the assignment and the person you are reviewing).
2. Enter a **score** and **comments**.
3. Submit. Completed reviews are shown back to you.

### 6.12 Homework — `/student/homework`

- A list of homework with **due date, attachment indicator and status**.
- Click an item to open the submission panel and turn in your work.

### 6.13 Course Content — `/student/content`

- An **overall progress** card (completed / total, with a bar).
- **Module** cards, which may be locked until prerequisites are met.
- For each material: open/download it, then click **Mark complete** (it switches to **Completed**).

### 6.14 Syllabus — `/student/syllabus`

The course's **objectives** and **outline**, as published by your teacher.

### 6.15 Library — `/student/library`

Files shared across your enrolled courses.

1. Use the **search box** (by title, course or module).
2. Click **Download** on any file.

### 6.16 Quizzes — `/student/quizzes`

- A list of quizzes showing **status, question count, attempts used/allowed, best score and time limit**.
- Click a quiz to take it: answer single-choice, multiple-select, true/false or short-answer questions, then **submit**.
- Open the **result** panel to see your score, pass/fail, and which questions were right.

### 6.17 Catalog — `/student/catalog`

Request to join a course offering.

1. Browse the offering cards (course, group, dates, description).
2. Optionally add a message, then **request enrollment**.
3. Track the outcome in **My requests** (pending / approved / rejected).

### 6.18 Certificates — `/student/certificates`

- Click **Claim** to earn a certificate for a completed course.
- Each certificate card shows the course, your name, the completion date and a unique **certificate code**, plus a **verify** link (see §10).

### 6.19 Progress Report — `/student/progress`

A detailed, printable report:

- composite score with formula version, sample count and compute date,
- a grid of every dimension (grades, attendance, practical, behaviour, activity, growth bonus, consistency bonus),
- attendance stats (present, late, absent, excused),
- recent grades and a trend history.

Click **Print** to produce a paper or PDF copy.

### 6.20 Messages — `/student/messages`

Send and read direct messages with teachers and peers. Pick a conversation, type in the box and send.

### 6.21 Notifications — `/student/notifications`

Your feed of system alerts (grades, feedback, messages and more).

### 6.22 Settings — `/student/settings`

- **Profile** — your details.
- **Two-factor authentication** — add a second sign-in step.
- **Sessions** — see and end logged-in devices.
- **Notification preferences** — choose what you are alerted about.

---

## 7. Teacher Guide

The teacher workspace puts your daily classroom work first. Your home page is **Today**.

### 7.1 Today (Dashboard) — `/teacher`

- **Today's lessons** — your schedule for the day.
- **Pending tasks** — things needing action.
- **At-risk students** — flagged students to watch.
- **Groups overview** — a card grid of your groups.
- Summary KPI cards at the top.

> 📷 **Screenshot:** Teacher "Today" dashboard.

### 7.2 Groups — `/teacher/groups`

A card grid of the groups you teach (course name and dates). Click **View students** to see a group's roster.

### 7.3 Attendance — `/teacher/attendance`

Mark attendance in bulk for a lesson.

1. Select the lesson (lesson buttons at the top).
2. The roster loads; set each student's status — **present, late, absent or excused** — and add a note if needed.
3. Click **Save**.

> Because scoring is live, the affected students' composite scores update the instant you save.

> 📷 **Screenshot:** Attendance roster with status dropdowns.

### 7.4 Check-in — `/teacher/checkin`

Let students mark themselves present.

1. Select the lesson.
2. Click **Open** to start a check-in session — a **QR code** and a large **check-in code** appear.
3. Show them to the class; students enter the code on their own Check-in page.
4. Click **Close** when done.

### 7.5 Justifications — `/teacher/justifications`

Review absence excuses. The queue lists **Student · Course · Lesson · Reason · Submitted**. Click **Approve** (marks the absence excused) or **Reject** on each row.

### 7.6 Attendance Reports — `/teacher/attendance-reports`

1. Choose a **group** (and optionally a single **student**).
2. Read the KPI cards (present, late, absent, excused, attendance %).
3. The table breaks down each student's counts, attendance % and an at-risk flag.

### 7.7 Grades (Gradebook) — `/teacher/grades`

1. Select a **course** and **group**.
2. Edit grades directly in the cells (quiz columns are read-only; manual assignment cells are editable). Column headers show max points, weight and class average.
3. Click **Export** to download the gradebook as CSV.

### 7.8 Submissions — `/teacher/submissions`

Pick a course to browse submitted work (student, submission time, status), then move on to grade it.

### 7.9 Grade Categories — `/teacher/grade-categories`

Define weighted categories (e.g. Homework 25%, Exams 75%) per course.

1. Select the course.
2. Add a category (name, weight %, position).
3. Edit or delete categories as needed; a badge shows the running total — aim for 100%.

### 7.10 Rubrics — `/teacher/rubrics`

Build a scoring rubric and grade against it.

1. Choose course, assignment and student.
2. In the rubric builder, add **criteria** (label + max points) and save.
3. Enter points per criterion for the selected student and save the scores back to the gradebook.

### 7.11 Feedback — `/teacher/feedback`

1. Select course, assignment and student.
2. Write your comment and **post** it.
3. Past feedback is listed with author and timestamp.

### 7.12 Grade Appeals — `/teacher/appeals`

Resolve student appeals. The table lists **Student · Course · Assignment · Reason · Created**. Expand a row to **resolve** (optionally entering a new grade) or **reject** with a note.

### 7.13 Transcripts — `/teacher/transcripts`

1. Choose course and term, then **Finalize whole course** to lock in term grades.
2. Select a student to view their finalised transcript (Term/Course, Final %, Letter, GPA).

### 7.14 Peer Reviews — `/teacher/peer-reviews`

1. Pick course and assignment.
2. Assign a **reviewer** to a **reviewee**.
3. Track status, scores and comments in the table.

### 7.15 Plagiarism — `/teacher/plagiarism`

1. Pick course and assignment.
2. Add submissions (one text box per student) and click **Run check**.
3. Review the similarity table (Student A, Student B, similarity % with colour-coded badges). Stored reports are listed below.

### 7.16 Homework — `/teacher/homework`

1. Select a course and create an assignment (name, type, max points, due date).
2. Select an assignment to see submissions; **download** each student's file.
3. Enter a grade and **save** it.

### 7.17 Course Content — `/teacher/content`

Organise learning materials.

1. Select a course.
2. Create **modules**; add **materials** (page, file, link or video) inside them.
3. **Publish** or keep as draft, view **version history**, and edit or delete items.

### 7.18 Syllabus — `/teacher/syllabus`

Write the course **objectives** and a week-by-week **outline** (Markdown supported), tick **Published** and **Save** to make it visible to students.

### 7.19 Library — `/teacher/library`

Search and download all downloadable files across your courses.

### 7.20 Quizzes — `/teacher/quizzes`

1. Select a course and create a quiz (title, description, time limit, max attempts, pass score, shuffle).
2. Build questions (single choice, multiple choice, true/false, short answer), set points and correct answers, and save. Auto-grading is supported.

### 7.21 At-Risk Students — `/teacher/at-risk`

A table of students flagged at-risk (low attendance, grades or behaviour) with their composite score and risk flags.

### 7.22 Students — `/teacher/students`

The full roster across your groups (name, group, email, enrolment status).

### 7.23 Reports — `/teacher/reports`

- **Download metrics CSV** for all your students.
- Enter a **student ID** to view that student's progress report or download their grades CSV.

### 7.24 Messages — `/teacher/messages`

Direct messaging with students and other users — select a conversation, read and send.

### 7.25 Announcements — `/teacher/announcements`

Post announcements to your enrolled students. Create, edit, publish/unpublish and delete.

### 7.26 Notifications — `/teacher/notifications`

Your feed of system notifications (grades, submissions, messages, assignments).

### 7.27 Settings — `/teacher/settings`

Profile, two-factor authentication, active sessions and notification preferences.

---

## 8. Administrator Guide

The admin workspace runs the whole institution. The sidebar is grouped into **Main**, **People**, **Organization**, **Insights** and **System**. Your home page is the **Institution dashboard**.

### 8.1 Institution Dashboard — `/admin`

A high-level overview:

- KPI grid (enrolment metrics),
- growth-trend chart and score pillars,
- top groups, at-risk students and weekly activity,
- an institution insights card.

Use **Add student** (top right) to create a student account quickly, or **Export** to download the dashboard data as CSV.

> 📷 **Screenshot:** Institution dashboard with KPI cards and charts.

### 8.2 Students — `/admin/students`

Manage every student account (name, email, group, status).

- **Add student** opens a creation dialog.
- Each row has **Edit** and **Delete** actions.

### 8.3 Teachers — `/admin/teachers`

Manage teacher accounts (name, email, department) with **Add**, **Edit** and **Delete**.

### 8.4 Groups — `/admin/groups`

Manage student groups/cohorts (name, description) with **Add**, **Edit** and **Delete**.

### 8.5 Courses — `/admin/courses`

Manage courses (code, name, description) with **Add**, **Edit** and **Delete**.

### 8.6 Lessons — `/admin/lessons`

Manage lessons (name, course, description) with **Add**, **Edit** and **Delete**.

### 8.7 Enrollment Management — `/admin/enrollment`

Move students between groups.

1. Select a student.
2. Use one of the action cards — **Enroll**, **Transfer** or **Withdraw** — choosing a group and adding an optional reason.
3. Every action is logged in the enrolment history table (Group, Status, Enrolled, Ended, Reason).

### 8.8 Enrollment Requests — `/admin/enrollment-requests`

Review requests students submitted from the catalog. The table lists **Student · Course · Group · Message · Requested at**. **Approve** (✓) or **Reject** (✗) each one.

### 8.9 Course Teachers / Co-Teachers — `/admin/teaching`

Assign teachers to courses.

1. Choose a course, a teacher and a role (**Lead** or **Co-teacher**).
2. Click **Assign**. Remove a teacher with the ✗ in their row.

### 8.10 Invitations — `/admin/invitations`

Invite new users by email.

1. Fill in **email**, optional **full name**, **role**, and (for students) a **group**.
2. Create the invitation — a one-time link is shown; use **Copy** to share it.
3. The table tracks status (Pending / Accepted / Expired / Revoked); **revoke** pending invitations as needed.

### 8.11 Bulk Imports — `/admin/imports`

Import many users at once from CSV.

1. Choose the **Students** or **Teachers** import card.
2. Upload a CSV with the columns shown on the card.
3. Review the result summary (created / failed); failures are listed with row, email and message.

### 8.12 Parents — `/admin/parents`

Link parent accounts to the students they may view.

1. Select a parent and a student, and optionally name the relationship.
2. Create the link. Remove links from the table.

### 8.13 Departments — `/admin/departments`

Create departments (name, code, description). Edit inline (pencil → save/cancel) and delete from the table.

### 8.14 Academic Terms — `/admin/terms`

Define terms (name, start, end) and mark one **current** (star icon). Delete terms from the table.

### 8.15 Attendance Policy — `/admin/attendance-policy`

Set institution-wide rules: minimum attendance %, consecutive-absence limit, and whether to notify on absence. Click **Save policy**.

### 8.16 Analytics — `/analytics`

Institution-wide reporting:

- KPI cards (enrolment, completion, average scores),
- a score-distribution histogram and attendance analytics,
- top groups, at-risk students and teacher activity.

Use **Export** to download analytics as CSV.

> 📷 **Screenshot:** Analytics dashboard with distribution chart.

### 8.17 Cohort Comparison — `/admin/cohorts`

Compare groups side by side (students, avg composite, avg attendance, avg grades, at-risk count) and view longitudinal trends. This page is read-only.

### 8.18 Scoring Formula — `/admin/formula`

Tune how the composite score is calculated (see §3).

1. Enter a **version name**.
2. Adjust the seven weights — **Grades, Attendance, Practical, Behaviour, Activity, Growth, Consistency**. They must sum to **1.0**.
3. Click **Preview impact** — the right-hand panel shows how many students would rise or fall, the average change, and the top movers.
4. Click **Activate** to apply. This re-scores every student in the institution.

> ⚠️ **Warning:** Activating a new formula recalculates all students' composite scores. Preview first.

> 📷 **Screenshot:** Formula page with weight inputs and the preview panel.

### 8.19 At-Risk Rules — `/admin/at-risk-rules`

Decide what flags a student as at-risk: flag by composite score (with threshold), flag by attendance (with threshold), and/or flag low-confidence data. Click **Save rules**.

### 8.20 At-Risk Students — `/admin/at-risk`

A read-only report of every student currently flagged at-risk (name, email, group, risk indicators, composite score, attendance %).

### 8.21 Announcements — `/admin/announcements`

Create and manage institution-wide announcements.

### 8.22 Notifications — `/admin/notifications`

The institution's notification feed.

### 8.23 Settings — `/admin/settings`

Your profile, two-factor authentication, sessions, **institution settings**, and notification preferences.

---

## 9. Parent Guide

The parent workspace is focused on your children. Your home page is **My children**.

### 9.1 My Children — `/parent`

1. Your linked children appear as cards (name and group).
2. Click **View progress** on a child to open their dashboard below, which shows:
   - **Composite score**, **attendance**, **grades** and **group percentile** cards,
   - **recent grades**,
   - **growth areas** compared with the group average,
   - an overall status badge (On track / At risk / Insufficient data).

If no children are listed, contact your institution to have them linked.

> 📷 **Screenshot:** Parent view of a selected child's progress.

### 9.2 Notifications — `/parent/notifications`

Your notification feed.

### 9.3 Settings — `/parent/settings`

Profile, two-factor authentication, sessions and notification preferences.

---

## 10. Verifying a Certificate (Public)

Anyone can confirm a certificate is genuine — no login required.

1. Go to the **`/verify`** page.
2. Enter the certificate code (e.g. `EM-AB12CD34EF`) and click **Verify**. (A link with `?code=…` verifies automatically.)
3. If valid, a green panel shows the **student name, course, completion date and code**. If not, a red panel reports that no certificate was found.

---

## 11. Troubleshooting

**The page shows a spinner and never loads**
- Check your internet connection.
- Confirm the backend API is reachable (ask your administrator).
- Refresh the page.

**"Login failed" / cannot sign in**
- Verify your email and password; check Caps Lock.
- Use **Forgot password** to reset, or ask your administrator.

**A student's score didn't change after I entered a grade/attendance**
- Scores update when you **Save**. Make sure the save succeeded, then refresh the dashboard.
- If a formula change is in progress, recalculation across all students can take a moment.

**The check-in code doesn't work (student)**
- Confirm the teacher has **opened** check-in for the right lesson and the session is still open.
- Re-type the code exactly as shown.

**Formula won't activate (admin)**
- The seven weights must add up to **1.0**. Adjust them until the total is exactly 1.0, then preview and activate.

**A CSV import reports failures**
- Open the error table and check the **row, email and message** for each failed line; fix the CSV and re-upload.

**I can't see a page another user has**
- Pages are role-specific. You only see the menu for your role; contact your administrator if you need different access.

**The interface is in the wrong language or theme**
- Use the language switcher (OʻZB / РУС / ENG) and the moon/sun toggle in the header; both preferences are saved.

---

*End of User Manual — EduMetric CRM v1.0.0*
