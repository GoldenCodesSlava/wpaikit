import { resolve } from 'node:path'
import { existsSync, rmSync, renameSync } from 'node:fs'
import { exec, logger } from '@golden/wp-ai-kit-core'
import { BOILERPLATE_REPO } from '../../../constants.js'

export async function cloneBoilerplate(targetDir: string): Promise<void> {
  logger.step('Cloning boilerplate wp-content...')

  const tempDir = resolve(targetDir, '__boilerplate-tmp')

  try {
    await exec('git', ['clone', '--depth', '1', BOILERPLATE_REPO, tempDir], {
      env: {
        ...process.env,
        // BatchMode=yes: fail immediately instead of hanging on passphrase/host prompts
        // ConnectTimeout=10: don't wait forever if GitHub is unreachable
        // StrictHostKeyChecking=accept-new: auto-accept github.com host key on first connection
        GIT_SSH_COMMAND:
          'ssh -o BatchMode=yes -o ConnectTimeout=10 -o StrictHostKeyChecking=accept-new',
      },
    })
  } catch (err) {
    rmSync(tempDir, { recursive: true, force: true })
    const msg = (err as Error).message
    if (msg.includes('Permission denied') || msg.includes('publickey')) {
      throw new Error(
        'SSH authentication failed.\n\n' +
          'Your SSH key is not loaded in the agent. Run:\n' +
          '  macOS:  ssh-add --apple-use-keychain ~/.ssh/id_ed25519\n' +
          '  Linux:  ssh-add ~/.ssh/id_ed25519\n\n' +
          'Then verify with: ssh -T git@github.com',
      )
    }
    throw err
  }

  const clonedWpContent = resolve(tempDir, 'wp-content')
  if (!existsSync(clonedWpContent)) {
    rmSync(tempDir, { recursive: true, force: true })
    throw new Error('Boilerplate repository does not contain a wp-content directory')
  }

  const destWpContent = resolve(targetDir, 'wp-content')
  renameSync(clonedWpContent, destWpContent)

  rmSync(tempDir, { recursive: true, force: true })

  logger.step('Boilerplate wp-content cloned')
}
