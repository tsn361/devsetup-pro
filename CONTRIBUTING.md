# Contributing to DevSetup Pro

Thank you for considering contributing to DevSetup Pro! 

## Contributor License Agreement (CLA)

By contributing to DevSetup Pro, you agree that:

1. **You own the rights** to the code you're contributing
2. **You grant DevSetup Team** the right to use your contributions under the Business Source License 1.1
3. **DevSetup Team may** include your contributions in both free and commercial versions
4. **Your contributions** will be credited appropriately

## How to Contribute

### 1. Fork and Clone
```bash
git clone https://github.com/tsn361/devsetup-pro.git
cd devsetup-pro
```

### 2. Create a Branch
```bash
git checkout -b feature/your-feature-name
```

### 3. Make Changes
- Follow existing code style
- Add tests if applicable
- Update documentation

### 4. Commit with Sign-off
```bash
git commit -s -m "Add feature: your description"
```

The `-s` flag adds a "Signed-off-by" line, which serves as your agreement to the CLA.

### 5. Push and Create Pull Request
```bash
git push origin feature/your-feature-name
```

Then create a PR on GitHub.

## Code Style

- **JavaScript**: Use ESLint configuration
- **React**: Follow React best practices
- **Comments**: Add JSDoc comments for functions
- **File Headers**: Include copyright notice (see COPYRIGHT_HEADER.txt)

## What We're Looking For

### High Priority
- Ubuntu compatibility improvements
- New tool definitions
- Bug fixes
- Performance improvements
- Documentation improvements

### Medium Priority
- UI/UX enhancements
- Testing improvements
- Code refactoring

### Future (Not Yet)
- macOS features (will be proprietary)
- Enterprise features (will be commercial)

## Testing

Before submitting:
```bash
npm test
npm run build
```

Test on Ubuntu if possible.

## Questions?

- **General**: Open a GitHub issue
- **Security**: security@devsetup.pro
- **Commercial**: business@devsetup.pro

## License

By contributing, you agree that your contributions will be licensed under the Business Source License 1.1, with the same Change Date (2029-12-21) and Change License (Apache 2.0).

---

Thank you for helping make DevSetup Pro better! 🎉
