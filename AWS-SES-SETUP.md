# AWS SES Setup Guide för Testning

Denna guide visar hur du konfigurerar AWS SES för att testa e-postfunktionaliteten utan att ha en egen domän ännu.

## Steg 1: Skapa AWS-konto

1. Gå till [AWS Console](https://aws.amazon.com/console/)
2. Klicka på "Create an AWS Account" eller "Sign In"
3. Följ instruktionerna för att skapa ett nytt konto
4. Du behöver ett kreditkort, men AWS SES har en generös free tier

## Steg 2: Aktivera AWS SES

1. Logga in på [AWS Console](https://console.aws.amazon.com/)
2. Sök efter "SES" i sökfältet och välj "Simple Email Service"
3. Välj din region (rekommenderat: `eu-north-1` för Stockholm eller `eu-west-1` för Irland)

## Steg 3: Verifiera E-postadresser (Sandbox Mode)

När du först använder SES är du i "Sandbox Mode", vilket betyder att du bara kan skicka till verifierade e-postadresser.

### Verifiera avsändaradress (From Email):

1. I SES Console, gå till "Verified identities" > "Create identity"
2. Välj "Email address"
3. Ange din e-postadress (t.ex. `din-email@gmail.com`)
4. Klicka "Create identity"
5. Kontrollera din e-postinkorg och klicka på verifieringslänken

### Verifiera mottagaradresser (för testning):

1. Upprepa steg ovan för varje e-postadress du vill testa med:
   - Student e-post (för bekräftelsemeddelanden)
   - Målsmans e-post (om du testar med målsman)
   - Klubbens e-post (för notifikationer)

**Viktigt:** I Sandbox Mode kan du bara skicka till verifierade adresser. För produktion behöver du begära att komma ur Sandbox Mode (kräver domänverifiering).

## Steg 4: Skapa IAM-användare med SES-behörigheter

1. I AWS Console, sök efter "IAM" och öppna Identity and Access Management
2. Gå till "Users" i vänstermenyn
3. Klicka på "Create user"
4. Ange ett användarnamn (t.ex. `ses-email-sender`)
5. Klicka "Next"

### Lägg till behörigheter:

1. Välj "Attach policies directly"
2. Sök efter "AmazonSESFullAccess" eller "AmazonSESSendingAccess"
3. Markera rutan för `AmazonSESSendingAccess` (mer begränsad, säkrare)
   - Eller `AmazonSESFullAccess` om du behöver mer kontroll
4. Klicka "Next" och sedan "Create user"

## Steg 5: Skapa Access Keys

1. Klicka på den användare du just skapade
2. Gå till fliken "Security credentials"
3. Scrolla ner till "Access keys"
4. Klicka på "Create access key"
5. Välj "Application running outside AWS"
6. Klicka "Next" och sedan "Create access key"
7. **VIKTIGT:** Kopiera både:
   - **Access key ID** (ser ut som: `AKIAIOSFODNN7EXAMPLE`)
   - **Secret access key** (ser ut som: `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`)
   
   **OBS:** Du kan bara se secret key en gång! Spara den säkert.

8. Klicka "Done"

## Steg 6: Konfigurera Environment Variables

Lägg till följande i din `.env.local` fil:

```env
# AWS SES Configuration
SES_REGION=eu-north-1
SES_ACCESS_KEY=din_access_key_id_här
SES_SECRET_ACCESS_KEY=din_secret_access_key_här
AWS_SES_FROM_EMAIL=din-verifierade-email@gmail.com
AWS_SES_CLUB_EMAIL=klubbens-verifierade-email@gmail.com
```

**Exempel:**
```env
SES_REGION=eu-north-1
SES_ACCESS_KEY=AKIAIOSFODNN7EXAMPLE
SES_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_SES_FROM_EMAIL=test@gmail.com
AWS_SES_CLUB_EMAIL=klubb@gmail.com
```

## Steg 7: Testa E-postfunktionaliteten

1. Starta utvecklingsservern:
   ```bash
   npm run dev
   ```

2. Gå till formulärsidan och fyll i en testansökan
3. Använd verifierade e-postadresser för:
   - Student e-post
   - Målsmans e-post (om du testar med målsman)
4. Skicka in formuläret
5. Kontrollera e-postinkorgen för:
   - Bekräftelsemeddelande till student
   - Notifikation till klubbens e-post
   - Målsmans e-post (om applicerbart)

## Felsökning

### E-post skickas inte

1. **Kontrollera console logs:** Titta i terminalen för felmeddelanden
2. **Verifiera e-postadresser:** Alla mottagaradresser måste vara verifierade i Sandbox Mode
3. **Kontrollera credentials:** Se till att Access Key ID och Secret Access Key är korrekta
4. **Kontrollera region:** Se till att `SES_REGION` matchar regionen där du verifierade e-postadresserna

### "Email address is not verified" fel

- Du försöker skicka till en e-postadress som inte är verifierad
- Verifiera mottagaradressen i SES Console
- I Sandbox Mode kan du bara skicka till verifierade adresser

### "Access Denied" fel

- IAM-användaren har inte rätt behörigheter
- Kontrollera att användaren har `AmazonSESSendingAccess` eller `AmazonSESFullAccess` policy

## Komma ur Sandbox Mode (för produktion)

När du har en domän och vill skicka till alla e-postadresser:

1. Gå till SES Console > "Account dashboard"
2. Klicka på "Request production access"
3. Fyll i formuläret:
   - Beskriv din användning
   - Uppskattat antal e-postmeddelanden per dag
   - Om du kommer att skicka marknadsföringsmail
4. Vänta på godkännande (vanligtvis 24-48 timmar)
5. Verifiera din domän istället för enskilda e-postadresser

## Kostnader

- AWS SES free tier: 62,000 e-postmeddelanden per månad (om du kör på EC2)
- Efter free tier: $0.10 per 1,000 e-postmeddelanden
- För testning kommer du förmodligen att vara inom free tier

## Ytterligare Resurser

- [AWS SES Dokumentation](https://docs.aws.amazon.com/ses/)
- [SES Pricing](https://aws.amazon.com/ses/pricing/)
- [SES Best Practices](https://docs.aws.amazon.com/ses/latest/dg/best-practices.html)

