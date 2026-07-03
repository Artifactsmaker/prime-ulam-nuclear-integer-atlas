# Prime-Ulam Nuclear Integer Atlas

**Prime-Ulam Nuclear Integer Atlas** is an interactive web atlas for exploring the full Prime-Ulam arithmetic descriptor grid over nuclear configuration space.

Subtitle: **bản đồ mô tả số học Prime-Ulam trên không gian cấu hình hạt nhân**

The app visualizes and queries **51,772 integer configurations** over:

- `Z = 1-172` proton-number axis
- `N = 0-300` neutron-number axis
- `A = Z + N` mass-number descriptor

It is designed as a static, browser-based research artifact: no server, database, package installation, or build step is required for use.

## Live Use

Open:

```text
index.html
```

The application loads the full dataset from:

```text
atlas-data.js
```

Because the data is bundled locally, the app can be archived, cited, and reopened as a self-contained static artifact.

## Features

- Full interactive canvas atlas for all 51,772 configurations.
- Search by nuclide label, coordinate, or prime-signature content.
- Exact label search, e.g. `U-238`.
- Coordinate search, e.g. `Z=92 N=146`.
- Region filtering:
  - all `Z`
  - `Z <= 118`
  - `Z = 119-172`
- Metric heatmap switching:
  - `Hpf_total`
  - `Omega_total`
  - `omega_total`
  - `rad_total`
  - `v2_total`
  - `factor_overlap`
- Detail panel for selected configurations.
- Paginated ledger table for browsing the full configuration set.

## Included Files

```text
index.html       Main static web application
styles.css       Futuristic/tarot-inspired visual styling
app.js           Interactive atlas logic
atlas-data.js    Bundled Prime-Ulam data payload
README.md        Project and citation metadata
```

## Data Source

This application is derived from the dataset:

**Prime-Ulam Full Nuclear Integer Grid**

- Author: **Phan Thành Trung**
- ORCID: `0009-0000-7520-6781`
- DOI: `10.5281/zenodo.21073857`
- Scope: `Z = 1-172`, `N = 0-300`
- Rows: `51,772`

The original dataset includes CSV, metadata, README, and a standard PDF note describing the arithmetic descriptor scaffold.

## Interpretation Boundary

This application is **not** an observed-nuclide database.

The displayed quantities are arithmetic descriptors derived from integer transformations of `Z`, `N`, and `A = Z + N`. They should not be interpreted as empirical nuclear stability measurements, decay data, binding energy predictions, or physical-causation claims.

For `Z <= 118`, element symbols correspond to the current official IUPAC range. For `Z = 119-172`, the dataset uses placeholder/systematic labels beyond the currently official periodic table.

## Suggested Citation

For the application/software:

```text
Phan Thành Trung. (2026). Prime-Ulam Nuclear Integer Atlas:
Interactive Web Application for the Prime-Ulam Full Nuclear Integer Grid
(v1.0.0). Zenodo. [DOI to be assigned]
```

For the source dataset:

```text
Phan Thành Trung. Prime-Ulam Full Nuclear Integer Grid.
Zenodo. DOI: 10.5281/zenodo.21073857
```

## Suggested Zenodo Metadata

Recommended resource type:

```text
Software
```

Recommended title:

```text
Prime-Ulam Nuclear Integer Atlas: Interactive Web Application for the Prime-Ulam Full Nuclear Integer Grid
```

Recommended relation to the dataset DOI:

```text
Is derived from: 10.5281/zenodo.21073857
```

or:

```text
Uses data from: 10.5281/zenodo.21073857
```

## Repository Notes

If publishing through GitHub and Zenodo:

1. Commit this app folder to a GitHub repository.
2. Add a license and citation metadata such as `CITATION.cff`.
3. Create a GitHub release, e.g. `v1.0.0`.
4. Archive the release through Zenodo to mint a software DOI.
5. Keep the dataset DOI separate from the app/software DOI.

This separation keeps the data artifact stable while allowing the app to evolve through versioned software releases.

## License

License information should be added before public release. A permissive open-source license such as MIT, BSD-3-Clause, or Apache-2.0 is suitable for the application code; the dataset license should be stated separately according to the original dataset record.
