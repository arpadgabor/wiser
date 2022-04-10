import * as sst from '@serverless-stack/resources'

interface Props extends sst.StackProps {
  auth: sst.Auth
}

export default class MainStack extends sst.Stack {
  constructor(scope: sst.App, id: string, props?: Props) {
    super(scope, id, props)

    this.setDefaultFunctionProps({
      runtime: 'nodejs14.x',
      architecture: 'arm_64',
    })

    const authorizers: Record<string, sst.ApiAuthorizer> | undefined =
      props?.auth
        ? {
            cognito: {
              type: 'user_pool',
              userPool: {
                id: props.auth.userPoolId,
                clientIds: [props.auth.userPoolClientId],
              },
            },
          }
        : undefined

    // Create a HTTP API
    const api = new sst.Api(this, 'Api', {
      authorizers,
      routes: {
        'GET /': {
          function: 'src/lambda.handler',
          authorizer: 'cognito' as any,
        },
      },
    })

    this.addOutputs({
      ApiEndpoint: api.url,
    })
  }
}
