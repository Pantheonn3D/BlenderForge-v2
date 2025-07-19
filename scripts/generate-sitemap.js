// scripts/generate-sitemap.js

import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const generateSitemap = async () => {
  console.log('Generating sitemap...');

  // 1. SETUP SUPABASE CLIENT
  // Make sure your .env file has these variables
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase URL or Key is missing. Check your .env file.');
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  // 2. DEFINE YOUR STATIC PAGES
  const staticPages = [
    { url: '', priority: '1.0', changefreq: 'daily' },
    { url: '/knowledge-base', priority: '0.9', changefreq: 'weekly' },
    { url: '/support', priority: '0.7', changefreq: 'monthly' },
    { url: '/supporters', priority: '0.7', changefreq: 'monthly' },
    { url: '/login', priority: '0.5', changefreq: 'yearly' },
    { url: '/signup', priority: '0.5', changefreq: 'yearly' },
  ];

  const baseUrl = 'https://blenderforge.com';
  const today = new Date().toISOString().split('T')[0];

 // 3. FETCH YOUR DYNAMIC PAGES (ARTICLES) FROM SUPABASE
  // IMPORTANT: We are changing 'updated_at' to 'created_at' based on the error.
  const { data: articles, error } = await supabase
    .from('articles') 
    .select('slug, created_at'); // <-- CHANGE IS HERE

  if (error) {
    console.error('Error fetching articles:', error);
    return;
  }

  // 4. GENERATE THE XML
  const sitemapXml = `
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages.map(page => `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('')}
  ${articles.map(article => `
  <url>
    <loc>${baseUrl}/guides/${article.slug}</loc>
    <lastmod>${article.created_at ? new Date(article.created_at).toISOString().split('T')[0] : today}</lastmod> <!-- CHANGE IS HERE -->
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
</urlset>`;

  // 5. WRITE THE FILE TO THE /public FOLDER
  fs.writeFileSync('public/sitemap.xml', sitemapXml);
  console.log('Sitemap generated successfully at public/sitemap.xml');
};

generateSitemap();