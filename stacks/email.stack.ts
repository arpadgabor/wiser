import * as sst from '@serverless-stack/resources'
import r53 from 'aws-cdk-lib/aws-route53'
import {
  VerifySesDomain,
  VerifySesEmailAddress,
} from '@seeebiii/ses-verify-identities'

interface Props extends sst.StackProps {
  domainName: string

  /**
   * An email that can be used in Sandbox mode before getting approved by AWS.
   */
  emails?: string[]
}

export default class EmailStack extends sst.Stack {
  constructor(scope: sst.App, id: string, props: Props) {
    super(scope, id, props)

    new VerifySesDomain(this, 'ses-domain', {
      domainName: props.domainName,
    })

    if (Array.isArray(props.emails)) {
      props.emails.forEach((email, i) => {
        new VerifySesEmailAddress(this, `ses-email-${i}`, {
          emailAddress: email,
        })
      })
    }
  }
}
