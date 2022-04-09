import * as sst from '@serverless-stack/resources'

const environments = ['dev', 'staging', 'prod']

export const useConfig = (app: sst.App) => {
  const isLocal: boolean = !environments.includes(app.stage)
  const env: string = environments.includes(app.stage) ? app.stage : 'dev'

  const baseDomain = process.env.BASE_DOMAIN

  const localDomainPrefix = isLocal ? app.stage : ''
  const envDomainPrefix = env !== 'prod' ? env : ''

  const apiDomain = [localDomainPrefix, envDomainPrefix, baseDomain].join('.')
  const envDomain = [envDomainPrefix, baseDomain].join('.')

  return {
    env,
    isLocal,
    baseDomain,

    /**
     * On local it is prefixed by the local stage name.
     * @example local.dev.example.com
     */
    apiDomain,

    /**
     * The base domain used by the environment. On local it will always be `dev.example.com` and on production it will be the base domain.
     */
    envDomain,
  }
}
