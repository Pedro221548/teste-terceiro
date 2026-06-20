import toast from 'react-hot-toast';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc, deleteDoc, limit, updateDoc, getDocs, deleteField, where } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import imageCompression from 'browser-image-compression';
import { db, auth } from '../firebase';
import { MessageSquare, Send, Upload, Trash2, Building2, Share2, Heart, Edit2, ChevronDown, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// ─── Interfaces ───

interface FeedPost {
  id: string;
  agencyId: string;
  title: string;
  content: string;
  imageUrl?: string;
  imagePath?: string;
  type: 'TRAINING' | 'ANNOUNCEMENT' | 'URGENT' | 'RECOGNITION';
  createdAt: any;
  creatorId?: string;
  creatorName?: string;
  creatorPhotoUrl?: string;
  reactions?: Record<string, { emoji: string; name: string }>;
}

interface FeedComment {
  id: string;
  feedPostId: string;
  userId: string;
  userName: string;
  userPhotoUrl?: string;
  comment: string;
  createdAt: any;
  editedAt?: any;
}

const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

const TYPE_LABELS: Record<string, string> = {
  TRAINING: 'Treinamento',
  ANNOUNCEMENT: 'Comunicado',
  URGENT: 'Urgente',
  RECOGNITION: 'Reconhecimento'
};

// ─── Extracted Comment Component ───

const CommentItem: React.FC<{ 
  comment: FeedComment;
  userRole: string | null;
  onEdit: (c: FeedComment) => void;
  onDelete: (c: FeedComment | null) => void;
  editingCommentId: string | null;
  editingCommentText: string;
  setEditingCommentText: (t: string) => void;
  setEditingCommentId: (id: string | null) => void;
  onSaveEdit: (id: string) => void;
}> = ({ 
  comment, 
  userRole, 
  onEdit, 
  onDelete, 
  editingCommentId, 
  editingCommentText, 
  setEditingCommentText, 
  setEditingCommentId, 
  onSaveEdit 
}) => {
  const isEditing = editingCommentId === comment.id;

  const renderCommentText = (text: string) => {
    const parts = text.split(/(@[\p{L}\w]+)/gu);
    return parts.map((part, i) => 
      /^@[\p{L}\w]+$/u.test(part) ? 
        <span key={i} className="text-blue-600 dark:text-blue-400 font-semibold">{part}</span> : 
        part
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl text-sm relative group/comment border border-transparent dark:border-slate-800/50"
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-2">
          {comment.userPhotoUrl ? (
            <img src={comment.userPhotoUrl} alt={comment.userName} className="w-6 h-6 rounded-full object-cover" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] text-slate-500 dark:text-slate-400 font-bold">
              {comment.userName.charAt(0)}
            </div>
          )}
          <span className="font-bold text-blue-700 dark:text-blue-400">{comment.userName}</span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">
            {comment.createdAt?.toDate ? comment.createdAt.toDate().toLocaleString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }) : ''}
            {comment.editedAt && ' (editado)'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {(auth.currentUser?.uid === comment.userId) && (
            <button
              onClick={() => onEdit(comment)}
              className="text-slate-400 dark:text-slate-500 hover:text-blue-500 transition-colors opacity-0 group-hover/comment:opacity-100 p-1"
              title="Editar comentário"
            >
              <Edit2 size={14} />
            </button>
          )}
          {(auth.currentUser?.uid === comment.userId || userRole === 'ADMIN' || userRole === 'AGENCY') && (
            <button
              onClick={() => onDelete(comment)}
              className="text-slate-400 dark:text-slate-500 hover:text-red-500 transition-colors opacity-0 group-hover/comment:opacity-100 p-1"
              title="Excluir comentário"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
      
      {isEditing ? (
        <div className="flex flex-col gap-2 mt-2">
          <input 
            type="text" 
            value={editingCommentText}
            onChange={(e) => setEditingCommentText(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white shadow-sm"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSaveEdit(comment.id);
              if (e.key === 'Escape') setEditingCommentId(null);
            }}
          />
          <div className="flex gap-2">
            <button 
              onClick={() => onSaveEdit(comment.id)}
              className="px-3 py-1.5 bg-blue-600 text-white text-[10px] uppercase tracking-wider font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              Salvar
            </button>
            <button 
              onClick={() => setEditingCommentId(null)}
              className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] uppercase tracking-wider font-bold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <p className="text-slate-700 dark:text-slate-300 mt-1" style={{ wordBreak: 'break-word' }}>
          {renderCommentText(comment.comment)}
        </p>
      )}
    </motion.div>
  );
};

// ─── Main Component ───

export const Feed = () => {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [comments, setComments] = useState<Record<string, FeedComment[]>>({});
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [userRole, setUserRole] = useState<string | null>(null);
  const [agencyInfo, setAgencyInfo] = useState<any>(null);
  const [postToDelete, setPostToDelete] = useState<FeedPost | null>(null);
  const [commentToDelete, setCommentToDelete] = useState<FeedComment | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [postLimit, setPostLimit] = useState(10);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [showAllComments, setShowAllComments] = useState<Record<string, boolean>>({});
  
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const [allUsersData, setAllUsersData] = useState<any[]>([]);
  
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [submittingCommentFor, setSubmittingCommentFor] = useState<string | null>(null);

  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postType, setPostType] = useState('TRAINING');

  // Load users for mentions (scoped by role)
  useEffect(() => {
    if (userRole === null) return;
    
    let usersQuery = query(collection(db, 'users'));
    if (userRole !== 'ADMIN') {
      if (!agencyInfo?.id) return;
      usersQuery = query(collection(db, 'users'), where('agencyId', '==', agencyInfo.id));
    }
    
    getDocs(usersQuery).then(snap => {
      setAllUsersData(snap.docs.map(d => ({id: d.id, ...d.data() as any})));
    }).catch(err => console.error('Error fetching users:', err));
  }, [userRole, agencyInfo?.id]);

  // Auth and user info
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        getDoc(doc(db, 'users', user.uid)).then(async (userDoc) => {
          const userData = userDoc.data();
          setUserRole(userData?.role || null);
          if (userData?.agencyId) {
            const agencyDoc = await getDoc(doc(db, 'agencies', userData.agencyId));
            setAgencyInfo({ id: agencyDoc.id, ...agencyDoc.data() });
          } else {
            setAgencyInfo(null);
          }
        });
      } else {
        setUserRole(null);
        setAgencyInfo(null);
      }
    });
    return unsubscribe;
  }, []);

  // Posts Listener
  useEffect(() => {
    if (userRole === null) return; // Wait for role resolution

    let q = query(collection(db, 'feedPosts'), orderBy('createdAt', 'desc'), limit(postLimit));
    
    if (userRole !== 'ADMIN') {
      if (!agencyInfo?.id) return; // Wait for agency information
      q = query(collection(db, 'feedPosts'), where('agencyId', '==', agencyInfo.id), orderBy('createdAt', 'desc'), limit(postLimit));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FeedPost));
      
      setHasMorePosts(snapshot.docs.length === postLimit);
      setPosts(postsData);
      setIsLoadingPosts(false);

      const imageUrls = postsData.map(p => p.imageUrl).filter(Boolean) as string[];
      const profileUrls = postsData.map(p => p.creatorPhotoUrl).filter(Boolean) as string[];
      const allUrlsToPreload = [...new Set([...imageUrls, ...profileUrls])];
      
      // Async preload pattern without blocking
      Promise.all(allUrlsToPreload.map(url => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = resolve;
          img.src = url;
        });
      })).catch(() => {});
      
    }, (error) => {
      console.error('Firestore Error (feedPosts):', error);
      setIsLoadingPosts(false);
    });
    return unsubscribe;
  }, [postLimit, userRole, agencyInfo?.id]);

  // Comments Listener scoped to visible posts
  useEffect(() => {
    if (posts.length === 0) {
      setComments({});
      setIsLoadingComments(false);
      return;
    }
    
    const postIds = posts.map(p => p.id);
    const chunks = [];
    for (let i = 0; i < postIds.length; i += 30) {
      chunks.push(postIds.slice(i, i + 30));
    }
    
    const latestChunksData: Record<number, FeedComment[]> = {};
    
    const unsubs = chunks.map((chunk, index) => {
      const q = query(collection(db, 'feedComments'), where('feedPostId', 'in', chunk));
      return onSnapshot(q, (snapshot) => {
        const chunkComments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FeedComment));
        latestChunksData[index] = chunkComments;
        
        let allComments = Object.values(latestChunksData).flat();
        
        allComments.sort((a, b) => {
           const t1 = a.createdAt?.toMillis ? a.createdAt.toMillis() : Date.now();
           const t2 = b.createdAt?.toMillis ? b.createdAt.toMillis() : Date.now();
           return t1 - t2;
        });

        const commentsByPost: Record<string, FeedComment[]> = {};
        allComments.forEach(comment => {
          if (!commentsByPost[comment.feedPostId]) {
            commentsByPost[comment.feedPostId] = [];
          }
          commentsByPost[comment.feedPostId].push(comment);
        });
        
        setComments(commentsByPost);
        setIsLoadingComments(false);
      });
    });
    
    return () => {
      unsubs.forEach(u => u());
    };
  }, [posts.map(p => p.id).join(',')]);

  // Handle outside clicks for reaction picker
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.reaction-picker-container')) {
        setShowReactionPicker(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // ─── Utility Functions ───

  const getUserProfile = useCallback(async (uid: string) => {
    const userDoc = await getDoc(doc(db, 'users', uid));
    const userData = userDoc?.data();
    let name = auth.currentUser?.displayName || 'Usuário';
    let photo = auth.currentUser?.photoURL || null;

    if (userData) {
      if (userData.role === 'EMPLOYEE') {
        const empDoc = await getDoc(doc(db, 'employees', uid));
        const empData = empDoc?.data();
        if (empData) {
          name = `${empData.firstName} ${empData.lastName || ''}`.trim();
          photo = empData.photoUrl || photo;
        }
      } else if (userData.role === 'COMPANY') {
        const compUserDoc = await getDoc(doc(db, 'companyUsers', uid));
        const compUserData = compUserDoc?.data();
        if (compUserData) {
          name = compUserData.fullName || name;
          photo = compUserData.photoUrl || photo;
        }
      } else if (userData.role === 'AGENCY') {
        if (userData.agencyId) {
          const agencyDoc = await getDoc(doc(db, 'agencies', userData.agencyId));
          const agencyData = agencyDoc?.data();
          if (agencyData) {
            name = agencyData.name || name;
            photo = agencyData.logoUrl || photo;
          }
        }
      } else {
        if (userData.fullName && userData.fullName.trim() !== '') {
          name = userData.fullName;
        } else if (userData.firstName && userData.firstName.trim() !== '') {
          name = `${userData.firstName} ${userData.lastName || ''}`.trim();
        }
        photo = userData.photoUrl || photo;
      }
    }
    return { name, photo, role: userData?.role };
  }, []);

  // ─── Actions ───

  const handleAddComment = async (postId: string) => {
    if (!newComment[postId] || !auth.currentUser || submittingCommentFor) return;
    
    const commentText = newComment[postId];
    setSubmittingCommentFor(postId);

    try {
      const { name: userName, photo: userPhotoUrl } = await getUserProfile(auth.currentUser.uid);

      const docRef = await addDoc(collection(db, 'feedComments'), {
        feedPostId: postId,
        userId: auth.currentUser.uid,
        userName,
        userPhotoUrl,
        comment: commentText,
        createdAt: serverTimestamp()
      });

      // MENTIONS LOGIC
      const mentions = commentText.match(/@([\p{L}\w]+)/gu);
      if (mentions && mentions.length > 0) {
        const uniqueMentions = [...new Set(mentions.map(m => m.substring(1).toLowerCase()))];
        
        for (const mention of uniqueMentions) {
          const targetUser = allUsersData.find(u => {
            const name1 = (u.fullName || '').toLowerCase();
            const name2 = (u.firstName || '').toLowerCase();
            const name3 = (u.name || '').toLowerCase();
            return name1.includes(mention) || name2.includes(mention) || name3.includes(mention);
          });
          
          if (targetUser && targetUser.id !== auth.currentUser.uid) {
            await addDoc(collection(db, 'notifications'), {
              type: 'MENTION',
              fromUser: userName,
              userId: targetUser.id,
              postId,
              commentId: docRef.id,
              read: false,
              createdAt: serverTimestamp(),
              message: `${userName} mencionou você em um comentário.`
            });
          }
        }
      }

      setNewComment(prev => ({ ...prev, [postId]: '' }));
    } catch (err) {
      console.error("Error adding comment:", err);
      toast.error('Erro ao enviar comentário.');
    } finally {
      setSubmittingCommentFor(null);
    }
  };

  const handleEditComment = (comment: FeedComment) => {
    setEditingCommentId(comment.id);
    setEditingCommentText(comment.comment);
  };

  const handleSaveEditComment = async (commentId: string) => {
    if (!editingCommentText.trim()) return;
    try {
      await updateDoc(doc(db, 'feedComments', commentId), {
        comment: editingCommentText,
        editedAt: serverTimestamp()
      });
      setEditingCommentId(null);
      setEditingCommentText('');
      toast.success('Comentário atualizado!');
    } catch (error) {
      console.error("Error editing comment:", error);
      toast.error('Erro ao editar comentário.');
    }
  };

  const handleDeletePost = async (post: FeedPost) => {
    try {
      if (post.imagePath) {
        const storage = getStorage();
        const storageRef = ref(storage, post.imagePath);
        await deleteObject(storageRef).catch(e => console.log('Error deleting image:', e));
      }
      await deleteDoc(doc(db, 'feedPosts', post.id));
      setPostToDelete(null);
      toast.success('Postagem excluída.');
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Erro ao excluir postagem.");
    }
  };

  const handleDeleteComment = async (comment: FeedComment) => {
    try {
      await deleteDoc(doc(db, 'feedComments', comment.id));
      setCommentToDelete(null);
      toast.success('Comentário excluído.');
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Erro ao excluir comentário.");
    }
  };

  const handleCreatePost = async () => {
    if (!auth.currentUser || !postTitle || !postContent) return;
    setIsSubmittingPost(true);

    try {
      let imageUrl = null;
      let imagePath = null;
      if (imageFile) {
        const options = {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1080,
          useWebWorker: true
        };
        const compressedFile = await imageCompression(imageFile, options);
        
        const storage = getStorage();
        imagePath = `feed/${Date.now()}_${compressedFile.name}`;
        const storageRef = ref(storage, imagePath);
        await uploadBytes(storageRef, compressedFile);
        imageUrl = await getDownloadURL(storageRef);
      }

      const { name: creatorName, photo: creatorPhotoUrl } = await getUserProfile(auth.currentUser.uid);

      await addDoc(collection(db, 'feedPosts'), {
        agencyId: agencyInfo?.id || null,
        title: postTitle,
        content: postContent,
        type: postType,
        imageUrl: imageUrl || null,
        imagePath: imagePath || null,
        reactions: {},
        createdAt: serverTimestamp(),
        creatorId: auth.currentUser.uid,
        creatorName,
        creatorPhotoUrl
      });
      
      setPostTitle('');
      setPostContent('');
      setPostType('TRAINING');
      setImageFile(null);
      toast.success('Postagem criada!');
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Erro ao publicar postagem: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsSubmittingPost(false);
    }
  };

  const handleSharePost = (postId: string) => {
    const url = `${window.location.origin}/feed?postId=${postId}`;
    navigator.clipboard.writeText(url);
    toast.success('Link do post copiado para a área de transferência!');
  };

  const handleReact = async (postId: string, emoji: string, currentReaction?: string | null) => {
    if (!auth.currentUser) return;
    const postRef = doc(db, 'feedPosts', postId);
    setShowReactionPicker(null);
    
    try {
      if (currentReaction === emoji) {
        await updateDoc(postRef, {
          [`reactions.${auth.currentUser.uid}`]: deleteField()
        });
      } else {
        const { name: userName } = await getUserProfile(auth.currentUser.uid);
        await updateDoc(postRef, {
          [`reactions.${auth.currentUser.uid}`]: { emoji, name: userName }
        });
      }
    } catch (error) {
      console.error("Error reacting to post:", error);
      toast.error("Erro ao curtir postagem.");
    }
  };

  const toggleShowAllComments = (postId: string) => {
    setShowAllComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  // ─── Renderizing ───

  const isLoading = (isLoadingPosts && posts.length === 0) || isLoadingComments;

  if (isLoading) {
    return (
      <div className="space-y-8 max-w-3xl mx-auto p-4">
        {(userRole === 'AGENCY' || userRole === 'ADMIN') && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-lg space-y-4 animate-pulse">
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-md w-1/3 mb-4"></div>
            <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
            <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
            <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
            <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
          </div>
        )}

        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/5"></div>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-4/6"></div>
            </div>
            <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full mb-4"></div>
            <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto p-4">
      {/* Custom Confirmation Modal */}
      {(postToDelete || commentToDelete) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-xl max-w-sm w-full space-y-4 border border-transparent dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {postToDelete ? 'Excluir postagem?' : 'Excluir comentário?'}
            </h3>
            <p className="text-slate-600 dark:text-slate-400">Esta ação não pode ser desfeita. Tem certeza que deseja continuar?</p>
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setPostToDelete(null);
                  setCommentToDelete(null);
                }}
                className="flex-1 px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                disabled={isSubmittingPost}
              >
                Cancelar
              </button>
              <button 
                onClick={() => postToDelete ? handleDeletePost(postToDelete) : commentToDelete ? handleDeleteComment(commentToDelete) : null}
                className="flex-1 px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
                disabled={isSubmittingPost}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Post Form */}
      {(userRole === 'AGENCY' || userRole === 'ADMIN') && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-lg space-y-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Criar Nova Postagem</h3>
          
          <input 
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
            placeholder="Título" 
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white" 
            disabled={isSubmittingPost}
          />
          
          <textarea 
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            placeholder="Conteúdo" 
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 h-32 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white" 
            disabled={isSubmittingPost}
          />
          
          <select 
            value={postType}
            onChange={(e) => setPostType(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white" 
            disabled={isSubmittingPost}
          >
            {Object.entries(TYPE_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
          
          <div className="flex gap-2 items-center">
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              disabled={isSubmittingPost}
            >
              <Upload size={18} /> {imageFile ? imageFile.name : 'Selecionar Imagem'}
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={(e) => setImageFile(e.target.files?.[0] || null)} 
              className="hidden" 
              accept="image/*"
            />
          </div>
          
          <button 
            onClick={handleCreatePost}
            disabled={isSubmittingPost || !postTitle || !postContent}
            className="w-full bg-blue-600 text-white font-semibold px-4 py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmittingPost ? <Loader2 size={20} className="animate-spin" /> : 'Publicar'}
          </button>
        </div>
      )}

      {/* Empty State */}
      {posts.length === 0 && !isLoadingPosts && (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm">
          <MessageSquare size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Nenhuma postagem ainda</h3>
          <p className="text-slate-500 dark:text-slate-400">Fique atento às novidades!</p>
        </div>
      )}

      {/* Posts List */}
      <AnimatePresence>
      {posts.map(post => {
        const postReactions = post.reactions || {};
        const myReaction = auth.currentUser ? postReactions[auth.currentUser.uid]?.emoji : null;
        
        const reactionCounts: Record<string, number> = {};
        let totalReactions = 0;
        
        (Object.values(postReactions) as {emoji: string, name: string}[]).forEach((reaction) => {
          reactionCounts[reaction.emoji] = (reactionCounts[reaction.emoji] || 0) + 1;
          totalReactions++;
        });
        
        const topEmojis = Object.keys(reactionCounts)
          .sort((a, b) => reactionCounts[b] - reactionCounts[a])
          .slice(0, 3);
          
        const likedUsers = (Object.values(postReactions) as {emoji: string, name: string}[]).map(r => r.name).slice(0, 5);
        const tooltipText = likedUsers.length > 0 
          ? likedUsers.join(', ') + (Object.keys(postReactions).length > 5 ? ` e mais ${Object.keys(postReactions).length - 5}` : '')
          : '';

        const postComments = comments[post.id] || [];
        const shouldTruncateComments = !showAllComments[post.id] && postComments.length > 3;
        const visibleComments = shouldTruncateComments ? postComments.slice(0, 3) : postComments;

        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={post.id} 
            className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all overflow-visible"
          >
            {/* Post Header */}
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0">
                  {post.creatorPhotoUrl ? (
                    <img src={post.creatorPhotoUrl} alt={post.creatorName} className="w-full h-full object-cover" />
                  ) : agencyInfo?.logoUrl ? (
                    <img src={agencyInfo.logoUrl} alt={agencyInfo.name || 'Agência'} className="w-full h-full object-cover" />
                  ) : (
                    <Building2 size={24} />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{post.creatorName || agencyInfo?.name || 'Agência Parceira'}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-500">
                    {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'Data indisponível'}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{post.title}</h3>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    post.type === 'URGENT' ? 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400' :
                    post.type === 'RECOGNITION' ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400' :
                    'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400'
                  }`}>
                    {TYPE_LABELS[post.type] || post.type}
                  </span>
                  {(userRole === 'AGENCY' || userRole === 'ADMIN') && (
                    <button onClick={() => setPostToDelete(post)} className="text-slate-400 dark:text-slate-500 hover:text-red-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            {/* Post Content */}
            <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed" style={{ wordBreak: 'break-word' }}>{post.content}</p>
            {post.imageUrl && (
              <img src={post.imageUrl} alt="Post" className="w-full h-auto rounded-2xl mb-4 border border-slate-100 dark:border-slate-800 shadow-sm object-cover max-h-[500px]" referrerPolicy="no-referrer" />
            )}
            
            {/* Post Actions (Reactions & Share) */}
            <div className="flex items-center gap-4 border-t border-slate-100 dark:border-slate-800 pt-4 mt-4 relative">
              <div className="relative flex items-center reaction-picker-container">
                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                    myReaction ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  onClick={() => handleReact(post.id, '👍', myReaction)}
                  onMouseEnter={() => setShowReactionPicker(post.id)}
                >
                  <Heart size={18} className={myReaction ? 'fill-current' : ''} />
                  <span>{myReaction ? myReaction : 'Curtir'}</span>
                </motion.button>
                
                <AnimatePresence>
                  {showReactionPicker === post.id && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.9 }}
                      className="absolute bottom-full left-0 mb-2 flex bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl rounded-full px-2 py-1 gap-1 z-50 overflow-visible"
                    >
                      {REACTIONS.map((emoji) => (
                        <motion.button 
                          whileHover={{ scale: 1.3 }}
                          whileTap={{ scale: 0.9 }}
                          key={emoji}
                          className="text-xl p-1.5 transition-transform origin-bottom"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReact(post.id, emoji, myReaction);
                          }}
                        >
                          {emoji}
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {totalReactions > 0 && (
                <div className="flex items-center gap-1 group/tooltip relative cursor-help">
                   <div className="flex -space-x-1">
                     {topEmojis.map((emoji, i) => (
                       <span key={i} className="text-xs bg-slate-50 dark:bg-slate-800 border border-white dark:border-slate-900 rounded-full w-5 h-5 flex items-center justify-center z-[3]">{emoji}</span>
                     ))}
                   </div>
                   <span className="text-sm text-slate-500 font-medium ml-1">{totalReactions}</span>
                   
                   <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tooltip:block bg-slate-900 dark:bg-slate-700 text-white text-xs py-1.5 px-3 rounded-lg whitespace-nowrap z-50">
                     {tooltipText}
                   </div>
                </div>
              )}

              <div className="flex-1"></div>

              <button 
                onClick={() => handleSharePost(post.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Share2 size={18} />
                <span className="hidden sm:inline">Compartilhar</span>
              </button>
            </div>

            {/* Comments Section */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-4">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-slate-800 dark:text-slate-200"><MessageSquare size={16} /> Comentários</h4>
              
              <div className="space-y-3 mb-4">
                <AnimatePresence initial={false}>
                  {visibleComments.map(comment => (
                    <CommentItem 
                      key={comment.id}
                      comment={comment}
                      userRole={userRole}
                      onEdit={handleEditComment}
                      onDelete={setCommentToDelete}
                      editingCommentId={editingCommentId}
                      editingCommentText={editingCommentText}
                      setEditingCommentText={setEditingCommentText}
                      setEditingCommentId={setEditingCommentId}
                      onSaveEdit={handleSaveEditComment}
                    />
                  ))}
                </AnimatePresence>
                
                {shouldTruncateComments && (
                  <button 
                    onClick={() => toggleShowAllComments(post.id)}
                    className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 mt-2 flex items-center gap-1 transition-colors"
                  >
                    Ver todos os {postComments.length} comentários
                    <ChevronDown size={14} className="mt-px" />
                  </button>
                )}

                {!shouldTruncateComments && postComments.length > 3 && (
                  <button 
                    onClick={() => toggleShowAllComments(post.id)}
                    className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 mt-3 flex items-center justify-center gap-1 w-full p-2 transition-colors rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Ocultar comentários
                  </button>
                )}
              </div>

              {/* Add Comment Input */}
              <div className="flex gap-2 relative">
                <input 
                  type="text" 
                  value={newComment[post.id] || ''}
                  onChange={e => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleAddComment(post.id);
                  }}
                  disabled={submittingCommentFor === post.id}
                  placeholder="Escreva um comentário... Use @ para mencionar"
                  className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white disabled:opacity-50"
                />
                <button 
                  onClick={() => handleAddComment(post.id)} 
                  disabled={submittingCommentFor === post.id || !newComment[post.id]}
                  className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[50px]"
                >
                  {submittingCommentFor === post.id ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </div>
            </div>
          </motion.div>
        );
      })}
      </AnimatePresence>

      {hasMorePosts && (
        <div className="flex justify-center pt-4 pb-8">
          <button
            onClick={() => setPostLimit(prev => prev + 10)}
            className="px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            Carregar mais postagens
          </button>
        </div>
      )}
    </div>
  );
};
