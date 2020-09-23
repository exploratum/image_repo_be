# Image Repository API

An API designed to manage an image repository on Amazon AWS Simple Storage Service (S3).
This API was built with Node.js, Express.js as the server, and PostgreSQL for the database

The image repository is managed by a server on Heroku. User authentication/authorisation, image metadata,
and getting presigned urls are all managed on Heroku. The server will provide presigned urls that will allow the user
to directly upload or download image to or from the repository hosted on AWS S3.

## Current features 
- getting list of all images in storage
- Provide presigned upload urls for user direct upload to AWS S3 (bulk upload)
- Provide presigned download urls for user direct downlaod to AWS S3 (bulk download)
- delete existing images (bulk delete)

##  future features
- mechanism to ensure that image database on the server is fully synchronized with actual images in AWS S3 storage
- thumbnail size images to be included when requesting image list
- Multiuser management with private/public images
- Emulate directories in S3 using path

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
  - token
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
## POST: image information to receive presigned urls for direct upload to S3
- /api/request-upload-url
### required fields:
- imgKey (filename = S3 object key)
- category
- owner
- description

### returns:
- presigned urls
- information on failed attempts

### HEADERS
- Content-Type
  - application/json
- Authorization
  - token
### PARAMS
Bodyraw (text)
{"images": [{"imgKey":"image1.jpg", "category": "landscape", "owner": "Thierry", "description": "cactus in Joshua park"}, {"imgKey":"image2.jpg", "category": "landscape", "owner": "Thierry", "description": "Utah park"}]}

### Example Request
curl --location --request POST 'https://image-repository-be.herokuapp.com/request-upload-url' \
--header 'Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWJqZWN0IjoxLCJ1c2VybmFtZSI6InVzZXIxIiwiaWF0IjoxNTk5NDk3Mjc0LCJleHAiOjE1OTk1ODM2NzR9.zHjNGA2eoDXWQ_OaBIhJgGDSK9jiwiJApQHm94tQeYU' \
--data-raw '{"images": [{"imgKey":"image1.jpg", "category": "landscape", "owner": "Thierry", "description": "cactus in Joshua park"}, {"imgKey":"image2.jpg", "category": "landscape", "owner": "Thierry", "description": "Utah park"}]}'

### Example Response
- 200 - OK
- {
    "data": 
      [
        {
            "msg": "success",
            "image": {
                "imgKey": "image25.jpg",
                "url": "https://image-repository-1.s3.us-west-1.amazonaws.com/image25.jpg?AWSAccessKeyId=AKIA5CFIOJJW5ELMZPRA&Content Type=image%2Fjpeg&Expires=1600410704&Signature=2uMYFO2aWOsdVtv9Hry8rKsjpZA%3D"
            }
        },
        {
            "msg": "success",
            "image": {
                "imgKey": "image26.jpg",
                "url": "https://image-repository-1.s3.us-west-1.amazonaws.com/image25.jpg?AWSAccessKeyId=AKIA5CFIOJJW5ELMZPRA&Content-    Type=image%2Fjpeg&Expires=1600410704&Signature=2uMYFO2aWOsdVtv9Hry8rKsjpZA%3D"
            }
        },
     ]
 }  
  
  or  
  
  207 Multi-Status  
  {
      "data": [
          {
              "error": "There is already an image with this name",  
              "img": "image24.jpg"  
          },
          {
              "msg": "success",  
              "image": {  
                  "imgKey": "image25.jpg",  
                  "url": "https://image-repository-1.s3.us-west-1.amazonaws.com/image25.jpg?AWSAccessKeyId=AKIA5CFIOJJW5ELMZPRA&Content-Type=image%2Fjpeg&Expires=1600410704&Signature=2uMYFO2aWOsdVtv9Hry8rKsjpZA%3D"
              }
          },  
          {
              "metadata": {
                  "aws failure(s)": 0,
                  "duplicates": 1,
                  "nonDuplicates": 1
              }
          }
      ]
  }

***
***

## POST: image information to receive presigned urls for direct download from S3
- /api/request-download-url
### required fields:
- imgKey (filename = S3 object key)
- category
- owner
- description

### returns:
- presigned urls
- information on failed attempts

### HEADERS
- Content-Type
  - application/json
- Authorization
  - token
### PARAMS
Bodyraw (text)
{"data": [{"imgKey":"image1.jpg"}, {"imgKey":"image2.jpg"}]}

### Example Request
curl --location --request POST 'https://image-repository-be.herokuapp.com/api/request-download-url' \
--header 'Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWJqZWN0IjoxLCJ1c2VybmFtZSI6InVzZXIxIiwiaWF0IjoxNTk5NDk3Mjc0LCJleHAiOjE1OTk1ODM2NzR9.zHjNGA2eoDXWQ_OaBIhJgGDSK9jiwiJApQHm94tQeYU' \
--data-raw '{"images": [{"imgKey":"image1.jpg"}, {"imgKey":"image2.jpg"}]}'

### Example Response
- 200 - OK
- {
    "data": 
      [
        {
                "imgKey": "image25.jpg",
                "url": "https://image-repository-1.s3.us-west-1.amazonaws.com/image25.jpg?AWSAccessKeyId=AKIA5CFIOJJW5ELMZPRA&Content Type=image%2Fjpeg&Expires=1600410704&Signature=2uMYFO2aWOsdVtv9Hry8rKsjpZA%3D"
            }
        },
        {
                "imgKey": "image26.jpg",
                "url": "https://image-repository-1.s3.us-west-1.amazonaws.com/image25.jpg?AWSAccessKeyId=AKIA5CFIOJJW5ELMZPRA&Content-    Type=image%2Fjpeg&Expires=1600410704&Signature=2uMYFO2aWOsdVtv9Hry8rKsjpZA%3D"
            }
        },
     ]
 }  
  
  or  
  
  207 Multi-Status  
  {
      "data": [
          {
              "error": "Image not found",  
              "imgKey": "image24.jpg"  
          },
          {
              "msg": "success",  
              "imgKey": "image25.jpg",  
              "url": "https://image-repository-1.s3.us-west-1.amazonaws.com/image25.jpg?AWSAccessKeyId=AKIA5CFIOJJW5ELMZPRA&Content-Type=image%2Fjpeg&Expires=1600410704&Signature=2uMYFO2aWOsdVtv9Hry8rKsjpZA%3D"
              }
          },  
          {
              "metadata": {
                  "aws failure(s)": 0,
                  "not found": 1,
                  "success": 1
              }
          }
      ]
  }

***
***
## GET: image list
- /api/list

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
- /api/remove
### required fields:
- imgKey (filename = S3 object key)

### returns:
- success message

### HEADERS
- Content-Type
  - application/json
- Authorization
  - token

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
