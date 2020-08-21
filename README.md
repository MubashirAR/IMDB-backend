# Folder Structure
```
.
├── ...
├── bin                     # Express www file (Starting point)
├── lib/
|   ├── service             # The services required within the project
|   ├── dbConnection.js     # Database connection and models are declared here
├── middleware              # All middlewares should go here
│   ├──  authenticate.js    # For authenticating users
├── public                  # Static files here (Compiled front end)
├── routes                  # All /api Express Routes
├── app.js                  # Contains basic express setup like helmet, session, cookie, etc
├── constants.js            # Constants to be used in the app
└── ...                 
```

To launch the app `node bin/www`. The app will launch on port `3000`.

**Some improvements I'd make in a real app:**
- I haven't had the chance to fix the sample data. There were some wierd things like "99popularity", imdb_score (imdbScore?) and spaces before genre names.
- In a real world app it would be important to use validation on the server (e.g. Joi) to **sanitize** the input.
- Similarly MongoDB URL should ideally be part of env.
- Genres would be linked in Movies as a foriegn key, and that key would be used during inserts and updates

#### app.js

There are two paths mentioned here `/api` and `*`. All api routes are passed on to `routes/index` and all other routes are passed to the front end.

#### routes/index.js

There are two paths here `/api/auth` and `/api/movies/` going to `routes/auth.js` and `routes/movies.js` respectively.

#### lib/dbConnection.js

This file contains the code for connection to DB and the models used in the project. In a larger project, we would keep each schema in a seperate file.

#### lib/service/auth.js

This service contains helper functions to manage authentication. e.g. hash and salt generation, login happen here.

#### middleware/authentication.js

Verify user session and return unauthorized if session is invalid.

# APIs

#### Admin Login

To login, hit the `POST /api/auth/login` API. 
**Body**
```
{
    "email": String
    :password": String
}
```
**Test Credentials:** 
email: asd@asd.com
password: 123456

#### GET Movies

To get movies list, hit the `POST /api/movie` API. 
**Query Params**
```
{
    searchVal: String,
    limit: Number,
    skip: Number,
    sortBy: Enum ['99popularity', 'director', 'name'],
    reverse: Boolean, // Reverse sorting
    genre: String,
}
```

#### GET Single Movie [authenticated]

To a single movie, hit the `POST /api/movie/single` API. 
**Query Params**
```
{
    movieId: String // Mongodb _id of the movie
}
```

#### GET Genre List

To get genre list, hit the `POST /api/movie/single` API. 
**Query Params**
```
{}
```

#### POST Single Movie [authenticated]

To add a new movie, hit the `POST /api/movie` API. 
**Body**
```
{
    movieId: String // Mongodb _id of the movie
}
```
#### PUT Single Movie [authenticated]

To add a new movie, hit the `POST /api/movie` API. 
**Body**
```
{
    movieId: String, // Mongodb _id of the movie
    genre: [String],
    '99popularity': Number // 0-100
    director: String
    imdb_score: Number // 0-10
    name: String
}
```
#### DELETE Single Movie [authenticated]

To delete a new movie, hit the `DELETE /api/movie` API. Note that this sets 'isActive' to false, and is then ignored by GET requests
**Body**
```
{
    movieId: String // Mongodb _id of the movie
}
```

