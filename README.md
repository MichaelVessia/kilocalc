# KiloCalc

A barbell plate loading calculator for powerlifters. Converts between kg and lbs, showing exactly which plates to load on each side of the bar.

Part of the [OpenPowerlifting](https://www.openpowerlifting.org/) / [PLSource](https://plsource.org/) ecosystem of open-source powerlifting tools.

## Features

- Convert between kg and lbs with automatic plate rounding
- Visual barbell diagram showing plates to load
- Configurable bar weight, collar weight, and available plates
- Customizable plate colors
- Saves preferences to localStorage

## Development

Requires [Nix](https://nixos.org/) with flakes enabled.

```bash
# Enter dev shell
nix develop

# Run dev server
bun run dev

# Run tests
bun test

# Type check
npx tsc --noEmit

# Build for production
bun run build
```
## License

See [LICENSE](LICENSE) for details.
