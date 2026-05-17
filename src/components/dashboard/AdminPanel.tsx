import { useState } from 'react';
import { Shield, Users, Ban, Megaphone, Crown } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { db } from '../../firebase/config';
import { ref, update, push, serverTimestamp } from 'firebase/database';

export default function AdminPanel() {
  const { isAdmin } = useAppStore();
  const [announcement, setAnnouncement] = useState('');
  const [banUid, setBanUid] = useState('');

  if (!isAdmin) return null;

  const sendGlobalAnnouncement = async () => {
    if (!announcement.trim()) return;
    await push(ref(db, 'announcements'), {
      text: announcement,
      createdAt: serverTimestamp(),
    });
    setAnnouncement('');
    alert('Announcement sent to all users!');
  };

  const banUser = async () => {
    if (!banUid.trim()) return;
    await update(ref(db, `users/${banUid}`), {
      banned: true,
      bannedAt: serverTimestamp(),
    });
    setBanUid('');
    alert('User banned successfully');
  };

  const makeGlobalVIP = async () => {
    alert('Global VIP mode activated (demo)');
  };

  return (
    <div className="flex-1 bg-[#151921] rounded-3xl border border-red-500/20 p-8">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="w-8 h-8 text-red-500" />
        <h1 className="text-3xl font-black text-red-400">Admin Control Panel</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Global Announcement */}
        <div className="bg-[#0B0E14] border border-white/10 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Megaphone className="text-amber-400" />
            <h3 className="font-black">Global Announcement</h3>
          </div>
          <textarea
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
            placeholder="Type announcement..."
            className="w-full h-24 bg-white/5 rounded-xl p-4 text-sm resize-none mb-4"
          />
          <button 
            onClick={sendGlobalAnnouncement}
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-3 rounded-xl"
          >
            Send to All Users
          </button>
        </div>

        {/* User Ban */}
        <div className="bg-[#0B0E14] border border-white/10 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Ban className="text-red-400" />
            <h3 className="font-black">Ban User</h3>
          </div>
          <input
            value={banUid}
            onChange={(e) => setBanUid(e.target.value)}
            placeholder="User UID"
            className="w-full bg-white/5 rounded-xl p-4 text-sm mb-4"
          />
          <button 
            onClick={banUser}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-black py-3 rounded-xl"
          >
            Ban User
          </button>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#0B0E14] border border-white/10 rounded-3xl p-6 md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Crown className="text-emerald-400" />
            <h3 className="font-black">Quick Actions</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={makeGlobalVIP} className="px-6 py-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-bold rounded-xl border border-emerald-500/30">
              Enable Global VIP Mode
            </button>
            <button className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold">
              Reset All Games
            </button>
            <button className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold">
              View All Active Rooms
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-red-400/60">
        Admin Panel • Only accessible with admin1@gmail.com
      </div>
    </div>
  );
}
