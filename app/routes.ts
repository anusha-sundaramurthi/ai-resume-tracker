import {type RouteConfig, index, route} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route('/auth', 'routes/auth.tsx'),
  route('/upload', 'routes/upload.tsx'),
  route('/resume/:id', 'routes/resume.tsx'),
  route('/resume/:id/optimize', 'routes/resumeOptimizer.tsx'),  // ADD THIS LINE
  route('/wipe', 'routes/wipe.tsx'),
] satisfies RouteConfig;