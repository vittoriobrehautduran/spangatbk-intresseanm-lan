export type Language = 'sv' | 'en';

export interface Translations {
  form: {
    title: string;
    bindingRegistration: string;
    date: string;
    sportInterest: string;
    tennis: string;
    tableTennis: string;
    interestAreas: string;
    writeInterest: string;
    studentInfo: string;
    studentName: string;
    studentFirstName: string;
    studentLastName: string;
    personalNumber: string;
      phone: string;
      address: string;
      postalCode: string;
      city: string;
      email: string;
    guardianInfo: string;
    guardianInfoNote: string;
    guardianName: string;
    addGuardian: string;
    groupPhotoConsent: string;
    groupPhotoQuestion: string;
    yes: string;
    no: string;
    preferredTimes: string;
    preferredTimesNote: string;
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
    from: string;
    to: string;
    otherWishes: string;
    courtTimeSuggestion: string;
    importantInfo: string;
    importantInfo1: string;
    importantInfo2: string;
    confirmation: string;
    confirmText: string;
    preview: string;
    submit: string;
    back: string;
    required: string;
    optional: string;
    invalidEmail: string;
    invalidPhone: string;
    invalidPersonalNumber: string;
      atLeastOneGuardian: string;
      atLeastOneTime: string;
      inappropriateAgeLevel: string;
    };
    levels: {
      tennis: Record<string, string>;
      tableTennis: Record<string, string>;
    };
    levelDescriptions: {
      tennis: Record<string, string>;
      tableTennis: Record<string, string>;
    };
  admin: {
    login: string;
    email: string;
    password: string;
    loginButton: string;
    logout: string;
    applications: string;
    search: string;
    filter: string;
    status: string;
    sport: string;
    date: string;
    actions: string;
      view: string;
      edit: string;
      save: string;
      cancel: string;
      delete: string;
      deleteConfirm: string;
      deleteConfirmDetail: string;
      deleted: string;
      notes: string;
      adminNotes: string;
      studentName: string;
      studentEmail: string;
      studentPhone: string;
      noApplications: string;
  };
  status: Record<string, string>;
}

export const translations: Record<Language, Translations> = {
  sv: {
    form: {
      title: 'Intresseanmälan',
      bindingRegistration: 'Bindande Anmälan (i mån om plats)',
      date: 'Datum',
      sportInterest: 'Vänligen ange vilken sport ni är intresserade av:',
      tennis: 'Tennis',
      tableTennis: 'Bordtennis',
      interestAreas: 'Intresseområden',
      writeInterest: 'Skriv här vad ni är intresserade av:',
      studentInfo: 'Elevinformation',
      studentName: 'Elevens för- och efternamn',
      studentFirstName: 'Elevens förnamn',
      studentLastName: 'Elevens efternamn',
      personalNumber: 'Personnummer (inklusive de 4 sista siffrorna)',
      phone: 'Telefonnummer',
      address: 'Adress',
      postalCode: 'Postnummer',
      city: 'Ort',
      email: 'E-post',
      guardianInfo: 'Målsmans information',
      guardianInfoNote: 'om eleven är under 18 år',
      guardianName: 'Målsmans namn',
      addGuardian: 'Lägg till målsman',
      groupPhotoConsent: 'Godkännande av gruppfotografering',
      groupPhotoQuestion: 'Vill ni godkänna att gruppfotografier kan användas på vår hemsida?',
      yes: 'Ja',
      no: 'Nej',
      preferredTimes: 'Önskade dagar och tider för träning',
      preferredTimesNote: 'Ju fler alternativ ni anger, desto större chans att vi kan uppfylla era önskemål!',
      monday: 'Måndag',
      tuesday: 'Tisdag',
      wednesday: 'Onsdag',
      thursday: 'Torsdag',
      friday: 'Fredag',
      saturday: 'Lördag',
      sunday: 'Söndag',
      from: 'Från klockan',
      to: 'till klockan',
      otherWishes: 'Övriga önskemål',
      courtTimeSuggestion: 'Har fått förslag på tid och bana av någon på Spånga TBK',
      importantInfo: 'Viktig information',
      importantInfo1: 'Vid antagning till tennis- eller bordtennisskolan krävs medlemskap i Spånga TBK samt att man följer Spånga TBK:s regler som finns på hemsidan. Detta gäller både tennis och bordtennis.',
      importantInfo2: 'Uppsägning av plats ska ske skriftligen senast en månad innan terminsstart till kansli@spangatbk.se. Annars debiteras en förseningsavgift under de första 3 månaderna. Säger man upp platsen efter de 3 månaderna betalar man full terminsavgift.',
      confirmation: 'Accepterade villkor',
      confirmText: 'Markera här för att acceptera villkoren och bekräfta att ni tagit del av ovanstående information:',
      preview: 'Förhandsvisning',
      submit: 'Skicka ansökan',
      back: 'Tillbaka',
      required: 'Detta fält är obligatoriskt',
      optional: '(valfritt)',
      invalidEmail: 'Ogiltig e-postadress. Måste innehålla @',
      invalidPhone: 'Ogiltigt telefonnummer. Ange minst 7 siffror',
      invalidPersonalNumber: 'Ogiltigt personnummer. Ange 12 siffror (YYYYMMDD-XXXX)',
      atLeastOneGuardian: 'Minst en målsman krävs för personer under 18 år',
      atLeastOneTime: 'Välj minst en träningsdag och tid',
      inappropriateAgeLevel: 'Välj ett lämpligt alternativ för elevens ålder.',
    },
    levels: {
      tennis: {
        'boll-lekis': 'Boll-lekis',
        'minitennis': 'Minitennis',
        'juniortennis': 'Juniortennis',
        'vuxentennis': 'Vuxentennis',
        'veterantennis_med_tranare': 'Veterantennis med tränare',
      },
      tableTennis: {
        'boll-lekis': 'Boll-lekis',
        'juniorbordtennis': 'Juniorbordtennis',
        'seniorbordtennis_med_tranare': 'Seniorbordtennis med tränare',
        'veteranbordtennis_med_tranare': 'Veteranbordtennis med tränare',
      },
    },
    levelDescriptions: {
      tennis: {
        'boll-lekis': 'För barn mellan två och fem år. Boll-lekis är en lekfull aktivitet för de aldra minsta barnen. Barnen får prova på både tennis och bordtennis och får en känsla för bollar och rörelse.',
        'minitennis': 'För barn mellan fyra och åtta år. Barnen använder racket och boll och får träning i bollkänsla, rörelse och teknik. Fyra tränare tar hand om barnen på tennisbanan och lär dem grunderna i tennis.',
        'juniortennis': 'För barn och ungdomar mellan sex och arton år. Ungdomarna lär sig spela tennis. Med tiden uppmuntras de att tävla och erbjuds fler träningar i veckan. Fokus läggs på teknik, rörelse och matchspel.',
        'vuxentennis': 'För vuxna över arton år. Träningen riktar sig till både nybörjare och motionärer. Fokus är teknik, rörelse och inte minst att ha roligt på banan.',
        'veterantennis_med_tranare': 'För vuxna 30+ år. Träning med tränare för erfarna spelare.',
      },
      tableTennis: {
        'boll-lekis': 'För barn mellan två och fem år. Boll-lekis är en lekfull aktivitet för de aldra minsta barnen. Barnen får prova på både tennis och bordtennis och får en känsla för bollar och rörelse.',
        'juniorbordtennis': 'För barn och ungdomar mellan sex och arton år. Ungdomarna lär sig grundslagen och reglerna i pingis. Vi blandar upp träningen med lekar och roliga fysiska övningar.',
        'seniorbordtennis_med_tranare': 'För vuxna över arton år. Träningen riktar sig till både nybörjare och motionärer. Fokus är teknik, rörelse och inte minst att ha roligt.',
        'veteranbordtennis_med_tranare': 'För vuxna 30+ år. Träning med tränare för erfarna spelare.',
      },
    },
    admin: {
      login: 'Logga in',
      email: 'E-post',
      password: 'Lösenord',
      loginButton: 'Logga in',
      logout: 'Logga ut',
      applications: 'Ansökningar',
      search: 'Sök',
      filter: 'Filtrera',
      status: 'Status',
      sport: 'Sport',
      date: 'Datum',
      actions: 'Åtgärder',
      view: 'Visa',
      edit: 'Redigera',
      save: 'Spara',
      cancel: 'Avbryt',
      delete: 'Ta bort',
      deleteConfirm: 'Är du säker på att du vill ta bort denna ansökan?',
      deleteConfirmDetail: 'Denna åtgärd kan inte ångras.',
      deleted: 'Ansökan har tagits bort',
      notes: 'Anteckningar',
      adminNotes: 'Adminanteckningar',
      studentName: 'Namn',
      studentEmail: 'E-post',
      studentPhone: 'Telefon',
      noApplications: 'Inga ansökningar hittades',
    },
    status: {
      new: 'Ny',
      contacted: 'Kontaktad',
      queued: 'Köad',
      placed: 'Placerad',
      aborted: 'Avbruten',
    },
  },
  en: {
    form: {
      title: 'Interest Registration',
      bindingRegistration: 'Binding Registration (subject to availability)',
      date: 'Date',
      sportInterest: 'Please indicate which sport you are interested in:',
      tennis: 'Tennis',
      tableTennis: 'Table Tennis',
      interestAreas: 'Areas of interest',
      writeInterest: 'Write here what you are interested in:',
      studentInfo: 'Student information',
      studentName: "Student's first and last name",
      studentFirstName: "Student's first name",
      studentLastName: "Student's last name",
      personalNumber: 'Personal identification number (including the last 4 digits)',
      phone: 'Phone number',
      address: 'Address',
      postalCode: 'Postal code',
      city: 'City',
      email: 'Email',
      guardianInfo: "Guardian's information",
      guardianInfoNote: 'if the student is under 18 years old',
      guardianName: "Guardian's name",
      addGuardian: 'Add guardian',
      groupPhotoConsent: 'Consent for group photography',
      groupPhotoQuestion: 'Do you approve that group photos can be used on our website?',
      yes: 'Yes',
      no: 'No',
      preferredTimes: 'Desired days and times for training',
      preferredTimesNote: 'The more alternatives you provide, the greater the chance we can fulfill your wishes!',
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday',
      from: 'From',
      to: 'to',
      otherWishes: 'Other wishes',
      courtTimeSuggestion: 'Have received suggestions for time and court from someone at Spånga TBK',
      importantInfo: 'Important information',
      importantInfo1: 'Admission to the tennis or table tennis school requires membership in Spånga TBK and that you follow Spånga TBK rules on the website. This applies to both tennis and table tennis.',
      importantInfo2: 'Cancellation of a spot must be made in writing no later than one month before the start of the term to kansli@spangatbk.se. Otherwise a late fee is charged for the first 3 months. If you cancel after those 3 months, you pay the full term fee.',
      confirmation: 'Accepted terms',
      confirmText: 'Check here to accept the terms and confirm that you have read the information above:',
      preview: 'Preview',
      submit: 'Submit application',
      back: 'Back',
      required: 'This field is required',
      optional: '(optional)',
      invalidEmail: 'Invalid email address. Must contain @',
      invalidPhone: 'Invalid phone number. Enter at least 7 digits',
      invalidPersonalNumber: 'Invalid personal number. Enter 12 digits (YYYYMMDD-XXXX)',
      atLeastOneGuardian: 'At least one guardian is required for persons under 18 years',
      atLeastOneTime: 'Select at least one training day and time',
      inappropriateAgeLevel: 'Choose an appropriate option for the student\'s age.',
    },
    levels: {
      tennis: {
        'boll-lekis': 'Ball play/fun',
        'minitennis': 'Mini tennis',
        'juniortennis': 'Junior tennis',
        'vuxentennis': 'Adult tennis',
        'veterantennis_med_tranare': 'Veteran tennis with coach',
      },
      tableTennis: {
        'boll-lekis': 'Ball play/fun',
        'juniorbordtennis': 'Junior table tennis',
        'seniorbordtennis_med_tranare': 'Senior table tennis with coach',
        'veteranbordtennis_med_tranare': 'Veteran table tennis with coach',
      },
    },
    levelDescriptions: {
      tennis: {
        'boll-lekis': 'For children between two and five years old. Ball play/fun is a playful activity for the very youngest children. Children get to try both tennis and table tennis and get a feel for balls and movement.',
        'minitennis': 'For children between four and eight years old. Children use rackets and balls and receive training in ball feel, movement, and technique. Four coaches take care of the children on the tennis court and teach them the basics of tennis.',
        'juniortennis': 'For children and youth between six and eighteen years old. Youth learn to play tennis. Over time, they are encouraged to compete and are offered more training sessions per week. Focus is on technique, movement, and match play.',
        'vuxentennis': 'For adults over eighteen years old. The training is aimed at both beginners and recreational players. Focus is on technique, movement, and not least, having fun on the court.',
        'veterantennis_med_tranare': 'For adults 30+ years old. Training with coach for experienced players.',
      },
      tableTennis: {
        'boll-lekis': 'For children between two and five years old. Ball play/fun is a playful activity for the very youngest children. Children get to try both tennis and table tennis and get a feel for balls and movement.',
        'juniorbordtennis': 'For children and youth between six and eighteen years old. Youth learn the basics and rules of ping pong. We mix training with games and fun physical exercises.',
        'seniorbordtennis_med_tranare': 'For adults over eighteen years old. The training is aimed at both beginners and recreational players. Focus is on technique, movement, and not least, having fun.',
        'veteranbordtennis_med_tranare': 'For adults 30+ years old. Training with coach for experienced players.',
      },
    },
    admin: {
      login: 'Login',
      email: 'Email',
      password: 'Password',
      loginButton: 'Login',
      logout: 'Log out',
      applications: 'Applications',
      search: 'Search',
      filter: 'Filter',
      status: 'Status',
      sport: 'Sport',
      date: 'Date',
      actions: 'Actions',
      view: 'View',
      edit: 'Edit',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      deleteConfirm: 'Are you sure you want to delete this application?',
      deleteConfirmDetail: 'This action cannot be undone.',
      deleted: 'Application has been deleted',
      notes: 'Notes',
      adminNotes: 'Admin notes',
      studentName: 'Name',
      studentEmail: 'Email',
      studentPhone: 'Phone',
      noApplications: 'No applications found',
    },
    status: {
      new: 'New',
      contacted: 'Contacted',
      queued: 'Queued',
      placed: 'Placed',
      aborted: 'Aborted',
    },
  },
};

