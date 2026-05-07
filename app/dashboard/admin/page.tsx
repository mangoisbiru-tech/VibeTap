"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";
import { ShieldAlert, Loader2, CheckCircle2, Trash2, Power, Edit3, PowerOff, Smartphone } from "lucide-react";

type Merchant = {
  id: string;
  name: string;
  email: string;
  planTier: "free" | "lite" | "basic" | "pro";
  createdAt: any;
  isActive: boolean;
  isListenerActive?: boolean;
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      const adminEmails = ["tappaymy@outlook.com", "tappaymy@hotmail.com"];
      if (!user.email || !adminEmails.includes(user.email)) {
        router.push("/dashboard");
        return;
      }

      setAuthorized(true);
      fetchMerchants();
    });

    return () => unsubscribe();
  }, [router]);

  async function fetchMerchants() {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "merchants"));
      const mList: Merchant[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        mList.push({
          id: docSnap.id,
          name: data.name || "Unknown",
          email: data.email || "No email",
          planTier: data.planTier || "free",
          createdAt: data.createdAt,
          isActive: data.isActive ?? true,
          isListenerActive: data.isListenerActive ?? true,
        });
      });
      // Sort by newest first
      mList.sort((a, b) => {
        const aTime = a.createdAt?.toMillis() || 0;
        const bTime = b.createdAt?.toMillis() || 0;
        return bTime - aTime;
      });
      setMerchants(mList);
    } catch (err) {
      console.error("Failed to fetch merchants:", err);
    } finally {
      setLoading(false);
    }
  }

  async function updatePlanTier(merchantId: string, newTier: "free" | "lite" | "basic" | "pro") {
    setUpdatingId(merchantId);
    try {
      await updateDoc(doc(db, "merchants", merchantId), {
        planTier: newTier,
      });
      setMerchants((prev) =>
        prev.map((m) => (m.id === merchantId ? { ...m, planTier: newTier } : m))
      );
    } catch (err) {
      console.error("Error updating plan:", err);
      alert("Failed to update plan tier.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function toggleStatus(merchantId: string, currentStatus: boolean) {
    setUpdatingId(merchantId);
    try {
      await updateDoc(doc(db, "merchants", merchantId), {
        isActive: !currentStatus,
      });
      setMerchants((prev) =>
        prev.map((m) => (m.id === merchantId ? { ...m, isActive: !currentStatus } : m))
      );
    } catch (err) {
      alert("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  }

  async function toggleListenerApp(merchantId: string, currentStatus: boolean) {
    setUpdatingId(merchantId);
    try {
      await updateDoc(doc(db, "merchants", merchantId), {
        isListenerActive: !currentStatus,
      });
      setMerchants((prev) =>
        prev.map((m) => (m.id === merchantId ? { ...m, isListenerActive: !currentStatus } : m))
      );
    } catch (err) {
      alert("Failed to update Listening App status");
    } finally {
      setUpdatingId(null);
    }
  }

  async function deleteMerchant(merchantId: string, name: string) {
    if (!confirm(`DANGER: Are you sure you want to PERMANENTLY DELETE ${name}? This cannot be undone.`)) return;
    setUpdatingId(merchantId);
    try {
      await deleteDoc(doc(db, "merchants", merchantId));
      setMerchants((prev) => prev.filter((m) => m.id !== merchantId));
    } catch (err) {
      alert("Failed to delete merchant");
    } finally {
      setUpdatingId(null);
    }
  }

  async function editMerchantInfo(merchantId: string, currentName: string, currentEmail: string) {
    const newName = prompt("New Business Name:", currentName);
    if (newName === null) return;
    const newEmail = prompt("New Email:", currentEmail === "No email" ? "" : currentEmail);
    if (newEmail === null) return;

    setUpdatingId(merchantId);
    try {
      await updateDoc(doc(db, "merchants", merchantId), {
        name: newName || currentName,
        email: newEmail || currentEmail,
      });
      setMerchants((prev) =>
        prev.map((m) => (m.id === merchantId ? { ...m, name: newName || currentName, email: newEmail || currentEmail } : m))
      );
    } catch (err) {
      alert("Failed to update info");
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading || !authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <ShieldAlert className="text-red-500" size={32} />
            God Mode Admin
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Manage merchant subscriptions and access levels.
          </p>
        </div>
        <div className="px-4 py-2 bg-slate-100 rounded-xl text-sm font-bold text-slate-600">
          Total Merchants: <span className="text-blue-600">{merchants.length}</span>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-md border border-slate-100 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-xs font-black uppercase tracking-widest text-slate-400">
                <th className="px-6 py-4">Merchant</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Subscription Plan</th>
                <th className="px-6 py-4">Listening App</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {merchants.map((merchant) => (
                <tr key={merchant.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{merchant.name}</div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">{merchant.id}</div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-600">
                    {merchant.email}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {merchant.createdAt
                      ? new Date(merchant.createdAt.toDate()).toLocaleDateString()
                      : "Unknown"}
                  </td>
                  <td className="px-6 py-4">
                    {merchant.isActive ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-600 text-xs font-bold">
                        <CheckCircle2 size={12} /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-500 text-xs font-bold">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative inline-block">
                      <select
                        value={merchant.planTier}
                        onChange={(e) => updatePlanTier(merchant.id, e.target.value as any)}
                        disabled={updatingId === merchant.id}
                        className="appearance-none bg-slate-50 border border-slate-200 text-slate-900 font-bold rounded-xl pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 cursor-pointer text-sm"
                      >
                        <option value="free">Free</option>
                        <option value="lite">Lite</option>
                        <option value="basic">Basic</option>
                        <option value="pro">Pro</option>
                      </select>
                      {updatingId === merchant.id ? (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 animate-spin pointer-events-none" size={16} />
                      ) : (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                          ▼
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative inline-block">
                      <select
                        value={(merchant.isListenerActive ?? true) ? "on" : "off"}
                        onChange={(e) => toggleListenerApp(merchant.id, e.target.value === "on")}
                        disabled={updatingId === merchant.id}
                        className={`appearance-none border font-bold rounded-xl pl-4 pr-10 py-2 focus:outline-none focus:ring-2 disabled:opacity-50 cursor-pointer text-sm transition-all ${
                          (merchant.isListenerActive ?? true)
                            ? "bg-blue-600 text-white border-blue-500 focus:ring-blue-500/20"
                            : "bg-slate-100 text-slate-500 border-slate-200 focus:ring-slate-500/20"
                        }`}
                      >
                        <option value="on" className="text-slate-900 bg-white">App: ON</option>
                        <option value="off" className="text-slate-900 bg-white">App: OFF</option>
                      </select>
                      <div className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${
                        (merchant.isListenerActive ?? true) ? "text-blue-200" : "text-slate-400"
                      }`}>
                        ▼
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => editMerchantInfo(merchant.id, merchant.name, merchant.email)}
                        disabled={updatingId === merchant.id}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Info"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button
                        onClick={() => toggleStatus(merchant.id, merchant.isActive)}
                        disabled={updatingId === merchant.id}
                        className={`p-2 rounded-lg transition-colors ${
                          merchant.isActive 
                            ? "text-slate-400 hover:text-orange-600 hover:bg-orange-50" 
                            : "text-emerald-500 hover:bg-emerald-50"
                        }`}
                        title={merchant.isActive ? "Make Offline" : "Make Online"}
                      >
                        {merchant.isActive ? <PowerOff size={18} /> : <Power size={18} />}
                      </button>
                      <button
                        onClick={() => deleteMerchant(merchant.id, merchant.name)}
                        disabled={updatingId === merchant.id}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Account"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {merchants.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">
                    No merchants found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
