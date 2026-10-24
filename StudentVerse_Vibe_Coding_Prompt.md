# StudentVerse — Master Vibe-Coding Prompt

**Project:** StudentVerse  
**Tagline:** Your campus. Your community. Your next big idea.  
**Goal:** Build a working, beginner-friendly student social platform for a hackathon in 3–4 hours.

## Copy-paste prompt

You are a senior full-stack developer, UI/UX designer, Supabase expert, and beginner-friendly coding mentor.

Help me build **StudentVerse**, an Instagram-inspired social media platform designed for students. I am a beginner, working solo on Windows, using vibe coding and free tools. I have approximately 3–4 hours to build a hackathon MVP.

### 1. Technology stack

- Frontend: React + Vite + JavaScript
- Styling: Responsive CSS
- Backend and database: Supabase
- Authentication: Supabase Auth
- Database: Supabase PostgreSQL
- Client: `@supabase/supabase-js`
- Icons: `lucide-react`
- Hosting: Free hosting where available
- AI: No paid AI API required

Keep the architecture simple. Avoid unnecessary libraries and complex patterns.

### 2. Design requirements

Create a polished, Instagram-inspired **light theme**.

- White cards and a light gray/lavender background.
- Purple primary buttons and active navigation.
- Rounded cards, subtle borders and shadows.
- Clean typography and generous spacing.
- Desktop sidebar and responsive mobile navigation.
- Student avatars, profile summaries and campus information.
- A main social feed and a right sidebar for suggested communities.
- Responsive design for mobile, tablet and desktop.
- Loading indicators, empty states, success messages and useful error messages.
- Accessible form labels, keyboard focus and readable contrast.

Use original StudentVerse branding instead of copying Instagram logos or assets.

### 3. Required MVP features

**A. Authentication**
- Sign up with full name, username, college/campus, email and password.
- Sign in and sign out.
- Handle email confirmation and authentication errors.
- Create a profile for each registered user.
- Enforce unique usernames.

**B. Social feed**
- Display recent posts, newest first.
- Show author, username, campus, post text, optional image and timestamp.
- Include like and comment counts.
- Add a basic search for posts, students and campuses.
- Include loading, empty and error states.

**C. Create posts**
- Authenticated users can publish text posts.
- Support optional images.
- For the fastest MVP, public image URLs are acceptable.
- Clearly explain if actual image upload is not implemented.
- Prevent empty posts and validate content length.

**D. Likes**
- Like and unlike posts.
- Allow one like per user per post.
- Store likes in Supabase.
- Update the UI after successful operations.

**E. Comments**
- Add comments to posts.
- Display existing comments and comment counts.
- Reject blank comments and validate their length.
- Show helpful error messages if a request fails.

**F. Student profiles**
- Display name, username, college, bio and posts.
- Allow users to edit their own profile.
- Prevent users from editing other users' profiles.

**G. Campus communities**
Seed these example communities:
- Coding & AI Club
- Campus Creators
- Placement Prep Circle
- Study Buddies

Display descriptions, categories and member counts. Allow users to join and leave communities. Prevent duplicate memberships and maintain accurate member counts using database logic.

### 4. Database and security

Create a complete Supabase SQL setup file containing:

- `profiles`
- `posts`
- `likes`
- `comments`
- `campus_communities`
- `community_members`

Include:
- Primary and foreign keys.
- Unique constraints and validation.
- Useful indexes.
- Row Level Security (RLS) on all exposed tables.
- Explicit least-privilege policies.
- Safe profile creation after signup.
- Community membership count logic.
- Example community records.

Security rules:
- Users can create content only as themselves.
- Users can update only their own profiles.
- Users can delete only their own content where deletion is implemented.
- Never put the Supabase service-role key in frontend code.
- Never disable RLS to bypass an error.
- Use the project URL and publishable/anon key in frontend environment variables.

**Important:** A user entering a college name does not prove they are a student. Clearly label genuine student verification as a future improvement requiring college-email verification or moderator approval.

### 5. Required project structure

Create a working project with this structure:

```text
studentverse/
├── index.html
├── package.json
├── .env.example
├── README.md
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── styles.css
│   └── supabase.js
└── supabase/
    └── schema.sql
```

You may add more components if needed, but keep the project beginner-friendly.

### 6. Windows setup instructions

Explain how to:

1. Install Node.js LTS and VS Code.
2. Create a React project using Vite.
3. Install dependencies.
4. Create a free Supabase project.
5. Run `supabase/schema.sql` in the Supabase SQL Editor.
6. Configure `.env.local`.
7. Start the development server.
8. Open the app in a browser.
9. Test signup, sign-in and database operations.
10. Troubleshoot common npm, Vite, Auth, RLS and environment-variable errors.

Use commands such as:

```powershell
npm create vite@latest studentverse -- --template react
cd studentverse
npm install
npm install @supabase/supabase-js lucide-react
npm run dev
```

Example `.env.local`:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

Tell me where to find these values in Supabase. Never invent credentials.

### 7. Implementation milestones

**Milestone 1 — Foundation**
- Create the project.
- Install dependencies.
- Configure Supabase.
- Create database tables and policies.
- Verify the app starts.

**Milestone 2 — Authentication and profiles**
- Implement signup, sign-in and sign-out.
- Create and load profiles.
- Test profile editing and ownership.

**Milestone 3 — Social feed**
- Load and create posts.
- Implement likes and comments.
- Test with two separate accounts.

**Milestone 4 — Campus communities**
- Display communities.
- Implement join/leave.
- Verify membership uniqueness and accurate counts.

**Milestone 5 — Polish and hackathon demo**
- Finish responsive styling.
- Add loading, empty, success and error states.
- Run `npm run build`.
- Fix build errors.
- Prepare a short presentation and demo script.

After each milestone, list:
- Files created or modified.
- Commands to run.
- Expected result.
- Testing steps.
- Common problems and their solutions.

Do not proceed past a broken critical milestone without explaining how to fix it.

### 8. Realistic 3–4 hour scope

Prioritize this complete user journey:

**Sign up → create profile → publish post → see it in feed → like/comment → join a campus community.**

Defer these features until later:
- Stories and reels.
- Direct messages and realtime chat.
- Push notifications.
- Recommendation algorithms.
- AI features.
- Advanced moderation tools.
- Verified college-only access.
- Video uploads.

Do not claim a feature works unless it is actually implemented. Do not claim code was tested unless it was run and verified.

### 9. Final deliverables

Provide:
1. Complete code for every required file.
2. Full SQL schema and RLS policies.
3. Windows setup guide.
4. Environment-variable instructions.
5. Manual testing checklist.
6. Troubleshooting guide.
7. Hackathon demo script.
8. Implemented features versus future improvements.

Use simple English or Hinglish and explain unfamiliar concepts clearly. Avoid giant, unexplained code dumps. If you can create project files directly, create them; otherwise, label every code block with its destination filename.

**Start with project setup and database SQL, then implement the frontend step by step.**
