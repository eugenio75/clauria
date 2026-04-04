import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "../i18n/LanguageContext";
import { toast } from "sonner";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userEmail?: string;
  authProvider?: string;
  onNameChange: (name: string) => void;
  onResetMemory: () => void;
  isAuthenticated?: boolean;
  onLogout?: () => void;
  userId?: string;
}

const SettingsPanel = ({
  isOpen,
  onClose,
  userName,
  userEmail,
  authProvider,
  onNameChange,
  onResetMemory,
  isAuthenticated = false,
  onLogout,
  userId,
}: SettingsPanelProps) => {
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(userName);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { t } = useLanguage();

  const handleSaveName = async () => {
    onNameChange(nameValue);
    setEditingName(false);
    if (userId) {
      const { error } = await supabase
        .from("intus_profiles")
        .update({ user_name: nameValue })
        .eq("id", userId);
      if (error) {
        console.error("Failed to save name:", error);
        toast.error(t("settings_save_error"));
      } else {
        toast.success(t("settings_save_success"));
      }
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmail.trim()) return;
    setEmailLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
      if (error) throw error;
      toast.success(t("settings_email_sent"));
      setNewEmail("");
    } catch (err) {
      console.error("Email change error:", err);
      toast.error(t("settings_email_error"));
    } finally {
      setEmailLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      const { error } = await supabase.functions.invoke("delete-account");
      if (error) throw error;
      await supabase.auth.signOut();
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/";
    } catch (err) {
      console.error("Delete account error:", err);
      toast.error(t("settings_delete_error"));
      setDeleteLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    sessionStorage.clear();
    onLogout?.();
    onClose();
    window.location.href = "/";
  };

  const providerLabel = authProvider === "google" ? "Google" : authProvider === "apple" ? "Apple" : "Email";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/20 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-parchment rounded-t-3xl max-w-[600px] mx-auto max-h-[85vh] overflow-y-auto"
          >
            <div className="p-6 pb-safe">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-display text-xl text-foreground">{t("settings_title")}</h2>
                <button onClick={onClose} className="text-muted-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-8">
                {/* ── PROFILO ── */}
                <section>
                  <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-3">{t("settings_section_profile")}</h3>
                  <div className="space-y-4">
                    {/* Name */}
                    <div>
                      <label className="text-xs text-muted-foreground">{t("settings_name_label")}</label>
                      {editingName ? (
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            value={nameValue}
                            onChange={(e) => setNameValue(e.target.value)}
                            className="flex-1 bg-transparent border-b border-trust-blue text-foreground text-[15px] py-1 focus:outline-none"
                            autoFocus
                          />
                          <button onClick={handleSaveName} className="text-trust-blue text-sm font-medium">
                            {t("settings_save")}
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => { setNameValue(userName); setEditingName(true); }} className="block mt-1 text-foreground text-[15px]">
                          {userName || "—"}
                        </button>
                      )}
                    </div>

                    {/* Email (read-only) */}
                    {userEmail && (
                      <div>
                        <label className="text-xs text-muted-foreground">Email</label>
                        <p className="mt-1 text-foreground text-[15px]">{userEmail}</p>
                      </div>
                    )}

                    {/* Provider */}
                    {isAuthenticated && (
                      <div>
                        <label className="text-xs text-muted-foreground">{t("settings_provider_label")}</label>
                        <p className="mt-1 text-foreground text-[15px]">{providerLabel}</p>
                      </div>
                    )}
                  </div>
                </section>

                {/* ── ACCOUNT ── */}
                {isAuthenticated && authProvider !== "google" && authProvider !== "apple" && (
                  <section>
                    <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-3">{t("settings_section_account")}</h3>
                    <div>
                      <label className="text-xs text-muted-foreground">{t("settings_change_email")}</label>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          placeholder={t("settings_new_email_placeholder")}
                          className="flex-1 bg-transparent border-b border-trust-blue/40 text-foreground text-[15px] py-1 focus:outline-none focus:border-trust-blue placeholder:text-muted-foreground/50"
                        />
                        <button
                          onClick={handleChangeEmail}
                          disabled={emailLoading || !newEmail.trim()}
                          className="text-trust-blue text-sm font-medium disabled:opacity-50"
                        >
                          {emailLoading ? "..." : t("settings_send_verification")}
                        </button>
                      </div>
                    </div>
                  </section>
                )}

                {/* ── PRIVACY ── */}
                <section>
                  <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-3">{t("settings_privacy")}</h3>
                  <div className="space-y-3">
                    {/* Reset memory */}
                    {showResetConfirm ? (
                      <div className="space-y-2">
                        <p className="text-sm text-foreground">{t("settings_reset_confirm")}</p>
                        <div className="flex gap-3">
                          <button
                            onClick={() => { onResetMemory(); setShowResetConfirm(false); onClose(); }}
                            className="text-crisis-red text-sm font-medium"
                          >
                            {t("settings_reset_yes")}
                          </button>
                          <button onClick={() => setShowResetConfirm(false)} className="text-muted-foreground text-sm">
                            {t("settings_cancel")}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setShowResetConfirm(true)} className="text-foreground/70 text-[15px]">
                        {t("settings_reset")}
                      </button>
                    )}

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {t("settings_privacy_text")}
                    </p>
                  </div>
                </section>

                {/* ── SUPPORTO ── */}
                <section>
                  <a href="mailto:supporto@intus.app" className="text-foreground/70 text-[15px]">
                    {t("settings_support")}
                  </a>
                </section>

                {/* ── ZONA PERICOLOSA ── */}
                {isAuthenticated && (
                  <section className="border-t border-crisis-red/20 pt-6">
                    <h3 className="text-xs text-crisis-red/70 uppercase tracking-wider mb-3">{t("settings_section_danger")}</h3>
                    <div className="space-y-4">
                      {/* Logout */}
                      <button onClick={handleLogout} className="text-crisis-red text-[15px] font-medium">
                        {t("settings_logout")}
                      </button>

                      {/* Delete Account */}
                      {showDeleteConfirm ? (
                        <div className="space-y-2">
                          <p className="text-sm text-crisis-red/80">{t("settings_delete_confirm")}</p>
                          <div className="flex gap-3">
                            <button
                              onClick={handleDeleteAccount}
                              disabled={deleteLoading}
                              className="text-crisis-red text-sm font-medium disabled:opacity-50"
                            >
                              {deleteLoading ? "..." : t("settings_delete_yes")}
                            </button>
                            <button onClick={() => setShowDeleteConfirm(false)} className="text-muted-foreground text-sm">
                              {t("settings_cancel")}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setShowDeleteConfirm(true)} className="text-crisis-red/60 text-[15px]">
                          {t("settings_delete_account")}
                        </button>
                      )}
                    </div>
                  </section>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SettingsPanel;
