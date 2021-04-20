const passport = require('passport');
require('dotenv').config()


const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;

passport.serializeUser(function(user,done){
    done(null,user)
})

passport.deserializeUser(function(user,done){
    done(null,user)
})

passport.use(new GoogleStrategy({
    clientID:     process.env.CLIENT_ID_GG,
    clientSecret: process.env.CLIENT_SECRET_GG,
    callbackURL: "http://localhost:3000/auth/google/callback",
  },
  function(request, accessToken, refreshToken, profile, done) {
      return done(null,profile);
  }
));