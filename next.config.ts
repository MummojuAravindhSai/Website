import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const assetCdnRemotePattern = (() => {
  const value = process.env.ASSET_CDN_URL
  if (!value) return undefined

  if (process.env.PAYLOAD_STORAGE !== 's3') {
    throw new Error('ASSET_CDN_URL requires PAYLOAD_STORAGE=s3.')
  }

  const url = new URL(value)
  if (
    url.protocol !== 'https:' ||
    url.pathname !== '/' ||
    url.search ||
    url.hash ||
    url.username ||
    url.password
  ) {
    throw new Error('ASSET_CDN_URL must be an HTTPS origin without a path or credentials.')
  }

  return {
    protocol: 'https' as const,
    hostname: url.hostname,
    port: url.port,
    pathname: '/**',
  }
})()

const s3ImageRemotePattern = (() => {
  if (process.env.PAYLOAD_STORAGE !== 's3' || !process.env.S3_BUCKET) return undefined

  const region = process.env.AWS_REGION
  const endpoint =
    process.env.S3_ENDPOINT ||
    (region
      ? `https://s3.${region}.amazonaws.com${region.startsWith('cn-') ? '.cn' : ''}`
      : undefined)

  if (!endpoint) return undefined

  const url = new URL(endpoint)
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new Error('S3_ENDPOINT must use http or https.')
  }

  const endpointPath = url.pathname.replace(/\/$/, '')

  return {
    protocol: url.protocol.slice(0, -1) as 'http' | 'https',
    hostname: url.hostname,
    port: url.port,
    pathname: `${endpointPath}/${process.env.S3_BUCKET}/**`,
  }
})()

const nextConfig: NextConfig = {
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
  output: 'standalone',
  ...(s3ImageRemotePattern || assetCdnRemotePattern
    ? {
        images: {
          remotePatterns: [
            ...(s3ImageRemotePattern ? [s3ImageRemotePattern] : []),
            ...(assetCdnRemotePattern ? [assetCdnRemotePattern] : []),
          ],
        },
      }
    : {}),
  // Prerender source maps add ~100 MB per static build worker
  enablePrerenderSourceMaps: false,
  experimental: {
    // Caps static build workers (~250-380 MB each) to lower `next build` peak memory
    cpus: 2,
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
