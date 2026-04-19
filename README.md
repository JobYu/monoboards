# monoboards

**Languages:** English (this file) · [繁體中文](README.zh-TW.md)

A static, offline project kanban: open it in a browser, store data locally in **localStorage**, with no backend and no package dependencies.

## Features

- Project cards on a board (drag to reorder)
- Todos: add, check off, edit, delete
- Live progress bar and completion rate
- Markdown export (single project or all)
- Responsive layout (desktop and mobile)
- UI languages: Traditional Chinese, Simplified Chinese, and English (auto-detected from the browser; manual choice is remembered)

## Tech stack


| Area         | Details                                                                        |
| ------------ | ------------------------------------------------------------------------------ |
| Frontend     | HTML5, CSS3, Vanilla JavaScript (ES6+)                                         |
| Storage      | `localStorage` (app data key `kanban-v2`; locale preference `monoboards-lang`) |
| Font         | [Inter](https://fonts.google.com/specimen/Inter) (Google Fonts CDN)            |
| Dependencies | None                                                                           |


## Repository layout

```
monoboards/
├── index.html       Main app (single file, inline styles & scripts)
├── privacy.html     Privacy policy
├── terms.html       Terms of use
├── README.md        This file (English)
├── README.zh-TW.md  Traditional Chinese readme
└── _MANIFEST.md     Extended internal notes and constraints
```

## Usage

1. Open `index.html` in a browser from the repository root.
2. For local preview (helps when `file://` is restrictive), optionally run:

```bash
python3 -m http.server 8080
# or
npx serve .
```

## Data & backups

- Data stays in the browser only and is **not** uploaded anywhere.
- Clearing site data or switching browsers/devices can lose content; use in-app **Export Markdown** for backups.

## Contact

- Email: [info@pixelart.tech](mailto:info@pixelart.tech)

## License

This project is licensed under the [GNU Affero General Public License v3.0](LICENSE).

For more implementation detail and known limitations, see `[_MANIFEST.md](_MANIFEST.md)`.