# Admin Panel Setup Guide

## Steg 1: Skapa Admin-användare i Supabase Auth

1. Gå till [Supabase Dashboard](https://supabase.com/dashboard)
2. Välj ditt projekt
3. Gå till **Authentication** → **Users**
4. Klicka på **"Add user"** → **"Create new user"**
5. Fyll i:
   - **Email**: Din admin e-postadress (t.ex. `admin@example.com`)
   - **Password**: Ett säkert lösenord
   - **Auto Confirm User**: Aktivera detta så att användaren kan logga in direkt
6. Klicka på **"Create user"**
7. **VIKTIGT**: Kopiera **User ID** (UUID) - du behöver detta i nästa steg

## Steg 2: Lägg till användaren i admin_users tabellen

1. Gå till **SQL Editor** i Supabase Dashboard
2. Kör följande SQL (ersätt med ditt User ID och e-post):

```sql
INSERT INTO admin_users (id, email, role)
VALUES ('DITT-USER-ID-HÄR', 'din-email@example.com', 'admin');
```

**Exempel:**
```sql
INSERT INTO admin_users (id, email, role)
VALUES ('123e4567-e89b-12d3-a456-426614174000', 'admin@spangatbk.se', 'admin');
```

3. Klicka på **"Run"** för att köra SQL:en

## Steg 3: Logga in

1. Gå till `/admin/login` i din applikation
   - Lokalt: `http://localhost:3000/admin/login`
   - Produktion: `https://din-domän.se/admin/login`

2. Använd e-post och lösenord som du skapade i steg 1

3. Efter inloggning omdirigeras du till `/admin/applications` där du kan se alla ansökningar

## Felsökning

### "Ogiltig e-post eller lösenord"
- Kontrollera att användaren är skapad i Supabase Auth
- Kontrollera att e-post och lösenord är korrekt
- Kontrollera att "Auto Confirm User" är aktiverat

### "Access denied" eller omdirigeras tillbaka till login
- Kontrollera att användaren finns i `admin_users` tabellen
- Kontrollera att User ID i `admin_users` matchar User ID från Supabase Auth
- Kontrollera att e-post i `admin_users` matchar e-post i Supabase Auth

### Kontrollera om användaren är admin

Kör denna SQL för att se alla admin-användare:

```sql
SELECT au.*, au_auth.email as auth_email
FROM admin_users au
LEFT JOIN auth.users au_auth ON au.id = au_auth.id;
```

## Skapa flera admin-användare

Upprepa steg 1-2 för varje admin-användare du vill skapa.

