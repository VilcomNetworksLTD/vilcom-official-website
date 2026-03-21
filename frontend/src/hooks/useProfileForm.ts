import { useState, useEffect } from "react";
import { usersApi, ProfileUpdatePayload, User } from "@/services/users";
import { useToast } from "@/hooks/use-toast";

export function useProfileForm() {
  const { toast } = useToast();

  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setSaving_]  = useState(true);   // renamed below
  const [saving,  setSaving]   = useState(false);
  const [dirty,   setDirty]    = useState(false);
  const [banner,  setBanner]   = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const [form, setForm] = useState<ProfileUpdatePayload>({
    name: "", phone: "", address: "", city: "", county: "", country: "", postal_code: "",
  });

  // re-export loading under the correct name
  const [loadingState, setLoadingState] = useState(true);

  const populate = (u: User) =>
    setForm({
      name:        u.name        ?? "",
      phone:       u.phone       ?? "",
      address:     u.address     ?? "",
      city:        u.city        ?? "",
      county:      u.county      ?? "",
      country:     u.country     ?? "",
      postal_code: u.postal_code ?? "",
    });

  useEffect(() => {
    (async () => {
      try {
        const res = await usersApi.getCurrent();
        const u: User = (res as any)?.data ?? res;
        setProfile(u);
        populate(u);
      } catch {
        setBanner({ type: "error", msg: "Could not load your profile. Please refresh." });
      } finally {
        setLoadingState(false);
      }
    })();
  }, []);

  const set = (key: keyof ProfileUpdatePayload) => (val: string) => {
    setForm((f) => ({ ...f, [key]: val }));
    setDirty(true);
    setBanner(null);
  };

  const handleReset = () => {
    if (!profile) return;
    populate(profile);
    setDirty(false);
    setBanner(null);
  };

  const handleSave = async (
    e: React.FormEvent,
    onSuccess?: (u: User) => void
  ) => {
    e.preventDefault();
    setSaving(true);
    setBanner(null);
    try {
      const res = await usersApi.updateCurrent(form);
      const updated: User = (res as any)?.data ?? res;
      setProfile(updated);
      populate(updated);
      setDirty(false);
      onSuccess?.(updated);
      setBanner({ type: "success", msg: "Profile updated successfully." });
      toast({ title: "Saved!", description: "Your profile has been updated." });
    } catch (err: any) {
      setBanner({
        type: "error",
        msg:  err?.response?.data?.message ?? "Something went wrong. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  return {
    profile,
    loading: loadingState,
    saving,
    dirty,
    banner,
    form,
    set,
    handleReset,
    handleSave,
  };
}