import toast from 'react-hot-toast';
import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc, deleteDoc, limit } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import imageCompression from 'browser-image-compression';
import { db, auth } from '../firebase';
import { MessageSquare, Send, Upload, Trash2, Building2 } from 'lucide-react';
import { motion } from 'motion/react';

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
}

interface FeedComment {
  id: string;
  feedPostId: string;
  userId: string;
  userName: string;
  userPhotoUrl?: string;
  comment: string;
  createdAt: any;
}

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

  useEffect(() => {
    if (auth.currentUser) {
      getDoc(doc(db, 'users', auth.currentUser.uid)).then(async (userDoc) => {
        const userData = userDoc.data();
        setUserRole(userData?.role || null);
        if (userData?.agencyId) {
          const agencyDoc = await getDoc(doc(db, 'agencies', userData.agencyId));
          setAgencyInfo(agencyDoc.data());
        }
      });
    }
    const q = query(collection(db, 'feedPosts'), orderBy('createdAt', 'desc'), limit(postLimit));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FeedPost));
      
      setHasMorePosts(snapshot.docs.length === postLimit);

      // Pré-carregamento de imagens para evitar "pulos" na tela
      const imageUrls = postsData.map(p => p.imageUrl).filter(Boolean) as string[];
      const profileUrls = postsData.map(p => p.creatorPhotoUrl).filter(Boolean) as string[];
      const allUrlsToPreload = [...new Set([...imageUrls, ...profileUrls])];
      
      await Promise.all(allUrlsToPreload.map(url => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = resolve; // Resolve mesmo com erro para não travar
          img.src = url;
        });
      }));

      setPosts(postsData);
      setIsLoadingPosts(false);
    }, (error) => {
      console.error('Firestore Error (feedPosts):', error);
      setIsLoadingPosts(false);
    });
    return unsubscribe;
  }, [postLimit]);

  useEffect(() => {
    const q = query(collection(db, 'feedComments'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const allComments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FeedComment));
      
      // Pré-carregamento das fotos de perfil dos comentários
      const commentProfileUrls = allComments.map(c => c.userPhotoUrl).filter(Boolean) as string[];
      const uniqueUrls = [...new Set(commentProfileUrls)];
      
      await Promise.all(uniqueUrls.map(url => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = resolve;
          img.src = url;
        });
      }));

      const commentsByPost: Record<string, FeedComment[]> = {};
      allComments.forEach(comment => {
        if (!commentsByPost[comment.feedPostId]) {
          commentsByPost[comment.feedPostId] = [];
        }
        commentsByPost[comment.feedPostId].push(comment);
      });
      setComments(commentsByPost);
      setIsLoadingComments(false);
    }, (error) => {
      console.error('Firestore Error (feedComments):', error);
      setIsLoadingComments(false);
    });
    return unsubscribe;
  }, []);

  const getUserProfile = async (uid: string) => {
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
    return { name, photo };
  };

  const handleAddComment = async (postId: string) => {
    if (!newComment[postId] || !auth.currentUser) return;
    
    const { name: userName, photo: userPhotoUrl } = await getUserProfile(auth.currentUser.uid);

    await addDoc(collection(db, 'feedComments'), {
      feedPostId: postId,
      userId: auth.currentUser.uid,
      userName,
      userPhotoUrl,
      comment: newComment[postId],
      createdAt: serverTimestamp()
    });
    setNewComment(prev => ({ ...prev, [postId]: '' }));
  };

  const handleDeletePost = async (post: FeedPost) => {
    try {
      if (post.imagePath) {
        const storage = getStorage();
        const storageRef = ref(storage, post.imagePath);
        await deleteObject(storageRef);
      }
      await deleteDoc(doc(db, 'feedPosts', post.id));
      setPostToDelete(null);
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Erro ao excluir postagem.");
    }
  };

  const handleDeleteComment = async (comment: FeedComment) => {
    try {
      await deleteDoc(doc(db, 'feedComments', comment.id));
      setCommentToDelete(null);
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Erro ao excluir comentário.");
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const title = (form.elements.namedItem('title') as HTMLInputElement).value;
    const content = (form.elements.namedItem('content') as HTMLTextAreaElement).value;
    const type = (form.elements.namedItem('type') as HTMLSelectElement).value;

    if (!auth.currentUser) return;

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
        agencyId: 'agency_id_placeholder', // Should be dynamic
        title,
        content,
        type,
        imageUrl: imageUrl || null,
        imagePath: imagePath || null,
        createdAt: serverTimestamp(),
        creatorId: auth.currentUser.uid,
        creatorName,
        creatorPhotoUrl
      });
      form.reset();
      setImageFile(null);
    } catch (error) {
      console.error("Error creating post:", error);
      toast("Erro ao publicar postagem: " + (error instanceof Error ? error.message : String(error)));
    }
  };

  const isLoading = (isLoadingPosts && posts.length === 0) || isLoadingComments;

  if (isLoading) {
    return (
      <div className="space-y-8 max-w-3xl mx-auto p-4">
        {/* Skeleton for Create Post */}
        {(userRole === 'AGENCY' || userRole === 'ADMIN') && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-lg space-y-4 animate-pulse">
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-md w-1/3 mb-4"></div>
            <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
            <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
            <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
            <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
          </div>
        )}

        {/* Skeletons for Posts */}
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
              >
                Cancelar
              </button>
              <button 
                onClick={() => postToDelete ? handleDeletePost(postToDelete) : commentToDelete ? handleDeleteComment(commentToDelete) : null}
                className="flex-1 px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {(userRole === 'AGENCY' || userRole === 'ADMIN') && (
        <form onSubmit={handleCreatePost} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-lg space-y-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Criar Nova Postagem</h3>
          <input name="title" placeholder="Título" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white" required />
          <textarea name="content" placeholder="Conteúdo" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 h-32 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white" required />
          <select name="type" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white" required>
            <option value="TRAINING">Treinamento</option>
            <option value="ANNOUNCEMENT">Comunicado</option>
            <option value="URGENT">Urgente</option>
            <option value="RECOGNITION">Reconhecimento</option>
          </select>
          <div className="flex gap-2 items-center">
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
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
          <button type="submit" className="w-full bg-blue-600 text-white font-semibold px-4 py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">Publicar</button>
        </form>
      )}

      {posts.map(post => (
        <motion.div key={post.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
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
                  {post.type}
                </span>
                {(userRole === 'AGENCY' || userRole === 'ADMIN') && (
                  <button onClick={() => setPostToDelete(post)} className="text-slate-400 dark:text-slate-500 hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>
          <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">{post.content}</p>
          {post.imageUrl && (
            <img src={post.imageUrl} alt="Post" className="w-full h-auto rounded-2xl mb-4 border border-slate-100 dark:border-slate-800 shadow-sm" referrerPolicy="no-referrer" />
          )}
          
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-4">
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-slate-800 dark:text-slate-200"><MessageSquare size={16} /> Comentários</h4>
            <div className="space-y-3 mb-4">
              {comments[post.id]?.map(comment => (
                <div key={comment.id} className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl text-sm space-y-1 relative group/comment border border-transparent dark:border-slate-800/50">
                  <div className="flex items-center justify-between gap-2">
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
                      </span>
                    </div>
                    {(auth.currentUser?.uid === comment.userId || userRole === 'ADMIN' || userRole === 'AGENCY') && (
                      <button
                        onClick={() => setCommentToDelete(comment)}
                        className="text-slate-400 dark:text-slate-500 hover:text-red-500 transition-colors opacity-0 group-hover/comment:opacity-100 p-1"
                        title="Excluir comentário"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">{comment.comment}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={newComment[post.id] || ''}
                onChange={e => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                placeholder="Escreva um comentário..."
                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
              />
              <button onClick={() => handleAddComment(post.id)} className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"><Send size={18} /></button>
            </div>
          </div>
        </motion.div>
      ))}

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
