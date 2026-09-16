# 📝 UserAuth

API Endpoint: `POST /v1/login`
- Issues JWT Access & Refresh Tokens
- Authenticates credentials against Argon2id hash

## Dependencies
- [[SessionDB]] - [[uses]] Redis cluster for fast token revocation and session invalidation.
- [[ClientApp]] - Direct client authentication provider.
