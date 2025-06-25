export const checksums = {
  "claims": "v3.5.0--9TDlm67x4mY6MY2rs85FT0QyP68jSvbhxOOy8-80bf4",
  "quotes": "v3.5.0--8dpJ9Jk8NwRJQ66YCbB86Xbo1nhz-JNvqogiYf67SDY",
  "memes": "v3.5.0--inThamuldj3MesKG0d8BOFpTzuF4LhHZn5fFyxx2yc0"
}
export const checksumsStructure = {
  "claims": "6dWk8M7axknLqL9igW_-SjCioTdrPkjJHeclOdOXLJM",
  "quotes": "W-EVotDwsiw3OcPVUe1KZ3J2TCKRXfMa9fSMh7fLhPY",
  "memes": "7iTHqDEHryIFjDg-UahsUH1ljgZ7dcVYtLJC8L3Iqew"
}

export const tables = {
  "claims": "_content_claims",
  "quotes": "_content_quotes",
  "memes": "_content_memes",
  "info": "_content_info"
}

export default {
  "claims": {
    "type": "page",
    "fields": {
      "id": "string",
      "title": "string",
      "body": "json",
      "description": "string",
      "extension": "string",
      "meta": "json",
      "navigation": "json",
      "path": "string",
      "seo": "json",
      "stem": "string"
    }
  },
  "quotes": {
    "type": "page",
    "fields": {
      "id": "string",
      "title": "string",
      "body": "json",
      "description": "string",
      "extension": "string",
      "meta": "json",
      "navigation": "json",
      "path": "string",
      "seo": "json",
      "stem": "string"
    }
  },
  "memes": {
    "type": "page",
    "fields": {
      "id": "string",
      "title": "string",
      "body": "json",
      "description": "string",
      "extension": "string",
      "meta": "json",
      "navigation": "json",
      "path": "string",
      "seo": "json",
      "stem": "string"
    }
  },
  "info": {
    "type": "data",
    "fields": {}
  }
}