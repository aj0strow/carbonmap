# Carbon Map

Carb up, bro.

[@aj0strow](https://github.com/aj0strow), [@subsumo](https://github.com/subsumo)

### Primary Key

Primary keys used on the Energy Kingston page and the service vary widely. To combat inconsistency, the primary key is always the dash-delimited abbreviated lowercase address.

```javascript
// Good
'374-earl-st'

// Bad
'374 EARL ST'
'373-Johnson-Street'
'10-aberdeen-street'
```

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
accountIds (array : string)
```
