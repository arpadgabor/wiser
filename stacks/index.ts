import * as sst from '@serverless-stack/resources'
import AuthStack from './auth.stack'
import DomainStack from './domain.stack'
import EmailStack from './email.stack'

import { useConfig } from './helpers'

import MainStack from './main.stack'

export default function main(app: sst.App): void {
  const config = useConfig(app)

  const domain = new DomainStack(app, 'domain', {
    domainName: config.envDomain,
  })

  const emails = new EmailStack(app, 'ses', {
    domainName: config.envDomain,
    emails: config.emails,
  })

  const auth = new AuthStack(app, 'auth', {
    hostedZone: domain.hostedZone,
    domainName: config.envDomain,
    fromEmail: emails.fromEmail,
  })

  new MainStack(app, 'api')
}
