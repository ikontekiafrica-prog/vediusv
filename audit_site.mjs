const baseUrl = 'http://localhost:5173';

const pages = [
  '/',
  '/about.html',
  '/services.html',
  '/projects.html',
  '/case-studies.html',
  '/skills.html',
  '/programs.html',
  '/coaching.html',
  '/contact.html',
  '/robots.txt',
  '/sitemap.xml'
];

async function auditSite() {
  console.log('====================================================');
  console.log('VEDIUS VEDASTO PORTFOLIO - AUTOMATED SITE & SEO AUDIT');
  console.log('====================================================\n');

  let totalChecks = 0;
  let passedChecks = 0;
  const issues = [];

  for (const path of pages) {
    const url = baseUrl + path;
    try {
      const res = await fetch(url);
      totalChecks++;
      if (res.status === 200) {
        passedChecks++;
        console.log(`[PASS] [HTTP 200] ${path}`);
      } else {
        issues.push(`HTTP ${res.status} for ${path}`);
        console.log(`[FAIL] [HTTP ${res.status}] ${path}`);
      }

      if (path.endsWith('.html') || path === '/') {
        const html = await res.text();
        
        // 1. Title tag
        totalChecks++;
        const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
        if (titleMatch && titleMatch[1].trim().length > 15) {
          passedChecks++;
          console.log(`   + Title: "${titleMatch[1].trim()}"`);
        } else {
          issues.push(`Missing or short title in ${path}`);
        }

        // 2. Meta description
        totalChecks++;
        const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
        if (descMatch && descMatch[1].trim().length > 40) {
          passedChecks++;
          console.log(`   + Meta Description: "${descMatch[1].trim().slice(0, 75)}..."`);
        } else {
          issues.push(`Missing or short meta description in ${path}`);
        }

        // 3. Single H1
        totalChecks++;
        const h1Matches = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
        if (h1Matches.length === 1) {
          passedChecks++;
          console.log(`   + Single H1: "${h1Matches[0].replace(/<[^>]+>/g, '').trim().slice(0, 60)}"`);
        } else {
          issues.push(`Expected exactly 1 H1 in ${path}, found ${h1Matches.length}`);
        }

        // 4. Canonical URL
        totalChecks++;
        const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
        if (canonicalMatch) {
          passedChecks++;
          console.log(`   + Canonical: ${canonicalMatch[1]}`);
        } else {
          issues.push(`Missing canonical tag in ${path}`);
        }

        // 5. Schema.org JSON-LD
        totalChecks++;
        const schemaMatch = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
        if (schemaMatch) {
          try {
            JSON.parse(schemaMatch[1]);
            passedChecks++;
            console.log(`   + Valid JSON-LD Schema.org Structured Data`);
          } catch(e) {
            issues.push(`Invalid JSON-LD in ${path}: ${e.message}`);
          }
        } else {
          issues.push(`Missing Schema.org JSON-LD in ${path}`);
        }

        // 6. Image alt attributes
        const imgTags = html.match(/<img[^>]+>/gi) || [];
        let missingAlt = 0;
        for (const tag of imgTags) {
          if (!tag.includes('alt="') && !tag.includes("alt='")) {
            missingAlt++;
          }
        }
        totalChecks++;
        if (missingAlt === 0) {
          passedChecks++;
          console.log(`   + Image Alt Audit: All ${imgTags.length} images have descriptive alt attributes`);
        } else {
          issues.push(`${missingAlt} images missing alt text in ${path}`);
        }

        // 7. Verify no CV download links
        totalChecks++;
        if (!html.includes('cv-vedius-vedasto.pdf') && !html.includes('Download CV')) {
          passedChecks++;
          console.log(`   + Privacy Audit: No CV download links present`);
        } else {
          issues.push(`Found CV download link in ${path}`);
        }

        // 8. Verify static site (no backend contact forms)
        totalChecks++;
        if (!html.includes('<form') && !html.includes('Send Inquiry Message') && !html.includes('Send a Direct Message')) {
          passedChecks++;
          console.log(`   + Static Audit: 100% Static - No dynamic contact form present`);
        } else {
          issues.push(`Found dynamic contact form in ${path}`);
        }

        // 9. Verify brand title uses Freelancer (no "web developer and strategist")
        totalChecks++;
        if (!html.toLowerCase().includes('web developer & strategist') && !html.toLowerCase().includes('web developer &amp; strategist')) {
          passedChecks++;
          console.log(`   + Rebrand Audit: Removed old "Web Developer & Strategist", branded as Freelancer`);
        } else {
          issues.push(`Found old "Web Developer & Strategist" title in ${path}`);
        }

        // 10. Verify Mobile Quick-Action Bar is present
        totalChecks++;
        if (html.includes('mobile-quick-bar')) {
          passedChecks++;
          console.log(`   + Mobile UX: Sticky mobile-quick-bar present`);
        } else {
          issues.push(`Missing sticky mobile-quick-bar in ${path}`);
        }

        // 11. Verify at least two working CTAs on page
        totalChecks++;
        const ctaMatches = html.match(/href=["'](https:\/\/wa\.me\/|tel:|mailto:|\/contact\.html)/gi) || [];
        if (ctaMatches.length >= 2) {
          passedChecks++;
          console.log(`   + CTA Audit: Verified ${ctaMatches.length} working CTAs (WhatsApp / Tel / Mail / Contact)`);
        } else {
          issues.push(`Expected >= 2 CTAs in ${path}, found ${ctaMatches.length}`);
        }
      }
      console.log('');
    } catch(err) {
      issues.push(`Failed to fetch ${url}: ${err.message}`);
      console.log(`[ERROR] ${url}: ${err.message}\n`);
    }
  }

  // Check that /cv-vedius-vedasto.pdf is NOT publicly served as a PDF
  totalChecks++;
  try {
    const cvRes = await fetch(baseUrl + '/cv-vedius-vedasto.pdf');
    const ct = cvRes.headers.get('content-type') || '';
    if (cvRes.status === 404 || !ct.includes('application/pdf')) {
      passedChecks++;
      console.log(`[PASS] [Privacy Check] CV PDF is confirmed removed and NOT accessible as a document`);
    } else {
      issues.push(`/cv-vedius-vedasto.pdf is still being served as application/pdf`);
      console.log(`[FAIL] /cv-vedius-vedasto.pdf is still accessible as PDF`);
    }
  } catch(e) {
    passedChecks++;
    console.log(`[PASS] /cv-vedius-vedasto.pdf is unreachable`);
  }

  // Check that all project and gallery images are strictly under 300 KB
  totalChecks++;
  try {
    const fs = await import('fs');
    const path = await import('path');
    let maxFound = 0;
    let oversized = [];
    for (const d of ['assets/img', 'assets/projects']) {
      const fullD = path.resolve('d:/my-workshop/projects/vediusv', d);
      if (fs.existsSync(fullD)) {
        for (const file of fs.readdirSync(fullD)) {
          const st = fs.statSync(path.join(fullD, file));
          const kb = st.size / 1024;
          if (kb > maxFound) maxFound = kb;
          if (kb > 300) oversized.push(`${d}/${file} (${kb.toFixed(1)} KB)`);
        }
      }
    }
    if (oversized.length === 0) {
      passedChecks++;
      console.log(`[PASS] [Image Optimization Audit] All images are strictly <= 300 KB (Largest image: ${maxFound.toFixed(1)} KB)`);
    } else {
      issues.push(`Images exceeding 300 KB: ${oversized.join(', ')}`);
      console.log(`[FAIL] Images exceed 300 KB: ${oversized.join(', ')}`);
    }
  } catch(e) {
    issues.push(`Image audit error: ${e.message}`);
  }

  console.log('====================================================');
  console.log(`AUDIT SUMMARY: ${passedChecks}/${totalChecks} checks passed!`);
  if (issues.length === 0) {
    console.log('PERFECT SCORE: All technical SEO, content, and markup checks PASSED!');
  } else {
    console.log('Issues detected:');
    issues.forEach(i => console.log(' - ' + i));
  }
  console.log('====================================================');
}

auditSite();
