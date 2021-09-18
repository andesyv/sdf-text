# SDF Text

This is a small web experiment where I attempted to visualize text with a surface distance function renderer. The page takes some input text and extracts the path from the font, which it then converts into lines and is sends it to a WebGL render, that uses a fragment shader to render the lines using a standard sphere march approach. For some reason I decided to make the whole thing in `Next.js`, where I therefore used the fancy `react-three/fiber` library for the WebGL render.

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