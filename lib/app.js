const restana = require('restana')
const json  = require('tiny-json-body-parser')

module.exports = function (options = {}) {
  const name = options.name || 'app'
  const server = options.server
  const errObj = {
    name: 'ServerError',
    status: 500,
    message: 'Internal Server Error'
  }

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
      res.send({
        name: 'ServerError',
        status: 500,
        message: 'Internal Server Error'
      }, 500)
    }

    if (413 === res.status) {
      return res.send(413)
    } else if (415 === res.status) {
      return res.send(415)
    } else if (err instanceof SyntaxError || err.message === 'invalid json') {
      return res.send({
        name: 'BadRequestError',
        message: 'invalid json',
        status: 400
      }, 400)
    }

    const shouldHandle = ({ status = 500 }) => status > 399 && status < 500

    if (shouldHandle(err)) {
      log.warn({ err: {
        code: err.code,
        description: err.description,
        message: err.message,
        name: err.name,
        originalStatus: err.original_status,
        status: err.status
      }})
      
      return res.send({ 
        name: err.name, 
        message: err.message, 
        status: err.status 
      }, err.status)
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

    return res.send({
      name: 'ServerError',
      status: 500,
      message: 'Internal Server Error'
    }, 500)
  }
  
  return { start }
}
