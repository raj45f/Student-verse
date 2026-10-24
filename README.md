# StudentVerse — Your Campus. Your Community. Your Next Big Idea. 🎓✨

> An Instagram-inspired student social media platform built for hackathons with **React + Vite + Supabase + Lucide Icons**. Featuring **Photos**, **Videos & Campus Reels**, **Live Campus Chat**, **Follow / Unfollow**, and **Friend Requests**!

---

## 📌 Project Overview

**StudentVerse** connects college students across campuses:
- **Social Feed & Media**: Share campus thoughts, auto-compressed photos, and video demo reels with native video player controls.
- **Following Feed**: Filter the feed to only see updates from students you follow.
- **Follow & Unfollow**: Follow peers directly from their post headers or from the "Discover Students" directory.
- **Friend Requests & Connections**: Send friend requests, review pending requests with **Accept / Decline** controls, and view your friends list.
- **Live Campus Chat**: Real-time group messaging in Club Channels (Coding & AI Club, Campus Creators, Placement Prep) and 1-on-1 Direct Messages with classmates.
- **Campus Communities**: Explore and join cross-campus clubs with atomic member count maintenance.
- **Student Profiles**: Public student profiles with college tags, custom bios, avatars, and follower/friends statistics.

---

## 🛠️ Technology Stack

| Layer | Tool / Library | Purpose |
|---|---|---|
| **Frontend** | React 18 + Vite | Fast, modern Single-Page Application (SPA) |
| **Icons** | `lucide-react` | Clean UI iconography |
| **Styling** | Custom Responsive CSS | Instagram-inspired light theme with lavender/purple accents |
| **Backend / DB** | Supabase (PostgreSQL) | Managed database, RLS security, triggers, Auth, Chat messages |
| **Auth** | Supabase Auth | User registration, password encryption, session persistence |
| **Social Graph** | PostgreSQL Tables | Follows, Friend Requests, Community Memberships |

---

## 🗂️ Project Structure

```text
studentverse/
├── index.html                   # HTML template with Plus Jakarta Sans & brand favicon
├── package.json                 # Project dependencies & Vite scripts
├── vite.config.js               # Vite React configuration
├── .env.example                 # Template for Supabase credentials
├── .env.local                   # Local credentials (ignored by Git)
├── README.md                    # Setup, milestones, troubleshooting & demo script
├── src/
│   ├── main.jsx                 # React root renderer
│   ├── App.jsx                  # Main application: Feed, Media, Chat, Friends, Follows
│   ├── styles.css               # Modern light theme, video player, chat & connections styling
│   └── supabase.js              # Supabase client instantiation & fallback guards
└── supabase/
    └── schema.sql               # Complete SQL schema, RLS policies, triggers, and seed data
```

---

## 👥 Follow & Friend Request Features Guide

### 1. Follow / Unfollow System
- **From Posts**: Every post by another student has an inline **"+ Follow"** button. Clicking it instantly updates state to **"Following ✓"** with toast confirmation.
- **From Suggested Peers**: The right sidebar and "Discover Students" directory allow 1-click following/unfollowing.
- **Following Feed**: On the main feed, switch to the **"👥 Following"** tab to see posts exclusively from people you follow.
- **Stats on Profile**: Your profile tracks your live **Followers** and **Following** numbers.

### 2. Friend Requests & Connections
- Click **"Friends & Requests"** in the sidebar (shows a red notification badge when there are pending requests).
- **Incoming Requests**: View students who want to connect with you. Click **"Accept 🤝"** to become friends and follow each other, or **"Decline ✕"** to dismiss.
- **Discover Students**: Browse cross-college peers from IIT Delhi, BITS Pilani, Delhi University, NIT Trichy, and IIT Bombay. Send friend requests with 1-click (**"+ Add Friend"** ➔ **"Requested ⏳"**).
- **My Friends**: Access your connected student friends list, complete with a **"Message"** shortcut button that opens an instant private chat!

---

## 🚀 Windows Setup Guide (Step-by-Step)

### 1. Prerequisites
- **Node.js LTS** (v18 or higher): Download from [nodejs.org](https://nodejs.org/).
- **VS Code**: [code.visualstudio.com](https://code.visualstudio.com/).

### 2. Install Project Dependencies
```powershell
cd d:\study\Webdevlopment\studentverse
npm install
```

### 3. Run Database Setup Script
In your Supabase project's **SQL Editor**, run the entire script located in [`supabase/schema.sql`](supabase/schema.sql).
This configures:
- Tables: `profiles`, `posts`, `likes`, `comments`, `campus_communities`, `community_members`, `follows`, `friend_requests`, `messages`
- Row Level Security (RLS) policies on every table
- Triggers for profile creation, like counters, and member counters
- Seed data for campus clubs

### 4. Start Development Server
```powershell
npm run dev
```
Open **`http://localhost:5173`** in your browser!

---

## 🎤 2-Minute Hackathon Demo Script

1. **Introduction (0:00 - 0:25)**:
   > *"Good afternoon judges! When students enter college, connecting across departments and colleges is tough. We built **StudentVerse** — an Instagram-style social platform tailored for students with photos, demo video reels, campus chat, and a full cross-college social graph."*

2. **Social Feed & Follow System (0:25 - 1:00)**:
   > *"Notice how easy it is to interact: right from the feed, I can follow any student with one tap on their post header. I can switch our feed filter to '👥 Following' to see updates exclusively from students I follow, or '🎥 Campus Videos & Reels' to watch project demo videos."*

3. **Friend Requests & Connections (1:00 - 1:35)**:
   > *"In our 'Friends & Requests' tab, students can manage incoming friend requests. Notice the red counter badge. I can review requests from peers at other colleges and hit 'Accept 🤝' to connect. Our 'Discover Students' section makes finding project collaborators effortless, and with one click from my friends list, I can launch directly into a live private chat."*

4. **Security & Closing (1:35 - 2:00)**:
   > *"Built with React, Vite, and Supabase PostgreSQL with strict Row Level Security, StudentVerse gives students an authentic, modern campus home. Thank you!"*
