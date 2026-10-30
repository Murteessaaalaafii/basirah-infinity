# Nexora Studio — Full Platform Build

## 1. Backend (Lovable Cloud)

**New tables (with RLS):**
- `profiles` — user_id, full_name, email, avatar_url, company
- `user_roles` — user_id, role enum (`admin`, `assistant`, `client`) + `has_role()` security-definer function
- `leads` — name, email, phone, company, service_interest, message, source, tag, status (`new`/`contacted`/`qualified`/`won`/`lost`), assigned_to
- `orders` — client_id, service, package, amount, status (`pending`/`in_progress`/`delivered`/`cancelled`), notes
- `messages` — sender_id, recipient_id (admin), thread_id, subject, body, read, from_assistant boolean
- `collaborations` — name, email, type (`agency`/`freelancer`/`partner`/`investor`), portfolio_url, proposal, status, response_sent
- Trigger: auto-create profile on signup; auto-assign `admin` role to `murtesaalafi@gmail.com`, `client` role to everyone else
- Lead capture is public-insertable (anon can create leads); only admin/assistant can read

**Auth:**
- Email/password + Google OAuth
- Admin login: `murtesaalafi@gmail.com` / `murtesaadmin` (user creates via signup; trigger grants admin role by email match)

**Server functions (`createServerFn`):**
- `submitLead` — public, inserts lead, tags it, triggers welcome email sequence
- `submitCollaboration` — public, inserts + sends auto-response email
- `sendEmail` — uses Lovable AI Gateway / Resend-style; for now logs to `email_send_log` table and uses fetch to a mailer endpoint. Since email infra not set up, we'll queue in DB and show admin a "send" action; real sending requires email domain setup (will note to user)
- `getAdminStats`, `getLeads`, `getOrders`, `getMessages`, `updateLeadStatus`, `assignLead`

## 2. Routes (independent pages)

```
/                  Landing (hero + highlights only)
/services          Full services
/about             About + brand values
/pricing           Pricing tiers
/portfolio         Case studies
/collaborate       Partnership form
/contact           Lead capture form
/login             Sign in
/register          Sign up
/reset-password    Password reset
/_authenticated/dashboard        Client dashboard (orders, messages)
/_authenticated/_admin/admin     Admin CRM (leads, orders, messages, collaborations, assistants)
```

## 3. UI / Design System

- Keep dark futuristic Nexora theme already in `styles.css`
- Header redesign: glassmorphic sticky nav with logo (existing `NexoraLogo`), nav links, **Login** + **Register** CTA pair (gradient pill buttons) on the right
- "Get Started" buttons globally point to `/register`
- Each page gets its own `head()` SEO meta
- Admin dashboard: sidebar layout, KPI cards, tabs for Leads / Orders / Messages / Collaborations / Team

## 4. Lead Capture & CRM Pipeline

- Contact form + hero CTA write to `leads` with auto-tag based on `service_interest`
- Admin can change lead status (kanban-style or status dropdown) → triggers status-change email entry
- All collaboration submissions auto-send confirmation email to applicant + notify admin

## 5. Email

- Without a verified email domain we cannot actually send mail. I'll wire a `notifications` table + server function stub that records every "email" with subject/body/recipient, and surface them in the admin dashboard as a queue. I'll also mention the user can enable Lovable Emails (domain setup) to actually deliver them.
- All "send to" addresses default to `murtesaalafi@gmail.com` for admin notifications.

## 6. Order of operations

1. Migration (tables + RLS + trigger + role function)
2. Auth pages (`/login`, `/register`, `/reset-password`) + auth context in `__root`
3. New layout: `Header` component with Login/Register, used across pages
4. Split index → independent route files (`/services`, `/about`, `/pricing`, `/portfolio`, `/contact`, `/collaborate`)
5. Server functions for leads, collaborations, admin queries
6. Client `/dashboard` and admin `/_authenticated/_admin/admin` dashboards
7. Wire CTAs (Get Started → /register)

## Notes for the user

- Real email delivery requires setting up an email sender domain (one-time DNS setup). I'll build the full pipeline + queue now; once you set up the domain I can flip the switch to actually deliver.
- Admin role is auto-granted to `murtesaalafi@gmail.com` the moment that email signs up — sign up with that email and password `murtesaadmin` to claim admin access.
