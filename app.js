const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const compression = require('compression');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const bookingController = require('./controllers/bookingController');
const viewRouter = require('./routes/viewRoutes');

//Start express app
const app = express();

app.enable('trust proxy');

app.set('view engine', 'pug'); //templating engine
app.set('views', path.join(__dirname, 'views')); //specifying folder with views (templates)

//global middleware stack
//Implement CORS - cross origin resource sharing
//For simple requests only (GET and POST)
app.use(cors());

// Allow only a specific domain to consume the API
// app.use(cors({
//   origin: 'https://www.example.com'
// }))

//FOR OTHER REQUESTS
//PREFLIGHT PHASE
app.options('*', cors());
//app.options('/app/v1/tours/:id', cors()) //for one resource

//serving static files
app.use(express.static(path.join(__dirname, 'public')));

//security HTTP headers
app.use(helmet());

//////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
//development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//limit requests from same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP. Please try again in an hour.',
});

app.use('/app', limiter);

//Stripe needs the body comming from the server in raw format (NOT json)
//this is why this route is located here
//the next middleware parses the body into the json format
app.post(
  '/webhook-checkout',
  bodyParser.raw({ type: 'application/json' }),
  bookingController.webhookCheckout
);

//Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' })); //middleware to modify incomming req data
app.use(express.urlencoded({ extended: true, limit: '10kb' })); //for HTML forms submitting

//Cookie parser
app.use(cookieParser());
//data sanitization against NoSQL query injection
app.use(mongoSanitize());

//Data sanitization against cross-site scripting attacks (XSS)
//sanitizes html/JS code from data
app.use(xss());

//prevent parameter pollution!
app.use(
  hpp({
    whitelist: [
      'duration',
      'price',
      'ratingAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
    ],
  })
);

app.use(compression());

//Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  //console.log(req.cookies);
  next();
});

//ROUTES

//website routes
app.use('/', viewRouter);

//API routes
app.use('/app/v1/tours', tourRouter);
app.use('/app/v1/users', userRouter);
app.use('/app/v1/reviews', reviewRouter);
app.use('/app/v1/bookings', bookingRouter);

//Error handler route for all types of requests (app.all)
//for all urls ('*')
//Must be the last handler!
app.all('*', (req, res, next) => {
  // const err = Error(`Can't find ${req.originalUrl} on the server!`);
  // err.status = 'fail';
  // err.statusCode = 404;

  next(new AppError(`Can't find ${req.originalUrl} on the server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
