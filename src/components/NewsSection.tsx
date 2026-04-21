import React, { useEffect, useState } from 'react';
import { Plane, Clock, ExternalLink } from "lucide-react";

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
        // فلتر السفر والطيران للمغرب
        const query = encodeURIComponent('flights Morocco OR ferries Morocco OR سياحة المغرب');
        const response = await fetch(
          `https://newsapi.org/v2/everything?q=${query}&language=ar&sortBy=publishedAt&pageSize=3&apiKey=${API_KEY}`
        );
        const data = await response.json();
        if (data.status === 'ok') setArticles(data.articles);
      } catch (error) {
        console.error("Fastamor Radar Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  if (loading || articles.length === 0) return null;

  return (
    <section className="my-8 bg-emerald-50 dark:bg-zinc-900/50 p-6 rounded-2xl border border-emerald-100 dark:border-zinc-800">
      <div className="flex items-center gap-3 mb-6">
        <Plane className="w-5 h-5 text-emerald-700" />
        <h2 className="font-black text-lg text-emerald-900 dark:text-emerald-400">آخر تحديثات السفر والرحلات</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {articles.map((article, i) => (
          <a key={i} href={article.url} target="_blank" rel="noreferrer" className="group">
            <h3 className="text-sm font-bold text-gray-800 dark:text-zinc-200 group-hover:text-emerald-600 line-clamp-2 mb-2">{article.title}</h3>
            <span className="text-[10px] text-gray-500">{article.source.name}</span>
          </a>
        ))}
      </div>
    </section>
  );
};
export default NewsSection;
