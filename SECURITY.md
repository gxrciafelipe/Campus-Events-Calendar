# Security policy

## Reporting a vulnerability

Please do not open a public issue for security problems.

Report privately through GitHub: open the repository's **Security** tab and choose **Report a vulnerability** (private vulnerability reporting). Include what you found, how to reproduce it, and what data or permissions it exposes.

This is a volunteer project, so fixes are made on a best-effort basis. Please give us reasonable time to fix an issue before disclosing it.

## Scope

Of particular interest: anything that lets a user read or change data their role should not allow (row-level security, storage policies, attendee names), or that leaks secrets. Never test against other people's accounts or data.
