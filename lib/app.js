const restana = require('restana')
const json  = require('tiny-json-body-parser')

module.exports = function (options = {}) {
  const name = options.name || 'app'
  const server = options.server

  let log

  async function start (dependencies) {

    log = (dependencies.logger && dependencies.logger.child({ component: name })) || console

    const opts = { 
      prioRequestsProcessing: false, 
      server, 
      ...{ errorHandler }, 
      ...dependencies.config 
    }
    
    const app = restana(opts)

    app.use(json())

    return app
  }

  function errorHandler(err, req, res) {
    if (err == null) {
      log.error("Something strange! Global error handler called with null error");
      res.send(500)
    }

    if (413 === res.status) return res.send(413)
    if (415 === res.status) return res.send(415)
    if (err instanceof SyntaxError || err.message === 'invalid json') {
      return res.send({
        name: 'BadRequestError',
        message: 'invalid json',
        status: 400
      }, 400)
    }

    const shouldHandle = ({ status = 500 }) => status > 399 && status < 500

    if (shouldHandle(err)) {
      const payload = conform(err)
      log.warn({ err: {
        code: err.code,
        description: err.description,
        message: err.message,
        name: err.name,
        originalStatus: err.original_status,
        status: err.status
      }})
      
      return res.send(payload, payload.status)
    }

    log.error({
      code: err.code,
      description: err.description,
      message: err.message,
      name: err.name,
      originalStatus: err.original_status,
      stack: err.stack,
      status: err.status
    })

    return res.send(500);
  }
  
  return { start }
}

function conform(obj) {
  return {
    name: `${obj.name}`,
    message: `${obj.message}`,
    status: +`${obj.status}`,
  };
}

