## Welcome

This is a sample node api server built with express. This allows you to filter a list of responses for specific Fillout form.

## Setup

In order you run, **you will** need to create a .env file with the following values:

- PORT (optional)
- API_KEY
- API_URL

## To Run

npm i

node app.js

## Endpoint Access

- {localhost||server}/{formId}/filteredResponses?filter={requires strinigified JSON}
- You may pass additional query string params based on Fillout's endpoint: 	[Fillout REST API - Get Submissions](https://www.fillout.com/help/fillout-rest-api#a981e824966448029aeb091e0706d070)
- Example: {localhost||server}/{formId}/filteredResponses?*sort=desc*&filter={requires strinigified JSON}

## Sample JSON filters(must stringify)

`[
  {
    "id": "4KC356y4M6W8jHPKx9QfEy",
    "condition": "equals",
    "value": "Nope"
  },
  {
    "id": "bE2Bo4cGUv49cjnqZ4UnkW",
    "condition": "equals",
    "value": "Tom"
  }
]`


`[
  {
    "id": "bE2Bo4cGUv49cjnqZ4UnkW",
    "condition": "equals",
    "value": "Tom"
  },
  {
    "id": "fFnyxwWa3KV6nBdfBDCHEA",
    "condition": "greater_than",
    "value": 49
  }
]`

`[
  {
    "id": "4KC356y4M6W8jHPKx9QfEy",
    "condition": "equals",
    "value": "I'm excited for it!"
  },
  {
    "id": "bE2Bo4cGUv49cjnqZ4UnkW",
    "condition": "equals",
    "value": "Jane"
  }
]`

`[
  {
    "id": "dSRAe3hygqVwTpPK69p5td",
    "condition": "less_than",
    "value": "2024-03-25"
  }
]`
