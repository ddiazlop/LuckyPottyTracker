# Self-Documenting Code & No Comments Rule

Avoid adding code comments across the entire repository. Code must be self-explanatory and easily readable as if it was written in plain English.

## Guidelines & Principles

1. **Avoid Code Comments**:
   - Do not write inline comments, explanatory block comments, or narrative restatements of code logic.
   - If a section of code is complex enough to tempt adding a comment, refactor the code to make its flow and logic self-evident instead.

2. **Plain English Readability**:
   - Write code that reads naturally from top to bottom.
   - Express intent through clear control flow, guard clauses, and small, single-purpose functions whose names clearly describe what they do.

3. **Explicit & Descriptive Naming (Length is Preferred over Ambiguity)**:
   - Prefer explicit, descriptive variable, parameter, function, and class names even if they are long.
   - Avoid cryptic abbreviations, short ambiguous names, or generic identifiers like `data`, `res`, `tmp`, `val`, `obj`.
   - Names should clearly state context, type/intent, and state:
     - Prefer `isUserAuthenticatedAndEmailVerified` over `isAuth`.
     - Prefer `maximumAllowedConnectionRetryAttemptsCount` over `maxRetries` or `n`.
     - Prefer `retrieveActiveCandidateProfileByIdentifier` over `getData`.
     - Prefer `transformedCandidateSkillRecordsList` over `items` or `arr`.
