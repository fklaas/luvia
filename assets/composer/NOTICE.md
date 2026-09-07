# Reisewelt-Geografie

Natural Earth 1:110m Admin 0 Countries, public domain.
Source: https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson
Terms: https://www.naturalearthdata.com/about/terms-of-use/
Retrieved: 2026-09-06. Source SHA-256: 6866c877d39cba9c357620878839b336d569f8c662d3cfab4cb1dbe2d39c977f

Only country name, continent, identifier and geographic geometry retained; coordinates rounded to three decimals for the decorative overview. This is an overview, not a boundary authority, navigation service or Place record.

Admin 1: Natural Earth 1:10m states/provinces, retrieved 2026-09-06. Source https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces.geojson
Source SHA-256: 22d0e3ad85eb3e27f17cabf8ba2d50e554fbc27a87796ff891d958185da62fb5. Published geometry simplified with maximum .015 degree vertex deviation and rounded to .001 degrees for presentation. No Place truth. Regions loaded only after geographic drill-down.

Continental outlines in world-continents.json are dissolved from the same Natural Earth country overview using topojson-server 3.0.1 and topojson-client 3.1.0 (build tools only). Geographic groupings follow the source dataset, not a political boundary assertion.

2026-09-07 completeness repair: added 81 countries/territories omitted by the 1:110m overview from Natural Earth 1:10m Admin 0 (source https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_0_countries.geojson ; SHA-256 239eec57ac17f100a11e2536cffc56752c318b50ae765b0918ff7aab4ce8f255). Total 258 source geographic units, not a claim of that many sovereign states. Added polygons simplified with .008 degree tolerance, six-decimal precision and spherical D3 winding validation. Existing 1:110m overview retained for performance. Source open-ocean units grouped using REGION_UN; Americas uses SUBREGION (Central America -> North America, otherwise South America). Continents redissolved at 1e7 quantization. Seven reversed small Admin-1 rings corrected, including Hawaii; regional geometry is not guaranteed to reflect every latest administrative reform. Last regional level continues with canonical Place destination search.
