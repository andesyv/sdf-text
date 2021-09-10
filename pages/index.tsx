import type { NextPage, GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { useState } from 'react';
import fs from 'fs';

import Input from '../components/input';
import WebGLCanvas, { Line } from '../components/webglcanvas';

import styles from '../styles/Home.module.css';
import { LineStrip } from 'three';

interface PageProps {
  shaderStr: string;
}

const Home: NextPage<PageProps> = ({ shaderStr }) => {
  const [renderData, setRenderData] = useState<Line[]>([]);

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

        <Input onInputChanged={setRenderData} />
        <WebGLCanvas
          shaderCode={shaderStr}
          width={500}
          height={500}
          lines={renderData.length ? renderData : undefined}
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

export const getServerSideProps: GetServerSideProps<PageProps> = async () => {
  const fileContent = new Promise<string>((resolve, reject) => {
    fs.readFile(`${process.cwd()}/public/shader.glsl`, (err, data) => {
      if (err) reject(err);
      resolve(data.toString());
    });
  });
  return { props: { shaderStr: await fileContent } };
};

export default Home;
