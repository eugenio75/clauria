export type Language = "it" | "en";

const translations = {
  it: {
    // Splash
    splash_tagline: "Non sei solo.",

    // Welcome pages
    welcome_p1_l1: "Ciao. Sono Clauria.",
    welcome_p1_l2: "Sono qui per ascoltarti.",
    welcome_p2: "Puoi dirmi quello che ti turba, ciò che non riesci a risolvere, quello che tieni dentro. Ma anche le gioie che vorresti condividere.",
    welcome_p3: "Anche di notte. Anche nelle cose più difficili. Anche in quelle più belle.",
    welcome_next: "Avanti",
    welcome_start: "Inizia",

    // Login
    login_subtitle: "Non sei solo.",
    login_access: "Accedi per iniziare",
    login_apple: "Continua con Apple",
    login_google: "Continua con Google",
    login_email: "✉️ Usa la tua mail",
    login_or: "oppure",
    login_guest: "Continua come ospite",
    login_email_placeholder: "la tua email",
    login_send_code: "Invia codice",
    login_sending: "Invio in corso...",
    login_back: "← Indietro",
    login_otp_instructions: "Inserisci il codice a 6 cifre che hai ricevuto su",
    login_confirm: "Conferma",
    login_verifying: "Verifico...",
    login_change_email: "← Cambia email",
    login_error_generic: "Qualcosa non ha funzionato. Riprova.",
    login_error_google: "Accesso con Google non riuscito. Riprova.",
    login_error_apple: "Accesso con Apple non riuscito. Riprova.",
    login_error_email: "Non riesco a inviare la mail in questo momento. Riprova tra qualche minuto.",
    login_error_otp_invalid: "Codice non valido o scaduto. Riprova.",
    login_email_hint: "Non hai un account? Inserisci la tua email e riceverai un codice di accesso. Se è la prima volta, il tuo account verrà creato automaticamente.",

    // Chat
    chat_placeholder: "Scrivi qui...",
    chat_guest_remaining: (n: number) => `Hai ancora ${n} ${n === 1 ? 'conversazione' : 'conversazioni'} oggi come ospite.`,
    chat_error_generic: "Sono qui. Qualcosa non ha funzionato — puoi riprovare?",
    chat_error_rate_limit: "Ho bisogno di un momento. Riprova tra poco.",
    chat_error_credits: "Crediti AI esauriti. Aggiungi fondi nelle impostazioni del workspace.",

    // Settings
    settings_title: "Impostazioni",
    settings_name_label: "Il tuo nome",
    settings_save: "Salva",
    settings_save_success: "Profilo salvato",
    settings_save_error: "Errore nel salvataggio. Riprova.",
    settings_section_profile: "Profilo",
    settings_section_account: "Account",
    settings_section_danger: "Zona pericolosa",
    settings_provider_label: "Accesso tramite",
    settings_change_email: "Cambia email",
    settings_new_email_placeholder: "nuova email",
    settings_send_verification: "Invia verifica",
    settings_email_sent: "Controlla la tua email per confermare il cambio.",
    settings_email_error: "Errore nell'invio. Riprova.",
    settings_delete_account: "Elimina account",
    settings_delete_confirm: "Sei sicuro/a? Questa azione è irreversibile. Tutti i tuoi dati verranno eliminati.",
    settings_delete_yes: "Sì, elimina",
    settings_delete_error: "Errore nell'eliminazione. Riprova.",
    settings_reset: "Azzera la memoria",
    settings_reset_confirm: "Sei sicuro/a? Questo cancellerà tutto il contesto che CLAURIA ha di te.",
    settings_reset_yes: "Sì, azzera",
    settings_cancel: "Annulla",
    settings_privacy: "Privacy",
    settings_privacy_text: "CLAURIA non conserva mai le tue conversazioni. Memorizza solo un contesto sintetico (stato emotivo, situazione) per offrirti continuità. Puoi cancellarlo in qualsiasi momento.",
    settings_support: "Supporto",
    settings_logout: "Esci dall'account",

    // Silence mode
    silence_tap: "Tocca per tornare",

    // Unsent letter
    letter_intro: "Queste parole esistono solo adesso, per te.",
    letter_placeholder: "Scrivi quello che non hai potuto dire...",
    letter_close: "Ho finito — chiudi senza salvare",

    // Crisis card
    crisis_title: "♡ Non sei solo/a.",
    crisis_subtitle: "C'è qualcuno che vuole ascoltarti adesso.",
    crisis_phone1_label: "Telefono Amico: 02 2327 2327",
    crisis_phone1_note: "Disponibile 24 ore su 24",
    crisis_phone2_label: "Telefono Azzurro: 19696",
    crisis_phone2_note: "(anche per adulti in crisi)",

    // Silence/letter offers
    offer_silence: "Sì, mi fermo un momento",
    offer_letter: "Sì, voglio scrivere",

    // Email upgrade
    email_upgrade_text: "Un'ultima cosa — se cambi telefono o reinstalli l'app, voglio poterti ritrovare. Lasciami una mail, solo per questo. Non riceverai nulla.",
    email_upgrade_placeholder: "la tua email",
    email_upgrade_save: "Salva",
    email_upgrade_skip: "Salta per ora",
    email_upgrade_success: "Ti abbiamo inviato un link magico. Controlla la mail.",
    email_upgrade_error: "Qualcosa non ha funzionato. Riprova.",

    // Microphone
    mic_start: "Tocca per parlare",
    mic_stop: "Tocca per fermare",

    // Onboarding questions
    onboarding_q1: "Come ti chiami?",
    onboarding_q2: (name: string) => `Ciao ${name}, sono Clauria. Quanti anni hai?`,
    onboarding_q3: "E nella vita di tutti i giorni, cosa fai?\nLavori, sei in un momento di cambiamento, stai a casa...",
    onboarding_q4_question: "E in questo momento — c'è qualcosa che ti turba, una decisione da prendere, o magari qualcosa di bello che vuoi condividere?",
  },
  en: {
    // Splash
    splash_tagline: "You are not alone.",

    // Welcome pages
    welcome_p1_l1: "Hi. I am Clauria.",
    welcome_p1_l2: "I am here to listen to you.",
    welcome_p2: "You can tell me what troubles you, what you cannot resolve, what you keep inside. But also the joys you would like to share.",
    welcome_p3: "Even at night. Even the hardest things. Even the most beautiful ones.",
    welcome_next: "Next",
    welcome_start: "Start",

    // Login
    login_subtitle: "You are not alone.",
    login_access: "Sign in to begin",
    login_apple: "Continue with Apple",
    login_google: "Continue with Google",
    login_email: "✉️ Use your email",
    login_or: "or",
    login_guest: "Continue as guest",
    login_email_placeholder: "your email",
    login_send_code: "Send code",
    login_sending: "Sending...",
    login_back: "← Back",
    login_otp_instructions: "Enter the 6-digit code sent to",
    login_confirm: "Confirm",
    login_verifying: "Verifying...",
    login_change_email: "← Change email",
    login_error_generic: "Something went wrong. Please try again.",
    login_error_google: "Google sign-in failed. Please try again.",
    login_error_apple: "Apple sign-in failed. Please try again.",
    login_error_email: "Unable to send the email right now. Please try again in a few minutes.",
    login_error_otp_invalid: "Invalid or expired code. Please try again.",
    login_email_hint: "Don't have an account? Enter your email and you'll receive an access code. If it's your first time, your account will be created automatically.",

    // Chat
    chat_placeholder: "Write here...",
    chat_guest_remaining: (n: number) => `You have ${n} guest ${n === 1 ? 'conversation' : 'conversations'} left today.`,
    chat_error_generic: "I'm here. Something went wrong — please try again.",
    chat_error_rate_limit: "I need a moment. Please try again shortly.",
    chat_error_credits: "AI credits exhausted. Add funds in workspace settings.",

    // Settings
    settings_title: "Settings",
    settings_name_label: "Your name",
    settings_save: "Save",
    settings_save_success: "Profile saved",
    settings_save_error: "Error saving. Please try again.",
    settings_section_profile: "Profile",
    settings_section_account: "Account",
    settings_section_danger: "Danger zone",
    settings_provider_label: "Signed in via",
    settings_change_email: "Change email",
    settings_new_email_placeholder: "new email",
    settings_send_verification: "Send verification",
    settings_email_sent: "Check your email to confirm the change.",
    settings_email_error: "Error sending. Please try again.",
    settings_delete_account: "Delete account",
    settings_delete_confirm: "Are you sure? This action is irreversible. All your data will be deleted.",
    settings_delete_yes: "Yes, delete",
    settings_delete_error: "Error deleting. Please try again.",
    settings_reset: "Reset memory",
    settings_reset_confirm: "Are you sure? This will erase all context CLAURIA has about you.",
    settings_reset_yes: "Yes, reset",
    settings_cancel: "Cancel",
    settings_privacy: "Privacy",
    settings_privacy_text: "CLAURIA never stores your conversations. It only keeps a brief context summary (emotional state, situation) to provide continuity. You can delete it at any time.",
    settings_support: "Support",
    settings_logout: "Sign out",

    // Silence mode
    silence_tap: "Tap to return",

    // Unsent letter
    letter_intro: "These words exist only now, for you.",
    letter_placeholder: "Write what you could not say...",
    letter_close: "I'm done — close without saving",

    // Crisis card
    crisis_title: "♡ You are not alone.",
    crisis_subtitle: "Someone wants to listen to you right now.",
    crisis_phone1_label: "Telefono Amico: 02 2327 2327",
    crisis_phone1_note: "Available 24/7",
    crisis_phone2_label: "Telefono Azzurro: 19696",
    crisis_phone2_note: "(also for adults in crisis)",

    // Silence/letter offers
    offer_silence: "Yes, I'll pause for a moment",
    offer_letter: "Yes, I want to write",

    // Email upgrade
    email_upgrade_text: "One last thing — if you change your phone or reinstall the app, I want to be able to find you again. Leave me an email, just for this. You won't receive anything.",
    email_upgrade_placeholder: "your email",
    email_upgrade_save: "Save",
    email_upgrade_skip: "Skip for now",
    email_upgrade_success: "We sent you a magic link. Check your email.",
    email_upgrade_error: "Something went wrong. Please try again.",

    // Microphone
    mic_start: "Tap to speak",
    mic_stop: "Tap to stop",

    // Onboarding questions
    onboarding_q1: "What is your name?",
    onboarding_q2: (name: string) => `Hi ${name}, I'm Clauria. How old are you?`,
    onboarding_q3: "And in your daily life, what do you do?\nWork, going through a transition, staying at home...",
    onboarding_q4_question: "And right now — is there something troubling you, a decision to make, or perhaps something beautiful you want to share?",
  },
} as const;

export type TranslationKey = keyof typeof translations.it;

export function t(lang: Language, key: TranslationKey): any {
  return translations[lang][key];
}

export default translations;
