# Auth-Gated App Testing Playbook (Emergent Google OAuth)

Admin dashboard is protected by Emergent Google Auth. First Google user to log in becomes admin automatically (or emails in ADMIN_EMAILS).

## Step 1: Create Test Admin User & Session
```
mongosh --eval "
use('cafeteria_db');
var userId = 'user_test' + Date.now();
var sessionToken = 'test_session_' + Date.now();
db.users.insertOne({
  user_id: userId,
  email: 'admin.test.' + Date.now() + '@example.com',
  name: 'Admin Test',
  picture: 'https://via.placeholder.com/150',
  is_admin: true,
  created_at: new Date().toISOString()
});
db.user_sessions.insertOne({
  user_id: userId,
  session_token: sessionToken,
  expires_at: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
  created_at: new Date().toISOString()
});
print('Session token: ' + sessionToken);
"
```

## Step 2: Test Backend API
```
curl -X GET "$URL/api/auth/me" -H "Authorization: Bearer <TOKEN>"
curl -X GET "$URL/api/orders?admin=true" -H "Authorization: Bearer <TOKEN>"
```

## Step 3: Browser Testing (set cookie)
```
await page.context.add_cookies([{ "name":"session_token","value":"<TOKEN>","domain":"<host>","path":"/","httpOnly":true,"secure":true,"sameSite":"None" }]);
await page.goto("<URL>/admin")
```

## Notes
- Public endpoints (menu, categories, orders create, reviews, settings GET) need NO auth.
- Admin endpoints require is_admin=true user session.
- Callback detection uses useLocation().hash. Redirect URL is /admin/callback.
