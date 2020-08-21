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

To launch the app install the dependencies with `npm install` and launch with `node bin/www`. The app will launch on port **3000**.

**Some things I can improve:**
- Add a **loader**.
- I haven't had the chance to **fix the sample data**. There were some wierd things like "99popularity", imdb_score (imdbScore?) and spaces before genre names. Also trim inputs to remove whitespaces around.
- **Sanitize** the input (e.g. Joi).
- Similarly **MongoDB URL** should ideally be part of **environment**.
- **Genres** would be linked in Movies as a **foriegn key**, and that key would be used during inserts and updates.
- Perhaps integrate a testing framework to test services.
- Check **authentication status** on app **load**.
- Add frontend pagination. The UI for pagination is to be done.
- Add a **searchable dropdown** for the genres input when adding movies.
- Refresh Genres when creating/editing a movie.

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

# Scaling The Application

## Architecture

![alt text][logo]

[logo]: 5M.png "Logo Title Text 2"

## 5M Movies, 15M Users

Running `db.getCollection('movies').stats({})` reveals that the average object size is close to 200 Bytes. This means that 5M records would need **1GB+ of storage**. Assuming we have 10K admins, in this case also nearly 200 bytes each, is around 2MB

Since we have 5 indexes, this would require 5x the memory if we do not use disk. So we will need **5GB+ of memory**

15M API hits per day would be **~180 hits per second**. Considering our API runs for 200ms, we have an average of **220 concurrent requests** at a given time. Considering we have more traffic at peak times in a day, this number would be higher at some times. Assuming we get 3x this traffic at **peak times, its 660 concurrent requests with 540 requests per second**.

Now, every server has a limited number of connections, assuming it is concurrent 500 connections, we might need to add multiple servers. So we could add a load balancer that distributes this load among 2 or 3 servers, thus solving the connection issue on the backend servers.

### Choosing a database

SQL databases are not very easy to scale. Since we are expecting the need to scale our database, in this case we would go for a NoSQL database

We could choose between MongoDB and Cassandra based on our requirement of **availability vs consistency**. Cassandra running on a HDD could lose upto 10 seconds worth of data. 

If 100% consistency is not a big concern, we have both anonymous and authenticated users **(more writes?)**, and we could be scaling it across servers, **Cassandra** could be the database we need.

We could improve availability by adding **master-master replication** to ensure we can accept a **large number of read and write requests**. 

This means two things. Firstly, we have eventual consistency and secondly, we could in rare cases lose data and throw an error to the admin when inseting/updating.

Alternatively, we can use a **consistent database** (e.g. MongoDB) to **shard** our database and use a hash to distribute load. The hash could be using the movie id. Ideally we want to have many shards, even if some are on the same server for now. This will allow us to scale across more servers when there is more load expected.

This means we need to generate the *id* beforehand. We could have a dedicated database that generates the key for us. To avoid single point of failure, we could have two sources generating odd and even keys respectively.

### Maintaining sessions

Since we have multiple servers, we need to maintain sessions outside of the server. We can use Redis to maintain the sessions. This could become a single point of failure so we could use Multi-Master Replication with Dynomite.

### Taking some load off the servers

We could set up reverse proxies that manage authentication (where required), compression, encryption and static files. If a reverse proxy can handle all the concurrent connections, we can replace the load balancer with it.

### Caching

Since our data doesn't change frequently, we can cache popular movies to take a large load off the database. Assuming we cache 20% top movies, we could have about 200MB of data cached on proxy servers.

If the 80-20 rule were to work, we would distribute close 80% requests to the proxies, making the responses faster and reducing most of the load from the servers. Caching will also ensure low latency across the globe.

Static files can also be cached

A push based cache should resolve stale data issues.

## 25M Movies, 75M Users

Now we might need to distribute the data of different shards across more servers (hence more shards were important).

An autoscaling setup would be able to identify higher loads and increase the number of backend servers to distribute the load. This would require identifying per server load.

## Bottlenecks

The main bottleneck in this case would be the load balancer/reverse proxy. The load balancer can perhaps be scaled out with keepalived or something similar.

If dynamite is not used, Redis will also be a single point of failure, and for write loads could be a bottleneck as apparantly it uses a single thread.

Querying the database would be difficult with the id being the hash key. Using the movie name might lead to higher load on some shards (e.g. shard storing movies starting with "a")