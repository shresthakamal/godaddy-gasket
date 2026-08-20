# @godaddy/gasket-private-labels

A package to map domain names to private label ids for our brands.
It automatically determines the correct plid for requests based off of the hostname.
The mappings in this package are based on the [Private label brands document].


## Installation

```bash
npm i @godaddy/gasket-private-labels
```

## Usage

#### getEnvPlids

Get a plid picker object for a given environment.

```js
import { getEnvPlids } from '@godaddy/gasket-private-labels'; 
    
const plids = getEnvPlids('prod');

plids.godaddy; // returns 1
plids['123reg'];  // returns 587240
plids.oneTwoThreeReg;  // returns 587240
plid.reamaze;  // returns 579333

getEnvPlids('dev').reamaze; // returns 443755
```

#### getPlidFromHost

Get a plid for a given hostname including env variants.

```js
import { getPlidFromHost } from '@godaddy/gasket-private-labels';

getPlidFromHost('local.dev-godaddy.com:8080');  // returns 1
getPlidFromHost('test-123-reg.co.uk');          // returns 587240
getPlidFromHost('dev-reamaze.com');             // returns 443755
getPlidFromHost('reamaze.com');                 // returns 579333
```

#### getPlidFromDomain

Using a base domain and env, get a plid.

```js
import { getPlidFromDomain } from '@godaddy/gasket-private-labels';

getPlidFromDomain('godaddy.com', 'prod');       // returns 1
getPlidFromDomain('godaddy.com', 'production'); // returns 1
getPlidFromDomain('123-reg.co.uk', 'test');     // returns 587240
getPlidFromDomain('reamaze.com', 'dev');        // returns 443755
getPlidFromDomain('reamaze.com', 'prod');       // returns 579333
```

#### getProdPlidFromOte

Get a prod plid from an ote plid, or fallback to provided id if not found.

```js
import { getProdPlidFromOte } from '@godaddy/gasket-private-labels';

getProdPlidFromOte(1002767); // returns 525849 (Host Europe (es))
getProdPlidFromOte(12345);   // no match - returns 12345
```


<!-- LINKS -->
[Private label brands document]: https://secureservernet.sharepoint.com/sites/TechHub/SitePages/Private-label-brands.aspx
