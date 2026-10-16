# Makan Wheel

Not sure where to eat later? Makan wheel helps you nominate a few choices, and
then makes a decision for you!

Pick a Singapore mall, shortlist a few places, and let the wheel choose.

1. **Pick a mall.** Search by name, area or MRT station, or filter by region.
2. **Shortlist food.** Filter by halal status, price and cuisine, then tap the
   places you'd be happy with. Can't find one? Add it yourself.
3. **Spin.** Every slice has the same chance. Don't like the result? Tap
   "Not this one" to drop it and spin again.

Your shortlist stays in your browser, so a reload won't lose it. "Share this
wheel" makes a link your friends can open to spin the same wheel.

## Run it

Needs Node 22 (see `.nvmrc`).

```bash
npm install
npm run dev       # http://localhost:5173
npm test          # unit tests, including checks on every mall file
npm run lint
npm run build     # production build in dist/
```

It's a static site with no backend or API keys, so any static host works.
On Vercel, import the repo and keep the default Vite settings.

## Malls

| Region  | Malls                                                     |
| ------- | --------------------------------------------------------- |
| Central | Funan, ION Orchard, Plaza Singapura, Raffles City, Suntec City |
| East    | Tampines Mall                                             |
| North   | Causeway Point, Northpoint City                           |
| West    | JEM, Jurong Point                                         |

Each mall lists 28 to 45 places to eat, not every outlet. Causeway Point's list
is the shortest and misses some big chains.

### About the data

The lists were put together in October 2026 from mall directories, mall store
pages and food guides. Shops open and close all the time, so treat the lists as
a starting point and check the mall directory before you go.

**Halal:** a place is marked "Halal" only where a source said it holds a MUIS
halal certificate, and "Muslim-owned" only where a source said so. Each such
entry keeps its source in `halalSource`. These were not checked one by one
against the MUIS HalalSG directory, and certificates can lapse, so always look
for the certificate at the shop.

### Add or fix a mall

Each mall is one JSON file in [`src/data/malls/`](src/data/malls). Add a file
and the app picks it up. The tests reject bad values, so run `npm test` after
editing.

```json
{
  "id": "vivocity",
  "name": "VivoCity",
  "region": "Central",
  "area": "HarbourFront",
  "mrt": "HarbourFront",
  "address": "1 HarbourFront Walk, Singapore 098585",
  "sources": ["https://..."],
  "outlets": [
    {
      "name": "Example Chicken Rice",
      "unit": "#B2-01",
      "cuisines": ["Local"],
      "type": "restaurant",
      "price": 1,
      "halal": "certified",
      "halalSource": "https://..."
    }
  ]
}
```

- `region`: `Central`, `North`, `North-East`, `East` or `West`
- `cuisines`: one or two of the names in `CUISINES` in
  [`src/lib/types.ts`](src/lib/types.ts)
- `type`: `restaurant`, `fast-food`, `cafe`, `dessert`, `food-court` or `kiosk`
- `price`: per person, `1` under S$15, `2` S$15 to S$35, `3` over S$35
- `halal`: `certified`, `muslim-owned` or `no`. Use `no` when unsure.

## How it's built

React 19, TypeScript and Vite, with plain CSS. No router library: the URL hash
holds the current step (`#/m/<mall>/wheel`), so the browser's Back button works.

| Path                     | What it does                                              |
| ------------------------ | --------------------------------------------------------- |
| `src/data/malls/*.json`  | One file per mall                                         |
| `src/lib/filter.ts`      | Halal, price, cuisine and text filters                    |
| `src/lib/wheel.ts`       | Fair random pick, and the angle that lands on it          |
| `src/lib/route.ts`       | Hash routes and share links                               |
| `src/lib/store.ts`       | Shortlist and added places, saved to `localStorage`       |
| `src/components/`        | The three screens and the wheel                           |

The wheel picks the winner first with `crypto.getRandomValues`, then spins to
it, so the animation can't bias the result.

## Ideas for later

- More malls (VivoCity, Jewel, NEX, Bugis Junction, Ngee Ann City, PLQ)
- Opening hours, so the wheel skips places that are closed
- Group mode, where each friend adds picks from their own phone
- A "near me" list using the browser's location
