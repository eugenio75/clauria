import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "../i18n/LanguageContext";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  onNameChange: (name: string) => void;
  onResetMemory: () => void;
  isAuthenticated?: boolean;
  onLogout?: () => void;
}

const SettingsPanel = ({ isOpen, onClose, userName, onNameChange, onResetMemory, isAuthenticated = false, onLogout }: SettingsPanelProps) => {
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(userName);
  const [showConfirm, setShowConfirm] = useState(false);
  const { t } = useLanguage();

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
            className="fixed bottom-0 left-0 right-0 z-50 bg-parchment rounded-t-3xl max-w-[600px] mx-auto"
          >
            <div className="p-6 pb-safe">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-display text-xl text-foreground">{t("settings_title")}</h2>
                <button onClick={onClose} className="text-muted-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Name */}
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">{t("settings_name_label")}</label>
                  {editingName ? (
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        value={nameValue}
                        onChange={(e) => setNameValue(e.target.value)}
                        className="flex-1 bg-transparent border-b border-trust-blue text-foreground text-[15px] py-1 focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => {
                          onNameChange(nameValue);
                          setEditingName(false);
                        }}
                        className="text-trust-blue text-sm font-medium"
                      >
                        {t("settings_save")}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingName(true)}
                      className="block mt-1 text-foreground text-[15px]"
                    >
                      {userName || "—"}
                    </button>
                  )}
                </div>

                {/* Reset Memory */}
                <div>
                  {showConfirm ? (
                    <div className="space-y-2">
                      <p className="text-sm text-foreground">{t("settings_reset_confirm")}</p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            onResetMemory();
                            setShowConfirm(false);
                            onClose();
                          }}
                          className="text-crisis-red text-sm font-medium"
                        >
                          {t("settings_reset_yes")}
                        </button>
                        <button
                          onClick={() => setShowConfirm(false)}
                          className="text-muted-foreground text-sm"
                        >
                          {t("settings_cancel")}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowConfirm(true)}
                      className="text-foreground/70 text-[15px]"
                    >
                      {t("settings_reset")}
                    </button>
                  )}
                </div>

                {/* Privacy */}
                <div>
                  <button
                    className="text-foreground/70 text-[15px]"
                    onClick={() => {}}
                  >
                    {t("settings_privacy")}
                  </button>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {t("settings_privacy_text")}
                  </p>
                </div>

                {/* Support */}
                <div>
                  <a href="mailto:supporto@intus.app" className="text-foreground/70 text-[15px]">
                    {t("settings_support")}
                  </a>
                </div>

                {/* Logout */}
                {isAuthenticated && (
                  <div>
                    <button
                      onClick={async () => {
                        await supabase.auth.signOut();
                        localStorage.removeItem("intus_profile");
                        localStorage.removeItem("intus_anon_msg_count");
                        onLogout?.();
                        onClose();
                        window.location.reload();
                      }}
                      className="text-crisis-red text-[15px] font-medium"
                    >
                      {t("settings_logout")}
                    </button>
                  </div>
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
