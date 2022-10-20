# Act Now Links Service

Service to generate sharable links with meta tags and dynamic preview images.

## Contents

[API](#api)

* [Creating a share link](#creating-a-share-link)
* [Taking a screenshot of a share image page](#taking-a-screenshot-of-a-share-image-page)
* [Fetching an existing share link by its original URL](#fetching-an-existing-share-link-by-its-original-url)

[Setup](#setup)

* [Getting started](#getting-started)
* [Running emulators for local development](#running-emulators-for-local-development)
* [Deploying changes](#deploying-changes)

## API

API base URL: `https://us-central1-act-now-links-dev.cloudfunctions.net`

### Creating a share link

Registers a new share link with meta tags according to the request body params, or returns the existing one if a share link already exists for the supplied parameters. On success, returns the URL of the new or existing share link.

#### Request

* URL:  `/api/registerUrl`
* Method: `POST`
* Headers
  * Required: `Content-Type:application/json`

##### Data Parameters

|     Parameter      | Data Type | Description | Required |
| ----------- | ----------- | ---------------| ------------|                 
| `url`      | `string`      |  Url to create share link for | `true` |
| `title`   | `string`        | Title meta tag                 | `false` |
| `description`   | `string`        | Description meta tag  | `false` |
| `imageUrl`   | `string`        | Url of image to use as image meta tag | `false` |


#### Success response

Returns new or existing share link for the URL provided with meta tags according to the data params.

* **Code:** `200 <br />`
* **Content:** `<share link URL>`
 
#### Error Response

* **Code:** `400 Missing or invalid URL parameter. <br />`


#### Example

##### `./payload.json`

```json
{
  "url": "https://www.covidactnow.org",
  "title": "Covid Act Now - US Covid Data Tracker",
  "description": "See how Covid is spreading in your community",
  "imageUrl": "https://covidactnow.org/internal/share-image/states/ma"
}
```

```bash
curl -X POST -H "Content-Type:application/json" <baseurl>/api/registerUrl -d @./payload.json
```

### Fetching all existing share links for a URL

Returns all the share links with the same URL as the supplied target URL, or an empty
array if none exist.

#### Request

* URL:  `/api/shareLinksByUrl?url=<target-URL>`
* Method: `GET`

#### Success Response

Returns all corresponding share links for the URL provided.

* **Code:** `200 <br />`
* **Content:** `{ urls: [<share links for target URL>] }`

#### Example

```bash
curl -X GET "https://us-central1-act-now-links-dev.cloudfunctions.net/api/getShareLinkUrl?url=https://www.covidactnow.org"
```


### Taking a screenshot of a share image page

Generates a screenshot of the given target URL and returns the image.

The target URL must contain `<div>`s with `screenshot` and `screenshot-ready` classes to indicate where to capture and when the screenshot is ready to be taken, e.g.:

 ```html
<div class="screenshot">
  <div class="screenshot-ready">
    {content to screenshot}
  </div>
</div>
 ```

 We can combine this endpoint with `/api/registerUrl` to create share links with dynamic images by
 supplying an `api/screenshot/` URL as the `imageUrl` data param when creating a new share link.

#### Request

* URL:  `/api/screenshot?url=<target-URL>`
* Method: `GET`

#### Success Response

Serves screenshot of targeted URL to request URL.

* **Code:** `200 <br />`
* **Content:** `<screenshot of target URL as .PNG>`

#### Example

```bash
wget -O img.png "<baseurl>/api/screenshot?url=https://covidactnow.org/internal/share-image/states/ma"
```


## Setup

### Getting Started

To get setup:

* If applicable, make sure you have access to the `act-now-links-dev` Google Firebase project.
* Clone the repo with: `git clone https://github.com/covid-projections/act-now-links-service.git`
* Move to the repo directory: `cd act-now-links-service`
* Install firebase tools and CLI: `yarn global add firebase-tools`
* Login to firebase: `firebase login`, this will open a browser to sign in through in order to give you authentication to interact with the project.
* Make sure that you are using Node 16
* `cd functions/ && yarn`
* Run `yarn serve` to start the emulators

### Running emulators for local development

For local development, we can run emulators such that we do not need to deploy our changes to the production at every step.

This project uses Firestore and Functions, so we will only need to configure emulators for these services. To do so:

* Run `firebase init emulators` and select `functions` and `firestore` from the dropdown selections with spacebar, and confirm selections with enter.
* Once the setup has completed, we can start the emulator with `firebase emulator:start`. The firestore emulator relies on Java, so if you encounter an error like ```The operation couldn’t be completed. Unable to locate a Java Runtime.``` it is either because you do not have Java installed, or the installation cannot be found.
  * If you do not have Java installed, install it with `brew install Java` (on Mac). On completion, run `java`; if the same error is raised as above, follow the next step, otherwise skip it.
  * To locate/link to your Java installation run `sudo ln -sfn /opt/homebrew/opt/openjdk/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk.jdk` (see this [StackOverflow post](https://stackoverflow.com/questions/65601196/how-to-brew-install-java) for context).
  * Re-run `firebase emulator:start` to hopefully see that the start is successful.
* Once the emulators are running you can interact with the local instance the same as you would production, following the ports/locations specified in the terminal. By default, the functions emulator is set to run on `localhost:5001`, creating endpoints at `localhost:5001/act-now-links-dev/central-us1/api`.
* The emulator will update whenever the project is built. We can have changes applied on save by running `yarn build:watch` in `functions/` in a separate terminal window.

### Deploying changes

Deploys are handled automatically by the [Firebase functions deploy](https://github.com/covid-projections/act-now-links-service/actions/workflows/functions-deploy.yml) Github action. The workflow is triggered on pushes to the `main` and `develop` branches so that the deployed functions will reflect the most up-to-date changes in `main`/`develop`.

If need be, you can deploy functions yourself by running `yarn deploy` in `functions/`, but this is generally discouraged as it disrupts the symmetry between Github and Firebase.
