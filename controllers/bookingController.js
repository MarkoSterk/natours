const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) get tour ID
  const tour = await Tour.findById(req.params.tourId);
  const queryString = `?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`;

  // 2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/${queryString}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
        amount: tour.price * 100, //expected to be in cents!
        currency: 'usd', //can also be 'eur'...
        quantity: 1,
      },
    ],
  });
  // 3) Create checkout session as response
  res.status(200).json({
    status: 'success',
    session: session,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  //Temporary solution, because it is unsecure. Everyone can make bookings without paying
  const { tour, user, price } = req.query;

  if (!tour || !user || !price) return next();

  await Booking.create({
    tour: tour,
    user: user,
    price: price,
  });

  res.redirect(req.originalUrl.split('?')[0]);
});

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
