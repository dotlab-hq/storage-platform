import { getConfig, Generator } from '@tanstack/router-generator'

async function main() {
  const config = getConfig()
  const generator = new Generator({
    root: process.cwd(),
    config,
  })
  await generator.run({ type: 'rerun' })
}

void main()
