import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        services: resolve(__dirname, 'services.html'),
        projects: resolve(__dirname, 'projects.html'),
        caseStudies: resolve(__dirname, 'case-studies.html'),
        skills: resolve(__dirname, 'skills.html'),
        programs: resolve(__dirname, 'programs.html'),
        coaching: resolve(__dirname, 'coaching.html'),
        contact: resolve(__dirname, 'contact.html')
      }
    }
  }
});
