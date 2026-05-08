# Contributing to Classes Management System

Thank you for your interest in contributing! This guide will help you get started.

---

## How to Contribute

### Reporting Bugs

1. Search existing issues to avoid duplicates
2. Create a new issue with steps to reproduce, expected vs actual behavior, and screenshots

### Requesting Features

Open a feature request issue with a clear description, use case, and mockups if applicable.

### Submitting Code

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make changes following the style guidelines below
4. Test locally with `python run.py`
5. Commit with clear messages and open a Pull Request

---

## Code Style

### JavaScript / React
- Functional components with hooks
- CSS custom properties for theming (no hardcoded colors)
- Follow existing page patterns in `src/pages/`

### CSS
- Use design tokens (`var(--primary)`, `var(--surface)`, etc.)
- Mobile-first responsive design
- Vanilla CSS only (no CSS-in-JS)

### Python / Django
- PEP 8 style
- DRF serializers for validation
- One Django app per domain

### Commit Messages
```
feat: add search to teachers page
fix: resolve mobile modal overflow
docs: update API reference
refactor: extract student card component
```

---

## Pull Request Guidelines

- One feature or fix per PR
- Update docs if APIs or UI change
- Test on desktop and mobile viewports
- Ensure `python run.py` starts without errors
