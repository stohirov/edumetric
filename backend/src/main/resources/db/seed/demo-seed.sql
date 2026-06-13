-- Idempotent demo seed.
-- Every statement is safe to re-apply: rows that already exist are skipped
-- (via ON CONFLICT DO NOTHING on the primary key or a natural unique key, or
-- WHERE NOT EXISTS where the table has neither). Re-running only fills gaps,
-- so partially-seeded databases (e.g. courses already present) won't error.
BEGIN;

INSERT INTO departments (id, name, code, description) VALUES
  (1, 'Software Engineering', 'ENG', 'Web and backend engineering programs'),
  (2, 'Data Science', 'DS', 'Analytics, ML foundations and data engineering')
ON CONFLICT DO NOTHING;

INSERT INTO courses (id, name, code, description) VALUES
  (1, 'Full-Stack JavaScript', 'FSJS-2026', 'Modern Node.js and React engineering'),
  (2, 'Python for Data Science', 'PYDS-2026', 'NumPy, Pandas and data visualization'),
  (3, 'UI/UX Design Foundations', 'UXDF-2026', 'Design principles, wireframing and prototyping')
ON CONFLICT DO NOTHING;

INSERT INTO institution_settings (id, institution_name, default_locale, primary_color, grading_scale, at_risk_threshold)
VALUES (1, 'EduMetric Academy', 'en', '#4F46E5', 'PERCENT', 60)
ON CONFLICT DO NOTHING;

INSERT INTO academic_terms (id, name, start_date, end_date, current) VALUES
  (1, 'Spring 2026', DATE '2026-01-06', DATE '2026-06-30', TRUE),
  (2, 'Fall 2026',   DATE '2026-09-01', DATE '2026-12-20', FALSE)
ON CONFLICT DO NOTHING;

INSERT INTO attendance_policy (id, min_attendance_percent, consecutive_absence_limit, notify_on_absence)
VALUES (1, 75, 3, TRUE) ON CONFLICT (id) DO NOTHING;

INSERT INTO at_risk_rules (id, composite_threshold, attendance_threshold, flag_low_confidence, composite_enabled, attendance_enabled)
VALUES (1, 50, 70, FALSE, TRUE, TRUE) ON CONFLICT (id) DO NOTHING;

INSERT INTO formula_config (version, weight_grades, weight_attendance, weight_practical, weight_behavior, weight_activity, weight_growth, weight_consistency, is_active)
VALUES ('v1.0', 0.25, 0.15, 0.25, 0.10, 0.10, 0.10, 0.05, TRUE)
ON CONFLICT (version) DO NOTHING;

INSERT INTO users (id, email, password_hash, full_name, role, email_verified, status, department_id, phone) VALUES
  (1,  'admin@edumetric.io',     '$2b$10$kyL/ovRnv6srCTMCGu/ADe6BS1oWvfThCJZgZe609X3Ouc55WqGqa', 'Aziza Karimova',     'ADMIN',   TRUE, 'ACTIVE', 1, '+998901112233'),
  (2,  'b.ismailov@edumetric.io','$2b$10$kyL/ovRnv6srCTMCGu/ADe6BS1oWvfThCJZgZe609X3Ouc55WqGqa', 'Bekhzod Ismailov',   'TEACHER', TRUE, 'ACTIVE', 1, '+998901112201'),
  (3,  'd.alimova@edumetric.io', '$2b$10$kyL/ovRnv6srCTMCGu/ADe6BS1oWvfThCJZgZe609X3Ouc55WqGqa', 'Dilnoza Alimova',    'TEACHER', TRUE, 'ACTIVE', 2, '+998901112202'),
  (4,  'r.nazarov@edumetric.io', '$2b$10$kyL/ovRnv6srCTMCGu/ADe6BS1oWvfThCJZgZe609X3Ouc55WqGqa', 'Rustam Nazarov',     'TEACHER', TRUE, 'ACTIVE', 1, '+998901112203'),
  (5,  'student@edumetric.io',   '$2b$10$kyL/ovRnv6srCTMCGu/ADe6BS1oWvfThCJZgZe609X3Ouc55WqGqa', 'Madina Yusupova',    'STUDENT', TRUE, 'ACTIVE', NULL, NULL),
  (6,  'laziz@edumetric.io',     '$2b$10$kyL/ovRnv6srCTMCGu/ADe6BS1oWvfThCJZgZe609X3Ouc55WqGqa', 'Laziz Tursunov',     'STUDENT', TRUE, 'ACTIVE', NULL, NULL),
  (7,  'shahzoda@edumetric.io',  '$2b$10$kyL/ovRnv6srCTMCGu/ADe6BS1oWvfThCJZgZe609X3Ouc55WqGqa', 'Shahzoda Rakhimova', 'STUDENT', TRUE, 'ACTIVE', NULL, NULL),
  (8,  'diyor@edumetric.io',     '$2b$10$kyL/ovRnv6srCTMCGu/ADe6BS1oWvfThCJZgZe609X3Ouc55WqGqa', 'Diyor Komilov',      'STUDENT', TRUE, 'ACTIVE', NULL, NULL),
  (9,  'nigora@edumetric.io',    '$2b$10$kyL/ovRnv6srCTMCGu/ADe6BS1oWvfThCJZgZe609X3Ouc55WqGqa', 'Nigora Sobirova',    'STUDENT', TRUE, 'ACTIVE', NULL, NULL),
  (10, 'anvar@edumetric.io',     '$2b$10$kyL/ovRnv6srCTMCGu/ADe6BS1oWvfThCJZgZe609X3Ouc55WqGqa', 'Anvar Tashkentov',   'STUDENT', TRUE, 'ACTIVE', NULL, NULL),
  (11, 'farangiz@edumetric.io',  '$2b$10$kyL/ovRnv6srCTMCGu/ADe6BS1oWvfThCJZgZe609X3Ouc55WqGqa', 'Farangiz Olimova',   'STUDENT', TRUE, 'ACTIVE', NULL, NULL),
  (12, 'sergey@edumetric.io',    '$2b$10$kyL/ovRnv6srCTMCGu/ADe6BS1oWvfThCJZgZe609X3Ouc55WqGqa', 'Sergey Petrov',      'STUDENT', TRUE, 'ACTIVE', NULL, NULL),
  (13, 'elena@edumetric.io',     '$2b$10$kyL/ovRnv6srCTMCGu/ADe6BS1oWvfThCJZgZe609X3Ouc55WqGqa', 'Elena Voronova',     'STUDENT', TRUE, 'ACTIVE', NULL, NULL),
  (14, 'jasur@edumetric.io',     '$2b$10$kyL/ovRnv6srCTMCGu/ADe6BS1oWvfThCJZgZe609X3Ouc55WqGqa', 'Jasur Kamolov',      'STUDENT', TRUE, 'ACTIVE', NULL, NULL),
  (15, 'malika@edumetric.io',    '$2b$10$kyL/ovRnv6srCTMCGu/ADe6BS1oWvfThCJZgZe609X3Ouc55WqGqa', 'Malika Yusupova',    'STUDENT', TRUE, 'ACTIVE', NULL, NULL),
  (16, 'timur@edumetric.io',     '$2b$10$kyL/ovRnv6srCTMCGu/ADe6BS1oWvfThCJZgZe609X3Ouc55WqGqa', 'Timur Abdullaev',    'STUDENT', TRUE, 'ACTIVE', NULL, NULL),
  (17, 'parent.gulnora@edumetric.io', '$2b$10$kyL/ovRnv6srCTMCGu/ADe6BS1oWvfThCJZgZe609X3Ouc55WqGqa', 'Gulnora Yusupova', 'PARENT', TRUE, 'ACTIVE', NULL, '+998901119001'),
  (18, 'parent.sardor@edumetric.io',  '$2b$10$kyL/ovRnv6srCTMCGu/ADe6BS1oWvfThCJZgZe609X3Ouc55WqGqa', 'Sardor Komilov',   'PARENT', TRUE, 'ACTIVE', NULL, '+998901119002')
ON CONFLICT DO NOTHING;

INSERT INTO groups (id, name, course_id, start_date, end_date) VALUES
  (1, 'FSJS-A26', 1, DATE '2026-01-06', DATE '2026-06-30'),
  (2, 'PYDS-A26', 2, DATE '2026-01-06', DATE '2026-06-30'),
  (3, 'UXDF-A26', 3, DATE '2026-01-06', DATE '2026-06-30')
ON CONFLICT DO NOTHING;

INSERT INTO teachers (id, user_id, department) VALUES
  (1, 2, 'Web Development'),
  (2, 3, 'Data Science'),
  (3, 4, 'Web Development')
ON CONFLICT DO NOTHING;

INSERT INTO students (id, user_id, group_id, enrolled_at) VALUES
  (1,  5,  1, DATE '2026-01-06'),
  (2,  6,  1, DATE '2026-01-06'),
  (3,  7,  1, DATE '2026-01-06'),
  (4,  8,  1, DATE '2026-01-06'),
  (5,  9,  1, DATE '2026-01-06'),
  (6,  10, 1, DATE '2026-01-06'),
  (7,  11, 2, DATE '2026-01-06'),
  (8,  12, 2, DATE '2026-01-06'),
  (9,  13, 2, DATE '2026-01-06'),
  (10, 14, 3, DATE '2026-01-06'),
  (11, 15, 3, DATE '2026-01-06'),
  (12, 16, 3, DATE '2026-01-06')
ON CONFLICT DO NOTHING;

INSERT INTO parent_links (parent_user_id, student_id, relationship) VALUES
  (17, 1, 'MOTHER'),
  (18, 7, 'FATHER')
ON CONFLICT DO NOTHING;

INSERT INTO course_teachers (course_id, teacher_id, assignment_role) VALUES
  (1, 1, 'LEAD'),
  (1, 3, 'CO_TEACHER'),
  (2, 2, 'LEAD'),
  (3, 3, 'LEAD')
ON CONFLICT DO NOTHING;

INSERT INTO course_syllabus (id, course_id, objectives, outline, published) VALUES
  (1, 1, 'Build and deploy a full-stack JS application.', 'Modules: foundations, backend, frontend.', TRUE),
  (2, 2, 'Analyze datasets with Python and Pandas.', 'Modules: python basics, analysis.', TRUE),
  (3, 3, 'Design accessible, usable interfaces.', 'Modules: principles, prototyping.', FALSE)
ON CONFLICT DO NOTHING;

INSERT INTO course_modules (id, course_id, title, summary, position, published, prerequisite_module_id) VALUES
  (1, 1, 'Foundations',       'JS language and tooling',        0, TRUE, NULL),
  (2, 1, 'Backend',           'Node.js, Express, PostgreSQL',   1, TRUE, 1),
  (3, 1, 'Frontend',          'React and state management',     2, TRUE, 2),
  (4, 2, 'Python Basics',     'Syntax, types, control flow',    0, TRUE, NULL),
  (5, 2, 'Pandas & Analysis', 'DataFrames and aggregation',     1, TRUE, 4),
  (6, 3, 'Design Principles', 'Hierarchy, contrast, color',     0, FALSE, NULL)
ON CONFLICT DO NOTHING;

INSERT INTO course_materials (id, module_id, title, type, content, url, position, published) VALUES
  (1, 1, 'Welcome & setup',     'PAGE',  'Install Node 22 and VS Code.', NULL, 0, TRUE),
  (2, 1, 'MDN: JavaScript',     'LINK',  NULL, 'https://developer.mozilla.org/docs/Web/JavaScript', 1, TRUE),
  (3, 2, 'Express handout',     'PAGE',  'Routing, middleware, error handling.', NULL, 0, TRUE),
  (4, 3, 'React intro (video)', 'VIDEO', NULL, 'https://example.com/react-intro.mp4', 0, TRUE),
  (5, 4, 'Python intro',        'PAGE',  'Variables, lists, dicts.', NULL, 0, TRUE),
  (6, 5, 'Pandas docs',         'LINK',  NULL, 'https://pandas.pydata.org/docs/', 0, TRUE),
  (7, 6, 'Design basics',       'PAGE',  'Gestalt principles overview.', NULL, 0, FALSE)
ON CONFLICT DO NOTHING;

INSERT INTO material_versions (id, material_id, version_no, title, type, content, created_by_user_id) VALUES
  (1, 1, 1, 'Welcome & setup', 'PAGE', 'Initial draft.', 2)
ON CONFLICT DO NOTHING;

INSERT INTO grade_categories (id, course_id, name, weight, position) VALUES
  (1, 1, 'Quizzes', 0.30, 0),
  (2, 1, 'Labs',    0.30, 1),
  (3, 1, 'Exams',   0.40, 2),
  (4, 2, 'Assignments', 0.50, 0),
  (5, 2, 'Final',       0.50, 1),
  (6, 3, 'Projects',    1.00, 0)
ON CONFLICT DO NOTHING;

INSERT INTO assignments (id, course_id, name, type, max_value, weight, due_date, category_id) VALUES
  (1, 1, 'Quiz 1: JS Basics',       'THEORY',    100, 1.0, DATE '2026-02-01', 1),
  (2, 1, 'Lab: Async I/O',          'PRACTICAL', 100, 1.5, DATE '2026-03-01', 2),
  (3, 1, 'Midterm Exam',            'EXAM',      100, 2.0, DATE '2026-03-20', 3),
  (4, 1, 'Capstone Project',        'PROJECT',   100, 3.0, DATE '2026-06-10', 2),
  (5, 2, 'Pandas Assignment',       'PRACTICAL', 100, 1.0, DATE '2026-03-05', 4),
  (6, 2, 'Final Project: Dashboard','PROJECT',   100, 2.0, DATE '2026-06-05', 5),
  (7, 3, 'Wireframe Project',       'PROJECT',   100, 1.0, DATE '2026-03-10', 6),
  (8, 3, 'Final Portfolio',         'PROJECT',   100, 2.0, DATE '2026-06-12', 6)
ON CONFLICT DO NOTHING;

INSERT INTO lessons (id, group_id, course_id, teacher_id, topic, scheduled_at) VALUES
  (1,  1, 1, 1, 'Intro to JavaScript', TIMESTAMPTZ '2026-01-08 10:00:00+00'),
  (2,  1, 1, 1, 'ES Modules',          TIMESTAMPTZ '2026-01-15 10:00:00+00'),
  (3,  1, 1, 1, 'Async patterns',      TIMESTAMPTZ '2026-01-22 10:00:00+00'),
  (4,  1, 1, 1, 'REST APIs',           TIMESTAMPTZ '2026-01-29 10:00:00+00'),
  (5,  2, 2, 2, 'Python Basics',       TIMESTAMPTZ '2026-01-09 12:00:00+00'),
  (6,  2, 2, 2, 'NumPy arrays',        TIMESTAMPTZ '2026-01-16 12:00:00+00'),
  (7,  2, 2, 2, 'Pandas DataFrames',   TIMESTAMPTZ '2026-01-23 12:00:00+00'),
  (8,  2, 2, 2, 'Data visualization',  TIMESTAMPTZ '2026-01-30 12:00:00+00'),
  (9,  3, 3, 3, 'Design principles',   TIMESTAMPTZ '2026-01-10 14:00:00+00'),
  (10, 3, 3, 3, 'Color & contrast',    TIMESTAMPTZ '2026-01-17 14:00:00+00'),
  (11, 3, 3, 3, 'Typography',          TIMESTAMPTZ '2026-01-24 14:00:00+00'),
  (12, 3, 3, 3, 'Prototyping',         TIMESTAMPTZ '2026-01-31 14:00:00+00')
ON CONFLICT DO NOTHING;

INSERT INTO lesson_checkins (id, lesson_id, code, open, opened_at, expires_at) VALUES
  (1, 4, 'JS4A29', TRUE, TIMESTAMPTZ '2026-01-29 10:00:00+00', TIMESTAMPTZ '2026-01-29 10:15:00+00')
ON CONFLICT DO NOTHING;

INSERT INTO quizzes (id, course_id, module_id, title, description, time_limit_minutes, max_attempts, pass_score, shuffle_questions, published) VALUES
  (1, 1, 1, 'JS Fundamentals Quiz', 'Variables, types, control flow', 20, 2, 60, FALSE, TRUE),
  (2, 2, 4, 'Python Basics Quiz',   'Collections and types',          15, 3, 50, TRUE,  TRUE),
  (3, 3, 6, 'Design Quiz',          'Principles and color',           10, 1, 50, FALSE, FALSE)
ON CONFLICT DO NOTHING;

INSERT INTO quiz_questions (id, quiz_id, text, type, points, position) VALUES
  (1, 1, 'Which keyword declares a block-scoped constant?', 'SINGLE_CHOICE', 1.0, 0),
  (2, 1, 'let is hoisted to the top of its block.',          'TRUE_FALSE',    1.0, 1),
  (3, 1, 'Name the pattern: a function retaining its lexical scope.', 'SHORT_ANSWER', 2.0, 2),
  (4, 2, 'Which are mutable Python collections?',            'MULTIPLE_CHOICE', 2.0, 0),
  (5, 3, 'Which principle guides the eye to the focal point?', 'SINGLE_CHOICE', 1.0, 0)
ON CONFLICT DO NOTHING;

INSERT INTO quiz_options (id, question_id, text, correct, position) VALUES
  (1, 1, 'let',   FALSE, 0),
  (2, 1, 'var',   FALSE, 1),
  (3, 1, 'const', TRUE,  2),
  (4, 1, 'def',   FALSE, 3),
  (5, 2, 'True',  TRUE,  0),
  (6, 2, 'False', FALSE, 1),
  (7, 4, 'list',  TRUE,  0),
  (8, 4, 'dict',  TRUE,  1),
  (9, 4, 'tuple', FALSE, 2),
  (10, 4, 'frozenset', FALSE, 3),
  (11, 5, 'Contrast', TRUE,  0),
  (12, 5, 'Randomness', FALSE, 1),
  (13, 5, 'Clutter', FALSE, 2)
ON CONFLICT DO NOTHING;

INSERT INTO quiz_attempts (id, quiz_id, student_id, started_at, submitted_at, score, max_score, passed) VALUES
  (1, 1, 1, TIMESTAMPTZ '2026-02-01 09:00:00+00', TIMESTAMPTZ '2026-02-01 09:12:00+00', 3.0, 4.0, TRUE),
  (2, 1, 2, TIMESTAMPTZ '2026-02-01 09:05:00+00', TIMESTAMPTZ '2026-02-01 09:20:00+00', 2.0, 4.0, TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO quiz_attempt_answers (attempt_id, question_id, selected_option_ids, text_answer, points_awarded, correct) VALUES
  (1, 1, '3',  NULL,       1.0, TRUE),
  (1, 2, '5',  NULL,       1.0, TRUE),
  (1, 3, NULL, 'closure',  1.0, TRUE),
  (2, 1, '2',  NULL,       0.0, FALSE),
  (2, 2, '5',  NULL,       1.0, TRUE),
  (2, 3, NULL, 'hoisting', 1.0, TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO rubrics (id, assignment_id, name) VALUES (1, 4, 'Capstone rubric')
ON CONFLICT DO NOTHING;
INSERT INTO rubric_criteria (id, rubric_id, label, max_points, position) VALUES
  (1, 1, 'Functionality', 60, 0),
  (2, 1, 'Code quality',  40, 1)
ON CONFLICT DO NOTHING;
INSERT INTO rubric_scores (criterion_id, student_id, points, comment) VALUES
  (1, 1, 54, 'All core features working'),
  (2, 1, 32, 'Clean, well-structured'),
  (1, 2, 48, 'Minor bugs in auth'),
  (2, 2, 30, 'Good naming')
ON CONFLICT DO NOTHING;

INSERT INTO conversations (id, user_a_id, user_b_id, last_message_at) VALUES
  (1, 2, 5,  TIMESTAMPTZ '2026-02-10 11:05:00+00'),
  (2, 3, 11, TIMESTAMPTZ '2026-02-11 09:30:00+00')
ON CONFLICT DO NOTHING;
INSERT INTO messages (id, conversation_id, sender_id, body, read_at) VALUES
  (1, 1, 2, 'Hi Madina, great work on the async lab!', TIMESTAMPTZ '2026-02-10 11:10:00+00'),
  (2, 1, 5, 'Thank you! I will push the capstone draft this week.', NULL),
  (3, 2, 11, 'Could you review my Pandas assignment?', NULL)
ON CONFLICT DO NOTHING;

INSERT INTO invitations (email, full_name, role, group_id, token_hash, status, expires_at, created_by_user_id) VALUES
  ('new.teacher@edumetric.io', 'Olim Saidov',  'TEACHER', NULL, 'seed_inv_hash_teacher_0001', 'PENDING', TIMESTAMPTZ '2026-07-01 00:00:00+00', 1),
  ('new.student@edumetric.io', 'Kamola Rashid', 'STUDENT', 1,   'seed_inv_hash_student_0002', 'PENDING', TIMESTAMPTZ '2026-07-01 00:00:00+00', 1)
ON CONFLICT DO NOTHING;

INSERT INTO notification_preferences (user_id, event_type, in_app, email) VALUES
  (5, 'GRADE_POSTED',     TRUE,  TRUE),
  (5, 'ABSENCE_MARKED',   TRUE,  FALSE),
  (11, 'MESSAGE_RECEIVED', TRUE, TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO notifications (id, user_id, type, title, body, link, read_at) VALUES
  (1, 5, 'GRADE_POSTED',   'New grade posted', 'Your grade for "Quiz 1: JS Basics" is available.', '/student/grades', NULL),
  (2, 5, 'ANNOUNCEMENT',   'Welcome to Spring 2026', 'Classes begin January 6.', '/student', TIMESTAMPTZ '2026-01-06 08:00:00+00'),
  (3, 6, 'ABSENCE_MARKED', 'Absence recorded', 'You were marked absent for "REST APIs".', '/student/attendance', NULL),
  (4, 11, 'MESSAGE_RECEIVED', 'New message', 'Dilnoza Alimova sent you a message.', '/student/messages', NULL),
  (5, 2, 'REMINDER', 'Lesson tomorrow', 'You have "REST APIs" scheduled tomorrow.', '/teacher/lessons', NULL)
ON CONFLICT DO NOTHING;

INSERT INTO announcements (id, author_user_id, scope, group_id, title, body) VALUES
  (1, 1, 'ALL',   NULL, 'Welcome to Spring 2026', 'All classes begin the week of January 6. Check your dashboards.'),
  (2, 2, 'GROUP', 1,    'FSJS midterm', 'The midterm exam is on March 20. Review modules 1-2.')
ON CONFLICT DO NOTHING;

INSERT INTO enrollments (student_id, group_id, status, enrolled_at, created_by_user_id)
SELECT s.id, s.group_id, 'ACTIVE', DATE '2026-01-06', 1
FROM students s
WHERE s.group_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM enrollments e
    WHERE e.student_id = s.id AND e.group_id = s.group_id
  );

INSERT INTO enrollment_requests (id, student_id, group_id, status, message, decided_by_user_id, decided_at) VALUES
  (1, 10, 1, 'PENDING',  'I would like to also join the FSJS track.', NULL, NULL),
  (2, 11, 1, 'APPROVED', 'Transfer approved.', 1, TIMESTAMPTZ '2026-02-01 10:00:00+00')
ON CONFLICT DO NOTHING;

INSERT INTO term_grades (student_id, course_id, term_id, final_percent, letter, gpa, finalized_by_user_id) VALUES
  (1, 1, 1, 88.5, 'B+', 3.5, 2),
  (2, 1, 1, 92.0, 'A-', 3.7, 2),
  (7, 2, 1, 79.0, 'C+', 2.7, 3)
ON CONFLICT DO NOTHING;

INSERT INTO course_completions (student_id, course_id, certificate_code) VALUES
  (1, 1, 'CERT-FSJS-0001'),
  (2, 1, 'CERT-FSJS-0002')
ON CONFLICT DO NOTHING;


INSERT INTO grades (student_id, assignment_id, value, graded_by_user_id, comment)
SELECT s.id, a.id,
       LEAST(100, 55 + ((s.id * 13 + a.id * 7) % 45))::numeric,
       t.user_id,
       NULL
FROM students s
JOIN groups g            ON g.id = s.group_id
JOIN assignments a       ON a.course_id = g.course_id
JOIN course_teachers ct  ON ct.course_id = g.course_id AND ct.assignment_role = 'LEAD'
JOIN teachers t          ON t.id = ct.teacher_id
ON CONFLICT DO NOTHING;

INSERT INTO attendance (student_id, lesson_id, status, marked_by_user_id, marked_at)
SELECT s.id, l.id,
       CASE
         WHEN (s.id + l.id) % 11 = 0 THEN 'ABSENT'
         WHEN (s.id + l.id) % 7  = 0 THEN 'EXCUSED'
         WHEN (s.id + l.id) % 5  = 0 THEN 'LATE'
         ELSE 'PRESENT'
       END,
       t.user_id, l.scheduled_at
FROM students s
JOIN groups g    ON g.id = s.group_id
JOIN lessons l   ON l.group_id = g.id
JOIN teachers t  ON t.id = l.teacher_id
ON CONFLICT DO NOTHING;

INSERT INTO behavior_records (student_id, teacher_id, period_start, period_end, value)
SELECT s.id, ct.teacher_id,
       DATE '2026-01-05' + (w * 7),
       DATE '2026-01-05' + (w * 7) + 6,
       (1 + ((s.id + w) % 5))::smallint
FROM students s
JOIN groups g           ON g.id = s.group_id
JOIN course_teachers ct ON ct.course_id = g.course_id AND ct.assignment_role = 'LEAD'
CROSS JOIN generate_series(0, 3) AS w
ON CONFLICT DO NOTHING;

INSERT INTO activity_records (student_id, teacher_id, period_start, period_end, value)
SELECT s.id, ct.teacher_id,
       DATE '2026-01-05' + (w * 7),
       DATE '2026-01-05' + (w * 7) + 6,
       (1 + ((s.id + w + 2) % 5))::smallint
FROM students s
JOIN groups g           ON g.id = s.group_id
JOIN course_teachers ct ON ct.course_id = g.course_id AND ct.assignment_role = 'LEAD'
CROSS JOIN generate_series(0, 3) AS w
ON CONFLICT DO NOTHING;

INSERT INTO material_completions (student_id, material_id)
SELECT s.id, m.id
FROM students s
JOIN groups g          ON g.id = s.group_id
JOIN course_modules cm ON cm.course_id = g.course_id
JOIN course_materials m ON m.module_id = cm.id
WHERE (s.id + m.id) % 3 = 0
ON CONFLICT DO NOTHING;

INSERT INTO homework_submissions (student_id, assignment_id, comment)
SELECT s.id, 1, 'Submitting my Quiz 1 prep notes.'
FROM students s JOIN groups g ON g.id = s.group_id
WHERE g.course_id = 1 AND s.id <= 3
ON CONFLICT DO NOTHING;

INSERT INTO submissions (student_id, course_id, kind, assignment_id, status, score, max_score, attempt_count, graded_at)
SELECT s.id, 1, 'HOMEWORK', 1, 'GRADED', 82, 100, 1, TIMESTAMPTZ '2026-02-02 12:00:00+00'
FROM students s JOIN groups g ON g.id = s.group_id
WHERE g.course_id = 1 AND s.id <= 3
ON CONFLICT DO NOTHING;

INSERT INTO submissions (student_id, course_id, kind, quiz_id, status, score, max_score, attempt_count, graded_at)
VALUES
  (1, 1, 'QUIZ', 1, 'GRADED', 3, 4, 1, TIMESTAMPTZ '2026-02-01 09:12:00+00'),
  (2, 1, 'QUIZ', 1, 'GRADED', 2, 4, 1, TIMESTAMPTZ '2026-02-01 09:20:00+00')
ON CONFLICT DO NOTHING;

INSERT INTO submission_feedback (id, assignment_id, student_id, author_user_id, body) VALUES
  (1, 2, 1, 2, 'Good use of async/await. Watch unhandled promise rejections.'),
  (2, 4, 2, 2, 'Strong project. Add tests before final submission.')
ON CONFLICT DO NOTHING;

INSERT INTO grade_appeals (id, assignment_id, student_id, reason, status) VALUES
  (1, 3, 4, 'I believe question 5 was graded incorrectly.', 'PENDING')
ON CONFLICT DO NOTHING;

INSERT INTO plagiarism_reports (id, assignment_id, student_a_id, student_b_id, similarity) VALUES
  (1, 4, 5, 6, 71.50)
ON CONFLICT DO NOTHING;

INSERT INTO peer_reviews (assignment_id, reviewer_student_id, reviewee_student_id, status, score, comments, submitted_at) VALUES
  (4, 1, 2, 'SUBMITTED', 88, 'Clean structure, good documentation.', TIMESTAMPTZ '2026-06-08 15:00:00+00'),
  (4, 2, 1, 'ASSIGNED',  NULL, NULL, NULL)
ON CONFLICT DO NOTHING;

INSERT INTO absence_justifications (student_id, lesson_id, reason, status, decided_by_user_id, decided_at) VALUES
  (6, 4, 'Medical appointment, doctor note attached.', 'PENDING', NULL, NULL),
  (3, 3, 'Family emergency.', 'APPROVED', 2, TIMESTAMPTZ '2026-01-23 09:00:00+00')
ON CONFLICT DO NOTHING;

INSERT INTO student_metrics (student_id, composite_score, grades_norm, attendance_norm, practical_norm, behavior_norm, activity_norm, growth_bonus, consistency_bonus, formula_version, sample_size, low_confidence)
SELECT s.id,
       (58 + (s.id * 3) % 32)::numeric,
       (60 + (s.id * 5) % 30)::numeric,
       (70 + (s.id * 7) % 25)::numeric,
       (55 + (s.id * 4) % 35)::numeric,
       (60 + (s.id * 6) % 30)::numeric,
       (60 + (s.id * 2) % 30)::numeric,
       (s.id % 6)::numeric,
       (s.id % 4)::numeric,
       'v1.0', 6, FALSE
FROM students s
ON CONFLICT DO NOTHING;

INSERT INTO metric_snapshots (student_id, snapshot_date, composite_score, grades_norm, attendance_norm, practical_norm, behavior_norm, activity_norm, growth_bonus, consistency_bonus)
SELECT s.id,
       DATE '2026-01-12' + (w * 7),
       LEAST(100, (52 + (s.id * 3) % 28) + w * 1.4)::numeric,
       LEAST(100, (55 + (s.id * 5) % 25) + w * 1.2)::numeric,
       LEAST(100, (68 + (s.id * 7) % 22) + w * 0.8)::numeric,
       LEAST(100, (50 + (s.id * 4) % 30) + w * 1.5)::numeric,
       LEAST(100, (58 + (s.id * 6) % 28) + w * 1.0)::numeric,
       LEAST(100, (58 + (s.id * 2) % 28) + w * 1.0)::numeric,
       (w % 6)::numeric,
       (w % 4)::numeric
FROM students s
CROSS JOIN generate_series(0, 7) AS w
ON CONFLICT DO NOTHING;

INSERT INTO refresh_tokens (user_id, token_hash, expires_at, user_agent, ip_address) VALUES
  (5, 'seed_refresh_hash_student_0001', TIMESTAMPTZ '2026-07-01 00:00:00+00', 'Mozilla/5.0 (demo)', '127.0.0.1')
ON CONFLICT DO NOTHING;

INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES
  (6, 'seed_pwreset_hash_0001', TIMESTAMPTZ '2026-06-15 00:00:00+00')
ON CONFLICT DO NOTHING;

INSERT INTO email_verification_tokens (user_id, token_hash, expires_at, used_at) VALUES
  (16, 'seed_emailverify_hash_0001', TIMESTAMPTZ '2026-06-20 00:00:00+00', NULL)
ON CONFLICT DO NOTHING;

INSERT INTO mfa_backup_codes (id, user_id, code_hash) VALUES
  (1, 1, 'seed_mfa_backup_hash_0001'),
  (2, 1, 'seed_mfa_backup_hash_0002')
ON CONFLICT DO NOTHING;

INSERT INTO reminder_log (reminder_type, ref_id, user_id) VALUES
  ('UPCOMING_LESSON', 4, 5),
  ('ASSIGNMENT_DUE',  3, 5)
ON CONFLICT DO NOTHING;

INSERT INTO audit_log (id, entity_type, entity_id, action, actor_user_id, payload) VALUES
  (1, 'Course', 1, 'CREATE', 1, '{"name":"Full-Stack JavaScript","code":"FSJS-2026"}'::jsonb),
  (2, 'Grade',  1, 'CREATE', 2, '{"assignmentId":1,"studentId":1}'::jsonb)
ON CONFLICT DO NOTHING;

SELECT setval(pg_get_serial_sequence('departments',         'id'), (SELECT MAX(id) FROM departments));
SELECT setval(pg_get_serial_sequence('courses',             'id'), (SELECT MAX(id) FROM courses));
SELECT setval(pg_get_serial_sequence('institution_settings','id'), (SELECT MAX(id) FROM institution_settings));
SELECT setval(pg_get_serial_sequence('academic_terms',      'id'), (SELECT MAX(id) FROM academic_terms));
SELECT setval(pg_get_serial_sequence('users',               'id'), (SELECT MAX(id) FROM users));
SELECT setval(pg_get_serial_sequence('groups',              'id'), (SELECT MAX(id) FROM groups));
SELECT setval(pg_get_serial_sequence('teachers',            'id'), (SELECT MAX(id) FROM teachers));
SELECT setval(pg_get_serial_sequence('students',            'id'), (SELECT MAX(id) FROM students));
SELECT setval(pg_get_serial_sequence('course_syllabus',     'id'), (SELECT MAX(id) FROM course_syllabus));
SELECT setval(pg_get_serial_sequence('course_modules',      'id'), (SELECT MAX(id) FROM course_modules));
SELECT setval(pg_get_serial_sequence('course_materials',    'id'), (SELECT MAX(id) FROM course_materials));
SELECT setval(pg_get_serial_sequence('material_versions',   'id'), (SELECT MAX(id) FROM material_versions));
SELECT setval(pg_get_serial_sequence('grade_categories',    'id'), (SELECT MAX(id) FROM grade_categories));
SELECT setval(pg_get_serial_sequence('assignments',         'id'), (SELECT MAX(id) FROM assignments));
SELECT setval(pg_get_serial_sequence('lessons',             'id'), (SELECT MAX(id) FROM lessons));
SELECT setval(pg_get_serial_sequence('lesson_checkins',     'id'), (SELECT MAX(id) FROM lesson_checkins));
SELECT setval(pg_get_serial_sequence('quizzes',             'id'), (SELECT MAX(id) FROM quizzes));
SELECT setval(pg_get_serial_sequence('quiz_questions',      'id'), (SELECT MAX(id) FROM quiz_questions));
SELECT setval(pg_get_serial_sequence('quiz_options',        'id'), (SELECT MAX(id) FROM quiz_options));
SELECT setval(pg_get_serial_sequence('quiz_attempts',       'id'), (SELECT MAX(id) FROM quiz_attempts));
SELECT setval(pg_get_serial_sequence('rubrics',             'id'), (SELECT MAX(id) FROM rubrics));
SELECT setval(pg_get_serial_sequence('rubric_criteria',     'id'), (SELECT MAX(id) FROM rubric_criteria));
SELECT setval(pg_get_serial_sequence('conversations',       'id'), (SELECT MAX(id) FROM conversations));
SELECT setval(pg_get_serial_sequence('messages',            'id'), (SELECT MAX(id) FROM messages));
SELECT setval(pg_get_serial_sequence('notifications',       'id'), (SELECT MAX(id) FROM notifications));
SELECT setval(pg_get_serial_sequence('announcements',       'id'), (SELECT MAX(id) FROM announcements));
SELECT setval(pg_get_serial_sequence('enrollment_requests', 'id'), (SELECT MAX(id) FROM enrollment_requests));
SELECT setval(pg_get_serial_sequence('submission_feedback', 'id'), (SELECT MAX(id) FROM submission_feedback));
SELECT setval(pg_get_serial_sequence('grade_appeals',       'id'), (SELECT MAX(id) FROM grade_appeals));
SELECT setval(pg_get_serial_sequence('plagiarism_reports',  'id'), (SELECT MAX(id) FROM plagiarism_reports));
SELECT setval(pg_get_serial_sequence('mfa_backup_codes',    'id'), (SELECT MAX(id) FROM mfa_backup_codes));
SELECT setval(pg_get_serial_sequence('audit_log',           'id'), (SELECT MAX(id) FROM audit_log));

COMMIT;
