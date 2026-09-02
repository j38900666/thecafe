# Test Credentials — The Cafeteria

## Admin Authentication (Emergent Google OAuth)
Admin login is via Google (Emergent-managed). There are NO app-managed passwords.
- The FIRST Google user to log in automatically becomes admin (is_admin=true).
- Additional admins can be allowlisted via `ADMIN_EMAILS` in backend/.env (comma-separated).

### For automated testing (inject a session directly):
```
mongosh --eval "
use('cafeteria_db');
var userId = 'user_test' + Date.now();
var sessionToken = 'test_session_' + Date.now();
db.users.insertOne({user_id:userId,email:'admin.test@example.com',name:'Admin Test',picture:'',is_admin:true,created_at:new Date().toISOString()});
db.user_sessions.insertOne({user_id:userId,session_token:sessionToken,expires_at:new Date(Date.now()+7*24*60*60*1000).toISOString(),created_at:new Date().toISOString()});
print('TOKEN='+sessionToken);
"
```
Use the token as `Authorization: Bearer <TOKEN>` or as httpOnly cookie `session_token`.

## Customer
No login required. Customers order as guests. Past orders tracked by mobile number.
- Sample test mobile: 9999999999 (create an order first to see it in My Orders).

## Business Info
- Name: The Cafeteria | Tagline: Good Food Good Mood
- Address: GC CRPF Doyapur, Silchar
- WhatsApp: 9101328562 | Phone: 8721824729
