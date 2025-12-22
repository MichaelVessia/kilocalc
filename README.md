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

Requires [Bun](https://bun.sh/). Either use `nix develop` or install Bun directly and run `bun install`.

```bash
bun run dev        # Dev server
bun test           # Run tests
bun run typecheck  # Type check
bun run build      # Production build
```
## License

See [LICENSE](LICENSE) for details.
