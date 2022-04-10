import * as sst from '@serverless-stack/resources'
import * as cdk from 'aws-cdk-lib'
import * as route53 from 'aws-cdk-lib/aws-route53'

interface Props extends sst.StackProps {
  domainName: string
}

export default class DomainStack extends sst.Stack {
  public hostedZone: route53.IHostedZone

  constructor(scope: sst.App, id: string, props: Props) {
    super(scope, id, props)

    this.hostedZone = route53.HostedZone.fromLookup(this, 'hostedZone', {
      domainName: props.domainName,
    })
  }
}
