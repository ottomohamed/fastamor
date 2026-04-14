import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Edit3, Trash2, Eye, EyeOff, Newspaper, X, Check, Loader2 } from 'lucide-react';
import { ArticleModal } from './ArticleModal';

interface NewsroomIntegratedProps {
  onToast: (msg: string) => void;
  siteLang: string;
}

export function NewsroomIntegrated({ onToast, siteLang }: NewsroomIntegratedProps) {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingArticle, setEditingArticle] = useState<any>(null);
  const [showNewArticle, setShowNewArticle] = useState(false);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setArticles(data || []);
    } catch (err) {
      console.error('Error loading articles:', err);
      onToast(' ??? ?? ????? ????????');
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('?? ??? ????? ?? ??? ??? ???????')) return;
    
    try {
      const { error } = await supabase.from('articles').delete().eq('id', id);
      if (error) throw error;
      onToast(' ?? ??? ??????');
      loadArticles();
    } catch (err) {
      onToast(' ??? ?? ?????');
    }
  };

  const handlePublish = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    
    try {
      const { error } = await supabase
        .from('articles')
        .update({ 
          status: newStatus, 
          published_at: newStatus === 'published' ? new Date().toISOString() : null 
        })
        .eq('id', id);
      
      if (error) throw error;
      onToast(newStatus === 'published' ? ' ?? ??? ??????' : ' ?? ??? ??????');
      loadArticles();
    } catch (err) {
      onToast(' ??? ?? ????? ??????');
    }
  };

  const getTitle = (article: any) => {
    return article.title?.[siteLang] || article.title?.en || '???? ?????';
  };

  const getExcerpt = (article: any) => {
    return article.excerpt?.[siteLang] || article.excerpt?.en || '';
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"/>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif font-black text-2xl text-foreground">????? ???????</h2>
        <button 
          onClick={() => setShowNewArticle(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors"
        >
          <Plus size={16}/> ???? ????
        </button>
      </div>

      {articles.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-12 text-center text-muted">
          <Newspaper size={48} className="mx-auto mb-3 opacity-30"/>
          <p>?? ???? ?????? ???</p>
          <button 
            onClick={() => setShowNewArticle(true)} 
            className="mt-3 text-primary font-bold hover:underline"
          >
             ???? ??? ????
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map(article => (
            <div 
              key={article.id} 
              className={'bg-surface border rounded-2xl p-4 transition-all border-border' + (article.status !== 'published' ? ' opacity-80' : '')}
            >
              <div className="flex gap-4">
                {article.featured_image && (
                  <img 
                    src={article.featured_image} 
                    className="w-24 h-24 object-cover rounded-xl" 
                    alt=""
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={'text-xs px-2 py-0.5 rounded-full ' + (article.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700')}>
                      {article.status === 'published' ? '?????' : '?????'}
                    </span>
                    <span className="text-xs text-muted">{article.author_slug}</span>
                    <span className="text-xs text-muted">
                      {new Date(article.created_at).toLocaleDateString('ar-EG')}
                    </span>
                    {article.views > 0 && (
                      <span className="text-xs text-muted"> {article.views} ??????</span>
                    )}
                  </div>
                  <h3 className="font-bold text-foreground">{getTitle(article)}</h3>
                  {getExcerpt(article) && (
                    <p className="text-sm text-muted line-clamp-2 mt-1">{getExcerpt(article)}</p>
                  )}
                  <div className="flex gap-3 mt-3">
                    <button 
                      onClick={() => setEditingArticle(article)} 
                      className="text-primary text-sm font-medium flex items-center gap-1 hover:underline"
                    >
                      <Edit3 size={14}/> ?????
                    </button>
                    <button 
                      onClick={() => handlePublish(article.id, article.status)} 
                      className="text-secondary text-sm font-medium flex items-center gap-1 hover:underline"
                    >
                      {article.status === 'published' ? <EyeOff size={14}/> : <Eye size={14}/>}
                      {article.status === 'published' ? '?????' : '???'}
                    </button>
                    <button 
                      onClick={() => handleDelete(article.id)} 
                      className="text-red-500 text-sm font-medium flex items-center gap-1 hover:underline"
                    >
                      <Trash2 size={14}/> ???
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(editingArticle || showNewArticle) && (
        <ArticleModal
          article={editingArticle}
          onClose={() => { 
            setEditingArticle(null); 
            setShowNewArticle(false); 
          }}
          onSave={() => { 
            loadArticles(); 
            onToast(' ?? ??? ??????'); 
          }}
          siteLang={siteLang}
        />
      )}
    </div>
  );
}
