export const checksums = {
  "claims": "v3.5.0--7NP0LKmdxzhGsD5Ou199IZGBlOjPoTxdVdye_lwZurg",
  "memes": "v3.5.0--7p1VhxbUIrx1QtZd2BCfP16xuO4jLiNxoPtN-_1dWWE",
  "quotes": "v3.5.0--V_Ew62Hk-iK4hkp92y6_6KQq5-aN3u-cHiDbVws4250"
}
export const checksumsStructure = {
  "claims": "6dWk8M7axknLqL9igW_-SjCioTdrPkjJHeclOdOXLJM",
  "memes": "7iTHqDEHryIFjDg-UahsUH1ljgZ7dcVYtLJC8L3Iqew",
  "quotes": "W-EVotDwsiw3OcPVUe1KZ3J2TCKRXfMa9fSMh7fLhPY"
}

export const tables = {
  "claims": "_content_claims",
  "memes": "_content_memes",
  "quotes": "_content_quotes",
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
  "info": {
    "type": "data",
    "fields": {}
  }
}