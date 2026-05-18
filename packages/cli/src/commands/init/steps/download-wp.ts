import { createWriteStream, rmSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { pipeline } from 'node:stream/promises'
import { exec, logger } from '@veaceslav-golden/wp-ai-kit-core'
import { WP_VERSION_API, WP_DOWNLOAD_URL } from '../../../constants.js'

interface WpVersionResponse {
  offers: Array<{ version: string; response: string }>
}

async function fetchLatestWpVersion(): Promise<string> {
  const res = await fetch(WP_VERSION_API)
  if (!res.ok) throw new Error(`Failed to fetch WP version info: ${res.status}`)
  const data = (await res.json()) as WpVersionResponse
  const latest = data.offers.find((o) => o.response === 'upgrade' || o.response === 'latest')
  if (!latest) throw new Error('Could not determine latest WordPress version')
  return latest.version
}

export async function downloadWordPress(targetDir: string): Promise<void> {
  logger.step('Fetching latest WordPress version...')
  const version = await fetchLatestWpVersion()
  logger.step(`Downloading WordPress ${version}...`)

  const tarballUrl = WP_DOWNLOAD_URL(version)
  const tarballPath = resolve(targetDir, 'wordpress.tar.gz')

  const res = await fetch(tarballUrl)
  if (!res.ok) throw new Error(`Failed to download WordPress: ${res.status}`)
  if (!res.body) throw new Error('Response body is empty')

  const { Writable } = await import('node:stream')
  const fileStream = createWriteStream(tarballPath)
  const webStream = res.body

  // Convert web ReadableStream to Node.js readable
  const { Readable } = await import('node:stream')
  const nodeReadable = Readable.fromWeb(webStream as Parameters<typeof Readable.fromWeb>[0])
  await pipeline(nodeReadable, fileStream)

  logger.step(`Extracting WordPress ${version}...`)

  // --strip-components=1 extracts directly into targetDir (skips the "wordpress/" prefix)
  await exec('tar', ['-xzf', 'wordpress.tar.gz', '--strip-components=1'], { cwd: targetDir })

  // Cleanup tarball
  rmSync(tarballPath, { force: true })

  const wpContentDir = resolve(targetDir, 'wp-content')
  if (existsSync(wpContentDir)) {
    rmSync(wpContentDir, { recursive: true, force: true })
  }

  logger.step(`WordPress ${version} extracted`)
}
