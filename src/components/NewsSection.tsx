import React, { useEffect, useState } from 'react';
import { Newspaper, Clock, ExternalLink } from "lucide-react";

interface Article {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  source: { name: string };
  publishedAt: string;
}

const NewsSection: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const API_KEY = '7e328b21e3dc4c87a05a4073be5de111';

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const query = encodeURIComponent('المغرب OR الرباط OR طنجة');
        const response = await fetch(
          `https://newsapi.org/v2/everything?q=${query}&language=ar&sortBy=publishedAt&pageSize=6&apiKey=${API_KEY}`
        );
        const data = await response.json();
        if (data.status === 'ok') setArticles(data.articles);
      } catch (error) {
        console.error("NewsAPI Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  if (loading) return null; // لا نريد إفساد تجربة المستخدم أثناء التحميل

  return (
    <section className="my-12 animate-in fade-in duration-700">
      <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-red-600 dark:border-red-500">
        <Newspaper className="w-5 h-5 text-red-600" />
        <h2 className="font-black text-lg tracking-wide dark:text-white">رادار مغرب 24 (أخبار حية)</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article, index) => (
          article.urlToImage && (
            <div key={index} className="group bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl overflow-hidden hover:shadow-lg transition-all">
              <div className="aspect-video overflow-hidden">
                <img src={article.urlToImage} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-black text-red-600 uppercase">{article.source.name}</span>
                  <span className="text-[10px] text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(article.publishedAt).toLocaleDateString('ar-MA')}
                  </span>
                </div>
                <h3 className="font-bold text-sm leading-snug text-gray-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 mb-4">
                  {article.title}
                </h3>
                <a href={article.url} target="_blank" rel="noopener noreferrer" 
                   className="flex items-center justify-center gap-2 w-full py-2 bg-gray-50 dark:bg-zinc-800 text-xs font-bold rounded-lg hover:bg-emerald-700 hover:text-white transition-colors">
                  تفاصيل الخبر <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )
        ))}
      </div>
    </section>
  );
};

export default NewsSection;
