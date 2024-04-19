/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: './dist', // Changes the build output directory to `./dist/`.
  compiler: {
    styledComponents: true
  }
}
 
export default nextConfig