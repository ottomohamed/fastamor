import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import FastamorMain from "@/pages/FastamorMain";
import NotFound from "@/pages/not-found";
import { lazy, Suspense } from "react";

const BlogView = lazy(() => import("@/views/BlogView"));
const ArticleView = lazy(() => import("@/views/ArticleView"));
const DestinationView = lazy(() => import("@/views/DestinationView"));

const queryClient = new QueryClient();

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFFDF7]">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"/>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={FastamorMain} />
      <Route path="/blog">
        <Suspense fallback={<LoadingSpinner />}>
          <BlogView />
        </Suspense>
      </Route>
      <Route path="/article/:slug">
        {(params) => (
          <Suspense fallback={<LoadingSpinner />}>
            <ArticleView slug={params.slug} />
          </Suspense>
        )}
      </Route>
      <Route path="/destination/:slug">
        {(params) => (
          <Suspense fallback={<LoadingSpinner />}>
            <DestinationView slug={params.slug} />
          </Suspense>
        )}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
