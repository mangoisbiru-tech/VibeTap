"use client";

import { useState } from "react";
import { ShoppingBag, ChevronRight, Plus, Minus, Zap } from "lucide-react";
import ParticleBackground from "@/components/ParticleBackground";

type MenuItem = { name: string; price: number; emoji: string };

export default function MenuClient({ 
  name, 
  menuItems, 
  paymentUrl 
}: { 
  name: string; 
  menuItems: MenuItem[]; 
  paymentUrl: string;
}) {
  const [cart, setCart] = useState<Record<number, number>>({});

  const updateQuantity = (index: number, delta: number) => {
    setCart(prev => {
      const current = prev[index] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [index]: next };
    });
  };

  const total = menuItems.reduce((sum, item, idx) => {
    return sum + (item.price * (cart[idx] || 0));
  }, 0);

  const itemCount = Object.values(cart).reduce((a, b) => a + b, 0);

  const handlePay = () => {
    if (total <= 0) return;
    // For now, we redirect to the static payment URL.
    // In the future, we will bake the 'total' into a deep link string here.
    window.location.href = paymentUrl;
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white selection:bg-purple-500/30 overflow-x-hidden">
      <ParticleBackground />

      {/* Header */}
      <header className="relative z-10 pt-12 pb-6 px-6 text-center">
        <div className="w-16 h-16 bg-gradient-to-tr from-purple-600 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-purple-500/20">
          <Zap className="text-white fill-white" size={32} />
        </div>
        <h1 className="text-3xl font-black tracking-tight">{name}</h1>
        <p className="text-gray-400 text-sm mt-2 font-medium opacity-80 uppercase tracking-widest">Digital Menu</p>
      </header>

      {/* Menu Items */}
      <main className="relative z-10 px-6 pb-32 max-w-lg mx-auto">
        <div className="space-y-4 mt-8">
          {menuItems.map((item, idx) => (
            <div 
              key={idx} 
              className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-3xl p-5 flex items-center gap-4 hover:bg-white/[0.05] transition-all"
            >
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-3xl shadow-inner">
                {item.emoji}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-white/90">{item.name}</h3>
                <p className="text-purple-400 font-black text-sm">RM {item.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-3 bg-black/20 rounded-2xl p-1 border border-white/5">
                <button 
                  onClick={() => updateQuantity(idx, -1)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="w-4 text-center font-bold text-sm">
                  {cart[idx] || 0}
                </span>
                <button 
                  onClick={() => updateQuantity(idx, 1)}
                  className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center hover:bg-purple-500 transition-colors shadow-lg shadow-purple-500/20"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          ))}

          {menuItems.length === 0 && (
            <div className="text-center py-20 opacity-40">
              <ShoppingBag size={48} className="mx-auto mb-4" />
              <p>Menu is empty</p>
            </div>
          )}
        </div>
      </main>

      {/* Floating Bottom Bar */}
      {itemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-6 z-50 animate-in slide-in-from-bottom-10 duration-500">
          <div className="max-w-md mx-auto bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] p-4 shadow-2xl shadow-black/50">
            <div className="flex items-center justify-between px-4 mb-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Total Amount</p>
                <p className="text-2xl font-black text-white">RM {total.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Items</p>
                <p className="text-xl font-bold text-purple-400">{itemCount}</p>
              </div>
            </div>
            
            <button 
              onClick={handlePay}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-black py-5 rounded-[2rem] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-purple-600/30"
            >
              PAY WITH TNG <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
