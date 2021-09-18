import type { NextPage, GetServerSideProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import fs from 'fs';
import { useRouter } from 'next/dist/client/router';

import Input from '../components/input';
import WebGLCanvas from '../components/webglcanvas';
import Sliders from '../components/sliders';

import styles from '../styles/Home.module.css';
import { nestedCount, queryParamFlatten, queryToNum, textToLines } from '../lib/utils';
import { Line2D as Line, ShaderParameters } from '../lib/types';

interface PageProps {
  shaderStr: string;
  lines: Line[][];
}

export const defaultSettings = {
  text: 'Hello',
  font: 'default',
  shaderParams: { radius: 0.2, smoothing: 0.2 } as ShaderParameters,
};

const Home: NextPage<PageProps> = ({ shaderStr, lines }) => {
  const router = useRouter();
  const { text, font, radius, smoothing } = router.query;
  const shaderParams: ShaderParameters = {
    radius: queryToNum(radius) ?? defaultSettings.shaderParams.radius,
    smoothing: queryToNum(smoothing) ?? defaultSettings.shaderParams.smoothing,
  };

  const refreshPath = (path: string): void => {
    // Hacky way of setting path because Next.js Routers didn't work
    const base = window.location.href.slice(0, window.location.href.lastIndexOf('/'));
    window.location.href = `${base}/${path}?radius=${shaderParams.radius}&smoothing=${shaderParams.smoothing}`;
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>SDF Text</title>
        <meta name="description" content="SDF Text" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <Input
          text={queryParamFlatten(text, defaultSettings.text)}
          font={queryParamFlatten(font, defaultSettings.font)}
          onSubmit={refreshPath}
        />
        <Sliders
          onRadiusChanged={(r) => {
            shaderParams.radius = r;
          }}
          onSmoothingChanged={(s) => {
            shaderParams.smoothing = s;
          }}
          defaultParams={shaderParams}
        />
        <WebGLCanvas
          shaderCode={shaderStr}
          width={500}
          height={500}
          lines={lines.length ? lines : undefined}
          shaderParams={shaderParams}
        />
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<PageProps> = async ({ params }) => {
  const queryParams = params ?? defaultSettings;
  const text = queryParamFlatten(queryParams.text, defaultSettings.text);
  // TODO: Fill in font fetching logic
  const font = queryParamFlatten(queryParams.font, defaultSettings.font);
  const convertedLines = await textToLines(text, font, 100, 2.4);
  const lineCount = nestedCount(convertedLines);
  console.log(`Line count: ${lineCount}`);

  // Would want this part in getStaticProps, but Next.js doesn't support it together with getServerSideProps
  const shader = new Promise<string>((resolve, reject) => {
    fs.readFile(`${process.cwd()}/public/shader.glsl`, (err, data) => {
      if (err) reject(err);
      const file = data.toString();
      resolve(file.replace('@LINE_COUNT@', lineCount.toString()));
    });
  });

  return { props: { shaderStr: await shader, lines: convertedLines } };
};

export default Home;
