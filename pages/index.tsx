import type { NextPage, GetServerSideProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import fs from 'fs';
import { useState } from 'react';
import { useRouter } from 'next/dist/client/router';

import Input from '../components/input';
import WebGLCanvas, { nestedCount } from '../components/webglcanvas';
import Sliders from '../components/sliders';

import styles from '../styles/Home.module.css';
import { queryParamFlatten, textToLines } from '../lib/utils';
import type { Line2D as Line } from '../lib/types';

interface PageProps {
  shaderStr: string;
  lines: Line[][];
}

export const defaultSettings = {
  text: 'Hello',
  font: 'default',
};

const Home: NextPage<PageProps> = ({ shaderStr, lines }) => {
  const router = useRouter();
  const { text, font } = router.query;
  const [radius, setRadius] = useState(1.0);
  const [smoothing, setSmoothing] = useState(1.0);

  return (
    <div className={styles.container}>
      <Head>
        <title>SDF Text</title>
        <meta name="description" content="SDF Text" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <a href="https://nextjs.org">Next.js!</a>
        </h1>

        <Input
          text={queryParamFlatten(text, defaultSettings.text)}
          font={queryParamFlatten(font, defaultSettings.font)}
        />
        <Sliders onRadiusChanged={setRadius} onSmoothingChanged={setSmoothing} />
        <WebGLCanvas
          shaderCode={shaderStr}
          width={500}
          height={500}
          lines={lines.length ? lines : undefined}
          radius={radius}
          smoothing={smoothing}
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
