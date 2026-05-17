import React, { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Play, Video, Upload, X, Loader2 } from 'lucide-react';
import { db } from '../../firebase/config';
import { ref, onValue, push, serverTimestamp, get, set, update } from 'firebase/database';
import { useAppStore } from '../../store/useAppStore';
import { uploadToCloudinary } from '../../lib/cloudinary';

export default function ClipsFeed() {
  const { user } = useAppStore();
  const [clips, setClips] = useState<any[]>([]);
  const [activeClip, setActiveClip] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');

  useEffect(() => {
    const clipsRef = ref(db, 'clips');
    const unsub = onValue(clipsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const sortedClips = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).sort((a, b) => b.createdAt - a.createdAt);
        setClips(sortedClips);
      } else {
        setClips([]);
      }
    });
    return () => unsub();
  }, []);

  const handleUploadClick = () => {
    setUploadError('');
    setShowUploadModal(true);
  };

  const checkUploadLimit = async () => {
    if (!user) return false;
    
    const { vipTier } = useAppStore.getState();
    if (vipTier !== 'free') return true; // VIPs have no upload limit

    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const limitRef = ref(db, `users/${user.uid}/monthlyUploads/${currentMonth}`);
    const snapshot = await get(limitRef);
    const count = snapshot.val() || 0;
    if (count >= 3) {
      setUploadError(`You have reached your limit of 3 video uploads for this month.`);
      return false;
    }
    return true;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setUploadError('File size must be under 15MB.');
      return;
    }

    const canUpload = await checkUploadLimit();
    if (!canUpload) return;

    setIsUploading(true);
    setUploadError('');

    try {
      const url = await uploadToCloudinary(file, 'video');
      
      await push(ref(db, 'clips'), {
        url,
        title: title || 'My Awesome Clip',
        userId: user?.uid,
        user: user?.displayName || 'Unknown Gamer',
        userPhoto: user?.photoURL || '',
        likes: 0,
        createdAt: serverTimestamp()
      });

      // Increment monthly count
      const currentMonth = new Date().toISOString().slice(0, 7);
      const limitRef = ref(db, `users/${user?.uid}/monthlyUploads/${currentMonth}`);
      const limitSnapshot = await get(limitRef);
      const newCount = (limitSnapshot.val() || 0) + 1;
      await set(limitRef, newCount);

      setShowUploadModal(false);
      setTitle('');
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex-1 bg-black rounded-3xl overflow-hidden flex flex-col relative border border-white/10">
       <div className="absolute top-6 left-6 z-30 flex items-center justify-between w-[calc(100%-3rem)] pointer-events-none">
         <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white drop-shadow-lg">Gaming Feed</h1>
         <button 
           className="bg-pink-600/90 hover:bg-pink-500 text-white font-bold px-4 py-2 rounded-xl transition-all shadow-lg shadow-pink-600/30 cursor-pointer flex items-center gap-2 pointer-events-auto backdrop-blur-sm"
           onClick={handleUploadClick}
         >
           <Upload className="w-4 h-4" /> Upload Clip
         </button>
       </div>
       
       {clips.length === 0 ? (
         <div className="flex-1 flex flex-col items-center justify-center bg-[#06080A] text-slate-500">
           <Video className="w-16 h-16 mb-4 opacity-30" />
           <p className="text-sm font-bold tracking-widest uppercase">No Clips Yet</p>
           <p className="text-xs mt-2 text-slate-600 max-w-xs text-center">Capture your best gaming moments and share them with the world.</p>
           <button 
             className="mt-6 bg-pink-600 hover:bg-pink-500 text-white font-bold px-6 py-2 rounded-xl transition-all shadow-lg shadow-pink-600/30 cursor-pointer"
             onClick={handleUploadClick}
           >
             Upload First Clip
           </button>
         </div>
       ) : (
         <>
           <div className="flex-1 relative flex items-center justify-center group">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 z-10 pointer-events-none"></div>
              
              <div className="w-full h-full bg-slate-900 flex items-center justify-center relative overflow-hidden">
                 <video 
                   src={clips[activeClip]?.url} 
                   autoPlay 
                   loop 
                   muted 
                   className="w-full h-full object-cover"
                 />
              </div>

              {/* Right Interactions */}
              <div className="absolute right-4 bottom-24 z-20 flex flex-col gap-6 items-center">
                <div className="flex flex-col items-center gap-1 group/btn">
                  <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-pink-500/20 text-white transition-colors cursor-pointer">
                    <Heart className="w-6 h-6 group-hover/btn:text-pink-500 group-hover/btn:fill-pink-500 transition-colors" />
                  </button>
                  <span className="text-xs font-bold text-white shadow-black drop-shadow-md">{clips[activeClip]?.likes || '0'}</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 text-white transition-colors cursor-pointer">
                    <MessageCircle className="w-6 h-6" />
                  </button>
                  <span className="text-xs font-bold text-white shadow-black drop-shadow-md">0</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 text-white transition-colors cursor-pointer">
                    <Share2 className="w-6 h-6" />
                  </button>
                  <span className="text-xs font-bold text-white shadow-black drop-shadow-md">Share</span>
                </div>
              </div>

              {/* Bottom Info */}
              <div className="absolute bottom-6 left-6 z-20 right-20 pointer-events-none">
                 <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 border border-white overflow-hidden pointer-events-auto">
                      {clips[activeClip]?.userPhoto ? (
                        <img src={clips[activeClip].userPhoto} alt={clips[activeClip].user} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-xs">{(clips[activeClip]?.user || '?').charAt(0)}</div>
                      )}
                    </div>
                    <span className="font-bold text-white shadow-black drop-shadow-md pointer-events-auto">@{clips[activeClip]?.user || 'Unknown'}</span>
                    <button className="px-3 py-1 bg-white text-black text-xs font-bold rounded-full ml-2 cursor-pointer pointer-events-auto">Follow</button>
                 </div>
                 <p className="text-white text-sm shadow-black drop-shadow-md mb-2">{clips[activeClip]?.title}</p>
                 <div className="flex gap-2">
                   <span className="px-2 py-1 bg-black/40 backdrop-blur-md rounded-md text-[10px] font-bold text-white uppercase tracking-wider pointer-events-auto">#Gaming</span>
                 </div>
              </div>
           </div>

           {/* Feed Navigation */}
           <div className="absolute right-6 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2">
              {clips.map((_, i) => (
                <button 
                  key={i}
                  onClick={() => setActiveClip(i)}
                  className={`w-2 rounded-full transition-all duration-300 cursor-pointer ${activeClip === i ? 'h-8 bg-white shadow-[0_0_10px_white]' : 'h-2 bg-white/30 hover:bg-white/50'}`}
                />
              ))}
           </div>
         </>
       )}

       {/* Upload Modal */}
       {showUploadModal && (
         <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6">
           <div className="bg-[#0B0E14] border border-white/10 rounded-3xl p-6 w-full max-w-md relative animate-in fade-in zoom-in duration-200">
             <button 
               onClick={() => setShowUploadModal(false)}
               className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
               disabled={isUploading}
             >
               <X className="w-6 h-6" />
             </button>
             
             <h2 className="text-2xl font-black italic uppercase tracking-wider text-white mb-2">Upload Clip</h2>
             <p className="text-slate-400 text-xs mb-6">
               {useAppStore.getState().vipTier === 'free' ? 'Share your epic moment. Max 15 sec (15MB). 3 videos per month.' : 'VIP Access: Share HD Clips up to 5 min. Unlimited uploads.'}
             </p>
             
             <div className="space-y-4">
               <div>
                 <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Clip Title</label>
                 <input 
                   type="text" 
                   value={title}
                   onChange={(e) => setTitle(e.target.value)}
                   disabled={isUploading}
                   placeholder="e.g. Insane 1v5 Clutch!"
                   className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500 transition-colors"
                 />
               </div>

               <div>
                 <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Video File</label>
                 <label className={`w-full border-2 border-dashed border-white/10 hover:border-pink-500/50 rounded-2xl flex flex-col items-center justify-center py-10 transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}>
                   <Upload className="w-10 h-10 text-pink-500 mb-3" />
                   <span className="text-slate-300 font-bold">Click to select video</span>
                   <span className="text-slate-500 text-xs mt-1">MP4, WebM up to 15MB</span>
                   <input 
                     type="file" 
                     accept="video/*" 
                     className="hidden" 
                     ref={fileInputRef}
                     onChange={handleFileChange}
                     disabled={isUploading}
                   />
                 </label>
               </div>

               {uploadError && (
                 <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-xl">
                   {uploadError}
                 </div>
               )}

               {isUploading && (
                 <div className="flex items-center justify-center gap-3 text-pink-500 font-bold py-4">
                   <Loader2 className="w-6 h-6 animate-spin" />
                   <span>Uploading your clip...</span>
                 </div>
               )}
             </div>
           </div>
         </div>
       )}
    </div>
  );
}
