# Image Repository API

An API designed to manage an image repository on Amazon AWS Simple Storage Service (S3).
This API was built with Node.js, Express.js as the server, and PostgreSQL for the database

The image repository is managed by a server on Heroku. User authentication/authorisation, image metadata,
and presigned urls are all managed on Heroku. The server will provide presigned urls that will allow the user
to directly upload or download image to or from the repository hosted on AWS S3.

## Current features 
- getting list of all images in storage
- upload new images (one at a time)
- delete existing images (bulk delete)

##  future features
- bulk upload and download
- mechanism to ensure that image database on the server is synchronized with actual images in AWS S3 storage
- thumbnail size images to be included when requesting image list
- Multiuser management with private/public images

The back end is hosted in Heroku at the following URL:
- https://image-repository-be.herokuapp.com/

This project is a pure back end project tested with Postman. However there is also a front end project currently under construction that will be making use of this API. It can be found at the following url:
- https://github.com/exploratum/image_repo

# REST API

## POST: new user registration (protected route)
- /users/register
### required fields:
- email
- password

### returns:
- user id

### HEADERS
- Content-Type
  - application/json
- Authorization
  - <token>
### PARAMS
Bodyraw (text)
{"username": "xxxxx", "password": "xxxxxxxx"}

### Example Request
curl --location --request POST 'https://image-repository-be.herokuapp.com/users/register' \
--data-raw '{"username": "xxxxx", "password": "xxxxxxxx"}'

### Example Response
- 201 - Created
- {"id": [1]}

***
***
## POST: User login to receive Json Web Token for API call authorization
- /users/login
### required fields:
- email
- password

### returns:
- token

### HEADERS
- Content-Type
  - application/json
### PARAMS
Bodyraw (text)
{"username": "xxxxx", "password": "xxxxxxxx"}

### Example Request
curl --location --request POST 'https://image-repository-be.herokuapp.com/users/login' \
--data-raw '{"username": "xxxxx", "password": "xxxxxxxx"}''

### Example Response
- 200 - OK
- {"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWJqZWN0IjoxLCJ1c2VybmFtZSI6InVzZXIxIiwiaWF0IjoxNTk5NDk3Mjc0LCJleHAiOjE1OTk1ODM2NzR9.zHjNGA2eoDXWQ_OaBIhJgGDSK9jiwiJApQHm94tQeYU"
}
***
***
## POST: image information to receive presigned url for direct upload to S3
- /request-upload-url
### required fields:
- imgKey (filename = S3 object key)
- category
- owner
- description

### returns:
- presigned url

### HEADERS
- Content-Type
  - application/json
- Authorization
  - <token>
### PARAMS
Bodyraw (text)
{"imgKey":"image1.jpg", "category": "landscape", "owner": "Thierry", "description": "cactus in Joshua park"}

### Example Request
curl --location --request POST 'https://image-repository-be.herokuapp.com/request-upload-url' \
--header 'Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWJqZWN0IjoxLCJ1c2VybmFtZSI6InVzZXIxIiwiaWF0IjoxNTk5NDk3Mjc0LCJleHAiOjE1OTk1ODM2NzR9.zHjNGA2eoDXWQ_OaBIhJgGDSK9jiwiJApQHm94tQeYU' \
--data-raw '{"imgKey":"image1.jpg", "category": "landscape", "owner": "Thierry", "description": "cactus in Joshua park"}'

### Example Response
- 200 - OK
- {"url": "https://image-repository-1.s3.amazonaws.com/flower1.jpg?AWSAccessKeyId=AKIA5CFIOJJW5ELMZPRA&Content-Type=image%2Fjpeg&Expires=1599503076&Signature=cN131QQKt8ezmBL6%2FB40jlUmQrU%3D"}

***
***
## GET: image list
- /list

### returns:
- list of images with related information

### HEADERS
- Content-Type
  - application/json

### Example Request
curl --location --request GET 'localhost:5000/list' \
--data-raw ''

### Example Response
- 200 - OK
- {
    "images": [
        {
            "id": 1,
            "imgKey": "iamge1.jpg",
            "category": "garden",
            "owner": "Thierry",
            "description": "red camelias",
            "verified": false
        }
        {
            "id": 2,
            "imgKey": "iamge2.jpg",
            "category": "landscape",
            "owner": "Thierry",
            "description": "cactus in Joshua park",
            "verified": false
        }
    ]
}

***
***
## DELETE: remove nformation from database and image from S3 (protected route)
- /remove
### required fields:
- imgKey (filename = S3 object key)

### returns:
- success message

### HEADERS
- Content-Type
  - application/json
- Authorization
  - <token>

### PARAMS
Bodyraw (text)
{"imgKey": "image1.jpg"}

### Example Request
curl --location --request DELETE 'https://image-repository-be.herokuapp.com/remove' \
--data-raw '{"imgKey": "image1.jpg"}'

### Example Response
- 200 - OK
- {"message": "all requested deletions have been completed"}  
or  
- 207 - Multi-Status
- {
    "data": [
        {
            "msg": "delete failure",
            "img": "park1.jpg"
        },
        {
            "msg": "success",
            "img": "park2.jpg"
        },
        {
            "metadata": {
                "failure(s)": 1,
                "success": 1
            }
        }
    ]
}
