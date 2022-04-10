import * as sst from '@serverless-stack/resources'
import * as cdk from 'aws-cdk-lib'
import * as cognito from 'aws-cdk-lib/aws-cognito'
import * as acm from 'aws-cdk-lib/aws-certificatemanager'
import * as route53 from 'aws-cdk-lib/aws-route53'
import * as route53_targets from 'aws-cdk-lib/aws-route53-targets'

interface Props extends sst.StackProps {
  domainName: string
  hostedZone: route53.IHostedZone
  fromEmail: string
}

export default class AuthStack extends sst.Stack {
  public userPool: cognito.UserPool
  public userPoolClient: cognito.UserPoolClient
  public authClient: sst.Auth

  constructor(scope: sst.App, id: string, props: Props) {
    super(scope, id, props)

    this.userPool = new cognito.UserPool(this, 'userPool', {
      userPoolName: 'userPool',
      selfSignUpEnabled: true,
      signInAliases: {
        username: true,
        email: true,
      },
      standardAttributes: {
        givenName: { required: false, mutable: true },
        familyName: { required: false, mutable: true },
      },
      customAttributes: {
        role: new cognito.StringAttribute({ mutable: true }),
      },
      passwordPolicy: {
        minLength: 8,
        requireDigits: true,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    })

    const authDomain = ['auth', props.hostedZone.zoneName].join('.')
    const userPoolDomain = new cognito.UserPoolDomain(this, 'userPoolDomain', {
      userPool: this.userPool,
      customDomain: {
        domainName: authDomain,
        certificate: new acm.DnsValidatedCertificate(this, 'authCertificate', {
          hostedZone: props.hostedZone,
          region: 'us-east-1',
          domainName: authDomain,
          validation: acm.CertificateValidation.fromDns(),
        }),
      },
    })

    new route53.ARecord(this, 'UserPoolCloudFrontAliasRecord', {
      zone: props.hostedZone,
      recordName: authDomain,
      target: route53.RecordTarget.fromAlias(
        new route53_targets.UserPoolDomainTarget(userPoolDomain),
      ),
    })

    const cfnUserPool = this.userPool.node.defaultChild as cognito.CfnUserPool
    cfnUserPool.emailConfiguration = {
      emailSendingAccount: 'DEVELOPER',
      from: props.fromEmail,
      replyToEmailAddress: props.fromEmail,
      sourceArn: `arn:aws:ses:${scope.region}:${this.account}:identity/${props.fromEmail}`,
    }

    const standardAttributes: cdk.aws_cognito.StandardAttributesMask = {
      givenName: true,
      familyName: true,
      email: true,
      emailVerified: true,
    }

    const clientReadAttributes = new cognito.ClientAttributes()
      .withStandardAttributes(standardAttributes)
      .withCustomAttributes('role')

    const clientWriteAttributes =
      new cognito.ClientAttributes().withStandardAttributes({
        ...standardAttributes,
        emailVerified: false,
      })

    this.userPoolClient = new cognito.UserPoolClient(this, 'userPoolClient', {
      userPoolClientName: 'userPoolClient',
      userPool: this.userPool,
      authFlows: {
        adminUserPassword: true,
        custom: true,
        userSrp: true,
      },
      supportedIdentityProviders: [
        cognito.UserPoolClientIdentityProvider.COGNITO,
      ],
      readAttributes: clientReadAttributes,
      writeAttributes: clientWriteAttributes,
    })

    this.authClient = new sst.Auth(this, 'auth', {
      cdk: {
        userPool: this.userPool,
        userPoolClient: this.userPoolClient,
      },
    })

    this.addOutputs({
      userPoolId: this.userPool.userPoolId,
    })
  }
}
