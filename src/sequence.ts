import { inject } from '@loopback/context';
import {
  FindRoute,
  InvokeMethod,
  ParseParams,
  Reject,
  RequestContext,
  RestBindings,
  Send,
  SequenceHandler,
} from '@loopback/rest';

const SequenceActions = RestBindings.SequenceActions;

export class MySequence implements SequenceHandler {
  constructor(
    @inject(SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
    @inject(SequenceActions.PARSE_PARAMS) protected parseParams: ParseParams,
    @inject(SequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
    @inject(SequenceActions.SEND) public send: Send,
    @inject(SequenceActions.REJECT) public reject: Reject,
  ) { }

  async handle(context: RequestContext) {
    try {
      const { request, response } = context;
      const route = this.findRoute(request);
      const args = await this.parseParams(request, route);
      const result = await this.invoke(route, args);
      this.send(response, result);
    } catch (err) {
      console.log(err);
      const { request, response } = context;
      let code: string = (err.code || 500).toString();
      if (code.length && code[0] === '4') {
        response.status(Number(code) || 500);
        return this.send(response, {
          error: {
            message: err.message,
            name: err.name || 'UnknownError',
            statusCode: code
          }
        });
      }
      this.reject(context, err);
    }
  }
}
