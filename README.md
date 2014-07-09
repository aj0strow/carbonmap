# Carbon Map

Carb up, bro.

[@aj0strow](https://github.com/aj0strow), [@subsumo](https://github.com/subsumo)

### Schema

#### Building

```
_id (bson id)
id (string)
name (string)
images
  small (string : url)
  large (string : url)
description (string)
location
  latitude (float)
  longitude (float)
  country (string)
  countryCode (string)
  city (string)
  zipcode (string)
  streetName (string)
  streetNumber (string)
  state (string)
  stateCode (string)
```
