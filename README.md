# [SDF Text](https://text.syvertsen.dev)

[![Vercel status](https://img.shields.io/github/deployments/andesyv/sdf-text/production?label=vercel&logo=vercel&logoColor=white)](https://sdf-text.vercel.app/_logs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This is a small web experiment where I attempted to visualize text with a surface distance function renderer. The page takes some input text and extracts the path from the font, which it then converts into lines and is sends it to a WebGL render, that uses a fragment shader to render the lines using a standard sphere march approach. For some reason I decided to make the whole thing in `Next.js`, where I therefore used the fancy `react-three/fiber` library for the WebGL render.

The page is hosted and deployed by [Vercel](https://vercel.com).

## Usage

Write some text into the text field and press enter / "submit", or add the text after the url. Ex.:
```
https://text.syvertsen.dev/foobar
```

You can also add additional parameters like the radius and smoothing in the url. 
```
https://text.syvertsen.dev/rad?radius=0.21&smoothing=0.1
```

## Development

First install project dependencies by running
```
yarn
```
and then run the development environment with
```
yarn dev
```

## Licence

MIT