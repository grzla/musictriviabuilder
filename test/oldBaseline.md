# Performance Testing Baseline (Pre-Optimization)

## Build Time
- Next.js dev server startup: 4.1 seconds

## First Page Load
- Initial compilation: 17s (1456 modules)
- Secondary compilation: 1.746s (718 modules)
- Page load (GET /): 18.424s
- Favicon compilation: Compiled (910 modules)
- Favicon load (GET /favicon.ico): 6.569s

### API Calls
- /api/round compilation: 2.4s (759 modules)
- GET /api/round?round=namethattune: 11.803s
- Database connections established

## Summary of First Load
Total time from start to all resources loaded: ~40 seconds
Major bottlenecks:
- Initial compilation (17s)
- Main page load (18.424s)
- API round endpoint (11.803s)

## Second Page Load
- Page load (GET /): 439ms
- Favicon load (GET /favicon.ico): 21ms

### API Calls
- GET /api/round?round=namethattune: 19.794s and 19.818s (two calls)
- Database connections established

## Summary of Second Load
Total time from start to all resources loaded: ~20 seconds
Notable improvements:
- No compilation time (cached)
- Main page load reduced from 18.424s to 439ms (97.6% faster)
- Favicon load reduced from 6.569s to 21ms (99.7% faster)

Major remaining bottleneck:
- API round endpoint still slow (~19.8s)
