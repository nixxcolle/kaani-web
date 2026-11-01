# KaAni Web

A responsive React / TypeScript website for agriculture and fisheries education, quizzes, legal information, sustainability resources, and a local marketplace prototype.

## Run locally

```sh
npm install
npm run dev
```

Open the URL printed by Vite, including `/Kaani-web/`. The base path matches the existing GitHub Pages deployment. Production builds are written to `dist/`, with a `404.html` copy for client-side routing.

```sh
npm run typecheck
npm run lint
npm test
npm run build
```

The regression tests cover bilingual learning and quiz content, authentication failures, email confirmation, forged legacy login flags, report delivery failures, anonymous duplicate detection, and commission rounding/idempotency.

## Languages and presentation

Use the language selector in the header or learning reader to choose English, Tagalog, or Waray-Waray. The selection updates React immediately without navigation, is saved in kaani_lang for future visits, synchronizes across tabs, and updates the HTML language tag. Existing fil preferences are retained; tl is also accepted as an alias. A blocked browser storage still allows in-memory switching.

src/lib/locales.ts defines language labels, compact labels, and HTML tags. The shared source-English catalogs are src/lib/translations.ts (Tagalog) and src/lib/waray.ts (Waray-Waray), registered in src/lib/translation-catalogs.ts. Keyed navigation overrides live in src/lib/i18n-data.ts. Add a locale to the registry, provide its catalog and keyed overrides, and extend the coverage checks when adding languages. Missing text falls back to its source; no external translation API receives user content.

The catalogs cover the current editorial interface, forms, errors, live notifications, built-in quiz and learning text, and the current public module descriptions. Waray wording targets broadly understood Samar/Leyte usage and should receive native-speaker editorial review before publication. Official agency names and scientific terms are retained. Original downloadable PDFs remain in their source language. New free-form content and proper names retain their source text unless a translation is added; include new editorial/database content in both catalogs before publication. Unknown user-authored product descriptions are not sent away for automatic machine translation.

Translations apply at render time; database IDs, form values, quiz answer keys, seller names, phone numbers, and saved records remain unchanged. Search matches the original content and its selected-language translation. Toasts keep source messages in state and translate when displayed, so an open notification follows later language changes.

The shared design uses forest green, coastal blue, rounded outline icons, responsive spacing, keyboard focus indicators, and scrollable dialogs. Ambient CSS animation uses transforms and opacity; reduced-motion preferences disable motion. Routes load on demand.

## Authentication and backend requirements

The app now uses **Supabase Auth**. It no longer reads or writes password hashes in a public `users` table, creates accounts during login, or falls back to browser-based member authentication. Guest sessions remain available without a network connection. Legacy cached password hashes are removed.

Existing accounts created by the old custom `users` implementation are **not Supabase Auth accounts**. Users must register through Supabase Auth or be migrated through a trusted administrative process. Email confirmation is handled explicitly. Enable the email/password provider and configure email delivery, redirect URLs, and any user-profile triggers in your Supabase project. Verify that `quiz_scores.user_id` accepts authenticated user IDs and that row-level security limits score writes to the authenticated owner.

### Troubleshoot sign-in

The sign-in screen now distinguishes incorrect credentials, unconfirmed email, rate limits, connection failures, email delivery restrictions, and server/database failures. Successful authentication is no longer rejected when optional browser display caches cannot be written. Confirmation instructions appear as a status notice, with a resend action; confirmation callbacks restore the Supabase session and open the quiz.

Submitting sign-in, registration, or confirmation email requests has an immediate in-flight guard. A rate-limit response pauses affected submissions for a visible 60-second local cooldown. An email quota pauses registration and resending, while password sign-in remains available for confirmed accounts. A general request limit pauses all authentication submissions. The app does not automatically retry authentication. The local pause does not reset or shorten Supabase's server-side limit; a longer wait may be necessary depending on the project's configuration. See [Supabase rate limits](https://supabase.com/docs/guides/auth/rate-limits) and the project's [Authentication → Rate Limits](https://supabase.com/dashboard/project/isdbsiocqiaxttlfysqq/auth/rate-limits).

In **Authentication → URL Configuration**, allow the exact callback used by the running app, for example `https://nixxcolle.github.io/Kaani-web/auth` for GitHub Pages and `http://localhost:8080/Kaani-web/auth` for local Vite. Use the printed preview origin when testing other ports. The app computes the callback from its actual origin and Vite base path.

Supabase's default email service only sends to organization team members. For public registration and confirmation emails, configure a custom SMTP service under the project's email settings. For this project, the owner has selected immediate access: disable Confirm email in Authentication → Sign In / Providers → Email and save. The app accepts the session returned by signUp and opens the quiz immediately; it never fabricates a session. This allows users to register email addresses they do not own. If confirmation is enabled again, email delivery must work. See the [official SMTP guide](https://supabase.com/docs/guides/auth/auth-smtp).

For a confirmed account that still fails, inspect its latest `/token` error in [this project's Auth logs](https://supabase.com/dashboard/project/isdbsiocqiaxttlfysqq/logs/auth-logs). A `Database error` requires investigating the matching Auth/Postgres log entry rather than changing passwords or relaxing permissions blindly. The read-only `supabase/diagnostics/auth.sql` file checks account confirmation counts, signup triggers, profile columns, and constraints without returning user records. No database changes are applied by that script.

Optional `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` environment variables can point the app to another project; configure both for the same project and rebuild. Never expose a service-role key in frontend configuration. See `.env.example`.

The existing public Supabase project configuration remains in `src/lib/supabase.ts`. Public module and quiz reads were checked, including translations for the current remote text. This change does not configure the remote database, migrate existing users, verify remote row-level-security policies, or send live test reports. Built-in quiz questions remain available after assets have loaded; module listings require database access.

Reports are only acknowledged after the remote insert succeeds. The `market_reports` table must support the fields in `src/lib/reports.ts`, including reporter name/contact, and enforce suitable insertion and read policies. Public browser-based moderation controls were removed. Moderation must run behind authenticated server-enforced permissions.

## Marketplace product management

Run the complete contents of supabase/marketplace.sql in this project's Supabase SQL Editor once (and rerun it after policy updates). It creates public.marketplace_products and the public product-photos bucket. The legacy products table and existing browser-only listings are not modified or silently imported because they have no verified owner. Old local listings remain in browser storage but are no longer shown as shared listings.

Members can publish products, edit all details, restock using the Stock field, choose Available / Out of Stock / Unavailable, replace a photo, or delete their listings. Use My Products to find your own items. Guests can browse and must sign in to publish. Seller names, phone numbers, locations, and product photos are public listing information.

Photos are selected as files only, checked for JPG/PNG/WebP signatures and a 5 MB limit, and uploaded under user-id/product-id/random-file-name. The resulting public URL and Storage path are saved with the product. Supabase enforces ownership on create/update/delete, immutable ownership, required photo existence, and stock/status constraints. Storage policies restrict writes to the owner's folder and prohibit overwriting photos or deleting a photo still referenced by a listing. See [Storage policies](https://supabase.com/docs/guides/storage/security/access-control).

Successful writes immediately update the local catalog and open product/contact views, then refresh the database. Realtime broadcasts database changes; a window-focus refresh and 30-second visible-page polling cover missed events. Stale edits/deletes are rejected using the server's updated_at value rather than overwriting concurrent changes. Changes to other open edit forms require refreshing before resubmission.

Old photos are removed only after the database confirms replacement or deletion. Cleanup failures are shown as warnings. A lost network response may leave an unused uploaded object: refresh before retrying to avoid duplicate listings, and remove confirmed unreferenced files through the owner/admin Storage interface. Account deletion can also leave photos requiring administrative cleanup. The app deliberately keeps an uploaded photo when a save might already have committed.

Favorites and pending SMS inquiries remain browser-local. Contact forms open an SMS draft; this implementation does not process payments, reserve stock, or promise delivery. Illustrative platform fees are not charged.

## Deployment

```sh
npm run build
npm run deploy
```

Deployment requires access to the existing GitHub Pages repository. No deployment was performed as part of these local changes.

## Supabase module integration

The SDK uses the project root URL (https://isdbsiocqiaxttlfysqq.supabase.co), not the REST endpoint. A supplied /rest/v1/ suffix is normalized; do not include square brackets around the public key. Rebuild after changing Vite environment variables.

Both learning pages fetch only public.modules records on every mount and after app authentication changes, using ordered pages with exact counts. No built-in modules or static lesson content are merged or used as a fallback. Empty results render an empty state; read failures render an error and retry action. Text-only modules are retained. Refreshing reflects additions, updates, and deletions visible to the current role. Category, difficulty, and read-time labels are omitted because they are not stored in the queried schema. Uploaded file_data takes precedence over bundled file_name PDFs; a database filename alone does not upload a document to public/assets/docs.

Run supabase/diagnostics/modules.sql as the project owner to compare the actual row count against anon/authenticated visibility, grants, and policies. The anon key cannot inspect or change RLS settings. supabase/modules-read-policy.sql is the owner-run repair for this public learning library. It grants anon/authenticated read access to the module fields used by the app, removes the three diagnosed anonymous creation/update/deletion policies, and revokes anonymous insert/update/delete grants. Other policies remain unchanged; it does not grant editing permissions to members. No SQL has been applied remotely by this update.

Public module catalog reads use a separate session-free Supabase client and the existing anon SELECT policy, including when a member is signed in. Member authentication and private writes continue using the authenticated client. This does not grant new database permissions or expose non-public tables.

## Registration without role selection

Register links open /auth?mode=signup directly. The form requires Full Name, Email, Password, and password confirmation. Signup metadata contains only the name; application user/guest objects no longer contain a role. Old /role-selection bookmarks redirect to the account form and legacy role/profile query parameters are ignored. No contact number is collected at registration; sellers provide public contact information when publishing products.

To clean up existing database data, run supabase/remove-registration-role.sql as the project owner. It removes the obsolete public.users.role column if present and clears the app's old role=user metadata. It stops rather than removing dependencies if a signup/profile trigger references the column. Supabase auth.users.role, app_metadata, Postgres roles, and RLS ownership policies are preserved; they are security infrastructure, not registration choices. Database cleanup must be applied separately from the website build.
