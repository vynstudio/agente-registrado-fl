import { useParams, Link } from "react-router-dom";
import { useLang, LOCALES, BRAND } from "@/i18n/LanguageContext";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Clock } from "lucide-react";
import DOMPurify from "dompurify";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import BlockRenderer from "@/components/blog/BlockRenderer";
import { ContentBlock } from "@/types/blog";
import { useState, useEffect, useRef } from "react";
// Posts are written by the business itself: its logo and name stand in as the author, and posts
// without their own image show the Miami skyline.
import { BLOG_AUTHOR_IMAGE, BLOG_FALLBACK_IMAGE } from "@/lib/blog";

// Estimate read time based on content blocks or HTML
const estimateReadTime = (blocks: ContentBlock[], htmlContent?: string): number => {
  const wordsPerMinute = 200;
  let totalWords = 0;
  
  if (blocks.length > 0) {
    blocks.forEach(block => {
      if (block.type === 'paragraph' || block.type === 'heading' || block.type === 'quote') {
        totalWords += (block.data.text || '').split(/\s+/).length;
      }
    });
  } else if (htmlContent) {
    // Strip HTML tags and count words
    const textContent = htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    totalWords = textContent.split(/\s+/).length;
  }
  
  return Math.max(1, Math.ceil(totalWords / wordsPerMinute));
};

// Extract headings from content blocks for TOC
const extractHeadingsFromBlocks = (blocks: ContentBlock[]): { id: string; text: string; level: number }[] => {
  return blocks
    .filter(block => block.type === 'heading')
    .map(block => ({
      id: block.id,
      text: (block.data as { text: string; level: number }).text,
      level: (block.data as { text: string; level: number }).level
    }));
};

// Extract headings from HTML content for TOC
const extractHeadingsFromHtml = (html: string): { id: string; text: string; level: number }[] => {
  if (!html) return [];
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const headingElements = doc.querySelectorAll('h1, h2, h3');
  
  return Array.from(headingElements).map((el, index) => {
    const level = parseInt(el.tagName.charAt(1));
    const text = el.textContent || '';
    // Create a URL-friendly ID from the heading text
    const id = `heading-${index}-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;
    return { id, text, level };
  });
};

// Add IDs to headings in HTML content for scroll-to functionality
const addIdsToHtmlHeadings = (html: string): string => {
  if (!html) return '';
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const headingElements = doc.querySelectorAll('h1, h2, h3');
  
  headingElements.forEach((el, index) => {
    const text = el.textContent || '';
    const id = `heading-${index}-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;
    el.setAttribute('id', id);
  });
  
  return doc.body.innerHTML;
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, lang } = useLang();
  const [activeHeading, setActiveHeading] = useState<string>('');
  const [readingProgress, setReadingProgress] = useState(0);
  const articleRef = useRef<HTMLElement>(null);

  const { data: post, isLoading, error } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select(`
          *,
          blog_categories (
            id,
            name,
            slug
          )
        `)
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });
  usePageTitle(post?.title ?? "Florida business formation guides");

  const contentBlocks = (post?.content_blocks as unknown as ContentBlock[]) || [];
  // Process HTML content to add IDs to headings for scroll-to functionality
  const processedHtmlContent = addIdsToHtmlHeadings(post?.content || '');
  // Use headings from blocks if available, otherwise extract from HTML
  const headings = contentBlocks.length > 0 
    ? extractHeadingsFromBlocks(contentBlocks) 
    : extractHeadingsFromHtml(post?.content || '');
  const readTime = estimateReadTime(contentBlocks, post?.content);
  const author = { name: BRAND[lang], image: BLOG_AUTHOR_IMAGE };

  // Track reading progress - using requestAnimationFrame to prevent forced reflow
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      
      requestAnimationFrame(() => {
        if (!articleRef.current) {
          ticking = false;
          return;
        }
        
        const article = articleRef.current;
        const articleTop = article.offsetTop;
        const articleHeight = article.offsetHeight;
        const windowHeight = window.innerHeight;
        const scrollY = window.scrollY;
        
        const start = articleTop - windowHeight / 2;
        const end = articleTop + articleHeight - windowHeight / 2;
        const progress = Math.min(Math.max((scrollY - start) / (end - start), 0), 1);
        
        setReadingProgress(progress * 100);
        ticking = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [post]);

  // Track active heading on scroll - using requestAnimationFrame to prevent forced reflow
  useEffect(() => {
    if (headings.length === 0) return;
    
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      
      requestAnimationFrame(() => {
        // Use a position near the top of viewport (accounting for sticky header)
        const scrollPosition = window.scrollY + 150;
        
        let currentHeading = headings[0]?.id || '';
        
        for (const { id } of headings) {
          const element = document.getElementById(id);
          if (element) {
            // Highlight heading when it scrolls past the top threshold
            if (element.offsetTop <= scrollPosition) {
              currentHeading = id;
            }
          }
        }
        
        setActiveHeading(currentHeading);
        ticking = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings, post]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      // Scroll with offset for sticky header
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(LOCALES[lang], {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-dvh bg-background">
        <Header />
        <main id="main-content" tabIndex={-1} className="container mx-auto px-4 pt-32 pb-8">
          <div className="max-w-4xl mx-auto animate-pulse">
            <div className="h-6 bg-muted rounded w-20 mb-8" />
            <div className="h-12 bg-muted rounded w-full mb-4" />
            <div className="h-6 bg-muted rounded w-1/3 mb-8" />
            <div className="h-80 bg-muted rounded-2xl w-full mb-8" />
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-3/4" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-dvh bg-background">
        <Header />
        <main id="main-content" tabIndex={-1} className="container mx-auto px-4 pt-32 pb-16 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">{t("Article Not Found")}</h1>
          <p className="text-muted-foreground mb-8">
            {t("The article you're looking for doesn't exist or has been removed.")}
          </p>
          <Link to="/blog">
            <Button variant="lime">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("Back to blog")}
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background">
      <Header />
      <main id="main-content" tabIndex={-1} className="container mx-auto px-4 pt-32 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-between"
        >
          {/* Main Content Column */}
          <div className="max-w-[760px]">
          {/* Back Button */}
          <Link to="/blog" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("Back to blog")}
          </Link>

          {/* Article Header */}
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
              {post.title}
            </h1>
            
            {/* Author & Meta Info */}
            <div className="flex items-center gap-2 flex-wrap text-[13px] font-light">
              <div className="flex items-center gap-3">
                <img 
                  src={author.image} 
                  alt={author.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="text-foreground">{author.name}</span>
              </div>
              <span className="text-muted-foreground">•</span>
              {post.blog_categories && (
                <>
                  <span className="text-accent">{post.blog_categories.name}</span>
                  <span className="text-muted-foreground">•</span>
                </>
              )}
              {post.published_at && (
                <>
                  <span className="text-muted-foreground">{formatDate(post.published_at)}</span>
                  <span className="text-muted-foreground">•</span>
                </>
              )}
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                <span>{readTime} {t("min read")}</span>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          <div className="mb-12 rounded-2xl overflow-hidden">
            <img
              src={post.featured_image_url || BLOG_FALLBACK_IMAGE}
              alt={post.title}
              className="w-full h-auto object-cover max-h-[480px]"
            />
          </div>

          {/* Content */}
          <article 
            ref={articleRef}
            className="w-full"
          >
            {contentBlocks.length > 0 ? (
              <BlockRenderer blocks={contentBlocks} />
            ) : processedHtmlContent ? (
              <div 
                className="prose prose-lg max-w-none prose-headings:font-display prose-headings:text-foreground prose-p:text-muted-foreground prose-blockquote:border-l-accent prose-blockquote:text-muted-foreground prose-img:rounded-lg"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(processedHtmlContent) }}
              />
            ) : null}
          </article>
        </div>

        {/* Sticky Table of Contents */}
        {headings.length > 0 && (
          <aside className="hidden xl:block w-56 flex-shrink-0 pt-[52px]">
            <nav className="sticky top-24 flex gap-4">
              {/* Vertical Progress bar */}
              <div className="w-0.5 bg-muted rounded-full overflow-hidden self-stretch min-h-[200px]">
                <motion.div 
                  className="w-full bg-accent rounded-full"
                  style={{ height: `${readingProgress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              
              <div className="flex-1">
                {/* TOC heading */}
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
                  {t("On this page")}
                </p>
                
                {/* TOC links */}
                <ul className="space-y-2">
                  {headings.map(({ id, text, level }) => (
                    <li key={id}>
                      <button
                        onClick={() => scrollToHeading(id)}
                        className={`text-left text-sm transition-all duration-200 block w-full leading-snug ${
                          level === 3 ? 'pl-3' : ''
                        } ${
                          activeHeading === id 
                            ? 'text-accent font-medium' 
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {text}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>
          </aside>
        )}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;
