import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { langFromPath, type Lang } from "@/lib/i18n-url";
import FastamorMain from "@/pages/FastamorMain";
import NotFound from "@/pages/not-found";
import { lazy, Suspense } from "react";

const BlogView = lazy(() => import("@/views/BlogView"));
const ArticleView = lazy(() => import("@/views/ArticleView"));
const DestinationView = lazy(() => import("@/views/DestinationView"));

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFFDF7]">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"/>
    </div>
  );
}

function LangRoutes({ lang, base }: { lang: Lang; base: string }) {
  return (
    <Switch>
      <Route path={`${base}/blog`}>
        <Suspense fallback={<LoadingSpinner />}>
          <BlogView lang={lang} />
        </Suspense>
      </Route>
      <Route path={`${base}/article/:slug`}>
        {(params) => (
          <Suspense fallback={<LoadingSpinner />}>
            <ArticleView key={`${lang}-${params.slug}`} slug={params.slug} lang={lang} />
          </Suspense>
        )}
      </Route>
      <Route path={`${base}/destination/:slug`}>
        {(params) => (
          <Suspense fallback={<LoadingSpinner />}>
            <DestinationView key={`${lang}-${params.slug}`} slug={params.slug} lang={lang} />
          </Suspense>
        )}
      </Route>
      <Route path={base || '/'}>
        <FastamorMain initialLang={lang} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function Router() {
  const [location] = useLocation();
  const lang = langFromPath(location);
  return <LangRoutes lang={lang} base={lang === 'en' ? '' : `/${lang}`} />;
}

function App() {
  return (
    <WouterRouter>
      <Router />
    </WouterRouter>
  );
}

export default App;
