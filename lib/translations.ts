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
    personalNumber: string;
    phone: string;
    address: string;
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
    importantInfo: string;
    importantInfo1: string;
    importantInfo2: string;
    confirmation: string;
    confirmText: string;
    preview: string;
    submit: string;
    back: string;
    required: string;
    invalidEmail: string;
    invalidPhone: string;
    invalidPersonalNumber: string;
    atLeastOneGuardian: string;
    atLeastOneTime: string;
  };
  levels: {
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
      personalNumber: 'Personnummer (inklusive de 4 sista siffrorna)',
      phone: 'Telefonnummer',
      address: 'Adress',
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
      importantInfo: 'Viktig information',
      importantInfo1: 'Medlemskap i Spånga TBK och följande av klubbens regler krävs för antagning till tennis- eller bordtennisskolan.',
      importantInfo2: 'Avbokning av plats måste ske skriftligt en månad innan terminen slutar, annars förlängs platsen automatiskt. Sen avbokning medför en avgift på 1500 SEK.',
      confirmation: 'Bekräftelse',
      confirmText: 'Jag bekräftar att jag tagit del av ovanstående information',
      preview: 'Förhandsvisning',
      submit: 'Skicka ansökan',
      back: 'Tillbaka',
      required: 'Detta fält är obligatoriskt',
      invalidEmail: 'Ogiltig e-postadress. Måste innehålla @',
      invalidPhone: 'Ogiltigt telefonnummer. Ange minst 7 siffror',
      invalidPersonalNumber: 'Ogiltigt personnummer. Ange 12 siffror (YYYYMMDD-XXXX)',
      atLeastOneGuardian: 'Minst en målsman krävs för personer under 18 år',
      atLeastOneTime: 'Välj minst en träningsdag och tid',
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
      placed: 'Placerad',
      rejected: 'Avslagen',
      cancelled: 'Inställd',
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
      personalNumber: 'Personal identification number (including the last 4 digits)',
      phone: 'Phone number',
      address: 'Address',
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
      importantInfo: 'Important information',
      importantInfo1: 'Membership in Spånga TBK and adherence to club rules are required for admission to the tennis or table tennis school.',
      importantInfo2: 'Cancellation of a spot must be in writing one month before the term ends, otherwise the spot is automatically extended, and late cancellation incurs a 1500 SEK penalty fee.',
      confirmation: 'Confirmation',
      confirmText: 'I confirm that I have read the above information',
      preview: 'Preview',
      submit: 'Submit application',
      back: 'Back',
      required: 'This field is required',
      invalidEmail: 'Invalid email address. Must contain @',
      invalidPhone: 'Invalid phone number. Enter at least 7 digits',
      invalidPersonalNumber: 'Invalid personal number. Enter 12 digits (YYYYMMDD-XXXX)',
      atLeastOneGuardian: 'At least one guardian is required for persons under 18 years',
      atLeastOneTime: 'Select at least one training day and time',
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
      placed: 'Placed',
      rejected: 'Rejected',
      cancelled: 'Cancelled',
    },
  },
};

