import * as sst from '@serverless-stack/resources'
import route53 from 'aws-cdk-lib/aws-route53'
import EmailStack from './email.stack'

import { useConfig } from './helpers'

import MainStack from './main.stack'

export default function main(app: sst.App): void {
  const config = useConfig(app)

  new EmailStack(app, 'ses', {
    domainName: config.envDomain,
    emails: config.emails,
  })

  new MainStack(app, 'api')
}
