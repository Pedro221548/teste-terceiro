import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, auth } from '../firebase';
import { MessageSquare, Send, Upload, Trash2, Building2 } from 'lucide-react';
import { motion } from 'motion/react';

interface FeedPost {
  id: string;
  agencyId: string;
  title: string;
  content: string;
  imageUrl?: string;
  imagePath?: string; // Added to facilitate deletion
  type: 'TRAINING' | 'ANNOUNCEMENT' | 'URGENT' | 'RECOGNITION';
  createdAt: any;
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
  const [imageFile, setImageFile] = useState<File | null>(null);
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
    const q = query(collection(db, 'feedPosts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FeedPost));
      setPosts(postsData);
    }, (error) => {
      console.error('Firestore Error (feedPosts):', error);
      // handleFirestoreError(error, OperationType.GET, 'feedPosts');
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'feedComments'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allComments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FeedComment));
      const commentsByPost: Record<string, FeedComment[]> = {};
      allComments.forEach(comment => {
        if (!commentsByPost[comment.feedPostId]) {
          commentsByPost[comment.feedPostId] = [];
        }
        commentsByPost[comment.feedPostId].push(comment);
      });
      setComments(commentsByPost);
    }, (error) => {
      console.error('Firestore Error (feedComments):', error);
    });
    return unsubscribe;
  }, []);

  const handleAddComment = async (postId: string) => {
    if (!newComment[postId] || !auth.currentUser) return;
    
    const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
    const userData = userDoc.data();
    const userName = userData?.fullName || 'Usuário';
    const userPhotoUrl = userData?.photoUrl || null;

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
      alert("Erro ao excluir postagem.");
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
        const storage = getStorage();
        imagePath = `feed/${Date.now()}_${imageFile.name}`;
        const storageRef = ref(storage, imagePath);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }

      await addDoc(collection(db, 'feedPosts'), {
        agencyId: 'agency_id_placeholder', // Should be dynamic
        title,
        content,
        type,
        imageUrl: imageUrl || null,
        imagePath: imagePath || null,
        createdAt: serverTimestamp()
      });
      form.reset();
      setImageFile(null);
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Erro ao publicar postagem: " + (error instanceof Error ? error.message : String(error)));
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto p-4">
      {/* Custom Confirmation Modal */}
      {postToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-3xl shadow-xl max-w-sm w-full space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Excluir postagem?</h3>
            <p className="text-slate-600">Esta ação não pode ser desfeita. Tem certeza que deseja continuar?</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setPostToDelete(null)}
                className="flex-1 px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={() => handleDeletePost(postToDelete)}
                className="flex-1 px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {(userRole === 'AGENCY' || userRole === 'ADMIN') && (
        <form onSubmit={handleCreatePost} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-lg space-y-4">
          <h3 className="text-xl font-bold text-slate-900">Criar Nova Postagem</h3>
          <input name="title" placeholder="Título" className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none" required />
          <textarea name="content" placeholder="Conteúdo" className="w-full border border-slate-200 rounded-xl p-3 h-32 focus:ring-2 focus:ring-blue-500 outline-none" required />
          <select name="type" className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none" required>
            <option value="TRAINING">Treinamento</option>
            <option value="ANNOUNCEMENT">Comunicado</option>
            <option value="URGENT">Urgente</option>
            <option value="RECOGNITION">Reconhecimento</option>
          </select>
          <div className="flex gap-2 items-center">
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 border border-slate-200 rounded-xl p-3 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
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
          <button type="submit" className="w-full bg-blue-600 text-white font-semibold px-4 py-3 rounded-xl hover:bg-blue-700 transition-colors">Publicar</button>
        </form>
      )}

      {posts.map(post => (
        <motion.div key={post.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200 overflow-hidden">
                {agencyInfo?.logoUrl ? (
                  <img src={agencyInfo.logoUrl} alt={agencyInfo.name} className="w-full h-full object-cover" />
                ) : (
                  <Building2 size={24} />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-900">{agencyInfo?.name || 'Agência Parceira'}</span>
                <span className="text-xs text-slate-500">
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
              <h3 className="text-lg font-bold text-slate-900">{post.title}</h3>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  post.type === 'URGENT' ? 'bg-red-50 text-red-700' :
                  post.type === 'RECOGNITION' ? 'bg-green-50 text-green-700' :
                  'bg-blue-50 text-blue-700'
                }`}>
                  {post.type}
                </span>
                {(userRole === 'AGENCY' || userRole === 'ADMIN') && (
                  <button onClick={() => setPostToDelete(post)} className="text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>
          <p className="text-slate-700 mb-4 leading-relaxed">{post.content}</p>
          {post.imageUrl && (
            <img src={post.imageUrl} alt="Post" className="w-full h-auto rounded-2xl mb-4 border border-slate-100" referrerPolicy="no-referrer" />
          )}
          
          <div className="border-t border-slate-100 pt-4 mt-4">
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-slate-800"><MessageSquare size={16} /> Comentários</h4>
            <div className="space-y-3 mb-4">
              {comments[post.id]?.map(comment => (
                <div key={comment.id} className="bg-slate-50 p-3 rounded-xl text-sm space-y-1">
                  <div className="flex items-center gap-2">
                    {comment.userPhotoUrl ? (
                      <img src={comment.userPhotoUrl} alt={comment.userName} className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] text-slate-500 font-bold">
                        {comment.userName.charAt(0)}
                      </div>
                    )}
                    <span className="font-bold text-blue-700">{comment.userName}</span>
                    <span className="text-[10px] text-slate-400">
                      {comment.createdAt?.toDate ? comment.createdAt.toDate().toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : ''}
                    </span>
                  </div>
                  <p className="text-slate-700">{comment.comment}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={newComment[post.id] || ''}
                onChange={e => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                placeholder="Escreva um comentário..."
                className="flex-1 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button onClick={() => handleAddComment(post.id)} className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-colors"><Send size={18} /></button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
