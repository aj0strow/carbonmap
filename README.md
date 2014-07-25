# Carbon Map

Carb up, bro.

[@aj0strow](https://github.com/aj0strow), [@subsumo](https://github.com/subsumo)

### Environment

The application expects the following keys defined. 

```
MONGOLAB_URL
TEMPODB_KEY
TEMPODB_SECRET
```

### Scraping

There are a few anomalies. 

* 309 University Ave does not have an account id. It was combined with 307, so each house should claim half the utility consumption of 307. 

* 374 Earl St and 376 have shared seed data on the kingston website. Each should use the combined 374376 page. 

To combat inconsist primary keys, the server always uses the dash-delimited abbreviated lowercase address.

```javascript
// Good
'374-earl-st'

// Bad
'374 EARL ST'
'373-Johnson-Street'
'10-aberdeen-street'
```

### Schema

#### buildings

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

#### dailysums

Node that `peak`, `midpeak`, and `offpeak` are in kWh. 

```
_id (bson id)
accountIds (array : string)
date (string : YYYY-MM-DD)
peak (float)
midpeak (float)
offpeak (float)
```
