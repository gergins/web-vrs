# AGENTS Operational Rules

Before edits:
- Run baseline verify (npm run verify OR validate.ps1)

After edits:
- Run verify again

No claim without:
- File path
- Command output

Fail PR if verify fails.

Engineering Mode:
- Additive only
- Backward compatible
- Minimal targeted changes

Policy Source:
- PROJECT_POLICY.md
