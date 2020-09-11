// first setup: the app can now accept and process info from incoming
// HTTP reqs. for which we first need to start a server using this app.

import express from 'express'
import bodyParser from 'body-parser'
// handle all complexities of parsing streamable request objects so that
// we can simplify browser-server communication by exchanging JSON 
// in the request body.
// yarn add body-parser
import cookieParser from 'cookie-parser'
// to parse and set cookies in request objects. 
// yarn add cookie-parser
import compress from 'compression'
// compress response bodies for all reqs. that traverse through the middleware.
// yarn add compression
import cors from 'cors'
// enable cross-origin resource sharing (CORS)
// yarn add cors.
import helmet from 'helmet'
// secure express apps by setting various HTTP headers.
// yarn add helmet
import userRoutes from './routes/user.routes'
import authRoutes from './routes/auth.routes'
import devBundle from './devBundle' // only for dev. Comment out in prod.
import path from 'path'
import { ServerStyleSheets, ThemeProvider } from '@material-ui/styles'
import theme from './../client/theme'
// modules for server side rendering
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import StaticRouter from 'react-router-dom/StaticRouter'
import MainRouter from './../client/MainRouter'
// import { StaticRouter } from 'react-router-dom'

const CURRENT_WORKING_DIR = process.cwd()
const app = express()
devBundle.compile(app) // only for development, comment out in prod.

import Template from './../template'

// parse body params and attache them to req.body
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(compress())
// secure apps by setting various HTTP headers
app.use(helmet())
// enable CORS - Cross Origin Resource Sharing
app.use(cors())
app.use('/', userRoutes)
app.use('/', authRoutes)
app.use('/dist', express.static(path.join(CURRENT_WORKING_DIR, 'dist')))

app.get('*', (req, res) => {
    const sheets = new ServerStyleSheets()
    const context = {}
    const markup = ReactDOMServer.renderToString(
      sheets.collect(
            <StaticRouter location={req.url} context={context}>
              <ThemeProvider theme={theme}>
                <MainRouter />
              </ThemeProvider>
            </StaticRouter>
          )
      )
      if (context.url) {
        return res.redirect(303, context.url)
      }
      const css = sheets.toString()
      res.status(200).send(Template({
        markup: markup,
        css: css
      }))
  })

// handling auth-related errors thrown by express-jwt
// express-jwt throws an error named Unauthorized Error when a token
// cannot be validated for some reason.
app.use((err, req, res, next) => {
    if (err.name === 'Unauthorized Error') {
        res.status(401).json({"error" : err.name + ": " + err.message})
    }
    else if (err) {
        res.status(400).json({"error" : err.name + ": " + err.message})
        console.log(err)
    }
})

export default app