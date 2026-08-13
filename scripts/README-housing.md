# Regenerating the housing data

Sources (public CSVs, no key needed):
- State: https://files.zillowstatic.com/research/public_csvs/zhvi/State_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv
- City:  https://files.zillowstatic.com/research/public_csvs/zhvi/City_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv

These are the Zillow Home Value Index (ZHVI), all homes, middle tier
(35th-65th percentile), smoothed and seasonally adjusted. It is a typical
home VALUE, not a median SALE price - the UI must keep saying so.

Process: for each row, take the latest non-empty month column. Write
- data/housingStates.json - 51 state values + meta (source, dataMonth,
  retrieved date, honesty note). Embedded in the bundle.
- public/housing/{ST}.json - per-state place lists {n,v,r} (name, value,
  Zillow size rank), fetched on demand by app/housing/page.tsx.

The processing script lives in the session transcript of 2026-08-13 (a
~60-line Python csv/json pass); rerun it against fresh CSVs and update
meta.dataMonth + meta.retrieved. Refresh roughly quarterly - stale housing
numbers are worse than none, and the UI prints the data month.

Why Zillow and not Census ACS: the Census API began requiring an API key
(account signup - Kaleb's step if we ever want it), and ACS medians are
5-year-old self-reported values anyway. For "what would buying here cost
me," a current market index with a printed data month is the more honest
number. Revisit if an official keyless source appears.
