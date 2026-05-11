# Security Specification for Portfolio CMS

## Data Invariants
- Admin configuration can only be modified by authenticated admins.
- Contact messages can be created by anyone but only read by admins.
- Services, Projects, Testimonials, and Blog posts are publicly readable but only writable by admins.
- User profiles are not used; auth is strictly for admin access.

## The Dirty Dozen (Attacker Payloads)
1. **Unauthenticated Site Config Update**: Attempt to change site title without logging in.
2. **Standard User Hero Update**: Logged in but not admin user trying to modify hero content.
3. **Contact Message Deletion**: Attempt to delete messages as an anonymous user.
4. **Service Hijacking**: Attempt to update a service with a malicious payload (shadow fields).
5. **Project ID Poisoning**: Create project with 2MB string as ID.
6. **Timestamp Spoofing**: Sending client-side `createdAt` for a new blog post.
7. **Identity Spoofing**: Trying to write a message and claiming to be someone else (if applicable).
8. **Resource Exhaustion**: Sending 1MB string in service description.
9. **Private Path Access**: Trying to read settings from unauthorized paths.
10. **State Shortcut**: Updating message status to "read" by a non-admin.
11. **Bulk List Scrape**: Reading all messages without being an admin.
12. **Admin Privilege Escalation**: User trying to add themselves to the admin list.

## Test Runner (Logic Overview)
- Verify `isSignedIn()` and `isAdmin()` (check against `admins/$(request.auth.uid)` with `exists()`).
- Verify `isValid[Entity]()` for all writes.
- Verify `affectedKeys().hasOnly()` for updates.
- Verify `request.time` for all timestamps.
