const fs = require('fs');

// Fix admin-shell
let shell = fs.readFileSync('components/admin-shell.tsx', 'utf8');
if (!shell.includes('title?: string')) {
  shell = shell.replace('export function AdminShell({ children }: { children: React.ReactNode }) {', 'export function AdminShell({ children, title, description }: { children: React.ReactNode; title?: string; description?: string }) {');
  fs.writeFileSync('components/admin-shell.tsx', shell);
}

// Fix tracker.tsx
let tracker = fs.readFileSync('features/analytics/tracker.tsx', 'utf8');
tracker = tracker.replace('is_returning', 'isReturning');
fs.writeFileSync('features/analytics/tracker.tsx', tracker);

// Fix route.ts supabase null checks
const serverRoutes = [
  'app/api/admin/ai-settings/route.ts',
  'app/api/admin/index-portfolio/route.ts',
  'app/api/analytics/route.ts',
  'app/api/recruiter-settings/route.ts',
  'app/api/chat/route.ts'
];
serverRoutes.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/const supabase = await createSupabaseServerClient\(\);/g, 'const supabase = await createSupabaseServerClient();\n    if (!supabase) throw new Error(\"Supabase client not initialized\");');
    
    // Fix streamText await and model issues in chat route
    if (f.includes('chat/route.ts')) {
      content = content.replace(/google\.textEmbeddingModel/g, 'google.textEmbeddingModel || (google as any).embedding'); // fallback
      content = content.replace(/const result = streamText/g, 'const result = await streamText');
    }
    
    // Fix textEmbeddingModel issue in index-portfolio route
    if (f.includes('index-portfolio/route.ts')) {
      content = content.replace(/google\.textEmbeddingModel/g, 'google.textEmbeddingModel || (google as any).embedding');
    }
    fs.writeFileSync(f, content);
  }
});
